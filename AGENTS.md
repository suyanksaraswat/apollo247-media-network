<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project conventions

Apollo 24|7 Media Network is a personal project: a working concept of a retail media network for Apollo 24|7, built on public information. It is not affiliated with Apollo, and every store, shopper and sales figure in it is synthetic.

- **Deep modules.** Domain logic lives in `src/packages/<name>/`: entry points at the package root, implementation in `lib/`, tests in `tests/`. Import a package only through its root files. Read [src/packages/README.md](./src/packages/README.md) before adding or importing a package; `pnpm lint:boundaries` enforces it.
- **Tests.** Jest for units and API route handlers: package tests in `src/packages/<name>/tests/*.test.ts` import only entry points; route tests sit next to the route as `*.test.ts`; component tests are `*.test.tsx` (jsdom, jest-dom matchers). Playwright end-to-end tests live in `e2e/*.e2e.ts`.
- **Finish with `pnpm check`** (typecheck, type-aware Oxlint with warnings as errors, boundaries, Prettier, Jest). Run `pnpm test:e2e` when a page changes.
- **AI is Gemini** through `@google/genai`, server-side only, keyed by `GEMINI_API_KEY`. Tests never call it: Jest blanks the key in `jest/hermetic.ts` and Playwright starts the app with an empty key, so the app's cached sample answers are what tests see.
- **Free and personal.** Free tiers only (Vercel Hobby, Gemini free tier, GitHub Actions on a public repo). Personal accounts only; nothing from any employer's accounts, keys or repos.
- **Numbers carry their source.** Every figure shown is either sourced (with a link), derived from sourced figures, or marked as a placeholder.
- **No code comments** unless one precise line is truly needed.
- Exact dependency versions (no ranges). TypeScript 7 runs `pnpm typecheck`; dependency-cruiser parses with SWC because TypeScript 7.0 has no compiler API.
