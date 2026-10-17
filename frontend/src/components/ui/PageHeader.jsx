export default function PageHeader({ title, description, actions }) {
    return (
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
                <h1 className="font-display text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl dark:text-white">{title}</h1>
                {description && <p className="mt-1 text-sm text-stone-500 sm:text-base dark:text-stone-400">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
    )
}
