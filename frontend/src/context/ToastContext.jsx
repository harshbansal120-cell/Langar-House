import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

    const push = useCallback((kind, message) => {
        const id = Math.random().toString(36).slice(2)
        setToasts((t) => [...t.slice(-2), { id, kind, message }])
        setTimeout(() => dismiss(id), kind === 'error' ? 6000 : 3500)
    }, [dismiss])

    const toast = {
        success: (m) => push('success', m),
        error: (m) => push('error', m instanceof Error ? m.message : m),
    }

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div
                aria-live="polite"
                className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
            >
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        role={t.kind === 'error' ? 'alert' : 'status'}
                        className="pointer-events-auto flex w-full max-w-sm animate-pop items-start gap-3 rounded-xl border border-stone-200 bg-white p-3.5 pr-2.5 text-sm shadow-lg shadow-stone-900/10 dark:border-stone-700 dark:bg-stone-900"
                    >
                        {t.kind === 'error' ? (
                            <AlertCircle className="mt-0.5 size-[18px] shrink-0 text-red-600 dark:text-red-400" />
                        ) : (
                            <CheckCircle2 className="mt-0.5 size-[18px] shrink-0 text-emerald-600 dark:text-emerald-400" />
                        )}
                        <p className="flex-1 text-stone-800 dark:text-stone-100">{t.message}</p>
                        <button
                            onClick={() => dismiss(t.id)}
                            className="rounded-md p-0.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800"
                            aria-label="Dismiss"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext)
