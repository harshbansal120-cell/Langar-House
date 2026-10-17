import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { isDemo } from '../lib/config'

const AuthContext = createContext({})

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)

const DEMO_SESSION_KEY = 'langar-demo-session'
const DEMO_PROFILES = {
    ADMIN: { id: 'demo-staff-1', full_name: 'Gurpreet Kaur', role: 'ADMIN' },
    STAFF: { id: 'demo-staff-2', full_name: 'Harjit Singh', role: 'STAFF' },
}

function readDemoSession() {
    try {
        return JSON.parse(sessionStorage.getItem(DEMO_SESSION_KEY))
    } catch {
        return null
    }
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    // Demo mode: a fake session kept in sessionStorage.
    const startDemoSession = async (role = 'ADMIN') => {
        const p = DEMO_PROFILES[role]
        const { setDemoRole } = await import('../lib/demoApi')
        setDemoRole(role)
        setUser({ id: p.id, email: `${role.toLowerCase()}@demo.langarhouse.org` })
        setProfile(p)
        try {
            sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({ role }))
        } catch {
            // Session just won't survive a reload.
        }
    }

    useEffect(() => {
        if (isDemo) {
            const saved = readDemoSession()
            if (saved) startDemoSession(saved.role).finally(() => setLoading(false))
            else setLoading(false)
            return
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) fetchProfile(session.user.id)
            else setLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) fetchProfile(session.user.id)
            else {
                setProfile(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error)
            }
            setProfile(data)
        } finally {
            setLoading(false)
        }
    }

    const login = async (email, password) => {
        if (isDemo) return startDemoSession('ADMIN')
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        return data
    }

    const signup = async (email, password, fullName) => {
        if (isDemo) throw new Error('Sign-up is turned off in demo mode.')
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
        })
        if (error) throw error
        return data
    }

    const logout = async () => {
        if (isDemo) {
            try { sessionStorage.removeItem(DEMO_SESSION_KEY) } catch { /* ignore */ }
            setUser(null)
            setProfile(null)
            return
        }
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    }

    const value = {
        user,
        profile,
        isAdmin: profile?.role?.toUpperCase() === 'ADMIN',
        isDemo,
        loading,
        login,
        signup,
        logout,
        startDemoSession,
    }

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="flex min-h-screen items-center justify-center">
                    <div className="size-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    )
}
