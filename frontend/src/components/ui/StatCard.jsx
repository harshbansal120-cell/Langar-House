import clsx from 'clsx'

const iconTones = {
    brand: 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-400',
    blue: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400',
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
    red: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400',
    violet: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400',
}

/** Stat tile: label · value · optional hint line. Shows a shimmer while loading. */
export default function StatCard({ label, value, hint, icon: Icon, tone = 'brand', loading, children, className }) {
    return (
        <div className={clsx('card flex flex-col gap-3 p-5', className)}>
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-stone-500 dark:text-stone-400">{label}</p>
                {Icon && (
                    <span className={clsx('flex size-8 items-center justify-center rounded-lg', iconTones[tone])}>
                        <Icon className="size-4" />
                    </span>
                )}
            </div>
            {loading ? (
                <div className="h-8 w-24 animate-pulse rounded-md bg-stone-100 dark:bg-stone-800" />
            ) : (
                <p className="text-[1.75rem] leading-none font-semibold tracking-tight text-stone-900 dark:text-white">{value}</p>
            )}
            {hint && !loading && <p className="text-xs text-stone-500 dark:text-stone-400">{hint}</p>}
            {children}
        </div>
    )
}
