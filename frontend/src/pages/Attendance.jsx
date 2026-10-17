import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { Plus, UserCheck, UserX, Plane, ChevronLeft, ChevronRight, CircleDashed } from 'lucide-react'
import { api } from '../lib/api'
import { useApi } from '../lib/useApi'
import { useEditor } from '../lib/useEditor'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { todayISO, addDays, formatLongDate, formatDate, humanize } from '../lib/format'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Table from '../components/ui/Table'
import Field, { Segmented } from '../components/ui/Field'
import RecordModal, { EditDeleteButtons } from '../components/ui/RecordModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const STATUS = {
    PRESENT: { label: 'Present', tone: 'good', icon: UserCheck },
    ABSENT: { label: 'Absent', tone: 'critical', icon: UserX },
    LEAVE: { label: 'On leave', tone: 'warning', icon: Plane },
}
const STATUS_OPTIONS = Object.entries(STATUS).map(([value, s]) => ({ value, label: s.label }))
const SHIFT_OPTIONS = [
    { value: 'MORNING', label: 'Morning' },
    { value: 'EVENING', label: 'Evening' },
    { value: 'FULL_DAY', label: 'Full day' },
]

const shortId = (id) => (id?.length > 12 ? `${id.slice(0, 8)}…` : id)

export default function Attendance() {
    const { isAdmin } = useAuth()
    const toast = useToast()
    const [date, setDate] = useState(todayISO())
    const [marking, setMarking] = useState(null)

    const staff = useApi(() => api.staff.list(), [])
    const history = useApi(() => api.attendance.list(), [])
    const day = useApi(() => api.attendance.byDate(date), [date])

    const reload = () => {
        day.reload()
        history.reload()
    }

    const nameOf = useMemo(() => {
        const map = Object.fromEntries((staff.data || []).map((s) => [s.id, s.full_name]))
        return (id) => map[id] || shortId(id)
    }, [staff.data])

    // Most recent role/shift per person, to pre-fill one-click marking.
    const lastSeen = useMemo(() => {
        const out = {}
        for (const a of [...(history.data || [])].sort((x, y) => x.date.localeCompare(y.date))) out[a.staffId] = a
        return out
    }, [history.data])

    const editor = useEditor({
        noun: 'attendance',
        empty: () => ({ date, staffId: '', role: '', shift: 'FULL_DAY', status: 'PRESENT' }),
        toForm: (r) => ({ ...r }),
        validate: (f) => ({
            staffId: !f.staffId.trim() && 'Choose who this is for.',
            role: !f.role.trim() && 'Enter their role, e.g. Cook.',
        }),
        create: (f) => api.attendance.create(toBody(f)),
        update: (row, f) => api.attendance.update(row.id, toBody(f)),
        remove: (row) => api.attendance.remove(row.id),
        onChange: reload,
    })

    // One row per known staff member, plus anyone with a record who isn't in the staff list.
    const rows = useMemo(() => {
        if (!day.data) return null
        const records = Object.fromEntries(day.data.map((a) => [a.staffId, a]))
        const ids = [...new Set([...(staff.data || []).map((s) => s.id), ...day.data.map((a) => a.staffId)])]
        return ids.map((staffId) => ({ staffId, name: nameOf(staffId), record: records[staffId] || null }))
    }, [day.data, staff.data, nameOf])

    const count = (s) => (day.data || []).filter((a) => a.status === s).length
    const unmarked = rows ? rows.filter((r) => !r.record).length : 0

    const quickMark = async (row, status) => {
        setMarking(`${row.staffId}:${status}`)
        try {
            if (row.record) {
                await api.attendance.update(row.record.id, { ...toBody(row.record), status })
            } else {
                const prev = lastSeen[row.staffId]
                await api.attendance.create({ date, staffId: row.staffId, role: prev?.role || 'Sevadar', shift: prev?.shift || 'FULL_DAY', status })
            }
            reload()
        } catch (err) {
            toast.error(err)
        } finally {
            setMarking(null)
        }
    }

    const columns = [
        {
            key: 'name',
            header: 'Sevadar',
            sortValue: (r) => r.name,
            cell: (r) => (
                <div className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                        {r.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                    </span>
                    <div>
                        <p className="font-medium text-stone-900 dark:text-white">{r.name}</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">{r.record?.role || lastSeen[r.staffId]?.role || '—'}</p>
                    </div>
                </div>
            ),
        },
        { key: 'shift', header: 'Shift', cell: (r) => (r.record ? humanize(r.record.shift) : <span className="text-stone-300 dark:text-stone-600">—</span>) },
        {
            key: 'status',
            header: 'Status',
            sortValue: (r) => r.record?.status || 'ZZZ',
            cell: (r) =>
                isAdmin ? (
                    <div className="inline-flex rounded-lg bg-stone-100 p-0.5 dark:bg-stone-800" role="group" aria-label={`Status for ${r.name}`}>
                        {STATUS_OPTIONS.map((o) => {
                            const active = r.record?.status === o.value
                            const busy = marking === `${r.staffId}:${o.value}`
                            return (
                                <button
                                    key={o.value}
                                    onClick={() => !active && quickMark(r, o.value)}
                                    disabled={!!marking}
                                    aria-pressed={active}
                                    className={clsx(
                                        'rounded-md px-2.5 py-1 text-xs font-medium transition disabled:cursor-wait',
                                        active
                                            ? o.value === 'PRESENT'
                                                ? 'bg-emerald-600 text-white shadow-sm'
                                                : o.value === 'ABSENT'
                                                    ? 'bg-red-600 text-white shadow-sm'
                                                    : 'bg-amber-500 text-white shadow-sm'
                                            : 'text-stone-500 hover:bg-white hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-900 dark:hover:text-white',
                                        busy && 'animate-pulse'
                                    )}
                                >
                                    {o.label}
                                </button>
                            )
                        })}
                    </div>
                ) : r.record ? (
                    <Badge tone={STATUS[r.record.status].tone} icon={STATUS[r.record.status].icon}>{STATUS[r.record.status].label}</Badge>
                ) : (
                    <Badge icon={CircleDashed}>Not marked</Badge>
                ),
        },
        ...(isAdmin
            ? [{
                key: 'actions',
                header: <span className="sr-only">Actions</span>,
                align: 'right',
                cell: (r) => r.record && <EditDeleteButtons label={`attendance for ${r.name}`} onEdit={() => editor.openEdit(r.record)} onDelete={() => editor.askDelete(r.record)} />,
            }]
            : []),
    ]

    const loadingFirst = day.loading && !day.data
    const staffOptions = staff.data || []

    return (
        <div className="animate-fade-up">
            <PageHeader
                title="Attendance"
                description={formatLongDate(date)}
                actions={
                    <>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" icon={ChevronLeft} aria-label="Previous day" onClick={() => setDate(addDays(date, -1))} />
                            <label className="sr-only" htmlFor="att-date">Date</label>
                            <input id="att-date" type="date" className="input w-auto py-2" value={date} max={todayISO()} onChange={(e) => e.target.value && setDate(e.target.value)} />
                            <Button variant="ghost" size="icon" icon={ChevronRight} aria-label="Next day" disabled={date >= todayISO()} onClick={() => setDate(addDays(date, 1))} />
                        </div>
                        {isAdmin && <Button icon={Plus} onClick={() => editor.openNew({ date })}>Mark attendance</Button>}
                    </>
                }
            />

            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Present" icon={UserCheck} tone="green" value={count('PRESENT')} loading={loadingFirst} />
                <StatCard label="Absent" icon={UserX} tone="red" value={count('ABSENT')} loading={loadingFirst} />
                <StatCard label="On leave" icon={Plane} tone="brand" value={count('LEAVE')} loading={loadingFirst} />
                <StatCard label="Not marked yet" icon={CircleDashed} tone="violet" value={unmarked} loading={loadingFirst} hint={unmarked && isAdmin ? 'Tap a status to mark them' : undefined} />
            </div>

            <Table
                columns={columns}
                rows={rows}
                rowKey={(r) => r.staffId}
                loading={day.loading}
                error={day.error}
                onRetry={day.reload}
                initialSort={{ key: 'name', dir: 'asc' }}
                searchPlaceholder="Search sevadars…"
                searchText={(r) => `${r.name} ${r.record?.role || ''}`}
                emptyTitle="No one on the roster"
                emptyMessage="Mark attendance for a sevadar and they'll appear here."
                emptyAction={isAdmin && <Button size="sm" icon={Plus} onClick={() => editor.openNew({ date })}>Mark attendance</Button>}
            />

            <RecordModal editor={editor} title="Mark attendance" editTitle="Edit attendance" description={formatDate(editor.form.date)}>
                {editor.isNew && (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Date">
                            <input type="date" max={todayISO()} value={editor.form.date} onChange={editor.setField('date')} />
                        </Field>
                        {staffOptions.length > 0 ? (
                            <Field label="Sevadar" error={editor.errors.staffId}>
                                <select
                                    value={editor.form.staffId}
                                    onChange={(e) => {
                                        editor.setField('staffId')(e)
                                        const prev = lastSeen[e.target.value]
                                        if (prev && !editor.form.role) editor.setField('role')(prev.role)
                                    }}
                                >
                                    <option value="">Choose…</option>
                                    {staffOptions.map((s) => <option key={s.id} value={s.id}>{s.full_name || shortId(s.id)}</option>)}
                                </select>
                            </Field>
                        ) : (
                            <Field label="Staff ID" hint="Their Supabase user id." error={editor.errors.staffId}>
                                <input value={editor.form.staffId} onChange={editor.setField('staffId')} />
                            </Field>
                        )}
                    </div>
                )}
                <Field label="Role" error={editor.errors.role}>
                    <input placeholder="e.g. Cook, Helper, Volunteer" value={editor.form.role} onChange={editor.setField('role')} />
                </Field>
                <Segmented label="Shift" options={SHIFT_OPTIONS} value={editor.form.shift} onChange={editor.setField('shift')} />
                <Segmented label="Status" options={STATUS_OPTIONS} value={editor.form.status} onChange={editor.setField('status')} />
            </RecordModal>

            <ConfirmDialog
                isOpen={!!editor.deleting}
                onClose={editor.cancelDelete}
                onConfirm={editor.confirmDelete}
                title="Remove this attendance record?"
                message={editor.deleting && `${nameOf(editor.deleting.staffId)} will go back to “not marked” for ${formatDate(editor.deleting.date)}.`}
                confirmLabel="Remove"
            />
        </div>
    )
}

function toBody(f) {
    return { date: f.date, staffId: f.staffId.trim(), role: f.role.trim(), shift: f.shift, status: f.status }
}
