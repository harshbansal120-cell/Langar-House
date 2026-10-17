import { isSupabaseConfigured } from './supabaseClient'

/**
 * Demo mode serves the dashboard from an in-browser copy of the backend API
 * (see demoApi.js) so the UI can be explored without Supabase or the Spring
 * Boot service. It turns on when VITE_DEMO_MODE=true, or automatically when
 * Supabase isn't configured.
 */
export const isDemo = import.meta.env.VITE_DEMO_MODE === 'true' || !isSupabaseConfigured

/** Base URL of the Spring Boot API. Empty means same origin (the Vite dev proxy). */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
