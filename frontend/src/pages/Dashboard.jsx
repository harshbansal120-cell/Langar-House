import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import {
    Users, Leaf, Wallet, UserCheck, AlertTriangle, ArrowRight, Sparkles, Plus, ChefHat, PackageCheck, RotateCw,
} from 'lucide-react'
import { api } from '../lib/api'
import { useApi } from '../lib/useApi'
import { useAuth } from '../context/AuthContext'
import { visitorsByDay, forecastFor } from '../lib/insights'
import {
    todayISO, addDays, lastNDays, formatLongDate, formatShortDate, formatNumber, formatCurrency, formatPercent, formatCompact, relativeDay,
} from '../lib/format'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import Button from '../components/ui/Button'
import { ChartCard, ChartTooltip } from '../components/charts/ChartParts'
import { axisProps, gridProps, MEAL_SERIES } from '../components/charts/chartTheme'

function greeting() {
    const h = new Date().getHours()
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export default function Dashboard() {
    const { profile, isAdmin } = useAuth()
    const [date, setDate] = useState(todayISO())

    const summary = useApi(() => api.dashboard.summary(date), [date])
    const history = useApi(() => Promise.all([api.visitors.list(), api.food.list()]), [])

    const s = summary.data
    const [visitorLogs, foodLogs] = history.data || []
    const days = lastNDays(14, date)
    const chartData = visitorsByDay(visitorLogs, days)
    const tomorrow = addDays(todayISO(), 1)
    const forecast = history.data ? forecastFor(tomorrow, visitorLogs, foodLogs) : null
    const firstName = profile?.full_name?.split(' ')[0]

    return (
        <div className="animate-fade-up">
            <PageHeader
                title={`${greeting()}${firstName ? `, ${firstName}` : ''}`}
                description={`Here's how the langar is doing on ${date === todayISO() ? 'today, ' : ''}${formatLongDate(date)}.`}
                actions={
                    <>
                        <label className="sr-only" htmlFor="dash-date">Date</label>
                        <input
                            id="dash-date"
                            type="date"
                            className="input w-auto py-2"
                            value={date}
                            max={todayISO()}
                            onChange={(e) => e.target.value && setDate(e.target.value)}
                        />
                        {date !== todayISO() && <Button variant="ghost" size="sm" onClick={() => setDate(todayISO())}>Today</Button>}
                    </>
                }
            />

            {summary.error && (
                <div className="card mb-6 flex flex-wrap items-center justify-between gap-3 border-red-200 bg-red-50/60 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                    <span className="flex items-center gap-2"><AlertTriangle className="size-4" /> {summary.error.message}</span>
                    <Button variant="secondary" size="sm" icon={RotateCw} onClick={summary.reload}>Retry</Button>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Visitors served"
                    icon={Users}
                    loading={summary.loading && !s}
                    value={formatNumber(s?.totalVisitors)}
                    hint={s && `${formatNumber(s.breakfastVisitors)} breakfast · ${formatNumber(s.lunchVisitors)} lunch · ${formatNumber(s.dinnerVisitors)} dinner`}
                />
                <StatCard
                    label="Food eaten"
                    icon={Leaf}
                    tone="green"
                    loading={summary.loading && !s}
                    value={s?.totalFoodPrepared ? formatPercent(s.overallEfficiencyPercent) : '—'}
                    hint={s && (s.totalFoodPrepared ? `${formatNumber(s.totalFoodWasted)} kg wasted of ${formatNumber(s.totalFoodPrepared)} kg cooked` : 'No meals logged yet')}
                />
                <StatCard
                    label="Spent"
                    icon={Wallet}
                    tone="violet"
                    loading={summary.loading && !s}
                    value={formatCurrency(s?.totalExpenses)}
                    hint="Purchases recorded for this day"
                />
                <StatCard
                    label="Sevadars present"
                    icon={UserCheck}
                    tone="blue"
                    loading={summary.loading && !s}
                    value={formatNumber(s?.staffPresent)}
                    hint={s && `${s.staffAbsent} absent · ${s.staffOnLeave} on leave`}
                />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <ChartCard
                    className="lg:col-span-2"
                    title="Visitors, last 14 days"
                    subtitle={`${formatShortDate(days[0])} – ${formatShortDate(days[days.length - 1])}`}
                    legend={MEAL_SERIES.map((m) => ({ label: m.label, color: m.color }))}
                    actions={<Link to="/dashboard/visitors" className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-400">All logs</Link>}
                >
                    <div className="h-64">
                        {history.loading && !history.data ? (
                            <div className="size-full animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barCategoryGap="22%">
                                    <CartesianGrid {...gridProps} />
                                    <XAxis dataKey="date" {...axisProps} tickFormatter={(d) => formatShortDate(d).split(' ')[0]} interval="preserveStartEnd" minTickGap={8} />
                                    <YAxis {...axisProps} tickFormatter={formatCompact} width={48} />
                                    <Tooltip
                                        cursor={{ fill: 'var(--chart-grid)', opacity: 0.5 }}
                                        content={<ChartTooltip labelFormatter={relativeDay} format={formatNumber} showTotal />}
                                    />
                                    {MEAL_SERIES.map((m, i) => (
                                        <Bar
                                            key={m.key}
                                            dataKey={m.key}
                                            name={m.label}
                                            stackId="v"
                                            fill={m.color}
                                            stroke="var(--chart-surface)"
                                            strokeWidth={1}
                                            maxBarSize={24}
                                            radius={i === MEAL_SERIES.length - 1 ? [4, 4, 0, 0] : 0}
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </ChartCard>

                <div className="flex flex-col gap-4">
                    <section className="card relative overflow-hidden p-5">
                        <div className="absolute -top-10 -right-10 size-32 rounded-full bg-brand-100/70 blur-2xl dark:bg-brand-900/20" />
                        <p className="relative flex items-center gap-1.5 text-sm font-medium text-brand-800 dark:text-brand-300">
                            <Sparkles className="size-4" /> Plan for tomorrow
                        </p>
                        {forecast ? (
                            <div className="relative">
                                <p className="mt-3 text-4xl font-semibold tracking-tight text-stone-900 dark:text-white">
                                    ~{formatNumber(forecast.visitors)}
                                    <span className="ml-1.5 text-base font-normal text-stone-500 dark:text-stone-400">visitors</span>
                                </p>
                                {forecast.foodKg && (
                                    <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
                                        Cook about <strong className="font-semibold text-stone-900 dark:text-white">{formatNumber(forecast.foodKg)} kg</strong> across all meals.
                                    </p>
                                )}
                                <p className="mt-3 text-xs text-stone-500 dark:text-stone-400">
                                    Average of the last {forecast.weeksSampled} {new Intl.DateTimeFormat('en-IN', { weekday: 'long' }).format(new Date(tomorrow + 'T00:00'))}s, scaled by recent kg eaten per visitor.
                                </p>
                            </div>
                        ) : (
                            <p className="relative mt-3 text-sm text-stone-500 dark:text-stone-400">
                                {history.loading ? 'Crunching the numbers…' : 'Log a few weeks of visitors to see an estimate here.'}
                            </p>
                        )}
                    </section>

                    <section className="card flex-1 p-5">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-stone-900 dark:text-white">Running low</h2>
                            {s?.lowStockCount > 0 && (
                                <span className="tabular rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950/50 dark:text-red-300">
                                    {s.lowStockCount}
                                </span>
                            )}
                        </div>
                        {s && s.lowStockItems.length === 0 && (
                            <p className="mt-4 flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                                <PackageCheck className="size-4 text-emerald-600" /> Everything is above its reorder level.
                            </p>
                        )}
                        <ul className="mt-3 space-y-1.5">
                            {s?.lowStockItems.slice(0, 5).map((name) => (
                                <li key={name} className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
                                    <AlertTriangle className="size-3.5 shrink-0 text-amber-500" /> {name}
                                </li>
                            ))}
                        </ul>
                        {s?.lowStockCount > 0 && (
                            <Link
                                to="/dashboard/inventory?filter=low"
                                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline dark:text-brand-400"
                            >
                                Review stock <ArrowRight className="size-3.5" />
                            </Link>
                        )}
                    </section>
                </div>
            </div>

            {isAdmin && (
                <section className="mt-4">
                    <h2 className="sr-only">Quick actions</h2>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {[
                            { to: '/dashboard/visitors?new=1', label: 'Log visitors', icon: Users },
                            { to: '/dashboard/food-prepared?new=1', label: 'Log a meal', icon: ChefHat },
                            { to: '/dashboard/expenses?new=1', label: 'Record expense', icon: Wallet },
                            { to: '/dashboard/attendance?new=1', label: 'Mark attendance', icon: UserCheck },
                        ].map((a) => (
                            <Link
                                key={a.to}
                                to={a.to}
                                className="card group flex items-center gap-3 p-4 transition hover:border-brand-300 hover:shadow-md dark:hover:border-brand-800"
                            >
                                <span className="flex size-9 items-center justify-center rounded-lg bg-stone-100 text-stone-600 transition group-hover:bg-brand-50 group-hover:text-brand-700 dark:bg-stone-800 dark:text-stone-300 dark:group-hover:bg-brand-950 dark:group-hover:text-brand-400">
                                    <a.icon className="size-[18px]" />
                                </span>
                                <span className="text-sm font-medium text-stone-800 dark:text-stone-200">{a.label}</span>
                                <Plus className="ml-auto size-4 text-stone-300 transition group-hover:text-brand-600" />
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}
