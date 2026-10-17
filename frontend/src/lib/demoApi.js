/**
 * In-browser stand-in for the Spring Boot API, used only in demo mode.
 * It mirrors the backend's request/response shapes, computed fields and
 * validation messages so the UI behaves the same against either. Data is
 * seeded once and kept in localStorage so edits survive a reload.
 */
import { ApiError } from './api'
import { addDays, todayISO } from './format'

const STORAGE_KEY = 'langar-demo-data-v1'
const LATENCY_MS = 220

export const DEMO_STAFF = [
    { id: 'demo-staff-1', full_name: 'Gurpreet Kaur', role: 'ADMIN' },
    { id: 'demo-staff-2', full_name: 'Harjit Singh', role: 'STAFF' },
    { id: 'demo-staff-3', full_name: 'Simran Bedi', role: 'STAFF' },
    { id: 'demo-staff-4', full_name: 'Manpreet Gill', role: 'STAFF' },
    { id: 'demo-staff-5', full_name: 'Arjun Mehta', role: 'STAFF' },
    { id: 'demo-staff-6', full_name: 'Navjot Sandhu', role: 'STAFF' },
]

// Deterministic pseudo-random numbers so every fresh demo looks the same.
function rng(seed) {
    let s = seed
    return () => {
        s = (s * 1664525 + 1013904223) % 4294967296
        return s / 4294967296
    }
}

function seed() {
    const rand = rng(42)
    const between = (lo, hi) => Math.round(lo + rand() * (hi - lo))
    const today = todayISO()
    const db = { visitors: [], food: [], expenses: [], inventory: [], attendance: [], nextId: 1 }
    const id = () => db.nextId++

    const dishes = {
        BREAKFAST: ['Aloo Paratha', 'Poha', 'Chole Bhature', 'Upma'],
        LUNCH: ['Dal Makhani', 'Rajma Chawal', 'Kadhi Pakora', 'Mix Veg Sabzi'],
        DINNER: ['Chana Masala', 'Dal Tadka', 'Aloo Gobi', 'Kheer'],
    }

    for (let i = 59; i >= 0; i--) {
        const date = addDays(today, -i)
        const dow = new Date(date + 'T00:00').getDay()
        const weekend = dow === 0 || dow === 6
        const special = i === 12 || i === 40
        const boost = (weekend ? 1.35 : 1) * (special ? 1.8 : 1)

        const counts = {
            BREAKFAST: Math.round(between(90, 130) * boost),
            LUNCH: Math.round(between(210, 280) * boost),
            DINNER: Math.round(between(150, 200) * boost),
        }
        for (const meal of ['BREAKFAST', 'LUNCH', 'DINNER']) {
            // Today's dinner hasn't happened yet.
            if (i === 0 && meal === 'DINNER') continue
            db.visitors.push({
                id: id(), date, mealType: meal, visitorCount: counts[meal],
                notes: special && meal === 'LUNCH' ? 'Gurpurab — extra seva' : '',
                isSpecialDay: special,
            })
            const prepared = Math.round(counts[meal] * 0.32 * 10) / 10
            const wasted = Math.round(prepared * (0.03 + rand() * 0.09) * 10) / 10
            db.food.push({
                id: id(), date, mealType: meal,
                dishName: dishes[meal][between(0, 3)],
                quantityPrepared: prepared, quantityWasted: wasted, unit: 'kg',
            })
        }

        if (i % 3 === 0) db.expenses.push({ id: id(), date, itemName: 'Fresh vegetables', category: 'Vegetables', quantity: between(40, 70), unit: 'kg', price: between(28, 40) })
        if (i % 7 === 2) db.expenses.push({ id: id(), date, itemName: 'Basmati rice', category: 'Grains', quantity: 50, unit: 'kg', price: between(78, 92) })
        if (i % 7 === 4) db.expenses.push({ id: id(), date, itemName: 'Toor dal', category: 'Pulses', quantity: 25, unit: 'kg', price: between(130, 150) })
        if (i % 10 === 5) db.expenses.push({ id: id(), date, itemName: 'LPG cylinder (19 kg)', category: 'Gas & Fuel', quantity: 2, unit: 'pcs', price: 1820 })
        if (i % 5 === 1) db.expenses.push({ id: id(), date, itemName: 'Milk', category: 'Dairy', quantity: between(30, 50), unit: 'liters', price: 58 })
        if (i % 14 === 6) db.expenses.push({ id: id(), date, itemName: 'Cleaning supplies', category: 'Maintenance', quantity: 1, unit: 'lot', price: between(600, 900) })

        if (i < 21) {
            DEMO_STAFF.forEach((s, idx) => {
                const r = rand()
                db.attendance.push({
                    id: id(), date, staffId: s.id,
                    role: ['Manager', 'Head cook', 'Cook', 'Helper', 'Volunteer', 'Cleaner'][idx],
                    status: r < 0.82 ? 'PRESENT' : r < 0.93 ? 'ABSENT' : 'LEAVE',
                    shift: idx % 3 === 0 ? 'FULL_DAY' : idx % 3 === 1 ? 'MORNING' : 'EVENING',
                })
            })
        }
    }
    db.expenses.forEach((e) => { e.total = e.quantity * e.price })

    const stock = [
        ['Basmati rice', 'Grains', 180, 'kg', 100],
        ['Atta (wheat flour)', 'Grains', 64, 'kg', 80],
        ['Toor dal', 'Pulses', 42, 'kg', 30],
        ['Rajma', 'Pulses', 12, 'kg', 20],
        ['Chana', 'Pulses', 35, 'kg', 20],
        ['Mustard oil', 'Oils', 48, 'liters', 25],
        ['Ghee', 'Dairy', 9, 'kg', 10],
        ['Milk', 'Dairy', 40, 'liters', 30],
        ['Onions', 'Vegetables', 70, 'kg', 40],
        ['Potatoes', 'Vegetables', 95, 'kg', 50],
        ['Garam masala', 'Spices', 3, 'kg', 2],
        ['Turmeric', 'Spices', 1.5, 'kg', 2],
        ['Salt', 'Spices', 22, 'kg', 10],
        ['LPG cylinders', 'Gas & Fuel', 3, 'pcs', 2],
        ['Dish soap', 'Cleaning', 6, 'liters', 5],
    ]
    db.inventory = stock.map(([itemName, category, quantity, unit, threshold]) => ({ id: id(), itemName, category, quantity, unit, threshold }))
    return db
}

let db = null
function load() {
    if (db) return db
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
        if (saved?.visitors) db = saved
    } catch {
        // Storage may be blocked (private mode); fall back to a fresh in-memory seed.
    }
    db ??= seed()
    return db
}
function save() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
    } catch {
        // Non-fatal: demo edits just won't survive a reload.
    }
}

export function resetDemoData() {
    db = seed()
    save()
}

// ── Response shaping (mirrors the backend services) ─────────────
const round2 = (n) => Math.round(n * 100) / 100
const efficiency = (prepared, wasted) => (prepared > 0 ? round2(((prepared - wasted) / prepared) * 100) : 0)

const toFood = (f) => ({ ...f, quantityConsumed: round2(f.quantityPrepared - f.quantityWasted), efficiencyPercent: efficiency(f.quantityPrepared, f.quantityWasted) })
const toInventory = (i) => ({ ...i, isLowStock: i.quantity <= i.threshold })

const shapes = {
    visitors: (v) => v,
    food: toFood,
    expenses: (e) => e,
    inventory: toInventory,
    attendance: (a) => a,
}

function requireFields(body, fields) {
    const missing = fields.filter((f) => body?.[f] === undefined || body?.[f] === null || body?.[f] === '')
    if (missing.length) throw new ApiError(missing.map((f) => `${f} is required`).join(', '), 400)
}

const validators = {
    visitors: (b) => {
        requireFields(b, ['date', 'mealType', 'visitorCount'])
        if (b.visitorCount < 0) throw new ApiError('Visitor count cannot be negative', 400)
    },
    food: (b) => {
        requireFields(b, ['date', 'mealType', 'dishName', 'quantityPrepared', 'quantityWasted'])
        if (b.quantityWasted > b.quantityPrepared) {
            throw new ApiError(`Quantity wasted (${b.quantityWasted}) cannot exceed quantity prepared (${b.quantityPrepared})`, 400)
        }
    },
    expenses: (b) => requireFields(b, ['date', 'itemName', 'category', 'quantity', 'unit', 'price']),
    inventory: (b) => requireFields(b, ['itemName', 'category', 'quantity', 'unit', 'threshold']),
    attendance: (b, existingId) => {
        requireFields(b, ['date', 'staffId', 'role', 'status', 'shift'])
        const dup = db.attendance.find((a) => a.staffId === b.staffId && a.date === b.date && a.id !== existingId)
        if (dup && existingId === undefined) {
            throw new ApiError(`Attendance already marked for staff ${b.staffId} on ${b.date}`, 400)
        }
    },
}

function withComputed(name, row) {
    return name === 'expenses' ? { ...row, total: row.quantity * row.price } : row
}

function summary(date) {
    const visitors = db.visitors.filter((v) => v.date === date)
    const byMeal = (m) => visitors.filter((v) => v.mealType === m).reduce((a, v) => a + v.visitorCount, 0)
    const food = db.food.filter((f) => f.date === date)
    const prepared = food.reduce((a, f) => a + f.quantityPrepared, 0)
    const wasted = food.reduce((a, f) => a + f.quantityWasted, 0)
    const low = db.inventory.filter((i) => i.quantity <= i.threshold)
    const att = db.attendance.filter((a) => a.date === date)
    const count = (s) => att.filter((a) => a.status === s).length
    return {
        date,
        totalVisitors: visitors.reduce((a, v) => a + v.visitorCount, 0),
        breakfastVisitors: byMeal('BREAKFAST'),
        lunchVisitors: byMeal('LUNCH'),
        dinnerVisitors: byMeal('DINNER'),
        totalFoodPrepared: round2(prepared),
        totalFoodConsumed: round2(prepared - wasted),
        totalFoodWasted: round2(wasted),
        overallEfficiencyPercent: efficiency(prepared, wasted),
        totalExpenses: db.expenses.filter((e) => e.date === date).reduce((a, e) => a + e.total, 0),
        lowStockCount: low.length,
        lowStockItems: low.map((i) => i.itemName),
        staffPresent: count('PRESENT'),
        staffAbsent: count('ABSENT'),
        staffOnLeave: count('LEAVE'),
    }
}

const ROUTES = {
    visitors: 'visitors', food: 'food', expenses: 'expenses', inventory: 'inventory', attendance: 'attendance',
}

function handle(method, path, body) {
    load()
    const url = new URL(path, 'http://demo')
    const parts = url.pathname.replace(/^\/api\//, '').split('/')
    const [resourceName, sub, action] = parts
    const q = url.searchParams

    if (resourceName === 'dashboard' && sub === 'summary') return summary(q.get('date') || todayISO())

    const name = ROUTES[resourceName]
    if (!name) throw new ApiError('Not found', 404)
    const table = db[name]
    const shape = shapes[name]

    if (method === 'GET') {
        if (!sub) return table.map(shape)
        if (sub === 'by-date') return table.filter((r) => r.date === q.get('date')).map(shape)
        if (sub === 'low-stock') return table.filter((r) => r.quantity <= r.threshold).map(shape)
        const row = table.find((r) => String(r.id) === sub)
        if (!row) throw new ApiError(`Record not found with id: ${sub}`, 404)
        return shape(row)
    }
    if (method === 'POST') {
        validators[name](body)
        const row = withComputed(name, { ...body, id: db.nextId++ })
        table.push(row)
        save()
        return shape(row)
    }

    const idx = table.findIndex((r) => String(r.id) === sub)
    if (idx === -1) throw new ApiError(`Record not found with id: ${sub}`, 404)

    if (method === 'PUT') {
        validators[name](body, table[idx].id)
        table[idx] = withComputed(name, { ...table[idx], ...body })
        save()
        return shape(table[idx])
    }
    if (method === 'PATCH' && action === 'quantity') {
        const quantity = Number(q.get('quantity'))
        if (!(quantity >= 0)) throw new ApiError('Quantity cannot be negative', 400)
        table[idx] = { ...table[idx], quantity }
        save()
        return shape(table[idx])
    }
    if (method === 'DELETE') {
        table.splice(idx, 1)
        save()
        return null
    }
    throw new ApiError('Not found', 404)
}

// Mirrors SecurityConfig: STAFF may read, only ADMIN may write.
let demoRole = 'ADMIN'
export function setDemoRole(role) {
    demoRole = role
}

export function demoRequest(method, path, body) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                if (method !== 'GET' && demoRole !== 'ADMIN') {
                    throw new ApiError('Only admins can make changes. Ask an admin if this needs updating.', 403)
                }
                // Clone so callers can't mutate the store by accident.
                resolve(structuredClone(handle(method, path, body)))
            } catch (e) {
                reject(e)
            }
        }, LATENCY_MS)
    })
}
