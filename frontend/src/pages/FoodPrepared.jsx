import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Plus, ChefHat, Leaf, Trash, Award } from 'lucide-react'
import { api } from '../lib/api'
import { useApi } from '../lib/useApi'
import { useEditor } from '../lib/useEditor'
import { useAuth } from '../context/AuthContext'
import { todayISO, lastNDays, relativeDay, formatNumber, formatDate, formatShortDate, formatPercent, humanize, sum } from '../lib/format'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Meter from '../components/ui/Meter'
import Table from '../components/ui/Table'
import Field, { Segmented } from '../components/ui/Field'
import RecordModal, { EditDeleteButtons } from '../components/ui/RecordModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { ChartCard, ChartTooltip } from '../components/charts/ChartParts'
import { axisProps, gridProps, MEAL_SERIES } from '../components/charts/chartTheme'

const MEAL_OPTIONS = MEAL_SERIES.map((m) => ({ value: m.key, label: m.label }))
const mealColor = Object.fromEntries(MEAL_SERIES.map((m) => [m.key, m.color]))
const efficiencyTone = (p) => (p >= 90 ? 'good' : p >= 80 ? 'warning' : 'critical')

export default function FoodPrepared() {
    const { isAdmin } = useAuth()
    const logs = useApi(() => api.food.list(), [])

    const editor = useEditor({
        noun: 'meal',
        empty: () => ({ date: todayISO(), mealType: 'LUNCH', dishName: '', unit: 'kg', quantityPrepared: '', quantityWasted: '0' }),
        toForm: (r) => ({ ...r, quantityPrepared: String(r.quantityPrepared), quantityWasted: String(r.quantityWasted) }),
        validate: (f) => ({
            dishName: !f.dishName.trim() && 'Name the dish.',
            quantityPrepared: !(Number(f.quantityPrepared) > 0) && 'Enter how much was cooked.',
            quantityWasted:
                f.quantityWasted === '' || Number(f.quantityWasted) < 0
                    ? 'Enter 0 if nothing was wasted.'
                    : Number(f.quantityWasted) > Number(f.quantityPrepared) && "Wasted can't be more than what was cooked.",
        }),
        create: (f) => api.food.create(toBody(f)),
        update: (row, f) => api.food.update(row.id, toBody(f)),
        remove: (row) => api.food.remove(row.id),
        onChange: logs.reload,
    })

    const { stats, chart } = useMemo(() => {
        const data = logs.data || []
        const days = lastNDays(30)
        const window = new Set(days)
        const recent = data.filter((r) => window.has(r.date) && r.unit === 'kg')
        const cooked = sum(recent, 'quantityPrepared')
        const wasted = sum(recent, 'quantityWasted')

        const byDish = {}
        for (const r of recent) {
            byDish[r.dishName] ??= { prepared: 0, wasted: 0 }
            byDish[r.dishName].prepared += r.quantityPrepared
            byDish[r.dishName].wasted += r.quantityWasted
        }
        const best = Object.entries(byDish)
            .filter(([, v]) => v.prepared >= 20)
            .map(([name, v]) => ({ name, rate: ((v.prepared - v.wasted) / v.prepared) * 100 }))
            .sort((a, b) => b.rate - a.rate)[0]

        const chartDays = lastNDays(14)
        const chart = chartDays.map((date) => {
            const rows = data.filter((r) => r.date === date && r.unit === 'kg')
            return { date, consumed: Math.round(sum(rows, 'quantityConsumed') * 10) / 10, wasted: Math.round(sum(rows, 'quantityWasted') * 10) / 10 }
        })

        return {
            stats: { cooked, wasted, efficiency: cooked ? ((cooked - wasted) / cooked) * 100 : 0, best },
            chart,
        }
    }, [logs.data])

    const columns = [
        { key: 'date', header: 'Date', cell: (r) => <span className="font-medium text-stone-900 dark:text-white">{relativeDay(r.date)}</span>, sortValue: (r) => r.date },
        { key: 'meal', header: 'Meal', cell: (r) => <Badge dot={mealColor[r.mealType]}>{humanize(r.mealType)}</Badge>, sortValue: (r) => r.mealType },
        { key: 'dish', header: 'Dish', cell: (r) => <span className="text-stone-900 dark:text-white">{r.dishName}</span>, sortValue: (r) => r.dishName },
        { key: 'cooked', header: 'Cooked', align: 'right', cell: (r) => `${formatNumber(r.quantityPrepared)} ${r.unit}`, sortValue: (r) => r.quantityPrepared },
        { key: 'wasted', header: 'Wasted', align: 'right', cell: (r) => `${formatNumber(r.quantityWasted)} ${r.unit}`, sortValue: (r) => r.quantityWasted },
        { key: 'eff', header: 'Eaten', cell: (r) => <Meter value={r.efficiencyPercent} tone={efficiencyTone(r.efficiencyPercent)} label={formatPercent(r.efficiencyPercent)} />, sortValue: (r) => r.efficiencyPercent },
        ...(isAdmin
            ? [{ key: 'actions', header: <span className="sr-only">Actions</span>, align: 'right', cell: (r) => <EditDeleteButtons label={r.dishName} onEdit={() => editor.openEdit(r)} onDelete={() => editor.askDelete(r)} /> }]
            : []),
    ]

    const prepared = Number(editor.form.quantityPrepared) || 0
    const wasted = Number(editor.form.quantityWasted) || 0
    const loadingFirst = logs.loading && !logs.data

    return (
        <div className="animate-fade-up">
            <PageHeader
                title="Kitchen"
                description="What was cooked, what was eaten, and what went to waste."
                actions={isAdmin && <Button icon={Plus} onClick={() => editor.openNew()}>Log a meal</Button>}
            />

            <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Cooked" icon={ChefHat} value={`${formatNumber(Math.round(stats.cooked))} kg`} hint="Last 30 days" loading={loadingFirst} />
                <StatCard label="Eaten, not wasted" icon={Leaf} tone="green" value={formatPercent(stats.efficiency)} hint="Last 30 days" loading={loadingFirst} />
                <StatCard label="Wasted" icon={Trash} tone="red" value={`${formatNumber(Math.round(stats.wasted))} kg`} hint="Last 30 days" loading={loadingFirst} />
                <StatCard label="Least wasted dish" icon={Award} tone="violet" value={stats.best ? stats.best.name : '—'} hint={stats.best && `${formatPercent(stats.best.rate)} eaten`} loading={loadingFirst} />
            </div>

            <ChartCard
                className="mb-4"
                title="Eaten vs. wasted, last 14 days"
                subtitle="Kilograms, all meals"
                legend={[{ label: 'Eaten', color: 'var(--series-1)' }, { label: 'Wasted', color: 'var(--series-2)' }]}
            >
                <div className="h-56">
                    {loadingFirst ? (
                        <div className="size-full animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chart} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barCategoryGap="22%">
                                <CartesianGrid {...gridProps} />
                                <XAxis dataKey="date" {...axisProps} tickFormatter={(d) => formatShortDate(d).split(' ')[0]} minTickGap={8} />
                                <YAxis {...axisProps} width={48} />
                                <Tooltip cursor={{ fill: 'var(--chart-grid)', opacity: 0.5 }} content={<ChartTooltip labelFormatter={relativeDay} format={(v) => `${formatNumber(v)} kg`} showTotal />} />
                                <Bar dataKey="consumed" name="Eaten" stackId="f" fill="var(--series-1)" stroke="var(--chart-surface)" strokeWidth={1} maxBarSize={24} />
                                <Bar dataKey="wasted" name="Wasted" stackId="f" fill="var(--series-2)" stroke="var(--chart-surface)" strokeWidth={1} maxBarSize={24} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </ChartCard>

            <Table
                columns={columns}
                rows={logs.data}
                loading={logs.loading}
                error={logs.error}
                onRetry={logs.reload}
                initialSort={{ key: 'date', dir: 'desc' }}
                searchPlaceholder="Search dishes…"
                searchText={(r) => `${r.dishName} ${r.mealType} ${r.date} ${formatDate(r.date)}`}
                emptyTitle="No meals logged yet"
                emptyMessage="Log each dish after service to track how much is eaten and how much is wasted."
                emptyAction={isAdmin && <Button size="sm" icon={Plus} onClick={() => editor.openNew()}>Log a meal</Button>}
            />

            <RecordModal editor={editor} title="Log a meal" editTitle="Edit meal" description="Record a dish after service, including any leftovers thrown away.">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Date">
                        <input type="date" max={todayISO()} value={editor.form.date} onChange={editor.setField('date')} />
                    </Field>
                    <Field label="Dish" error={editor.errors.dishName}>
                        <input placeholder="e.g. Dal makhani" value={editor.form.dishName} onChange={editor.setField('dishName')} />
                    </Field>
                </div>
                <Segmented label="Meal" options={MEAL_OPTIONS} value={editor.form.mealType} onChange={editor.setField('mealType')} />
                <div className="grid grid-cols-[1fr_1fr_6.5rem] gap-3">
                    <Field label="Cooked" error={editor.errors.quantityPrepared}>
                        <input type="number" inputMode="decimal" min="0" step="0.1" value={editor.form.quantityPrepared} onChange={editor.setField('quantityPrepared')} />
                    </Field>
                    <Field label="Wasted" error={editor.errors.quantityWasted}>
                        <input type="number" inputMode="decimal" min="0" step="0.1" value={editor.form.quantityWasted} onChange={editor.setField('quantityWasted')} />
                    </Field>
                    <Field label="Unit">
                        <select value={editor.form.unit} onChange={editor.setField('unit')}>
                            <option value="kg">kg</option>
                            <option value="liters">liters</option>
                        </select>
                    </Field>
                </div>
                {prepared > 0 && wasted <= prepared && (
                    <p className="rounded-xl bg-stone-50 px-3 py-2.5 text-sm text-stone-600 dark:bg-stone-800/60 dark:text-stone-300">
                        {formatNumber(prepared - wasted)} {editor.form.unit} eaten ·{' '}
                        <strong className="font-semibold text-stone-900 dark:text-white">{formatPercent(((prepared - wasted) / prepared) * 100)}</strong> of what was cooked
                    </p>
                )}
            </RecordModal>

            <ConfirmDialog
                isOpen={!!editor.deleting}
                onClose={editor.cancelDelete}
                onConfirm={editor.confirmDelete}
                title="Delete this meal?"
                message={editor.deleting && `${editor.deleting.dishName} (${humanize(editor.deleting.mealType)}, ${formatDate(editor.deleting.date)}) will be removed. This can't be undone.`}
            />
        </div>
    )
}

function toBody(f) {
    return {
        date: f.date,
        mealType: f.mealType,
        dishName: f.dishName.trim(),
        unit: f.unit,
        quantityPrepared: Number(f.quantityPrepared),
        quantityWasted: Number(f.quantityWasted),
    }
}
