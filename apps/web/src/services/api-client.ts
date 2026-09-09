/**
 * Thin fetch wrapper around the future NestJS API.
 *
 * The rest of the app never imports `fetch` directly — every service goes
 * through `apiClient`, so swapping the mock services (see src/mock and
 * src/services) for real HTTP calls later is a one-file change per domain,
 * not a rewrite.
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api/v1'

export class ApiClientError extends Error {
    constructor(
        message: string,
        public statusCode: number,
    ) {
        super(message)
        this.name = 'ApiClientError'
    }
}

interface RequestOptions extends RequestInit {
    authToken?: string
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { authToken, headers, ...rest } = options

    let token = authToken || localStorage.getItem('nlams_access_token') || null
    if (!token) {
        try {
            const raw = localStorage.getItem('nlams-auth')
            if (raw) {
                const parsed = JSON.parse(raw)
                token = parsed?.state?.session?.tokens?.accessToken || null
            }
        } catch {}
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...rest,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
    })

    if (!response.ok) {
        const body = await response.json().catch(() => ({ message: response.statusText }))
        throw new ApiClientError(body.message ?? 'Request failed', response.status)
    }

    if (response.status === 204) {
        return undefined as T
    }

    return (await response.json()) as T
}

export const apiClient = {
    get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
    post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
        request<T>(path, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
    patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
        request<T>(path, { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
    delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'DELETE' }),
}