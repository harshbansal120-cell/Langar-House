// Dates travel to and from the backend as ISO "YYYY-MM-DD" strings in local time.
// (toISOString() would shift to UTC and log evening entries against tomorrow.)

export function toISODate(d) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

export const todayISO = () => toISODate(new Date())

export function parseISODate(s) {
    const [y, m, d] = s.split('-').map(Number)
    return new Date(y, m - 1, d)
}

export function addDays(iso, n) {
    const d = parseISODate(iso)
    d.setDate(d.getDate() + n)
    return toISODate(d)
}

/** The `count` ISO dates ending at `end` (inclusive), oldest first. */
export function lastNDays(count, end = todayISO()) {
    return Array.from({ length: count }, (_, i) => addDays(end, i - count + 1))
}

const dateFmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
const shortDateFmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' })
const weekdayFmt = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

export const formatDate = (iso) => (iso ? dateFmt.format(parseISODate(iso)) : '—')
export const formatShortDate = (iso) => (iso ? shortDateFmt.format(parseISODate(iso)) : '—')
export const formatLongDate = (iso) => (iso ? weekdayFmt.format(parseISODate(iso)) : '—')

export function relativeDay(iso) {
    const today = todayISO()
    if (iso === today) return 'Today'
    if (iso === addDays(today, -1)) return 'Yesterday'
    return formatDate(iso)
}

const numberFmt = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 })
const compactFmt = new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 })
const currencyFmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const preciseCurrencyFmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const formatNumber = (n) => numberFmt.format(n ?? 0)
export const formatCompact = (n) => compactFmt.format(n ?? 0)
export const formatCurrency = (n) => currencyFmt.format(n ?? 0)
/** With paise, for small per-unit amounts like cost per visitor. */
export const formatCurrencyPrecise = (n) => preciseCurrencyFmt.format(n ?? 0)
export const formatPercent = (n) => `${numberFmt.format(n ?? 0)}%`

/** "BREAKFAST" → "Breakfast", "FULL_DAY" → "Full day" */
export function humanize(value) {
    if (!value) return ''
    const s = String(value).replace(/_/g, ' ').toLowerCase()
    return s.charAt(0).toUpperCase() + s.slice(1)
}

export const sum = (rows, key) => rows.reduce((acc, r) => acc + (Number(typeof key === 'function' ? key(r) : r[key]) || 0), 0)
