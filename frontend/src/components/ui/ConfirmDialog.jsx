import { useState } from 'react'
import Modal from './Modal'
import Button from './Button'

/** A small "are you sure?" modal. `onConfirm` may be async; the button spins until it settles. */
export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete' }) {
    const [busy, setBusy] = useState(false)

    const confirm = async () => {
        setBusy(true)
        try {
            await onConfirm()
            onClose()
        } catch {
            // onConfirm reports its own errors; keep the dialog open so the user can retry.
        } finally {
            setBusy(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="sm"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="danger" onClick={confirm} loading={busy} data-autofocus>{confirmLabel}</Button>
                </>
            }
        >
            <p className="text-sm text-stone-600 dark:text-stone-300">{message}</p>
        </Modal>
    )
}
