# Nat early-access website

## Vercel deployment

Vercel uses Next.js 16.3.5 through `pnpm build:vercel`, configured in `vercel.json`. Run `pnpm dev:vercel` for local Next.js development. The original Vinext build scripts are retained for Sites. The submission route reads server environment variables; on Vercel, rate limiting uses the IP header overwritten by Vercel’s edge. Do not trust forwarding headers outside the documented hosting boundary.

Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `WAITLIST_RATE_LIMIT_SECRET` in the Vercel project’s environment settings to enable saved applications. `NEXT_PUBLIC_SITE_URL` optionally sets a custom canonical domain; otherwise Vercel’s configured production domain supplies metadata and sitemap origins. Legal pages remain drafts and indexing remains disabled.

Direct CLI deployment is available through the signed-in Vercel account. Connecting this private GitHub organization repository to automatic deployments was blocked by the account’s Hobby plan; Vercel reported that Pro is required for this integration. No subscription upgrade or repository visibility change was made.

Nat’s public-site implementation, currently prepared as an owner-only preview. It includes the supplied marketing narrative, deterministic concept demonstration, two-step early-access application, server validation, Supabase SQL migration, legal drafts, metadata and a generated social image.

## Run

Use Node 22.13 or newer and pnpm. Run `pnpm install`, then `pnpm dev`. Use `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` for validation. The generated Sites scaffold uses Vinext’s Next-compatible App Router on Cloudflare Workers, React 19, TypeScript, Tailwind 4 and the included Base UI primitives. This differs from the brief’s recommended Next/Vercel runtime to support Sites private previews. Application copy remains server rendered; client islands provide the demo, form and navigation.

The local Windows npm launcher was broken and the bundled pnpm launcher attempted unnecessary module reconciliation. Checks were run through the installed script entrypoints using the bundled Node runtime. The lockfile is retained.

## Connect applications

1. Create or choose a Supabase project dedicated to this environment.
2. Apply `supabase/migrations/202609080001_early_access.sql` through the Supabase SQL editor or your migration workflow. This creates application records, a unique email/domain key, a shared atomic rate limiter, RLS, and restricted RPC functions.
3. Set server-only `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and a randomly generated `WAITLIST_RATE_LIMIT_SECRET` (at least 32 random bytes). Use `.env.example` as a key list; configure deployed values through Sites environment settings. Never prefix these secrets with `NEXT_PUBLIC_`. For local Cloudflare Worker bindings, use an ignored `.dev.vars` file; do not commit it.
4. Test a fresh application, repeat submission and rate limiting against the configured database. Verify the application count remains one for the same normalized email/domain.

The endpoint refuses to report success without a configured backend. No Supabase credentials were available during implementation, so database execution and real persistence remain unverified. Unit tests use a mock HTTP boundary. A success response means the RPC completed, with identical responses for duplicates to avoid revealing membership. Duplicate submissions preserve the existing record rather than allowing anonymous edits of someone else’s details.

Rate limiting allows five valid submission attempts per 15-minute connection window. It relies on Cloudflare’s trusted `CF-Connecting-IP` header and keyed SHA-256; an unavailable IP falls into a shared conservative bucket. Do not trust this header if deploying behind a different server without an equivalent trusted proxy policy. Expired rate-limit entries are cleaned during subsequent requests. Raw IPs are not saved by application code.

## Routes and source

- `/`: complete homepage and application.
- `/api/early-access`: JSON POST endpoint with bounded request bodies, validation, origin checks, honeypot and rate limiting.
- `/privacy`, `/terms`: visibly marked drafts.
- `/robots.txt`, `/sitemap.xml`, `/favicon.svg`, `/og.png`: site metadata and assets.
- `content/marketing.json`: exact supplied copy and demo script.
- `components/waitlist-form.tsx`, `lib/validation/early-access.ts`, `lib/submission.ts`: application flow and server boundary.

The demo is scripted, has no LLM calls, and never routes a real message. It plays once, supports pause/replay, pauses in hidden tabs, and shows the final transcript for reduced-motion users. The supplied Movo example is illustrative. Voice and Nat Brief remain explicitly planned.

Typed analytics emit local `nat:analytics` browser events only. No third-party collector, analytics cookies or network telemetry are configured. Event properties exclude email, notes and other form content. Connect a reviewed consent-aware collector before claiming funnel reporting is live.

Browsers supporting WebMCP expose `stage_nat_application`, which fills step one for review and never submits or grants privacy acknowledgment.

## Before public launch

- Connect Supabase and verify the SQL migration and actual insert/deduplication behavior.
- Replace draft legal copy with approved operator identity, contact, retention period and terms; update the privacy version in the database.
- Choose the final domain and update canonical, Open Graph and sitemap URLs. Homepage indexing is intentionally disabled for the private preview; revise robots and metadata for public launch.
- Review CSP against the deployed runtime and promote the current report-only policy to enforcement. Other headers restrict MIME sniffing, referrers and camera/microphone/geolocation access.
- Select an analytics adapter if reporting is desired.
- Test Safari, Firefox and Edge and measure real mobile performance before broad launch. The in-app browser checks do not establish cross-browser or WCAG certification.

Generated vendor UI components are excluded from application lint because the untouched scaffold contains baseline lint failures; they remain included in TypeScript checks. No custom lint rules were disabled globally to conceal application defects. A single documented local exception allows keyboard scrolling in the demo transcript.

## Social image

`public/og.png` was generated with the built-in image tool using the brief’s bone background, ink text, green pulse, exact headline and Private beta label. Its generated dimensions are 1730 × 909 (approximately the requested 1200:630 ratio); metadata uses the actual dimensions. It is not a screenshot of a live product.

## Validation

See `BUILD_REPORT.md` for executed checks and known release limitations.
