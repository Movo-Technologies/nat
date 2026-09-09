import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateApplication,
  normalizeWebsite,
} from '../work/tests/validation.mjs';
import { submitApplication } from '../work/tests/submission.mjs';
const valid = {
  name: 'Test Applicant',
  email: ' Test@Example.com ',
  websiteUrl: 'https://www.example.com/services?secret=remove#anchor',
  desiredOutcomes: ['capture_leads'],
  liveBetaOptIn: false,
  feedbackOptIn: false,
  privacyAcknowledged: true,
};
const env = {
  SUPABASE_URL: 'https://database.example',
  SUPABASE_SERVICE_ROLE_KEY: 'test-secret-never-browser',
  WAITLIST_RATE_LIMIT_SECRET: 'test-only-hmac-salt-at-least-32-chars',
};
const request = (body = valid, headers = {}) =>
  new Request('https://nat.example/api/early-access', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://nat.example',
      ...headers,
    },
    body: JSON.stringify(body),
  });
test('normalizes email and website without query strings; accepts explicit no', () => {
  const { data, errors } = validateApplication(valid);
  assert.deepEqual(errors, {});
  assert.equal(data.email, 'test@example.com');
  assert.equal(data.websiteDomain, 'example.com');
  assert.equal(data.websiteUrl, 'https://www.example.com/services');
  assert.equal(data.liveBetaOptIn, false);
});
test('rejects missing required fields and unacknowledged privacy', () => {
  const { errors } = validateApplication({});
  assert.deepEqual(
    Object.keys(errors).sort(),
    [
      'desiredOutcomes',
      'email',
      'liveBetaOptIn',
      'name',
      'privacyAcknowledged',
      'websiteUrl',
    ].sort(),
  );
});
test('rejects invalid outcomes, oversize notes, invalid opt-in type', () => {
  const { errors } = validateApplication({
    ...valid,
    notes: 'x'.repeat(1001),
    desiredOutcomes: ['constructor'],
    liveBetaOptIn: 'yes',
  });
  assert.ok(errors.notes);
  assert.ok(errors.desiredOutcomes);
  assert.ok(errors.liveBetaOptIn);
});
test('rejects credentials, non-web schemes, local and raw IP hosts', () => {
  for (const url of [
    'https://user:secret@example.com',
    'file:///tmp/private',
    'localhost',
    'https://127.0.0.1',
    'https://internal.local',
  ])
    assert.throws(() => normalizeWebsite(url));
});
test('server validation rejects before touching backend', async () => {
  const r = await submitApplication(request({}), env, () => {
    throw Error('Should not fetch');
  });
  assert.equal(r.status, 400);
  assert.equal((await r.json()).error, 'validation_error');
});
test('origin, content type and honeypot fail closed', async () => {
  assert.equal(
    (
      await submitApplication(
        request(valid, { Origin: 'https://attacker.example' }),
        env,
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await submitApplication(
        request(valid, { 'Content-Type': 'text/plain' }),
        env,
      )
    ).status,
    415,
  );
  assert.equal(
    (await submitApplication(request({ ...valid, contactFax: 'bot' }), env))
      .status,
    400,
  );
});
test('oversize request rejected before backend', async () => {
  assert.equal(
    (
      await submitApplication(
        request({ ...valid, notes: 'x'.repeat(20000) }),
        env,
      )
    ).status,
    400,
  );
});
test('missing config never claims success', async () => {
  const r = await submitApplication(request(), {});
  assert.equal(r.status, 503);
  assert.equal((await r.json()).ok, false);
});
test('successful and duplicate backend calls have indistinguishable safe responses', async () => {
  const calls = [];
  const mock = async (url, options) => {
    calls.push({ url: String(url), options });
    return Response.json(
      String(url).endsWith('consume_waitlist_rate_limit') ? true : null,
    );
  };
  const first = await submitApplication(request(), env, mock);
  const duplicate = await submitApplication(request(), env, mock);
  assert.equal(first.status, 200);
  assert.deepEqual(await first.json(), await duplicate.json());
  assert.equal(calls.length, 4);
  assert.equal(JSON.parse(calls[0].options.body).p_key.length, 64);
  assert.equal(
    JSON.parse(calls[1].options.body).p_application.email,
    'test@example.com',
  );
});
test('rate limit blocks persistence and provides retry advice', async () => {
  let calls = 0;
  const r = await submitApplication(request(), env, async () => {
    calls++;
    return Response.json(false);
  });
  assert.equal(r.status, 429);
  assert.equal(r.headers.get('Retry-After'), '900');
  assert.equal(calls, 1);
});
test('network failure, limiter failure and database failure preserve safe errors', async () => {
  for (const mock of [
    async () => {
      throw Error('private server details');
    },
    async () => new Response('private server details', { status: 500 }),
    async (url) =>
      String(url).endsWith('consume_waitlist_rate_limit')
        ? Response.json(true)
        : new Response('SQL SECRET', { status: 500 }),
  ]) {
    const r = await submitApplication(request(), env, mock);
    assert.equal(r.status, 503);
    const text = await r.text();
    assert.ok(!text.includes('SECRET'));
    assert.ok(!text.includes('private server details'));
  }
});
