import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Package, AlertTriangle, CheckCircle2, Layers, ArrowDownUp } from 'lucide-react'
import { api } from '../lib/api'
import { useApi } from '../lib/useApi'
import { useEditor } from '../lib/useEditor'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatNumber } from '../lib/format'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Table from '../components/ui/Table'
import Modal from '../components/ui/Modal'
import Field, { Segmented } from '../components/ui/Field'
import RecordModal, { EditDeleteButtons } from '../components/ui/RecordModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const DEFAULT_CATEGORIES = ['Grains', 'Pulses', 'Vegetables', 'Dairy', 'Spices', 'Oils', 'Gas & Fuel', 'Cleaning', 'Other']
const UNITS = ['kg', 'liters', 'pcs', 'packets']

export default function Inventory() {
    const { isAdmin } = useAuth()
    const items = useApi(() => api.inventory.list(), [])
    const [params, setParams] = useSearchParams()
    const lowOnly = params.get('filter') === 'low'
    const [category, setCategory] = useState('ALL')
    const [adjusting, setAdjusting] = useState(null)

    const editor = useEditor({
        noun: 'item',
        empty: () => ({ itemName: '', category: 'Grains', quantity: '', unit: 'kg', threshold: '' }),
        toForm: (r) => ({ ...r, quantity: String(r.quantity), threshold: String(r.threshold) }),
        validate: (f) => ({
            itemName: !f.itemName.trim() && 'Name the item.',
            category: !f.category.trim() && 'Pick a category.',
            quantity: (f.quantity === '' || Number(f.quantity) < 0) && 'Enter the amount in stock.',
            threshold: (f.threshold === '' || Number(f.threshold) < 0) && 'Enter a reorder level.',
        }),
        create: (f) => api.inventory.create(toBody(f)),
        update: (row, f) => api.inventory.update(row.id, toBody(f)),
        remove: (row) => api.inventory.remove(row.id),
        onChange: items.reload,
    })

    const data = useMemo(() => items.data || [], [items.data])
    const categories = useMemo(() => [...new Set([...DEFAULT_CATEGORIES, ...data.map((i) => i.category)])].sort(), [data])
    const rows = useMemo(
        () => (items.data || []).filter((i) => (!lowOnly || i.isLowStock) && (category === 'ALL' || i.category === category)),
        [items.data, lowOnly, category]
    )
    const lowCount = data.filter((i) => i.isLowStock).length

    const setLowOnly = (on) => {
        if (on) params.set('filter', 'low')
        else params.delete('filter')
        setParams(params, { replace: true })
    }

    const columns = [
        { key: 'name', header: 'Item', cell: (r) => <span className="font-medium text-stone-900 dark:text-white">{r.itemName}</span>, sortValue: (r) => r.itemName },
        { key: 'category', header: 'Category', cell: (r) => <span className="text-stone-500 dark:text-stone-400">{r.category}</span>, sortValue: (r) => r.category },
        {
            key: 'qty',
            header: 'In stock',
            align: 'right',
            cell: (r) => <span className="font-semibold text-stone-900 dark:text-white">{formatNumber(r.quantity)} <span className="font-normal text-stone-500">{r.unit}</span></span>,
            sortValue: (r) => r.quantity,
        },
        { key: 'threshold', header: 'Reorder at', align: 'right', cell: (r) => `${formatNumber(r.threshold)} ${r.unit}`, sortValue: (r) => r.threshold },
        {
            key: 'status',
            header: 'Status',
            cell: (r) => (r.isLowStock ? <Badge tone="critical" icon={AlertTriangle}>Low</Badge> : <Badge tone="good" icon={CheckCircle2}>OK</Badge>),
            sortValue: (r) => (r.isLowStock ? 0 : 1),
        },
        ...(isAdmin
            ? [{
                key: 'actions',
                header: <span className="sr-only">Actions</span>,
                align: 'right',
                cell: (r) => (
                    <div className="flex items-center justify-end gap-1">
                        <Button variant="secondary" size="sm" icon={ArrowDownUp} onClick={() => setAdjusting(r)} aria-label={`Adjust stock for ${r.itemName}`}>
                            Adjust
                        </Button>
                        <EditDeleteButtons label={r.itemName} onEdit={() => editor.openEdit(r)} onDelete={() => editor.askDelete(r)} />
                    </div>
                ),
            }]
            : []),
    ]

    const loadingFirst = items.loading && !items.data

    return (
        <div className="animate-fade-up">
            <PageHeader
                title="Inventory"
                description="Raw materials and supplies, with alerts when anything drops to its reorder level."
                actions={isAdmin && <Button icon={Plus} onClick={() => editor.openNew()}>Add item</Button>}
            />

            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
                <StatCard label="Items tracked" icon={Package} value={formatNumber(data.length)} loading={loadingFirst} />
                <StatCard label="Running low" icon={AlertTriangle} tone="red" value={formatNumber(lowCount)} hint={lowCount ? 'At or below reorder level' : 'Nothing to reorder'} loading={loadingFirst}>
                    {lowCount > 0 && !lowOnly && (
                        <button onClick={() => setLowOnly(true)} className="self-start text-xs font-medium text-brand-700 hover:underline dark:text-brand-400">
                            Show only these
                        </button>
                    )}
                </StatCard>
                <StatCard label="Categories" icon={Layers} tone="violet" value={formatNumber(new Set(data.map((i) => i.category)).size)} loading={loadingFirst} className="col-span-2 lg:col-span-1" />
            </div>

            <Table
                columns={columns}
                rows={items.data && rows}
                loading={items.loading}
                error={items.error}
                onRetry={items.reload}
                initialSort={{ key: 'status', dir: 'asc' }}
                searchPlaceholder="Search items…"
                searchText={(r) => `${r.itemName} ${r.category}`}
                toolbar={
                    <>
                        <select aria-label="Filter by category" className="input w-auto py-2" value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="ALL">All categories</option>
                            {categories.map((c) => <option key={c}>{c}</option>)}
                        </select>
                        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-stone-300 px-3 py-2 text-sm text-stone-700 dark:border-stone-700 dark:text-stone-300">
                            <input type="checkbox" className="size-4 accent-brand-700" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} />
                            Low stock only
                        </label>
                    </>
                }
                emptyTitle={lowOnly ? 'Nothing is running low' : 'No items yet'}
                emptyMessage={lowOnly ? 'Every item is above its reorder level.' : 'Add the staples you keep in the store room so you know when to reorder.'}
                emptyAction={isAdmin && !lowOnly && <Button size="sm" icon={Plus} onClick={() => editor.openNew()}>Add an item</Button>}
            />

            <RecordModal editor={editor} title="Add item" editTitle="Edit item">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Item" error={editor.errors.itemName}>
                        <input placeholder="e.g. Basmati rice" value={editor.form.itemName} onChange={editor.setField('itemName')} />
                    </Field>
                    <Field label="Category" error={editor.errors.category}>
                        <select value={editor.form.category} onChange={editor.setField('category')}>
                            {categories.map((c) => <option key={c}>{c}</option>)}
                        </select>
                    </Field>
                </div>
                <div className="grid grid-cols-[1fr_7rem] gap-3">
                    <Field label="Amount in stock" error={editor.errors.quantity}>
                        <input type="number" inputMode="decimal" min="0" step="0.1" value={editor.form.quantity} onChange={editor.setField('quantity')} />
                    </Field>
                    <Field label="Unit">
                        <select value={editor.form.unit} onChange={editor.setField('unit')}>
                            {[...new Set([...UNITS, editor.form.unit])].map((u) => <option key={u}>{u}</option>)}
                        </select>
                    </Field>
                </div>
                <Field label="Reorder level" hint="You'll see an alert when stock falls to this amount." error={editor.errors.threshold}>
                    <input type="number" inputMode="decimal" min="0" step="0.1" value={editor.form.threshold} onChange={editor.setField('threshold')} />
                </Field>
            </RecordModal>

            <AdjustStockModal item={adjusting} onClose={() => setAdjusting(null)} onSaved={items.reload} />

            <ConfirmDialog
                isOpen={!!editor.deleting}
                onClose={editor.cancelDelete}
                onConfirm={editor.confirmDelete}
                title="Delete this item?"
                message={editor.deleting && `${editor.deleting.itemName} will be removed from inventory. This can't be undone.`}
            />
        </div>
    )
}

function AdjustStockModal({ item, onClose, onSaved }) {
    const toast = useToast()
    const [mode, setMode] = useState('add')
    const [amount, setAmount] = useState('')
    const [saving, setSaving] = useState(false)
    const [lastItem, setLastItem] = useState(item)

    // Reset the form whenever a different item is opened.
    if (item !== lastItem) {
        setLastItem(item)
        setMode('add')
        setAmount('')
    }
    if (!item) return null

    const n = Number(amount) || 0
    const next = mode === 'add' ? item.quantity + n : mode === 'remove' ? item.quantity - n : n
    const invalid = amount === '' || n < 0 || next < 0

    const save = async (e) => {
        e.preventDefault()
        if (invalid) return
        setSaving(true)
        try {
            await api.inventory.setQuantity(item.id, Math.round(next * 100) / 100)
            toast.success(`${item.itemName} is now ${formatNumber(next)} ${item.unit}.`)
            onClose()
            onSaved()
        } catch (err) {
            toast.error(err)
        } finally {
            setSaving(false)
        }
    }

    return (
        <Modal
            isOpen
            onClose={onClose}
            size="sm"
            title={`Adjust ${item.itemName}`}
            description={`Currently ${formatNumber(item.quantity)} ${item.unit} in stock.`}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="adjust-form" loading={saving} disabled={invalid}>Update stock</Button>
                </>
            }
        >
            <form id="adjust-form" onSubmit={save} className="space-y-4">
                <Segmented
                    options={[{ value: 'add', label: 'Received' }, { value: 'remove', label: 'Used' }, { value: 'set', label: 'Set to' }]}
                    value={mode}
                    onChange={setMode}
                    label="Change"
                />
                <Field label={`Amount (${item.unit})`} error={amount !== '' && next < 0 ? `Only ${formatNumber(item.quantity)} ${item.unit} in stock.` : undefined}>
                    <input type="number" inputMode="decimal" min="0" step="0.1" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </Field>
                {amount !== '' && next >= 0 && (
                    <p className="rounded-xl bg-stone-50 px-3 py-2.5 text-sm text-stone-600 dark:bg-stone-800/60 dark:text-stone-300">
                        New stock: <strong className="font-semibold text-stone-900 dark:text-white">{formatNumber(next)} {item.unit}</strong>
                        {next <= item.threshold && <span className="text-red-600 dark:text-red-400"> · at or below reorder level</span>}
                    </p>
                )}
            </form>
        </Modal>
    )
}

function toBody(f) {
    return {
        itemName: f.itemName.trim(),
        category: f.category.trim(),
        quantity: Number(f.quantity),
        unit: f.unit,
        threshold: Number(f.threshold),
    }
}
