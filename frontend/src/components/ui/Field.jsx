import { useId, cloneElement } from 'react'
import clsx from 'clsx'

/** Label + control + hint/error. Wires the label and hint to the child control's id. */
export default function Field({ label, hint, error, className, children }) {
    const id = useId()
    const hintId = `${id}-hint`
    return (
        <div className={className}>
            {label && <label htmlFor={id} className="label">{label}</label>}
            {cloneElement(children, {
                id,
                'aria-describedby': hint || error ? hintId : undefined,
                'aria-invalid': error ? true : undefined,
                className: clsx('input', error && 'border-red-500 focus:border-red-500 focus:ring-red-500/15', children.props.className),
            })}
            {(error || hint) && (
                <p id={hintId} className={clsx('mt-1.5 text-xs', error ? 'text-red-600 dark:text-red-400' : 'text-stone-500 dark:text-stone-400')}>
                    {error || hint}
                </p>
            )}
        </div>
    )
}

/** Pill-style single choice, e.g. meal type or attendance status. */
export function Segmented({ options, value, onChange, label, className }) {
    return (
        <div className={className}>
            {label && <span className="label">{label}</span>}
            <div role="radiogroup" aria-label={label} className="inline-flex w-full rounded-xl bg-stone-100 p-1 dark:bg-stone-800">
                {options.map((o) => {
                    const active = o.value === value
                    return (
                        <button
                            key={o.value}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => onChange(o.value)}
                            className={clsx(
                                'flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition',
                                active
                                    ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-950 dark:text-white'
                                    : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                            )}
                        >
                            {o.label}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
