/** Shared Recharts styling: hairline grid, muted axes, compact ticks. Colours come from CSS tokens in index.css. */
export const axisProps = {
    axisLine: false,
    tickLine: false,
    tick: { fill: 'var(--chart-axis)', fontSize: 12 },
}
export const gridProps = { stroke: 'var(--chart-grid)', vertical: false }

export const MEAL_SERIES = [
    { key: 'BREAKFAST', label: 'Breakfast', color: 'var(--series-1)' },
    { key: 'LUNCH', label: 'Lunch', color: 'var(--series-2)' },
    { key: 'DINNER', label: 'Dinner', color: 'var(--series-3)' },
]
