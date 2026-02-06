export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface FetchOptions extends RequestInit {
  defaultError?: string;
}

/**
 * Wrapper around fetch that handles JSON parsing and error responses
 * @param url - The URL to fetch
 * @param options - Fetch options with optional defaultError message
 */
export async function apiFetch<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { defaultError = "Une erreur est survenue", ...fetchOptions } = options;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data.error || defaultError, response.status);
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/**
 * GET request helper
 */
export function apiGet<T>(url: string, defaultError?: string): Promise<T> {
  return apiFetch<T>(url, { method: "GET", defaultError });
}

/**
 * POST request helper
 */
export function apiPost<T>(url: string, body?: unknown, defaultError?: string): Promise<T> {
  return apiFetch<T>(url, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
    defaultError,
  });
}

/**
 * PUT request helper
 */
export function apiPut<T>(url: string, body?: unknown, defaultError?: string): Promise<T> {
  return apiFetch<T>(url, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
    defaultError,
  });
}

/**
 * DELETE request helper
 */
export function apiDelete<T>(url: string, body?: unknown, defaultError?: string): Promise<T> {
  return apiFetch<T>(url, {
    method: "DELETE",
    body: body ? JSON.stringify(body) : undefined,
    defaultError,
  });
}
