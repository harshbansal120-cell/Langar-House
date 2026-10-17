import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import Button from './ui/Button'

export default function ThemeToggle({ className }) {
    const { theme, toggleTheme } = useTheme()
    return (
        <Button
            variant="ghost"
            size="icon"
            icon={theme === 'dark' ? Sun : Moon}
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className={className}
        />
    )
}
