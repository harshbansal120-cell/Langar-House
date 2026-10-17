import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { Search, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Inbox, AlertTriangle, RotateCw } from 'lucide-react'
import Button from './Button'

const PAGE_SIZE = 10

/**
 * Data table with search, sortable columns, pagination and loading/empty/error states.
 *
 * columns: [{ key, header, cell(row), sortValue?(row), align?: 'right', className? }]
 * searchText(row) → string used for the search box (defaults to all values).
 */
export default function Table({
    columns,
    rows,
    loading,
    error,
    onRetry,
    searchPlaceholder = 'Search…',
    searchText,
    toolbar,
    initialSort,
    emptyTitle = 'Nothing here yet',
    emptyMessage,
    emptyAction,
    rowKey = (r) => r.id,
}) {
    const [query, setQuery] = useState('')
    const [sort, setSort] = useState(initialSort || null) // { key, dir: 'asc' | 'desc' }
    const [page, setPage] = useState(1)

    const filtered = useMemo(() => {
        const list = rows || []
        const q = query.trim().toLowerCase()
        let out = q
            ? list.filter((r) => (searchText ? searchText(r) : Object.values(r).join(' ')).toLowerCase().includes(q))
            : list
        const col = sort && columns.find((c) => c.key === sort.key)
        if (col?.sortValue) {
            out = [...out].sort((a, b) => {
                const av = col.sortValue(a)
                const bv = col.sortValue(b)
                const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv
                return sort.dir === 'asc' ? cmp : -cmp
            })
        }
        return out
    }, [rows, query, sort, columns, searchText])

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const current = Math.min(page, totalPages)
    const pageRows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

    const toggleSort = (key) => {
        setSort((s) => (s?.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }))
        setPage(1)
    }

    const showSkeleton = loading && !rows

    return (
        <div className="card overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-stone-100 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4 dark:border-stone-800">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-400" />
                    <input
                        type="search"
                        aria-label="Search"
                        placeholder={searchPlaceholder}
                        className="input py-2 pl-9"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value)
                            setPage(1)
                        }}
                    />
                </div>
                {toolbar && <div className="flex flex-wrap items-center gap-2">{toolbar}</div>}
            </div>

            {error ? (
                <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                    <span className="flex size-11 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                        <AlertTriangle className="size-5" />
                    </span>
                    <div>
                        <p className="font-medium text-stone-900 dark:text-white">Couldn't load this list</p>
                        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{error.message}</p>
                    </div>
                    {onRetry && <Button variant="secondary" size="sm" icon={RotateCw} onClick={onRetry}>Try again</Button>}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-stone-100 dark:border-stone-800">
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        scope="col"
                                        className={clsx(
                                            'px-4 py-3 text-xs font-medium whitespace-nowrap text-stone-500 first:pl-5 last:pr-5 dark:text-stone-400',
                                            col.align === 'right' && 'text-right'
                                        )}
                                        aria-sort={sort?.key === col.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                                    >
                                        {col.sortValue ? (
                                            <button
                                                onClick={() => toggleSort(col.key)}
                                                className={clsx(
                                                    'inline-flex items-center gap-1 rounded hover:text-stone-900 dark:hover:text-white',
                                                    sort?.key === col.key && 'text-stone-900 dark:text-white'
                                                )}
                                            >
                                                {col.header}
                                                {sort?.key === col.key &&
                                                    (sort.dir === 'asc' ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />)}
                                            </button>
                                        ) : (
                                            col.header
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className={clsx('divide-y divide-stone-100 dark:divide-stone-800', loading && rows && 'opacity-60 transition-opacity')}>
                            {showSkeleton &&
                                Array.from({ length: 5 }, (_, i) => (
                                    <tr key={i}>
                                        {columns.map((col) => (
                                            <td key={col.key} className="px-4 py-4 first:pl-5 last:pr-5">
                                                <div className="h-4 w-full max-w-[8rem] animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            {!showSkeleton &&
                                pageRows.map((row) => (
                                    <tr key={rowKey(row)} className="transition-colors hover:bg-stone-50/70 dark:hover:bg-stone-800/40">
                                        {columns.map((col) => (
                                            <td
                                                key={col.key}
                                                className={clsx(
                                                    'tabular px-4 py-3 whitespace-nowrap text-stone-700 first:pl-5 last:pr-5 dark:text-stone-300',
                                                    col.align === 'right' && 'text-right',
                                                    col.className
                                                )}
                                            >
                                                {col.cell(row)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                        </tbody>
                    </table>

                    {!showSkeleton && pageRows.length === 0 && (
                        <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
                            <span className="flex size-11 items-center justify-center rounded-full bg-stone-100 text-stone-400 dark:bg-stone-800">
                                <Inbox className="size-5" />
                            </span>
                            <p className="font-medium text-stone-900 dark:text-white">{query ? 'No matches' : emptyTitle}</p>
                            <p className="max-w-sm text-sm text-stone-500 dark:text-stone-400">
                                {query ? `Nothing matches “${query}”.` : emptyMessage}
                            </p>
                            {!query && emptyAction && <div className="mt-2">{emptyAction}</div>}
                        </div>
                    )}
                </div>
            )}

            {!error && filtered.length > PAGE_SIZE && (
                <div className="flex items-center justify-between border-t border-stone-100 px-4 py-2.5 text-xs text-stone-500 sm:px-5 dark:border-stone-800 dark:text-stone-400">
                    <span className="tabular">
                        {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, filtered.length)} of {filtered.length}
                    </span>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" icon={ChevronLeft} aria-label="Previous page" disabled={current === 1} onClick={() => setPage(current - 1)} />
                        <Button variant="ghost" size="icon" icon={ChevronRight} aria-label="Next page" disabled={current === totalPages} onClick={() => setPage(current + 1)} />
                    </div>
                </div>
            )}
        </div>
    )
}

