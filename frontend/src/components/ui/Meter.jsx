import clsx from 'clsx'

/**
 * Small horizontal meter. The fill carries severity; the track is a light step
 * of the same hue. Always paired with a text value so colour isn't the only cue.
 */
const tones = {
    good: { fill: 'bg-emerald-500', track: 'bg-emerald-100 dark:bg-emerald-950' },
    warning: { fill: 'bg-amber-500', track: 'bg-amber-100 dark:bg-amber-950' },
    critical: { fill: 'bg-red-500', track: 'bg-red-100 dark:bg-red-950' },
}

export default function Meter({ value, max = 100, tone = 'good', label, className }) {
    const pct = Math.max(0, Math.min(100, (value / max) * 100))
    return (
        <div className={clsx('flex items-center gap-2', className)}>
            <div className={clsx('h-1.5 w-16 overflow-hidden rounded-full', tones[tone].track)}>
                <div className={clsx('h-full rounded-full', tones[tone].fill)} style={{ width: `${pct}%` }} />
            </div>
            {label && <span className="tabular text-xs font-medium text-stone-700 dark:text-stone-300">{label}</span>}
        </div>
    )
}
