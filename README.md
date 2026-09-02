# Vincent Flowers Porto

Website for Vincent Flowers, a florist in Porto: a bouquet builder, a ready-made shop,
subscriptions, and event/B2B enquiry pages, in English and European Portuguese.

- `frontend/` — React 19 + Vite + TypeScript, deployed to **Cloudflare Pages**
- `backend/` — Hono on **Cloudflare Workers**, with KV for data and R2 for uploaded photos

There is no payment step: every order is an enquiry that is stored server-side and
emailed to the shop.

## Running it locally

Two processes. Start the backend first — the frontend reads its catalogue from it.

```bash
cd backend && npm install && npx wrangler dev
```

```bash
cd frontend && npm install && npm run dev
```

The frontend then runs on <http://localhost:5173> and talks to the Worker on port 8787.
`npm run dev:network` exposes it on the LAN for phone testing; the API address is
derived from the hostname you browse to, so that works without extra configuration.

## Configuration

**Frontend** — one variable, in `frontend/.env.production`:

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE` | Base URL of the deployed Worker, no trailing slash. |

This is the only place the API address appears. In development it is left unset and
`src/lib/api.ts` falls back to `http://<current host>:8787`.

**Backend** — three secrets, listed with descriptions in `backend/.dev.vars.example`:
`RESEND_API_KEY`, `ADMIN_PASSWORD`, `ADMIN_TOKEN_SECRET`. Copy that file to
`backend/.dev.vars` for local work; in production set each with
`wrangler secret put <NAME>`.

## Cloudflare resources

These must exist in the account before `wrangler deploy` will succeed:

- **KV namespace** bound as `VINCENT_INVENTORY` — holds the catalogue, the closure
  periods, stored orders (`order:*`, kept for two years) and rate-limit counters. The
  ids in `backend/wrangler.toml` are account-scoped: a new account needs new ones from
  `wrangler kv namespace create VINCENT_INVENTORY`.
- **R2 bucket** `vincent-flowers-media` — photos uploaded from the admin panel. Create
  it once with `wrangler r2 bucket create vincent-flowers-media`. Until it exists,
  uploads return an error but the rest of the site works.

The sending domain must also be verified in Resend, otherwise every order email is
rejected. When that happens the order is still stored and shows a red "email failed"
badge in the admin panel — check there before assuming no orders came in.

## Deploying

```bash
cd backend && npx wrangler deploy
```

```bash
cd frontend && npm run build
```

`frontend/dist/` is what Cloudflare Pages serves. If Pages is connected to the GitHub
repository this happens automatically on push.

## Checks

```bash
cd frontend && npm run build && npm run lint
```

```bash
cd backend && npm run typecheck
```

`npm run build` runs `tsc -b` first, so a type error fails the build. There is no
automated test suite yet.

## Admin

`/admin`, password-protected, `noindex`. It manages the order history, closure periods
(dates the shop is shut, with the message customers see), the bouquet-builder
catalogue, and the ready-made shop bouquets — including drag-and-drop photo upload.
