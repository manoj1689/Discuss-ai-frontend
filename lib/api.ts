const defaultBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000"
const apiPrefix = process.env.NEXT_PUBLIC_API_PREFIX || "/api/v1"

const buildUrl = (path: string) => {
  if (path.startsWith("http")) return path
  const normalizedPath = path.startsWith("/api/") ? path : `${apiPrefix}${path.startsWith("/") ? "" : "/"}${path}`
  return `${defaultBase}${normalizedPath}`
}

export interface ApiOptions extends RequestInit {
  token?: string
  query?: Record<string, string | number | boolean | undefined>
}

export const buildQueryString = (query?: ApiOptions["query"]) => {
  if (!query) return ""
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined) return
    params.append(key, String(value))
  })
  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { token, query, headers, body, ...rest } = options
  const url = `${buildUrl(path)}${buildQueryString(query)}`

  const finalHeaders = new Headers(headers || {})
  if (token) {
    finalHeaders.set("Authorization", `Bearer ${token}`)
  }
  if (body && !finalHeaders.has("Content-Type") && !(body instanceof FormData)) {
    finalHeaders.set("Content-Type", "application/json")
  }

  const response = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    body,
  })

  const text = await response.text()
  let data: any = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!response.ok) {
    const message = data?.detail || data?.message || response.statusText
    const error = new Error(message)
    throw error
  }

  return data as T
}
