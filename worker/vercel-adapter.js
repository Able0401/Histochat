// Runs a Vercel-style (req, res) API handler inside a Cloudflare Worker.
// Only the parts of req/res these handlers use are implemented.
export async function runVercelHandler(handler, request) {
  const url = new URL(request.url);
  let body;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const text = await request.text();
    try { body = text ? JSON.parse(text) : undefined; } catch { body = text; }
  }
  const req = {
    method: request.method,
    url: url.pathname + url.search,
    headers: Object.fromEntries(request.headers),
    query: Object.fromEntries(url.searchParams),
    body,
  };

  return new Promise((resolve) => {
    let status = 200;
    const headers = new Headers();
    const send = (payload) => resolve(new Response(payload ?? null, { status, headers }));
    const res = {
      status(code) { status = code; return res; },
      setHeader(key, value) { headers.set(key, value); return res; },
      json(obj) { headers.set('Content-Type', 'application/json'); send(JSON.stringify(obj)); return res; },
      send(payload) { send(typeof payload === 'object' && payload !== null ? JSON.stringify(payload) : payload); return res; },
      end(payload) { send(payload); return res; },
    };
    Promise.resolve()
      .then(() => handler(req, res))
      .catch((e) => {
        console.error(e);
        resolve(new Response('Internal Server Error', { status: 500 }));
      });
  });
}
