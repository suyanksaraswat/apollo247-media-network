# Packages

Each folder in `src/packages/` is a deep module: a lot of behaviour behind a small interface.

```
src/packages/
  <name>/
    index.ts        entry point (public), import this from outside
    client.ts       another entry point, a package may expose several
    lib/            implementation, private to the package
    tests/          tests and fixtures, private to the package
```

**Import only through entry points.** Code outside a package imports its root files only, never anything in its subfolders. This holds for `@/packages/<name>/lib/...` imports too.

**Free inside a package.** A package's own files import each other freely.

**Tests go through entry points.** Files in `<name>/tests/` import entry points (of their own package or others) and their own fixtures, never `lib/` internals, not even their own.

**No cycles.** No dependency cycles anywhere.

**No barrels.** Expose several small entry points (`index.ts`, `server.ts`, `types.ts`) instead of one `index.ts` that re-exports a whole subtree.

Check the rules with `pnpm lint:boundaries` (it also runs in `pnpm check` and CI).
