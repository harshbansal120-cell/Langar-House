import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

function initialTheme() {
    try {
        const saved = localStorage.getItem('theme')
        if (saved === 'light' || saved === 'dark') return saved
    } catch {
        // Storage blocked; use the OS preference.
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(initialTheme)

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
        try {
            localStorage.setItem('theme', theme)
        } catch {
            // Non-fatal: the choice just won't be remembered.
        }
    }, [theme])

    const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

    return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
    return useContext(ThemeContext)
}
