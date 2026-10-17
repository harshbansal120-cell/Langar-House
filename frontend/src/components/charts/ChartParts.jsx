import clsx from 'clsx'

export function ChartCard({ title, subtitle, legend, actions, children, className }) {
    return (
        <section className={clsx('card p-5', className)}>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="font-semibold text-stone-900 dark:text-white">{title}</h2>
                    {subtitle && <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">{subtitle}</p>}
                </div>
                {actions}
            </div>
            {legend && <Legend items={legend} />}
            {children}
        </section>
    )
}

/** Legend: colour swatch beside ink-coloured text (text never wears the series colour). */
export function Legend({ items }) {
    return (
        <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-600 dark:text-stone-300">
            {items.map((i) => (
                <li key={i.label} className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-[3px]" style={{ background: i.color }} />
                    {i.label}
                </li>
            ))}
        </ul>
    )
}

/** Recharts tooltip content. `format(value, name)` renders each value. */
export function ChartTooltip({ active, payload, label, labelFormatter, format = (v) => v, showTotal }) {
    if (!active || !payload?.length) return null
    const total = payload.reduce((a, p) => a + (Number(p.value) || 0), 0)
    return (
        <div className="min-w-36 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-stone-700 dark:bg-stone-900">
            <p className="mb-1.5 font-medium text-stone-900 dark:text-white">{labelFormatter ? labelFormatter(label) : label}</p>
            <ul className="space-y-1">
                {payload.map((p) => (
                    <li key={p.dataKey} className="flex items-center justify-between gap-4 text-stone-600 dark:text-stone-300">
                        <span className="flex items-center gap-1.5">
                            <span className="size-2 rounded-[2px]" style={{ background: p.color || p.fill }} />
                            {p.name}
                        </span>
                        <span className="tabular font-medium text-stone-900 dark:text-white">{format(p.value, p.name)}</span>
                    </li>
                ))}
            </ul>
            {showTotal && payload.length > 1 && (
                <p className="mt-1.5 flex justify-between border-t border-stone-100 pt-1.5 font-medium text-stone-900 dark:border-stone-800 dark:text-white">
                    <span>Total</span>
                    <span className="tabular">{format(total)}</span>
                </p>
            )}
        </div>
    )
}
