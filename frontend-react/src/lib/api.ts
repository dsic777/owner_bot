const BASE = (import.meta.env.VITE_API_BASE as string) ?? ''

export function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  return fetch(`${BASE}${path}`, options)
}
