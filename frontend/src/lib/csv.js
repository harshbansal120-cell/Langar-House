/** Build a CSV from rows and trigger a download in the browser. */
export function downloadCsv(filename, columns, rows) {
    const escape = (v) => {
        const s = v == null ? '' : String(v)
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const lines = [
        columns.map((c) => escape(c.header)).join(','),
        ...rows.map((r) => columns.map((c) => escape(typeof c.value === 'function' ? c.value(r) : r[c.value])).join(',')),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
}
