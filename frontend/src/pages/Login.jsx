import { useState } from 'react'
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft, ShieldCheck, Eye, FlaskConical } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)
    const [error, setError] = useState('')
    const [notice, setNotice] = useState('')
    const [loading, setLoading] = useState(false)

    const { user, login, signup, isDemo, startDemoSession } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const destination = location.state?.from || '/dashboard'

    if (user) return <Navigate to={destination} replace />

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setNotice('')
        setLoading(true)
        try {
            if (isSignUp) {
                await signup(email, password, fullName)
                setNotice('Account created. Check your email to confirm it, then sign in.')
                setIsSignUp(false)
            } else {
                await login(email, password)
                navigate(destination, { replace: true })
            }
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const enterDemo = async (role) => {
        await startDemoSession(role)
        navigate(destination, { replace: true })
    }

    return (
        <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
            {/* Image panel */}
            <div className="relative hidden overflow-hidden bg-stone-900 lg:block">
                <img
                    src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1200&auto=format&fit=crop"
                    alt=""
                    className="absolute inset-0 size-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
                <div className="relative flex h-full flex-col justify-between p-10">
                    <Logo light />
                    <blockquote className="max-w-md">
                        <p className="font-display text-3xl leading-snug font-medium text-white">
                            “Everyone sits together, and everyone is served the same meal.”
                        </p>
                        <footer className="mt-4 text-sm text-stone-300">The principle of pangat, at the heart of langar</footer>
                    </blockquote>
                </div>
            </div>

            {/* Form */}
            <div className="flex flex-col bg-white px-5 py-6 sm:px-10 dark:bg-stone-950">
                <div className="flex items-center justify-between">
                    <div className="lg:hidden"><Logo /></div>
                    <Link to="/" className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-900 dark:hover:text-white">
                        <ArrowLeft className="size-4" /> Back to site
                    </Link>
                </div>

                <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
                    <h1 className="font-display text-3xl font-semibold tracking-tight">{isSignUp ? 'Create your account' : 'Welcome back'}</h1>
                    <p className="mt-2 text-stone-500 dark:text-stone-400">
                        {isSignUp ? 'New sevadars start with view-only access until an admin upgrades them.' : 'Sign in to manage today’s seva.'}
                    </p>

                    {isDemo && (
                        <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50/70 p-4 dark:border-brand-900 dark:bg-brand-950/30">
                            <p className="flex items-center gap-2 text-sm font-semibold text-brand-900 dark:text-brand-300">
                                <FlaskConical className="size-4" /> Demo mode
                            </p>
                            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                                Supabase isn't configured, so the dashboard runs on sample data in your browser.
                            </p>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                <Button icon={ShieldCheck} onClick={() => enterDemo('ADMIN')}>As admin</Button>
                                <Button variant="secondary" icon={Eye} onClick={() => enterDemo('STAFF')}>As staff</Button>
                            </div>
                        </div>
                    )}

                    {!isDemo && (
                        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                            {error && (
                                <div role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                                    <AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}
                                </div>
                            )}
                            {notice && (
                                <div role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                                    {notice}
                                </div>
                            )}
                            {isSignUp && (
                                <Field label="Full name">
                                    <input required autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                                </Field>
                            )}
                            <Field label="Email">
                                <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </Field>
                            <Field label="Password" hint={isSignUp ? 'At least 6 characters.' : undefined}>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </Field>
                            <Button type="submit" size="lg" className="w-full" loading={loading}>
                                {isSignUp ? 'Create account' : 'Sign in'}
                            </Button>
                            <p className="text-center text-sm text-stone-500 dark:text-stone-400">
                                {isSignUp ? 'Already have an account?' : 'New to the team?'}{' '}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsSignUp(!isSignUp)
                                        setError('')
                                        setNotice('')
                                    }}
                                    className="font-medium text-brand-700 hover:underline dark:text-brand-400"
                                >
                                    {isSignUp ? 'Sign in' : 'Create an account'}
                                </button>
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
