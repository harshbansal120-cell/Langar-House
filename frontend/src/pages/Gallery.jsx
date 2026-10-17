const PHOTOS = [
    { id: 'photo-1488521787991-ed7bbaae773c', caption: 'Smiles all round', className: 'sm:col-span-2 sm:row-span-2' },
    { id: 'photo-1593113598332-cd288d649433', caption: 'Volunteers unloading supplies' },
    { id: 'photo-1532629345422-7515f3d16bb6', caption: 'Every rupee helps' },
    { id: 'photo-1594708767771-a7502209ff51', caption: 'Young friends in Delhi' },
    { id: 'photo-1509099836639-18ba1795216d', caption: 'Children gathered together' },
    { id: 'photo-1608555855762-2b657eb1c348', caption: 'Spread love' },
]

export default function Gallery() {
    return (
        <section className="mx-auto max-w-6xl px-4 pt-12 pb-20 sm:px-6 md:pt-20">
            <p className="eyebrow">Gallery</p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Moments of seva</h1>
            <p className="mt-4 max-w-2xl text-lg text-stone-600 dark:text-stone-300">
                A glimpse of the people, the kitchen and the meals that make Langar House.
            </p>

            <div className="mt-12 grid auto-rows-[16rem] grid-cols-1 gap-4 sm:grid-cols-3">
                {PHOTOS.map((p) => (
                    <figure key={p.id} className={`group relative overflow-hidden rounded-2xl bg-stone-200 dark:bg-stone-800 ${p.className || ''}`}>
                        <img
                            src={`https://images.unsplash.com/${p.id}?q=80&w=1000&auto=format&fit=crop`}
                            alt={p.caption}
                            loading="lazy"
                            className="size-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12 text-sm font-medium text-white">
                            {p.caption}
                        </figcaption>
                    </figure>
                ))}
            </div>
        </section>
    )
}
