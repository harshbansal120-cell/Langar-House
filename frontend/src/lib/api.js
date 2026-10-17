import { supabase } from './supabaseClient'
import { API_BASE_URL, isDemo } from './config'

export class ApiError extends Error {
    constructor(message, status) {
        super(message)
        this.status = status
    }
}

const FALLBACK_MESSAGES = {
    401: 'Your session has expired. Please sign in again.',
    403: 'Only admins can make changes. Ask an admin if this needs updating.',
    429: 'Too many requests. Please wait a minute and try again.',
}

async function authHeader() {
    if (!supabase) return {}
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(method, path, body) {
    if (isDemo) {
        const { demoRequest } = await import('./demoApi')
        return demoRequest(method, path, body)
    }

    let res
    try {
        res = await fetch(API_BASE_URL + path, {
            method,
            headers: {
                ...(body !== undefined && { 'Content-Type': 'application/json' }),
                ...(await authHeader()),
            },
            body: body !== undefined ? JSON.stringify(body) : undefined,
        })
    } catch {
        throw new ApiError("Can't reach the server. Check that the backend is running.", 0)
    }

    if (res.status === 204) return null
    const text = await res.text()
    let json = null
    try {
        json = text ? JSON.parse(text) : null
    } catch {
        // Non-JSON body (e.g. a proxy error page); fall through to status handling.
    }

    if (!res.ok) {
        const message = FALLBACK_MESSAGES[res.status] || json?.message || `Request failed (${res.status})`
        throw new ApiError(message, res.status)
    }
    return json
}

const get = (path) => request('GET', path)
const post = (path, body) => request('POST', path, body)
const put = (path, body) => request('PUT', path, body)
const patch = (path) => request('PATCH', path)
const del = (path) => request('DELETE', path)

/** CRUD helpers for a standard backend resource. */
function resource(base) {
    return {
        list: () => get(base),
        byDate: (date) => get(`${base}/by-date?date=${date}`),
        create: (body) => post(base, body),
        update: (id, body) => put(`${base}/${id}`, body),
        remove: (id) => del(`${base}/${id}`),
    }
}

export const api = {
    dashboard: {
        summary: (date) => get(`/api/dashboard/summary${date ? `?date=${date}` : ''}`),
    },
    visitors: resource('/api/visitors'),
    food: resource('/api/food'),
    expenses: resource('/api/expenses'),
    attendance: resource('/api/attendance'),
    inventory: {
        ...resource('/api/inventory'),
        lowStock: () => get('/api/inventory/low-stock'),
        setQuantity: (id, quantity) => patch(`/api/inventory/${id}/quantity?quantity=${quantity}`),
    },
    /**
     * Staff come from the Supabase `profiles` table (the backend has no staff
     * endpoint; attendance stores the profile id as staffId). Returns [] when
     * row-level security hides other profiles, and the UI falls back to free text.
     */
    staff: {
        list: async () => {
            if (isDemo) {
                const { DEMO_STAFF } = await import('./demoApi')
                return DEMO_STAFF
            }
            const { data, error } = await supabase.from('profiles').select('id, full_name, role').order('full_name')
            return error ? [] : data
        },
    },
}
