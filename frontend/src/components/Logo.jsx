import { Link } from 'react-router-dom'
import clsx from 'clsx'

export function LogoMark({ className }) {
    return (
        <svg viewBox="0 0 32 32" className={clsx('shrink-0', className)} aria-hidden="true">
            <rect width="32" height="32" rx="9" fill="#c2410c" />
            <path d="M8.5 14h15a7.5 7.5 0 0 1-15 0Z" fill="#fff" />
            <path d="M13 6.5c0 2 2 2 2 4.2M17.5 6.5c0 2 2 2 2 4.2" stroke="#fed7aa" strokeWidth="1.7" fill="none" strokeLinecap="round" />
            <rect x="7.5" y="23.2" width="17" height="2.2" rx="1.1" fill="#fff" />
        </svg>
    )
}

export default function Logo({ to = '/', className, light }) {
    return (
        <Link to={to} className={clsx('flex items-center gap-2.5', className)}>
            <LogoMark className="size-9" />
            <span className={clsx('font-display text-lg font-semibold tracking-tight', light ? 'text-white' : 'text-stone-900 dark:text-white')}>
                Langar House
            </span>
        </Link>
    )
}
