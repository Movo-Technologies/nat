import { validateApplication } from './validation/early-access';
export type SubmissionEnv = {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  WAITLIST_RATE_LIMIT_SECRET?: string;
  VERCEL?: string;
};
type Fetcher = typeof fetch;
function response(status: number, body: object) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...(status === 429 ? { 'Retry-After': '900' } : {}),
    },
  });
}
async function hashIp(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const bytes = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(bytes), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('');
}
async function readJson(request: Request) {
  if (!request.body) throw Error('empty');
  const reader = request.body.getReader();
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 16384) {
        await reader.cancel();
        throw Error('large');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const all = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    all.set(chunk, offset);
    offset += chunk.length;
  }
  return JSON.parse(new TextDecoder().decode(all)) as unknown;
}
export async function submitApplication(
  request: Request,
  env: SubmissionEnv,
  fetcher: Fetcher = fetch,
) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin)
    return response(403, { ok: false, error: 'invalid_origin' });
  if (
    !request.headers
      .get('content-type')
      ?.toLowerCase()
      .startsWith('application/json')
  )
    return response(415, { ok: false, error: 'unsupported_media_type' });
  let raw: unknown;
  try {
    raw = await readJson(request);
  } catch {
    return response(400, {
      ok: false,
      error: 'validation_error',
      message: 'Check your application and try again.',
    });
  }
  if (
    raw &&
    typeof raw === 'object' &&
    'contactFax' in raw &&
    (raw as { contactFax: unknown }).contactFax
  )
    return response(400, { ok: false, error: 'validation_error' });
  const { data, errors } = validateApplication(raw);
  if (!data)
    return response(400, { ok: false, error: 'validation_error', errors });
  if (
    !env.SUPABASE_URL ||
    !env.SUPABASE_SERVICE_ROLE_KEY ||
    !env.WAITLIST_RATE_LIMIT_SECRET
  )
    return response(503, {
      ok: false,
      error: 'submission_unavailable',
      message:
        'Applications cannot be sent just yet. Your answers are still here. Please try again later.',
    });
  try {
    const base = new URL(env.SUPABASE_URL);
    if (base.protocol !== 'https:') throw Error('invalid_config');
    const headers = {
      'Content-Type': 'application/json',
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    };
    // Only Vercel deployments trust the forwarding header overwritten by Vercel's edge.
    const ipHash = await hashIp(
      (env.VERCEL === '1'
        ? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        : request.headers.get('cf-connecting-ip')) || 'unknown-connection',
      env.WAITLIST_RATE_LIMIT_SECRET,
    );
    const rate = await fetcher(
      new URL('/rest/v1/rpc/consume_waitlist_rate_limit', base),
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ p_key: ipHash }),
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!rate.ok) throw Error('rate_backend');
    if ((await rate.json()) !== true)
      return response(429, {
        ok: false,
        error: 'rate_limited',
        message: 'Too many attempts from this connection. Try again later.',
      });
    const result = await fetcher(
      new URL('/rest/v1/rpc/submit_early_access', base),
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ p_application: data }),
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!result.ok) throw Error('database');
    // Return an identical response for fresh and duplicate applications to avoid disclosing list membership.
    return response(200, { ok: true, status: 'submitted' });
  } catch {
    return response(503, {
      ok: false,
      error: 'submission_failed',
      message: 'We couldn’t send that. Your answers are still here. Try again.',
    });
  }
}
