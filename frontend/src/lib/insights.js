import { addDays, lastNDays } from './format'

/** Visitor logs → [{ date, BREAKFAST, LUNCH, DINNER, total }] for each of the given dates. */
export function visitorsByDay(logs, dates) {
    const map = Object.fromEntries(dates.map((d) => [d, { date: d, BREAKFAST: 0, LUNCH: 0, DINNER: 0, total: 0 }]))
    for (const v of logs || []) {
        const row = map[v.date]
        if (!row) continue
        row[v.mealType] += v.visitorCount
        row.total += v.visitorCount
    }
    return dates.map((d) => map[d])
}

/**
 * Estimate visitors for `date` as the mean of the same weekday over the
 * previous four weeks (skipping weeks with no logs), and the food to cook
 * from the recent kg-per-visitor ratio. Returns null without enough history.
 */
export function forecastFor(date, visitorLogs, foodLogs) {
    const totals = {}
    for (const v of visitorLogs || []) totals[v.date] = (totals[v.date] || 0) + v.visitorCount

    const samples = [7, 14, 21, 28].map((n) => totals[addDays(date, -n)]).filter((n) => n > 0)
    if (samples.length < 2) return null
    const visitors = Math.round(samples.reduce((a, b) => a + b, 0) / samples.length)

    const window = new Set(lastNDays(14, addDays(date, -1)))
    const recentVisitors = Object.entries(totals).filter(([d]) => window.has(d)).reduce((a, [, n]) => a + n, 0)
    const recentKg = (foodLogs || []).filter((f) => window.has(f.date) && f.unit === 'kg').reduce((a, f) => a + f.quantityConsumed, 0)
    const kgPerVisitor = recentVisitors > 0 ? recentKg / recentVisitors : null

    return {
        visitors,
        weeksSampled: samples.length,
        foodKg: kgPerVisitor ? Math.round(visitors * kgPerVisitor) : null,
    }
}
