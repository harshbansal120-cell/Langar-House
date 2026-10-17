import { Link } from 'react-router-dom'
import { ArrowRight, Clock, HandHeart, Users, Soup, Wheat, MessageCircle, Quote } from 'lucide-react'
import Button from '../components/ui/Button'

const img = (id, w = 900) => `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`

const TIMINGS = [
    { meal: 'Breakfast', time: '7:00 – 9:30 am' },
    { meal: 'Lunch', time: '12:00 – 3:00 pm' },
    { meal: 'Dinner', time: '7:00 – 9:30 pm' },
]

const PILLARS = [
    { icon: Soup, title: 'Langar, three times a day', body: 'Fresh dal, sabzi, rice and rotis, cooked every morning and served to anyone who walks through the door.' },
    { icon: Users, title: 'Pangat: we sit together', body: 'Everyone eats side by side on the same floor, whatever their background. No one is asked who they are.' },
    { icon: HandHeart, title: 'Run on seva', body: 'Volunteers chop, cook, serve and clean. Many come for an hour before work; some have come every day for years.' },
]

const HELP = [
    { icon: Clock, title: 'Give a few hours', body: 'Morning prep from 5 am, serving at lunch, or washing up after dinner. No experience needed.' },
    { icon: Wheat, title: 'Donate ingredients', body: 'Atta, rice, dal and oil keep the kitchen running. We’ll tell you what’s running low this week.' },
    { icon: MessageCircle, title: 'Tell someone', body: 'If you know a person who needs a hot meal, let them know they’re welcome here, every day.' },
]

const QUOTES = [
    { quote: 'Serving at Langar House has been the most fulfilling thing I do all week. The smiles are worth every early morning.', name: 'Rajesh Kumar', role: 'Volunteer' },
    { quote: 'They don’t just provide food, they provide dignity. Everyone is served with the same respect.', name: 'Simran Kaur', role: 'Donor' },
]

export default function Home() {
    return (
        <>
            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="pointer-events-none absolute -top-40 right-[-10%] size-[36rem] rounded-full bg-brand-200/40 blur-3xl dark:bg-brand-900/20" />
                <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-10 pb-16 sm:px-6 md:pt-16 lg:grid-cols-[1.05fr_1fr] lg:pb-24">
                    <div className="relative animate-fade-up">
                        <p className="eyebrow">Free community kitchen · New Delhi</p>
                        <h1 className="mt-4 font-display text-[2.6rem] leading-[1.05] font-semibold tracking-tight text-stone-900 sm:text-6xl dark:text-white">
                            A warm meal for everyone who <span className="text-brand-700 italic dark:text-brand-400">walks in.</span>
                        </h1>
                        <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-600 dark:text-stone-300">
                            Langar House serves free, freshly cooked vegetarian meals three times a day, in the Sikh tradition of langar.
                            No questions, no queue for paperwork. Just sit down and eat.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Button as={Link} to="/contact" size="lg" icon={ArrowRight} className="flex-row-reverse">Volunteer with us</Button>
                            <Button as={Link} to="/about" size="lg" variant="secondary">Our story</Button>
                        </div>
                    </div>

                    <div className="relative animate-fade-up [animation-delay:120ms]">
                        <div className="grid grid-cols-5 gap-3">
                            <img
                                src={img('photo-1488521787991-ed7bbaae773c')}
                                alt="Children smiling and making peace signs"
                                className="col-span-3 aspect-[3/4] w-full rounded-3xl object-cover shadow-xl shadow-stone-900/10"
                            />
                            <div className="col-span-2 flex flex-col gap-3 pt-10">
                                <img
                                    src={img('photo-1593113598332-cd288d649433', 600)}
                                    alt="Volunteers in masks unloading boxes of supplies"
                                    className="aspect-square w-full rounded-3xl object-cover"
                                />
                                <img
                                    src={img('photo-1509099836639-18ba1795216d', 600)}
                                    alt="A group of children smiling"
                                    className="aspect-[4/5] w-full rounded-3xl object-cover"
                                />
                            </div>
                        </div>
                        <div className="absolute -bottom-6 left-4 w-64 rounded-2xl border border-stone-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:left-[-1.5rem] dark:border-stone-700 dark:bg-stone-900/95">
                            <p className="flex items-center gap-2 text-sm font-semibold text-stone-900 dark:text-white">
                                <Clock className="size-4 text-brand-700 dark:text-brand-400" /> Langar timings
                            </p>
                            <ul className="mt-2.5 space-y-1.5 text-sm">
                                {TIMINGS.map((t) => (
                                    <li key={t.meal} className="flex justify-between gap-3">
                                        <span className="text-stone-500 dark:text-stone-400">{t.meal}</span>
                                        <span className="tabular font-medium text-stone-800 dark:text-stone-200">{t.time}</span>
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-2.5 text-xs text-stone-500 dark:text-stone-400">Every day, including holidays.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Numbers */}
            <section className="border-y border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
                <dl className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-stone-200 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 dark:divide-stone-800">
                    {[
                        ['500+', 'meals served every day'],
                        ['3', 'hot meals, 365 days a year'],
                        ['₹0', 'charged to anyone, ever'],
                    ].map(([n, label]) => (
                        <div key={label} className="flex items-baseline gap-3 py-7 sm:flex-col sm:items-start sm:gap-1 sm:px-8 sm:first:pl-0">
                            <dt className="sr-only">{label}</dt>
                            <dd className="font-display text-4xl font-semibold text-stone-900 dark:text-white">{n}</dd>
                            <dd className="text-stone-500 dark:text-stone-400">{label}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            {/* Pillars */}
            <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
                <div className="max-w-2xl">
                    <p className="eyebrow">What we do</p>
                    <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Simple food, served with care, to anyone who needs it.</h2>
                </div>
                <div className="mt-12 grid gap-8 md:grid-cols-3">
                    {PILLARS.map((p) => (
                        <div key={p.title}>
                            <span className="flex size-11 items-center justify-center rounded-xl bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-400">
                                <p.icon className="size-5" />
                            </span>
                            <h3 className="mt-5 text-lg font-semibold text-stone-900 dark:text-white">{p.title}</h3>
                            <p className="mt-2 leading-relaxed text-stone-600 dark:text-stone-400">{p.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Quotes */}
            <section className="bg-stone-900 text-white dark:bg-black">
                <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-2">
                    {QUOTES.map((q) => (
                        <figure key={q.name}>
                            <Quote className="size-7 text-brand-400" />
                            <blockquote className="mt-4 font-display text-2xl leading-snug">{q.quote}</blockquote>
                            <figcaption className="mt-5 text-sm text-stone-400">
                                <span className="font-medium text-white">{q.name}</span> · {q.role}
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </section>

            {/* Help */}
            <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div className="max-w-xl">
                        <p className="eyebrow">Get involved</p>
                        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">The kitchen runs on people like you.</h2>
                    </div>
                    <Button as={Link} to="/contact" variant="secondary" icon={ArrowRight} className="flex-row-reverse self-start md:self-auto">Get in touch</Button>
                </div>
                <div className="mt-10 grid gap-4 md:grid-cols-3">
                    {HELP.map((h) => (
                        <div key={h.title} className="card p-6">
                            <h.icon className="size-6 text-brand-700 dark:text-brand-400" />
                            <h3 className="mt-4 font-semibold text-stone-900 dark:text-white">{h.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">{h.body}</p>
                        </div>
                    ))}
                </div>
            </section>
        </>
    )
}
