const API_PREFIX = '/api/msu';
const DEFAULT_API_BASE_URL = 'https://openapi.msu.io/v1rc1';

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers }
  });
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  const allowedOrigins = (env.ALLOWED_ORIGINS || '').split(',').map((value) => value.trim()).filter(Boolean);
  const allowOrigin = origin && allowedOrigins.includes(origin) ? origin : null;
  return {
    ...(allowOrigin ? { 'access-control-allow-origin': allowOrigin, vary: 'Origin' } : {}),
    'access-control-allow-methods': 'GET, OPTIONS',
    'access-control-allow-headers': 'content-type'
  };
}

function withCors(response, request, env) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(corsHeaders(request, env))) headers.set(name, value);
  return new Response(response.body, { status: response.status, headers });
}

function validValue(value, maxLength = 200) {
  return Boolean(value) && value.length <= maxLength && /^[a-zA-Z0-9._:-]+$/.test(value);
}

function getUpstreamPath(url) {
  try {
    const path = url.pathname.slice(API_PREFIX.length);
    const characterMatch = path.match(/^\/accounts\/([^/]+)\/characters$/);
    if (characterMatch && url.searchParams.get('size') === '100') {
      const wallet = decodeURIComponent(characterMatch[1]);
      return validValue(wallet, 128) ? `/accounts/${encodeURIComponent(wallet)}/characters?size=100` : null;
    }

    const raffleMatch = path.match(/^\/msn\/characters\/([^/]+)\/raffles$/);
    if (raffleMatch) {
      const assetKey = decodeURIComponent(raffleMatch[1]);
      const wallet = url.searchParams.get('walletAddress');
      return validValue(assetKey) && validValue(wallet, 128)
        ? `/msn/characters/${encodeURIComponent(assetKey)}/raffles?walletAddress=${encodeURIComponent(wallet)}`
        : null;
    }

    const historyMatch = path.match(/^\/msn\/characters\/([^/]+)\/raffles\/history$/);
    if (historyMatch) {
      const assetKey = decodeURIComponent(historyMatch[1]);
      const wallet = url.searchParams.get('wallet_address');
      const raffledAt = url.searchParams.get('raffled_at');
      return validValue(assetKey) && validValue(wallet, 128) && (!raffledAt || validValue(raffledAt, 64))
        ? `/msn/characters/${encodeURIComponent(assetKey)}/raffles/history?${new URLSearchParams({
          wallet_address: wallet,
          ...(raffledAt ? { raffled_at: raffledAt } : {})
        })}`
        : null;
    }
  } catch {
    return null;
  }

  return null;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const headers = corsHeaders(request, env);
    if (request.method === 'OPTIONS') return new Response(null, { headers });
    if (request.method !== 'GET' || !url.pathname.startsWith(`${API_PREFIX}/`)) {
      return withCors(json({ error: 'Not found' }, 404), request, env);
    }

    const upstreamPath = getUpstreamPath(url);
    if (!upstreamPath) return withCors(json({ error: 'Invalid request' }, 400), request, env);

    const cache = caches.default;
    const cacheKey = new Request(url.toString(), request);
    const cached = await cache.match(cacheKey);
    if (cached) return withCors(cached, request, env);

    const upstream = await fetch(`${env.MSU_API_BASE_URL || DEFAULT_API_BASE_URL}${upstreamPath}`, {
      headers: { accept: 'application/json', 'x-nxopen-api-key': env.MSU_API_KEY }
    });
    const response = new Response(upstream.body, {
      status: upstream.status,
      headers: { 'content-type': upstream.headers.get('content-type') || 'application/json' }
    });
    if (response.ok) ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return withCors(response, request, env);
  }
};