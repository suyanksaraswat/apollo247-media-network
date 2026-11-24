# Apollo 24|7 Media Network (unofficial concept)

**Live:** https://apollo247-media-concept.vercel.app

A working concept of a retail media network for Apollo 24|7: how the app, about 7,300 pharmacy stores and home deliveries could be sold to brands as one media network, with the measurement that makes brands renew. Built by Suyank Saraswat for the DGM – Monetization application.

Built on public information only. Not affiliated with or endorsed by Apollo. Every store, shopper and sales figure in the app is synthetic; every public figure links to its source, and every assumption is marked as one.

## What is in it

| Page          | What it does                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------- |
| 90-day plan   | Where Apollo stands, how peers sell ads, what is unsold, and the first 90 days                          |
| Media kit     | Every sellable surface across app, stores, doorstep and data, with status, buyer, price model and reach |
| Planner       | A brand brief becomes a media plan across channels; rules block what may not be advertised              |
| Store pilot   | Picks test stores and matched control stores, sizes the lift a pilot can detect, simulates a readout    |
| Revenue model | Year-by-year revenue by line with editable, sourced assumptions                                         |
| Sources       | Every figure and assumption with its source or placeholder status                                       |

## Stack

|                                         | Version |
| --------------------------------------- | ------- |
| Next.js (App Router, Turbopack)         | 16.4.6  |
| React                                   | 19.3.1  |
| TypeScript                              | 7.0.2   |
| Tailwind CSS                            | 4.3.5   |
| Gemini SDK (`@google/genai`)            | 3.6.1   |
| Jest + Testing Library                  | 30.5.2  |
| Playwright                              | 1.65.1  |
| Oxlint (type-aware via oxlint-tsgolint) | 1.94.0  |
| Prettier                                | 3.10.1  |
| dependency-cruiser                      | 18.9.0  |
| Node                                    | 24      |
| pnpm                                    | 10.27.0 |

All dependency versions are exact.

## Run it

```bash
pnpm install
cp .env.example .env.local   # optional: add a Gemini key
pnpm dev                     # http://localhost:3000
```

The app works without a Gemini key: the planner falls back to cached answers for the sample briefs, and you fill the fields by hand for your own brief.

## Scripts

| Script                         | What it runs                                                     |
| ------------------------------ | ---------------------------------------------------------------- |
| `pnpm dev` / `build` / `start` | Next.js                                                          |
| `pnpm typecheck`               | `tsc --noEmit` (TypeScript 7)                                    |
| `pnpm lint`                    | Oxlint, type-aware, warnings fail (settings in `.oxlintrc.json`) |
| `pnpm lint:boundaries`         | dependency-cruiser deep-module rules (`.dependency-cruiser.cjs`) |
| `pnpm format` / `format:check` | Prettier with the Tailwind class sorter                          |
| `pnpm test` / `test:watch`     | Jest: `unit` (node) and `ui` (jsdom) projects                    |
| `pnpm test:e2e`                | Playwright on a production build, desktop and mobile Chromium    |
| `pnpm check`                   | typecheck, lint, boundaries, format check and Jest in one go     |

A Husky pre-commit hook runs lint-staged (Prettier and Oxlint on staged files), then `pnpm typecheck` and `pnpm test`.

Two Oxlint rules are switched off on purpose. `react-perf/jsx-no-new-*-as-prop` and `react-perf/jsx-no-jsx-as-prop` flag every inline event handler and every element passed as a prop, which only matters for components wrapped in `React.memo`, and none are. `typescript/consistent-return` flags exhaustive `switch` statements that TypeScript already proves return on every path.

## Layout

```
src/
  app/            pages and API route handlers
  components/     shared UI
  packages/       domain logic as deep modules (see src/packages/README.md)
e2e/              Playwright tests (*.e2e.ts)
jest/             Jest setup: hermetic env, jest-dom matchers
```

Tests never call Gemini: Jest blanks `GEMINI_API_KEY` in `jest/hermetic.ts`, and Playwright starts the app with an empty key.

## Deploy for free (Vercel Hobby)

Use your personal accounts throughout.

1. Create a public repo on your personal GitHub account and push this folder to it. If the `gh` CLI has more than one login, switch first: `gh auth switch -u <your-personal-username>`.
2. Sign in to [vercel.com](https://vercel.com) with that personal GitHub account (Hobby plan, free for personal, non-commercial projects).
3. Add New → Project → import the repo. Vercel detects Next.js and pnpm; keep the defaults.
4. Optional: under Settings → Environment Variables add `GEMINI_API_KEY` (a free key from [Google AI Studio](https://aistudio.google.com/apikey) on your personal Google account) and, if you want a different model, `GEMINI_MODEL`.
5. Deploy. The app is live at `https://<project>.vercel.app`; every push to `main` redeploys.

No database, no paid add-ons, no custom domain needed.

## CI

`.github/workflows/ci.yml` runs on every push to `main` and every pull request: install with the frozen lockfile, `pnpm check`, `pnpm build`, then Playwright. GitHub Actions minutes are free on public repos.
