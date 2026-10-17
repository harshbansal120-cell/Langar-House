import { X } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'

export default function Modal({ isOpen, onClose, title, description, children, footer, size = 'md' }) {
    const titleId = useId()
    const panelRef = useRef(null)
    const onCloseRef = useRef(onClose)
    useEffect(() => {
        onCloseRef.current = onClose
    })

    useEffect(() => {
        if (!isOpen) return
        const previouslyFocused = document.activeElement
        const handleKey = (e) => {
            if (e.key === 'Escape') onCloseRef.current()
        }
        document.addEventListener('keydown', handleKey)
        document.body.style.overflow = 'hidden'
        // Focus the first field (or the panel) so keyboard users land inside.
        requestAnimationFrame(() => {
            const first = panelRef.current?.querySelector('input:not([type=hidden]), select, textarea, [data-autofocus]')
            ;(first || panelRef.current)?.focus()
        })
        return () => {
            document.removeEventListener('keydown', handleKey)
            document.body.style.overflow = ''
            previouslyFocused?.focus?.()
        }
    }, [isOpen])

    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
            <div className="absolute inset-0 bg-stone-950/50 backdrop-blur-[2px]" onClick={onClose} />
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className={clsx(
                    'relative flex max-h-[92vh] w-full animate-pop flex-col rounded-t-2xl bg-white shadow-2xl outline-none sm:rounded-2xl dark:bg-stone-900 dark:ring-1 dark:ring-stone-800',
                    size === 'sm' ? 'sm:max-w-md' : 'sm:max-w-xl'
                )}
            >
                <div className="flex items-start justify-between gap-4 border-b border-stone-100 px-5 py-4 sm:px-6 dark:border-stone-800">
                    <div>
                        <h2 id={titleId} className="text-lg font-semibold text-stone-900 dark:text-white">{title}</h2>
                        {description && <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">{description}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="-mr-1.5 rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                        aria-label="Close"
                    >
                        <X className="size-5" />
                    </button>
                </div>
                <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
                {footer && (
                    <div className="flex flex-col-reverse gap-2 border-t border-stone-100 bg-stone-50/60 px-5 py-3.5 sm:flex-row sm:justify-end sm:rounded-b-2xl sm:px-6 dark:border-stone-800 dark:bg-stone-900">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    )
}
