// lib/api.ts
const BASE = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

export type Agent = {
  id: string;
  handle: string;
  display_name?: string;
  avatar?: string;
  resonance?: number;
};

export class ApiError extends Error {
  readonly status: number;
  readonly url: string;
  readonly body?: unknown;

  constructor(url: string, status: number, statusText: string, body?: unknown) {
    const bodyStr = body === undefined
      ? ''
      : ` - ${typeof body === 'string' ? body : JSON.stringify(body)}`;
    super(`${url} failed: ${status} ${statusText}${bodyStr}`);
    this.name = 'ApiError';
    this.status = status;
    this.url = url;
    this.body = body;
  }
}

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  let res: Response;

  try {
    res = await fetch(url, { cache: 'no-store', ...init });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`${url} request failed: ${msg}`);
  }

  const contentType = res.headers.get('Content-Type') || '';
  const isJson = contentType.includes('application/json');

  if (!res.ok) {
    let body: unknown;
    try {
      body = isJson ? await res.json() : await res.text();
    } catch {
      // ignore body read errors
    }
    throw new ApiError(url, res.status, res.statusText, body);
  }

  return res.json() as Promise<T>;
}

async function requestText(path: string, init: RequestInit = {}): Promise<string> {
  const url = `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  let res: Response;

  try {
    res = await fetch(url, { cache: 'no-store', ...init });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`${url} request failed: ${msg}`);
  }

  const contentType = res.headers.get('Content-Type') || '';
  const isJson = contentType.includes('application/json');

  if (!res.ok) {
    let body: unknown;
    try {
      body = isJson ? await res.json() : await res.text();
    } catch {
      // ignore body read errors
    }
    throw new ApiError(url, res.status, res.statusText, body);
  }

  return res.text();
}

const AGENTS_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

async function json<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

/** GET /status */
export function getStatus(signal?: AbortSignal) {
  return requestText('/status', { signal });
}

/** GET /system/collective-entropy */
export function getEntropy(signal?: AbortSignal) {
  return requestJson('/system/collective-entropy', { signal });
}

/** POST /ai-assist/:vibenodeId */
export function aiAssist(vibenodeId: number, prompt: string, token: string, signal?: AbortSignal) {
  return requestJson(`/ai-assist/${vibenodeId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt }),
    signal,
  });
}

export const api = {
  // Tries a few common agent endpoints; falls back gracefully
  async listAgents(signal?: AbortSignal): Promise<Agent[]> {
    if (!AGENTS_BASE) throw new Error('No API base set');
    const paths = ['/agents', '/ai/personas', '/api/agents', '/api/personas'];
    for (const p of paths) {
      try {
        const r = await json<any>(`${AGENTS_BASE}${p}`, { signal });
        // normalize a little:
        if (Array.isArray(r)) return r as Agent[];
        if (Array.isArray(r?.results)) return r.results as Agent[];
      } catch {
        /* try next */
      }
    }
    throw new Error('No agents endpoint found');
  },
};
