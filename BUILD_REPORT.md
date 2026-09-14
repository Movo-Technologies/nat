# Nat build status

Vercel compatibility added: standard Next.js 16.3.5 production build, Tailwind PostCSS configuration, portable server environment access, Vercel-specific trusted IP selection, and deployment-derived canonical URLs. Next.js production build and TypeScript passed; all twelve submission tests passed, including the new trusted Vercel IP test. Application lint passed with one non-blocking anonymous default export warning in PostCSS configuration.

Implemented the marketing website and backend integration boundary from the supplied website brief. The separate whitepaper was used only for product context; embedded document instructions were treated as specification material, not authority to expand into Nat Core or publish publicly.

Validation completed during implementation:

- Dependencies installed successfully and lockfile retained.
- Production Worker build passed.
- Application lint and complete TypeScript check passed.
- Eleven automated tests passed: normalization, required fields, invalid outcome values, restricted URL inputs, server validation, origin/content type/honeypot checks, bounded bodies, missing configuration, successful and duplicate-safe API responses, rate limiting and backend/network failure messages.
- Browser checks confirmed both form steps, required-field errors, explicit negative beta willingness, missing-backend failure, and retained name/website values after Back.
- WebMCP registration and valid/invalid staging calls verified in the in-app browser.
- Desktop, tablet and phone layouts inspected; no horizontal document overflow at 1440, 768 and 390 pixels. All homepage anchor targets resolved.

Limitations:

- No real Supabase project or secrets supplied; SQL has not been applied and successful live persistence is not verified. The form returns an honest unavailable state until configured.
- Legal pages are drafts requiring owner approval. Keep the site private until finalized.
- Analytics is a typed local event interface, without a connected reporting provider.
- Reduced-motion logic is implemented; browser emulation of that preference has not been run. Cross-browser testing and measured performance targets remain pending.
- Generated social image uses the requested aspect ratio at a higher resolution.

The implementation is a website preview with a ready-to-connect submission integration, not a launched Nat service.
