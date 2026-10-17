import clsx from 'clsx'
import { Loader2 } from 'lucide-react'

const variants = {
    primary:
        'bg-brand-700 text-white shadow-sm shadow-brand-900/20 hover:bg-brand-800 active:bg-brand-900 dark:bg-brand-600 dark:hover:bg-brand-500',
    secondary:
        'border border-stone-300 bg-white text-stone-800 shadow-sm hover:bg-stone-50 active:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800',
    ghost: 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white',
    danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800',
}

const sizes = {
    sm: 'h-8 gap-1.5 rounded-lg px-3 text-sm',
    md: 'h-10 gap-2 rounded-xl px-4 text-sm',
    lg: 'h-12 gap-2 rounded-xl px-6 text-base',
    icon: 'size-9 rounded-lg',
}

export default function Button({
    as: Component = 'button',
    variant = 'primary',
    size = 'md',
    icon: Icon,
    loading = false,
    className,
    children,
    disabled,
    ...props
}) {
    return (
        <Component
            className={clsx(
                'inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap transition-colors select-none disabled:pointer-events-none disabled:opacity-50',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={Component === 'button' ? disabled || loading : undefined}
            {...(Component === 'button' && !props.type && { type: 'button' })}
            {...props}
        >
            {loading ? (
                <Loader2 className="size-4 animate-spin" />
            ) : (
                Icon && <Icon className={size === 'icon' ? 'size-[18px]' : 'size-4'} />
            )}
            {children}
        </Component>
    )
}
