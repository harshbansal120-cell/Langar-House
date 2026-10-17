import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import clsx from 'clsx'
import {
    LayoutDashboard, Users, ChefHat, Package, Wallet, UserCheck, BarChart3, LogOut, Menu, X, FlaskConical, RotateCcw,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import Button from '../components/ui/Button'

const navigation = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard, end: true },
    { name: 'Visitors', path: '/dashboard/visitors', icon: Users },
    { name: 'Kitchen', path: '/dashboard/food-prepared', icon: ChefHat },
    { name: 'Inventory', path: '/dashboard/inventory', icon: Package },
    { name: 'Expenses', path: '/dashboard/expenses', icon: Wallet },
    { name: 'Attendance', path: '/dashboard/attendance', icon: UserCheck },
    { name: 'Reports', path: '/dashboard/reports', icon: BarChart3 },
]

function initials(name = '') {
    return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?'
}

function SidebarContent({ onNavigate }) {
    const { profile, user, isAdmin, isDemo, logout } = useAuth()
    const navigate = useNavigate()
    const name = profile?.full_name || user?.email || 'Sevadar'

    const signOut = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <div className="flex h-full flex-col">
            <div className="flex h-16 items-center px-5">
                <Logo to="/dashboard" />
            </div>

            <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4" aria-label="Dashboard">
                {navigation.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                            clsx(
                                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-brand-50 text-brand-800 dark:bg-brand-950/60 dark:text-brand-300'
                                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/70 dark:hover:text-white'
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon
                                    className={clsx(
                                        'size-[18px]',
                                        isActive ? 'text-brand-700 dark:text-brand-400' : 'text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300'
                                    )}
                                />
                                {item.name}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {isDemo && <DemoCard />}

            <div className="border-t border-stone-200 p-3 dark:border-stone-800">
                <div className="flex items-center gap-3 rounded-xl px-2 py-2">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-semibold text-white dark:bg-stone-100 dark:text-stone-900">
                        {initials(name)}
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-stone-900 dark:text-white" title={name}>{name}</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">{isAdmin ? 'Admin' : 'Staff · view only'}</p>
                    </div>
                    <ThemeToggle />
                    <Button variant="ghost" size="icon" icon={LogOut} onClick={signOut} aria-label="Sign out" />
                </div>
            </div>
        </div>
    )
}

function DemoCard() {
    const { isAdmin, startDemoSession } = useAuth()
    const reset = async () => {
        const { resetDemoData } = await import('../lib/demoApi')
        resetDemoData()
        window.location.reload()
    }
    return (
        <div className="mx-3 mb-3 rounded-xl border border-dashed border-brand-300 bg-brand-50/60 p-3 text-xs dark:border-brand-900 dark:bg-brand-950/30">
            <p className="flex items-center gap-1.5 font-semibold text-brand-900 dark:text-brand-300">
                <FlaskConical className="size-3.5" /> Demo mode
            </p>
            <p className="mt-1 text-stone-600 dark:text-stone-400">Sample data, stored in this browser only.</p>
            <div className="mt-2 flex gap-1.5">
                <button
                    onClick={() => startDemoSession(isAdmin ? 'STAFF' : 'ADMIN')}
                    className="rounded-md bg-white px-2 py-1 font-medium text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50 dark:bg-stone-900 dark:text-stone-200 dark:ring-stone-700"
                >
                    View as {isAdmin ? 'staff' : 'admin'}
                </button>
                <button
                    onClick={reset}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium text-stone-600 hover:bg-white dark:text-stone-400 dark:hover:bg-stone-900"
                >
                    <RotateCcw className="size-3" /> Reset
                </button>
            </div>
        </div>
    )
}

export default function DashboardLayout() {
    const [open, setOpen] = useState(false)
    const { pathname } = useLocation()
    const [lastPath, setLastPath] = useState(pathname)

    // Close the mobile drawer whenever the route changes.
    if (pathname !== lastPath) {
        setLastPath(pathname)
        setOpen(false)
    }

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
            {/* Desktop sidebar */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-stone-200 bg-white lg:block dark:border-stone-800 dark:bg-stone-900">
                <SidebarContent />
            </aside>

            {/* Mobile top bar */}
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-stone-200 bg-white/90 px-4 backdrop-blur lg:hidden dark:border-stone-800 dark:bg-stone-900/90">
                <Logo to="/dashboard" />
                <Button variant="ghost" size="icon" icon={Menu} onClick={() => setOpen(true)} aria-label="Open menu" />
            </header>

            {/* Mobile drawer */}
            {open && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-stone-950/50" onClick={() => setOpen(false)} />
                    <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] animate-fade-up bg-white shadow-xl dark:bg-stone-900">
                        <Button
                            variant="ghost"
                            size="icon"
                            icon={X}
                            onClick={() => setOpen(false)}
                            aria-label="Close menu"
                            className="absolute top-3.5 right-3"
                        />
                        <SidebarContent onNavigate={() => setOpen(false)} />
                    </aside>
                </div>
            )}

            <main className="lg:pl-64">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
