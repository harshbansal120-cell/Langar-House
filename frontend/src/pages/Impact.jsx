import { Link } from 'react-router-dom'
import { ArrowRight, Wheat, Flame, Sparkles } from 'lucide-react'
import Button from '../components/ui/Button'

const FIGURES = [
    { value: '150k+', label: 'Meals served this year' },
    { value: '₹12L', label: 'Spent on food and fuel' },
    { value: '0%', label: 'Spent on administration' },
]

const SPEND = [
    { icon: Wheat, title: 'Ingredients', body: 'Grains, pulses, vegetables, dairy and spices, bought weekly from local wholesalers.' },
    { icon: Flame, title: 'Gas and fuel', body: 'LPG for the big kitchen burners, which run for around ten hours a day.' },
    { icon: Sparkles, title: 'Cleaning and upkeep', body: 'Soap, utensils and repairs that keep the kitchen safe and hygienic.' },
]

export default function Impact() {
    return (
        <>
            <section className="mx-auto max-w-6xl px-4 pt-12 pb-14 sm:px-6 md:pt-20">
                <p className="eyebrow">Our impact</p>
                <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                    Every rupee goes into the pot.
                </h1>
                <p className="mt-5 max-w-2xl text-lg text-stone-600 dark:text-stone-300">
                    Volunteers run the kitchen, so donations go to food, fuel and upkeep. We track every meal and every purchase,
                    and we're happy to share the numbers.
                </p>
            </section>

            <section className="mx-auto max-w-6xl px-4 sm:px-6">
                <dl className="grid gap-4 sm:grid-cols-3">
                    {FIGURES.map((f) => (
                        <div key={f.label} className="card p-6">
                            <dt className="text-sm text-stone-500 dark:text-stone-400">{f.label}</dt>
                            <dd className="mt-2 font-display text-5xl font-semibold text-stone-900 dark:text-white">{f.value}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
                <h2 className="font-display text-3xl font-semibold tracking-tight">Where donations go</h2>
                <div className="mt-10 grid gap-10 md:grid-cols-3">
                    {SPEND.map((s) => (
                        <div key={s.title}>
                            <span className="flex size-11 items-center justify-center rounded-xl bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-400">
                                <s.icon className="size-5" />
                            </span>
                            <h3 className="mt-5 text-lg font-semibold text-stone-900 dark:text-white">{s.title}</h3>
                            <p className="mt-2 leading-relaxed text-stone-600 dark:text-stone-400">{s.body}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 flex flex-col items-start justify-between gap-5 rounded-3xl bg-brand-50 p-8 sm:flex-row sm:items-center dark:bg-brand-950/40">
                    <div>
                        <h3 className="font-display text-2xl font-semibold text-stone-900 dark:text-white">Want the monthly breakdown?</h3>
                        <p className="mt-1 text-stone-600 dark:text-stone-300">We'll send you our latest spending and meals report.</p>
                    </div>
                    <Button as={Link} to="/contact" icon={ArrowRight} className="flex-row-reverse">Ask for a report</Button>
                </div>
            </section>
        </>
    )
}
