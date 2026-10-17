import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

/**
 * State for an add/edit modal plus a delete confirmation, shared by the CRUD pages.
 *
 *   empty()          → blank form values
 *   toForm(row)      → form values for editing a row
 *   create(form)     → Promise (POST)
 *   update(row, form)→ Promise (PUT)
 *   remove(row)      → Promise (DELETE)
 *   onChange()       → called after any successful write (usually a reload)
 *   noun             → "visitor log", used in toasts
 *
 * Opening /page?new=1 opens the add form straight away (used by dashboard quick actions).
 */
export function useEditor({ empty, toForm, create, update, remove, onChange, noun, validate }) {
    const toast = useToast()
    const { isAdmin } = useAuth()
    const [params, setParams] = useSearchParams()
    const [editing, setEditing] = useState(null) // null = closed, {} = new, row = edit
    const [form, setForm] = useState(empty)
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(null)

    const openNew = (overrides) => {
        setForm({ ...empty(), ...overrides })
        setErrors({})
        setEditing({})
    }
    const openEdit = (row) => {
        setForm(toForm(row))
        setErrors({})
        setEditing(row)
    }
    const close = () => setEditing(null)

    useEffect(() => {
        if (params.get('new') === '1') {
            if (isAdmin) openNew()
            params.delete('new')
            setParams(params, { replace: true })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    /** setField('date') works as an onChange for inputs, or call it with a raw value. */
    const setField = (key) => (eOrValue) => {
        const value = eOrValue?.target ? (eOrValue.target.type === 'checkbox' ? eOrValue.target.checked : eOrValue.target.value) : eOrValue
        setForm((f) => ({ ...f, [key]: value }))
        setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e))
    }

    const submit = async (e) => {
        e?.preventDefault()
        const found = validate?.(form) || {}
        if (Object.values(found).some(Boolean)) {
            setErrors(found)
            return
        }
        setSaving(true)
        try {
            const isNew = !editing?.id
            await (isNew ? create(form) : update(editing, form))
            toast.success(isNew ? `Saved new ${noun}.` : `Updated ${noun}.`)
            setEditing(null)
            onChange?.()
        } catch (err) {
            toast.error(err)
        } finally {
            setSaving(false)
        }
    }

    const confirmDelete = async () => {
        try {
            await remove(deleting)
            toast.success(`Deleted ${noun}.`)
            onChange?.()
        } catch (err) {
            toast.error(err)
            throw err
        }
    }

    return {
        isOpen: editing !== null,
        isNew: !editing?.id,
        editing,
        form,
        errors,
        saving,
        setField,
        openNew,
        openEdit,
        close,
        submit,
        deleting,
        askDelete: setDeleting,
        cancelDelete: () => setDeleting(null),
        confirmDelete,
    }
}
