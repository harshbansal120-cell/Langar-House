import { useState } from 'react'
import { MapPin, Phone, Mail, Send } from 'lucide-react'
import Button from '../components/ui/Button'
import Field, { Segmented } from '../components/ui/Field'

const EMAIL = 'contact@langarhouse.org'

const CHANNELS = [
    { icon: MapPin, title: 'Visit', lines: ['123 Seva Marg', 'New Delhi 110001'] },
    { icon: Phone, title: 'Call', lines: ['+91 98765 43210', 'Every day, 6 am – 10 pm'] },
    { icon: Mail, title: 'Email', lines: [EMAIL, 'We reply within two days'] },
]

export default function Contact() {
    const [topic, setTopic] = useState('Volunteering')
    const [name, setName] = useState('')
    const [message, setMessage] = useState('')

    // There's no mail backend yet, so the form hands off to the visitor's email app.
    const submit = (e) => {
        e.preventDefault()
        const subject = encodeURIComponent(`${topic} — ${name || 'Website enquiry'}`)
        const body = encodeURIComponent(`${message}\n\n— ${name}`)
        window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`
    }

    return (
        <section className="mx-auto max-w-6xl px-4 pt-12 pb-20 sm:px-6 md:pt-20">
            <p className="eyebrow">Contact</p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Come by, or say hello.</h1>
            <p className="mt-4 max-w-2xl text-lg text-stone-600 dark:text-stone-300">
                Whether you'd like to volunteer, donate ingredients, or just ask a question, we'd love to hear from you.
            </p>

            <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.3fr]">
                <ul className="space-y-6">
                    {CHANNELS.map((c) => (
                        <li key={c.title} className="flex gap-4">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-400">
                                <c.icon className="size-5" />
                            </span>
                            <div>
                                <h2 className="font-semibold text-stone-900 dark:text-white">{c.title}</h2>
                                <p className="text-stone-700 dark:text-stone-300">{c.lines[0]}</p>
                                <p className="text-sm text-stone-500 dark:text-stone-400">{c.lines[1]}</p>
                            </div>
                        </li>
                    ))}
                </ul>

                <form onSubmit={submit} className="card space-y-4 p-6 sm:p-8">
                    <h2 className="text-xl font-semibold text-stone-900 dark:text-white">Send us a message</h2>
                    <Segmented label="About" options={['Volunteering', 'Donating', 'Other'].map((v) => ({ value: v, label: v }))} value={topic} onChange={setTopic} />
                    <Field label="Your name">
                        <input required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </Field>
                    <Field label="Message" hint="This opens your email app with the message ready to send.">
                        <textarea required rows={5} placeholder="How can we help?" value={message} onChange={(e) => setMessage(e.target.value)} />
                    </Field>
                    <Button type="submit" size="lg" icon={Send} className="w-full sm:w-auto">Write email</Button>
                </form>
            </div>
        </section>
    )
}
