import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { Menu, X, MapPin, Phone, Mail, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import Button from '../components/ui/Button'

const navigation = [
    { name: 'About', path: '/about' },
    { name: 'Our impact', path: '/impact' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
]

export default function MainLayout() {
    const [open, setOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const location = useLocation()
    const { user } = useAuth()

    const [lastPath, setLastPath] = useState(location.pathname)
    if (location.pathname !== lastPath) {
        setLastPath(location.pathname)
        setOpen(false)
    }
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [location.pathname])

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8)
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const cta = user ? (
        <Button as={Link} to="/dashboard" size="sm" icon={ArrowRight} className="flex-row-reverse">Dashboard</Button>
    ) : (
        <Button as={Link} to="/login" size="sm" variant="secondary">Staff login</Button>
    )

    return (
        <div className="flex min-h-screen flex-col bg-[#fbf8f4] dark:bg-stone-950">
            <header
                className={clsx(
                    'sticky top-0 z-40 border-b transition-colors',
                    scrolled
                        ? 'border-stone-200/80 bg-[#fbf8f4]/85 backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/85'
                        : 'border-transparent'
                )}
            >
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                    <Logo />
                    <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    clsx(
                                        'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                        isActive
                                            ? 'text-brand-800 dark:text-brand-400'
                                            : 'text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white'
                                    )
                                }
                            >
                                {item.name}
                            </NavLink>
                        ))}
                        <ThemeToggle className="ml-1" />
                        <div className="ml-2">{cta}</div>
                    </nav>
                    <div className="flex items-center gap-1 md:hidden">
                        <ThemeToggle />
                        <Button
                            variant="ghost"
                            size="icon"
                            icon={open ? X : Menu}
                            onClick={() => setOpen(!open)}
                            aria-label={open ? 'Close menu' : 'Open menu'}
                            aria-expanded={open}
                        />
                    </div>
                </div>
                {open && (
                    <nav className="animate-fade-up border-t border-stone-200 bg-[#fbf8f4] px-4 pt-2 pb-4 md:hidden dark:border-stone-800 dark:bg-stone-950">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    clsx(
                                        'block rounded-lg px-3 py-2.5 text-base font-medium',
                                        isActive ? 'bg-brand-50 text-brand-800 dark:bg-brand-950/50 dark:text-brand-300' : 'text-stone-700 dark:text-stone-200'
                                    )
                                }
                            >
                                {item.name}
                            </NavLink>
                        ))}
                        <div className="mt-3 [&>*]:w-full">{cta}</div>
                    </nav>
                )}
            </header>

            <main className="flex-1">
                <Outlet />
            </main>

            <footer className="border-t border-stone-200 bg-stone-900 text-stone-300 dark:border-stone-800 dark:bg-black">
                <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
                    <div>
                        <Logo light />
                        <p className="mt-4 max-w-xs text-sm leading-relaxed text-stone-400">
                            A free community kitchen in the Sikh tradition of langar. Everyone is welcome, and everyone eats together.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">Explore</h3>
                        <ul className="mt-4 space-y-2.5 text-sm">
                            {navigation.map((item) => (
                                <li key={item.path}>
                                    <Link to={item.path} className="text-stone-400 transition hover:text-white">{item.name}</Link>
                                </li>
                            ))}
                            <li><Link to="/login" className="text-stone-400 transition hover:text-white">Staff login</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">Visit</h3>
                        <ul className="mt-4 space-y-3 text-sm text-stone-400">
                            <li className="flex gap-2.5"><MapPin className="mt-0.5 size-4 shrink-0 text-brand-400" />123 Seva Marg, New Delhi 110001</li>
                            <li className="flex gap-2.5"><Phone className="mt-0.5 size-4 shrink-0 text-brand-400" />+91 98765 43210</li>
                            <li className="flex gap-2.5"><Mail className="mt-0.5 size-4 shrink-0 text-brand-400" />contact@langarhouse.org</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-white/10">
                    <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-stone-500 sm:px-6">
                        © {new Date().getFullYear()} Langar House. Served with love, every day.
                    </p>
                </div>
            </footer>
        </div>
    )
}
