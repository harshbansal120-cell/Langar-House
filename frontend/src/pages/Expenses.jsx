import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts'
import { Plus, Wallet, CalendarDays, Tag } from 'lucide-react'
import { api } from '../lib/api'
import { useApi } from '../lib/useApi'
import { useEditor } from '../lib/useEditor'
import { useAuth } from '../context/AuthContext'
import { todayISO, relativeDay, formatNumber, formatDate, formatCurrency, formatCompact, sum } from '../lib/format'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import Button from '../components/ui/Button'
import Table from '../components/ui/Table'
import Field from '../components/ui/Field'
import RecordModal, { EditDeleteButtons } from '../components/ui/RecordModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { ChartCard, ChartTooltip } from '../components/charts/ChartParts'
import { axisProps } from '../components/charts/chartTheme'

const DEFAULT_CATEGORIES = ['Grains', 'Pulses', 'Vegetables', 'Dairy', 'Spices', 'Gas & Fuel', 'Maintenance', 'Other']
const UNITS = ['kg', 'liters', 'pcs', 'packets', 'lot']

const monthLabel = (ym) => new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(new Date(`${ym}-01T00:00`))

export default function Expenses() {
    const { isAdmin } = useAuth()
    const expenses = useApi(() => api.expenses.list(), [])
    const [month, setMonth] = useState(todayISO().slice(0, 7))

    const editor = useEditor({
        noun: 'expense',
        empty: () => ({ date: todayISO(), itemName: '', category: 'Vegetables', quantity: '', unit: 'kg', price: '' }),
        toForm: (r) => ({ ...r, quantity: String(r.quantity), price: String(r.price) }),
        validate: (f) => ({
            itemName: !f.itemName.trim() && 'What was bought?',
            category: !f.category.trim() && 'Pick a category.',
            quantity: !(Number(f.quantity) > 0) && 'Enter a quantity.',
            price: (f.price === '' || Number(f.price) < 0) && 'Enter the price per unit.',
        }),
        create: (f) => api.expenses.create(toBody(f)),
        update: (row, f) => api.expenses.update(row.id, toBody(f)),
        remove: (row) => api.expenses.remove(row.id),
        onChange: expenses.reload,
    })

    const all = useMemo(() => expenses.data || [], [expenses.data])
    const categories = useMemo(() => [...new Set([...DEFAULT_CATEGORIES, ...all.map((e) => e.category)])].sort(), [all])
    const rows = useMemo(() => (expenses.data || []).filter((e) => e.date.startsWith(month)), [expenses.data, month])

    const stats = useMemo(() => {
        const total = sum(rows, 'total')
        const isCurrent = month === todayISO().slice(0, 7)
        const [y, m] = month.split('-').map(Number)
        const days = isCurrent ? new Date().getDate() : new Date(y, m, 0).getDate()
        const byCategory = Object.entries(
            rows.reduce((acc, e) => ({ ...acc, [e.category]: (acc[e.category] || 0) + e.total }), {})
        )
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
        return { total, perDay: total / days, byCategory }
    }, [rows, month])

    const columns = [
        { key: 'date', header: 'Date', cell: (r) => <span className="font-medium text-stone-900 dark:text-white">{relativeDay(r.date)}</span>, sortValue: (r) => r.date },
        { key: 'item', header: 'Item', cell: (r) => <span className="text-stone-900 dark:text-white">{r.itemName}</span>, sortValue: (r) => r.itemName },
        { key: 'category', header: 'Category', cell: (r) => <span className="text-stone-500 dark:text-stone-400">{r.category}</span>, sortValue: (r) => r.category },
        { key: 'qty', header: 'Quantity', align: 'right', cell: (r) => `${formatNumber(r.quantity)} ${r.unit} × ${formatCurrency(r.price)}` },
        { key: 'total', header: 'Total', align: 'right', cell: (r) => <span className="font-semibold text-stone-900 dark:text-white">{formatCurrency(r.total)}</span>, sortValue: (r) => r.total },
        ...(isAdmin
            ? [{ key: 'actions', header: <span className="sr-only">Actions</span>, align: 'right', cell: (r) => <EditDeleteButtons label={r.itemName} onEdit={() => editor.openEdit(r)} onDelete={() => editor.askDelete(r)} /> }]
            : []),
    ]

    const liveTotal = (Number(editor.form.quantity) || 0) * (Number(editor.form.price) || 0)
    const loadingFirst = expenses.loading && !expenses.data

    return (
        <div className="animate-fade-up">
            <PageHeader
                title="Expenses"
                description="Every purchase for the kitchen, from rice to gas cylinders."
                actions={
                    <>
                        <label className="sr-only" htmlFor="exp-month">Month</label>
                        <input id="exp-month" type="month" className="input w-auto py-2" value={month} max={todayISO().slice(0, 7)} onChange={(e) => e.target.value && setMonth(e.target.value)} />
                        {isAdmin && <Button icon={Plus} onClick={() => editor.openNew()}>Record expense</Button>}
                    </>
                }
            />

            <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-3">
                <StatCard label={`Spent in ${monthLabel(month)}`} icon={Wallet} tone="violet" value={formatCurrency(stats.total)} hint={`${rows.length} purchases`} loading={loadingFirst} />
                <StatCard label="Per day" icon={CalendarDays} value={formatCurrency(stats.perDay)} hint="Average this month" loading={loadingFirst} />
                <StatCard
                    label="Biggest category"
                    icon={Tag}
                    tone="blue"
                    className="col-span-2 lg:col-span-1"
                    value={stats.byCategory[0]?.name || '—'}
                    hint={stats.byCategory[0] && `${formatCurrency(stats.byCategory[0].value)} · ${Math.round((stats.byCategory[0].value / stats.total) * 100)}% of spend`}
                    loading={loadingFirst}
                />
            </div>

            {stats.byCategory.length > 0 && (
                <ChartCard className="mb-4" title="Where the money went" subtitle={monthLabel(month)}>
                    <div style={{ height: Math.max(120, stats.byCategory.length * 36) }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.byCategory} layout="vertical" margin={{ top: 0, right: 64, left: 0, bottom: 0 }} barCategoryGap={8}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" {...axisProps} tick={{ ...axisProps.tick, fill: 'var(--chart-ink-2)' }} width={110} />
                                <Tooltip cursor={{ fill: 'var(--chart-grid)', opacity: 0.5 }} content={<ChartTooltip format={formatCurrency} />} />
                                <Bar dataKey="value" name="Spent" fill="var(--series-accent)" radius={[0, 4, 4, 0]} maxBarSize={20}>
                                    <LabelList dataKey="value" position="right" formatter={(v) => `₹${formatCompact(v)}`} style={{ fill: 'var(--chart-ink-2)', fontSize: 12 }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
            )}

            <Table
                columns={columns}
                rows={expenses.data && rows}
                loading={expenses.loading}
                error={expenses.error}
                onRetry={expenses.reload}
                initialSort={{ key: 'date', dir: 'desc' }}
                searchPlaceholder="Search items or categories…"
                searchText={(r) => `${r.itemName} ${r.category} ${formatDate(r.date)}`}
                emptyTitle={`No expenses in ${monthLabel(month)}`}
                emptyMessage="Record purchases as they happen so the monthly total stays accurate."
                emptyAction={isAdmin && <Button size="sm" icon={Plus} onClick={() => editor.openNew()}>Record an expense</Button>}
            />

            <RecordModal editor={editor} title="Record expense" editTitle="Edit expense">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Date">
                        <input type="date" max={todayISO()} value={editor.form.date} onChange={editor.setField('date')} />
                    </Field>
                    <Field label="Category" error={editor.errors.category}>
                        <select value={editor.form.category} onChange={editor.setField('category')}>
                            {categories.map((c) => <option key={c}>{c}</option>)}
                        </select>
                    </Field>
                </div>
                <Field label="Item" error={editor.errors.itemName}>
                    <input placeholder="e.g. Basmati rice, 50 kg sack" value={editor.form.itemName} onChange={editor.setField('itemName')} />
                </Field>
                <div className="grid grid-cols-[1fr_6.5rem_1fr] gap-3">
                    <Field label="Quantity" error={editor.errors.quantity}>
                        <input type="number" inputMode="decimal" min="0" step="0.1" value={editor.form.quantity} onChange={editor.setField('quantity')} />
                    </Field>
                    <Field label="Unit">
                        <select value={editor.form.unit} onChange={editor.setField('unit')}>
                            {[...new Set([...UNITS, editor.form.unit])].map((u) => <option key={u}>{u}</option>)}
                        </select>
                    </Field>
                    <Field label="Price per unit (₹)" error={editor.errors.price}>
                        <input type="number" inputMode="decimal" min="0" step="0.01" value={editor.form.price} onChange={editor.setField('price')} />
                    </Field>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3 dark:bg-stone-800/60">
                    <span className="text-sm text-stone-600 dark:text-stone-300">Total</span>
                    <span className="tabular text-lg font-semibold text-stone-900 dark:text-white">{formatCurrency(liveTotal)}</span>
                </div>
            </RecordModal>

            <ConfirmDialog
                isOpen={!!editor.deleting}
                onClose={editor.cancelDelete}
                onConfirm={editor.confirmDelete}
                title="Delete this expense?"
                message={editor.deleting && `${editor.deleting.itemName} (${formatCurrency(editor.deleting.total)}, ${formatDate(editor.deleting.date)}) will be removed. This can't be undone.`}
            />
        </div>
    )
}

function toBody(f) {
    return {
        date: f.date,
        itemName: f.itemName.trim(),
        category: f.category.trim(),
        quantity: Number(f.quantity),
        unit: f.unit,
        price: Number(f.price),
    }
}
