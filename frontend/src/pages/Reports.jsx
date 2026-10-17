import { useMemo, useState } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Download, Users, IndianRupee, Leaf, Receipt, FileSpreadsheet, AlertTriangle } from 'lucide-react'
import { api } from '../lib/api'
import { useApi } from '../lib/useApi'
import { useToast } from '../context/ToastContext'
import { lastNDays, formatShortDate, formatNumber, formatCurrency, formatCurrencyPrecise, formatCompact, formatPercent, relativeDay, humanize, sum } from '../lib/format'
import { downloadCsv } from '../lib/csv'
import { visitorsByDay } from '../lib/insights'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import { Segmented } from '../components/ui/Field'
import { ChartCard, ChartTooltip } from '../components/charts/ChartParts'
import { axisProps, gridProps } from '../components/charts/chartTheme'

const RANGES = [
    { value: '7', label: '7 days' },
    { value: '30', label: '30 days' },
    { value: '90', label: '90 days' },
]

export default function Reports() {
    const toast = useToast()
    const [range, setRange] = useState('30')
    const data = useApi(() => Promise.all([api.visitors.list(), api.food.list(), api.expenses.list(), api.attendance.list()]), [])

    const days = useMemo(() => lastNDays(Number(range)), [range])
    const report = useMemo(() => {
        if (!data.data) return null
        const inRange = new Set(days)
        const [visitors, food, expenses, attendance] = data.data.map((list) => list.filter((r) => inRange.has(r.date)))
        const daily = visitorsByDay(visitors, days).map((d) => ({
            date: d.date,
            visitors: d.total,
            spend: Math.round(sum(expenses.filter((e) => e.date === d.date), 'total')),
        }))
        const totalVisitors = sum(visitors, 'visitorCount')
        const totalSpend = sum(expenses, 'total')
        const cooked = sum(food, 'quantityPrepared')
        const wasted = sum(food, 'quantityWasted')
        return {
            visitors, food, expenses, attendance, daily,
            totalVisitors,
            totalSpend,
            costPerVisitor: totalVisitors ? totalSpend / totalVisitors : 0,
            efficiency: cooked ? ((cooked - wasted) / cooked) * 100 : 0,
        }
    }, [data.data, days])

    const label = `last ${range} days`
    const period = `${formatShortDate(days[0])} – ${formatShortDate(days[days.length - 1])}`
    const fileSuffix = `${days[0]}_to_${days[days.length - 1]}.csv`

    const exports = report && [
        {
            title: 'Visitor logs',
            count: report.visitors.length,
            run: () => downloadCsv(`visitors_${fileSuffix}`, [
                { header: 'Date', value: 'date' },
                { header: 'Meal', value: (r) => humanize(r.mealType) },
                { header: 'Visitors', value: 'visitorCount' },
                { header: 'Special day', value: (r) => (r.isSpecialDay ? 'Yes' : 'No') },
                { header: 'Notes', value: 'notes' },
            ], report.visitors),
        },
        {
            title: 'Kitchen log',
            count: report.food.length,
            run: () => downloadCsv(`kitchen_${fileSuffix}`, [
                { header: 'Date', value: 'date' },
                { header: 'Meal', value: (r) => humanize(r.mealType) },
                { header: 'Dish', value: 'dishName' },
                { header: 'Unit', value: 'unit' },
                { header: 'Cooked', value: 'quantityPrepared' },
                { header: 'Wasted', value: 'quantityWasted' },
                { header: 'Eaten', value: 'quantityConsumed' },
                { header: 'Eaten %', value: 'efficiencyPercent' },
            ], report.food),
        },
        {
            title: 'Expenses',
            count: report.expenses.length,
            run: () => downloadCsv(`expenses_${fileSuffix}`, [
                { header: 'Date', value: 'date' },
                { header: 'Item', value: 'itemName' },
                { header: 'Category', value: 'category' },
                { header: 'Quantity', value: 'quantity' },
                { header: 'Unit', value: 'unit' },
                { header: 'Price per unit (INR)', value: 'price' },
                { header: 'Total (INR)', value: 'total' },
            ], report.expenses),
        },
        {
            title: 'Attendance',
            count: report.attendance.length,
            run: () => downloadCsv(`attendance_${fileSuffix}`, [
                { header: 'Date', value: 'date' },
                { header: 'Staff ID', value: 'staffId' },
                { header: 'Role', value: 'role' },
                { header: 'Shift', value: (r) => humanize(r.shift) },
                { header: 'Status', value: (r) => humanize(r.status) },
            ], report.attendance),
        },
    ]

    const loadingFirst = data.loading && !data.data

    return (
        <div className="animate-fade-up">
            <PageHeader
                title="Reports"
                description={`Trends and exports for ${period}.`}
                actions={<Segmented options={RANGES} value={range} onChange={setRange} className="w-64" />}
            />

            {data.error && (
                <div className="card mb-6 flex items-center gap-2 border-red-200 bg-red-50/60 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                    <AlertTriangle className="size-4" /> {data.error.message}
                </div>
            )}

            <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Visitors served" icon={Users} value={formatNumber(report?.totalVisitors)} hint={label} loading={loadingFirst} />
                <StatCard label="Total spend" icon={Receipt} tone="violet" value={formatCurrency(report?.totalSpend)} hint={label} loading={loadingFirst} />
                <StatCard label="Cost per visitor" icon={IndianRupee} tone="blue" value={formatCurrencyPrecise(report?.costPerVisitor)} hint="Spend ÷ people served" loading={loadingFirst} />
                <StatCard label="Food eaten" icon={Leaf} tone="green" value={formatPercent(report?.efficiency)} hint={label} loading={loadingFirst} />
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <ChartCard title="Visitors per day" subtitle={period}>
                    <div className="h-64">
                        {loadingFirst ? <ChartSkeleton /> : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={report.daily} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                    <CartesianGrid {...gridProps} />
                                    <XAxis dataKey="date" {...axisProps} tickFormatter={formatShortDate} minTickGap={24} />
                                    <YAxis {...axisProps} tickFormatter={formatCompact} width={48} />
                                    <Tooltip cursor={{ stroke: 'var(--chart-axis)', strokeWidth: 1 }} content={<ChartTooltip labelFormatter={relativeDay} format={formatNumber} />} />
                                    <Area
                                        type="monotone"
                                        dataKey="visitors"
                                        name="Visitors"
                                        stroke="var(--series-accent)"
                                        strokeWidth={2}
                                        fill="var(--series-accent-wash)"
                                        fillOpacity={1}
                                        dot={false}
                                        activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--chart-surface)', fill: 'var(--series-accent)' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </ChartCard>

                <ChartCard title="Spend per day" subtitle={period}>
                    <div className="h-64">
                        {loadingFirst ? <ChartSkeleton /> : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={report.daily} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                                    <CartesianGrid {...gridProps} />
                                    <XAxis dataKey="date" {...axisProps} tickFormatter={formatShortDate} minTickGap={24} />
                                    <YAxis {...axisProps} tickFormatter={(v) => `₹${formatCompact(v)}`} width={56} />
                                    <Tooltip cursor={{ fill: 'var(--chart-grid)', opacity: 0.5 }} content={<ChartTooltip labelFormatter={relativeDay} format={formatCurrency} />} />
                                    <Bar dataKey="spend" name="Spend" fill="var(--series-1)" radius={[4, 4, 0, 0]} maxBarSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </ChartCard>
            </div>

            <section className="card mt-4 p-5">
                <h2 className="font-semibold text-stone-900 dark:text-white">Download data</h2>
                <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">CSV files for {period}, ready for Excel or Google Sheets.</p>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {(exports || Array.from({ length: 4 }, () => null)).map((x, i) =>
                        x ? (
                            <button
                                key={x.title}
                                onClick={() => {
                                    if (!x.count) return toast.error(`No ${x.title.toLowerCase()} in this period.`)
                                    x.run()
                                    toast.success(`Downloaded ${x.title.toLowerCase()}.`)
                                }}
                                className="group flex items-center gap-3 rounded-xl border border-stone-200 p-3.5 text-left transition hover:border-brand-300 hover:bg-brand-50/40 dark:border-stone-700 dark:hover:border-brand-800 dark:hover:bg-brand-950/20"
                            >
                                <span className="flex size-9 items-center justify-center rounded-lg bg-stone-100 text-stone-600 group-hover:bg-white group-hover:text-brand-700 dark:bg-stone-800 dark:text-stone-300">
                                    <FileSpreadsheet className="size-[18px]" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-medium text-stone-900 dark:text-white">{x.title}</span>
                                    <span className="block text-xs text-stone-500 dark:text-stone-400">{formatNumber(x.count)} rows</span>
                                </span>
                                <Download className="size-4 text-stone-400 group-hover:text-brand-600" />
                            </button>
                        ) : (
                            <div key={i} className="h-16 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
                        )
                    )}
                </div>
            </section>
        </div>
    )
}

function ChartSkeleton() {
    return <div className="size-full animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
}
