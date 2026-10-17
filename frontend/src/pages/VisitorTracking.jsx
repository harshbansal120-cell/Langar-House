import { useMemo, useState } from 'react'
import { Plus, Users, CalendarDays, TrendingUp, Star } from 'lucide-react'
import { api } from '../lib/api'
import { useApi } from '../lib/useApi'
import { useEditor } from '../lib/useEditor'
import { useAuth } from '../context/AuthContext'
import { todayISO, lastNDays, relativeDay, formatNumber, formatDate, humanize, sum } from '../lib/format'
import { visitorsByDay } from '../lib/insights'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Table from '../components/ui/Table'
import Field, { Segmented } from '../components/ui/Field'
import RecordModal, { EditDeleteButtons } from '../components/ui/RecordModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { MEAL_SERIES } from '../components/charts/chartTheme'

const MEAL_OPTIONS = MEAL_SERIES.map((m) => ({ value: m.key, label: m.label }))
const mealColor = Object.fromEntries(MEAL_SERIES.map((m) => [m.key, m.color]))

export default function VisitorTracking() {
    const { isAdmin } = useAuth()
    const logs = useApi(() => api.visitors.list(), [])
    const [meal, setMeal] = useState('ALL')

    const editor = useEditor({
        noun: 'visitor log',
        empty: () => ({ date: todayISO(), mealType: 'LUNCH', visitorCount: '', isSpecialDay: false, notes: '' }),
        toForm: (r) => ({ ...r, visitorCount: String(r.visitorCount), notes: r.notes || '' }),
        validate: (f) => ({
            date: !f.date && 'Pick a date.',
            visitorCount: (f.visitorCount === '' || Number(f.visitorCount) < 0) && 'Enter how many people were served.',
        }),
        create: (f) => api.visitors.create(toBody(f)),
        update: (row, f) => api.visitors.update(row.id, toBody(f)),
        remove: (row) => api.visitors.remove(row.id),
        onChange: logs.reload,
    })

    const rows = useMemo(
        () => (logs.data || []).filter((r) => meal === 'ALL' || r.mealType === meal),
        [logs.data, meal]
    )

    const stats = useMemo(() => {
        const data = logs.data || []
        const week = visitorsByDay(data, lastNDays(7))
        const month = visitorsByDay(data, lastNDays(30))
        const busiest = month.reduce((best, d) => (d.total > (best?.total ?? 0) ? d : best), null)
        return {
            today: sum(data.filter((r) => r.date === todayISO()), 'visitorCount'),
            weekAvg: Math.round(sum(week, 'total') / 7),
            busiest,
            specialDays: new Set(data.filter((r) => r.isSpecialDay).map((r) => r.date)).size,
        }
    }, [logs.data])

    const columns = [
        { key: 'date', header: 'Date', cell: (r) => <span className="font-medium text-stone-900 dark:text-white">{relativeDay(r.date)}</span>, sortValue: (r) => r.date },
        { key: 'meal', header: 'Meal', cell: (r) => <Badge dot={mealColor[r.mealType]}>{humanize(r.mealType)}</Badge>, sortValue: (r) => r.mealType },
        { key: 'count', header: 'Visitors', align: 'right', cell: (r) => <span className="font-semibold text-stone-900 dark:text-white">{formatNumber(r.visitorCount)}</span>, sortValue: (r) => r.visitorCount },
        { key: 'special', header: 'Occasion', cell: (r) => (r.isSpecialDay ? <Badge tone="brand" icon={Star}>Special day</Badge> : <span className="text-stone-300 dark:text-stone-600">—</span>) },
        { key: 'notes', header: 'Notes', className: 'max-w-64 truncate', cell: (r) => r.notes || <span className="text-stone-300 dark:text-stone-600">—</span> },
        ...(isAdmin
            ? [{ key: 'actions', header: <span className="sr-only">Actions</span>, align: 'right', cell: (r) => <EditDeleteButtons label={`${humanize(r.mealType)} on ${formatDate(r.date)}`} onEdit={() => editor.openEdit(r)} onDelete={() => editor.askDelete(r)} /> }]
            : []),
    ]

    return (
        <div className="animate-fade-up">
            <PageHeader
                title="Visitors"
                description="How many people the langar served, meal by meal."
                actions={isAdmin && <Button icon={Plus} onClick={() => editor.openNew()}>Log visitors</Button>}
            />

            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Served today" icon={Users} value={formatNumber(stats.today)} loading={logs.loading && !logs.data} />
                <StatCard label="Daily average" icon={TrendingUp} tone="blue" value={formatNumber(stats.weekAvg)} hint="Last 7 days" loading={logs.loading && !logs.data} />
                <StatCard
                    label="Busiest day"
                    icon={CalendarDays}
                    tone="violet"
                    value={stats.busiest ? formatNumber(stats.busiest.total) : '—'}
                    hint={stats.busiest ? `${formatDate(stats.busiest.date)} · last 30 days` : 'Last 30 days'}
                    loading={logs.loading && !logs.data}
                />
                <StatCard label="Special days" icon={Star} tone="green" value={formatNumber(stats.specialDays)} hint="Gurpurabs and events logged" loading={logs.loading && !logs.data} />
            </div>

            <Table
                columns={columns}
                rows={logs.data && rows}
                loading={logs.loading}
                error={logs.error}
                onRetry={logs.reload}
                initialSort={{ key: 'date', dir: 'desc' }}
                searchPlaceholder="Search notes or dates…"
                searchText={(r) => `${r.date} ${formatDate(r.date)} ${r.mealType} ${r.notes || ''}`}
                toolbar={
                    <select aria-label="Filter by meal" className="input w-auto py-2" value={meal} onChange={(e) => setMeal(e.target.value)}>
                        <option value="ALL">All meals</option>
                        {MEAL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                }
                emptyTitle="No visitors logged yet"
                emptyMessage="Each meal gets its own entry, so you can see how breakfast, lunch and dinner compare."
                emptyAction={isAdmin && <Button size="sm" icon={Plus} onClick={() => editor.openNew()}>Log the first meal</Button>}
            />

            <RecordModal editor={editor} title="Log visitors" editTitle="Edit visitor log" description="One entry per meal service.">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Date" error={editor.errors.date}>
                        <input type="date" max={todayISO()} value={editor.form.date} onChange={editor.setField('date')} />
                    </Field>
                    <Field label="People served" error={editor.errors.visitorCount}>
                        <input type="number" inputMode="numeric" min="0" placeholder="e.g. 240" value={editor.form.visitorCount} onChange={editor.setField('visitorCount')} />
                    </Field>
                </div>
                <Segmented label="Meal" options={MEAL_OPTIONS} value={editor.form.mealType} onChange={editor.setField('mealType')} />
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 p-3 transition hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800/50">
                    <input type="checkbox" className="mt-0.5 size-4 accent-brand-700" checked={!!editor.form.isSpecialDay} onChange={editor.setField('isSpecialDay')} />
                    <span>
                        <span className="block text-sm font-medium text-stone-800 dark:text-stone-200">Special day</span>
                        <span className="block text-xs text-stone-500 dark:text-stone-400">A gurpurab, festival or event that drew extra people.</span>
                    </span>
                </label>
                <Field label="Notes" hint="Optional">
                    <textarea rows={2} maxLength={500} placeholder="e.g. Rain kept numbers low" value={editor.form.notes} onChange={editor.setField('notes')} />
                </Field>
            </RecordModal>

            <ConfirmDialog
                isOpen={!!editor.deleting}
                onClose={editor.cancelDelete}
                onConfirm={editor.confirmDelete}
                title="Delete this visitor log?"
                message={editor.deleting && `${humanize(editor.deleting.mealType)} on ${formatDate(editor.deleting.date)} (${formatNumber(editor.deleting.visitorCount)} visitors) will be removed. This can't be undone.`}
            />
        </div>
    )
}

function toBody(f) {
    return {
        date: f.date,
        mealType: f.mealType,
        visitorCount: Number(f.visitorCount),
        isSpecialDay: !!f.isSpecialDay,
        notes: f.notes?.trim() || null,
    }
}
