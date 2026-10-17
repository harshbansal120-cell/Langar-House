import { HeartHandshake, Scale, Sprout } from 'lucide-react'

const VALUES = [
    { icon: HeartHandshake, title: 'Selfless service', body: 'Seva means giving without expecting anything back. Every sevadar here is a volunteer.' },
    { icon: Scale, title: 'Equality', body: 'Everyone sits together on the same level and is served the same food, in the same way.' },
    { icon: Sprout, title: 'Quality', body: 'Nutritious, hygienic, freshly cooked meals. We serve what we would serve our own families.' },
]

export default function About() {
    return (
        <>
            <section className="mx-auto max-w-6xl px-4 pt-12 pb-16 sm:px-6 md:pt-20">
                <p className="eyebrow">About us</p>
                <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                    A small kitchen that grew into a daily act of community.
                </h1>
            </section>

            <section className="mx-auto grid max-w-6xl gap-12 px-4 pb-20 sm:px-6 lg:grid-cols-2 lg:items-center">
                <img
                    src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1000&auto=format&fit=crop"
                    alt="Volunteers in masks sorting boxes of supplies"
                    className="aspect-[4/3] w-full rounded-3xl object-cover"
                />
                <div className="space-y-5 text-lg leading-relaxed text-stone-600 dark:text-stone-300">
                    <h2 className="font-display text-2xl font-semibold text-stone-900 dark:text-white">Our story</h2>
                    <p>
                        Langar House began in 2020, during a hard year, as a handful of neighbours cooking 50 meals a day.
                        Word spread, more hands arrived, and today the kitchen serves over 500 meals every day.
                    </p>
                    <p>
                        We follow the Sikh tradition of langar: a free kitchen open to all, regardless of religion, caste,
                        gender or status. Everyone who comes is a guest, and everyone who serves is a sevadar.
                    </p>
                </div>
            </section>

            <section className="border-t border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
                <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
                    <h2 className="font-display text-3xl font-semibold tracking-tight">What we hold to</h2>
                    <div className="mt-10 grid gap-10 md:grid-cols-3">
                        {VALUES.map((v) => (
                            <div key={v.title} className="border-l-2 border-brand-300 pl-5 dark:border-brand-800">
                                <v.icon className="size-6 text-brand-700 dark:text-brand-400" />
                                <h3 className="mt-4 text-lg font-semibold text-stone-900 dark:text-white">{v.title}</h3>
                                <p className="mt-2 leading-relaxed text-stone-600 dark:text-stone-400">{v.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    )
}
