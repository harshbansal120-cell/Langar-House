import Modal from './Modal'
import Button from './Button'

/** Add/edit modal wired to a useEditor() instance. */
export default function RecordModal({ editor, title, editTitle, description, children }) {
    const formId = `${title.replace(/\W+/g, '-').toLowerCase()}-form`
    return (
        <Modal
            isOpen={editor.isOpen}
            onClose={editor.close}
            title={editor.isNew ? title : editTitle || title}
            description={description}
            footer={
                <>
                    <Button variant="secondary" onClick={editor.close}>Cancel</Button>
                    <Button type="submit" form={formId} loading={editor.saving}>
                        {editor.isNew ? 'Save' : 'Save changes'}
                    </Button>
                </>
            }
        >
            <form id={formId} onSubmit={editor.submit} className="space-y-4" noValidate>
                {children}
            </form>
        </Modal>
    )
}

/** Edit/delete icon buttons for a table row (admins only). */
export function EditDeleteButtons({ onEdit, onDelete, label }) {
    return (
        <div className="flex items-center justify-end gap-0.5">
            {onEdit && (
                <button
                    onClick={onEdit}
                    className="rounded-lg px-2 py-1 text-xs font-medium text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-white"
                    aria-label={`Edit ${label}`}
                >
                    Edit
                </button>
            )}
            {onDelete && (
                <button
                    onClick={onDelete}
                    className="rounded-lg px-2 py-1 text-xs font-medium text-stone-500 transition hover:bg-red-50 hover:text-red-700 dark:text-stone-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                    aria-label={`Delete ${label}`}
                >
                    Delete
                </button>
            )}
        </div>
    )
}
