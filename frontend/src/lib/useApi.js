import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Run an async loader and track { data, error, loading }. Re-runs when `deps`
 * change; `reload()` refetches without blanking what's already on screen.
 */
export function useApi(loader, deps = []) {
    const [state, setState] = useState({ data: null, error: null, loading: true })
    const loaderRef = useRef(loader)
    useEffect(() => {
        loaderRef.current = loader
    })
    const requestId = useRef(0)

    const run = useCallback(async () => {
        const id = ++requestId.current
        setState((s) => ({ ...s, loading: true, error: null }))
        try {
            const data = await loaderRef.current()
            if (id === requestId.current) setState({ data, error: null, loading: false })
        } catch (error) {
            if (id === requestId.current) setState((s) => ({ ...s, error, loading: false }))
        }
    }, [])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { run() }, deps)

    return { ...state, reload: run }
}
