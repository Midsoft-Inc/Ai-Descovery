// Tiny fetch helper: always resolves { ok, status, data } (data is {} if the body is not JSON).
export async function api(url, { method = "GET", body, signal } = {}) {
  const r = await fetch(url, {
    method,
    signal,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data };
}
