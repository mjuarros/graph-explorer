# PROTOTYPE — connection-validation UX (#1327)

**Throwaway.** This directory answers one question: _what should the good/bad-data
connection UX look and feel like?_ It is a UI-branch prototype (see
`.kiro/skills/prototype/UI.md`), sub-shape A — it mounts against the real
`/connections` page so density and chrome are honest. No real validation, no
schema wiring, no IndexedDB, no tests. **Do not promote this code to production**;
fold the winning direction into the real form/list, then delete this directory.

## Run it

```sh
pnpm connections:prototype
```

That's just `pnpm dev`. Then open:

```
http://localhost:5173/connections?prototype=connection-validation&variant=A
```

Flip variants with the floating bar at the bottom of the screen, or the `←` / `→`
arrow keys. The switcher and the whole prototype are hidden in production builds
(`NotInProduction`, gated on `env.PROD`).

## The three variants

Each variant shows a **valid**, a **hard-invalid**, and a **soft-invalid**
connection, plus the improved **per-field import error** — so the good/bad
contrast is visible in one screen.

- **A — Inline per-field.** Errors sit directly under each field; list rows expand
  to list their issues inline with an "Edit to fix" action; import errors are inline
  line items.
- **B — Summary banner.** All issues are hoisted into one `Alert` at the top of the
  form and the top of the list; fields stay quiet. Import failure is a single banner.
- **C — Row badge + fix drawer.** The list is calm — each row carries only a status
  badge (Blocked / Warning / Ready). Detail lives behind a click: a flagged row opens
  a fix drawer explaining each issue and routing to the fix. The form carries a
  compact status rail.

## The decisions this makes visible

From the locked design in `.scratch/connection-form-validation-research.md`:

- Per-field form validation replacing the single global `hasError` flag, including a
  **malformed URL** (not just empty).
- **Needs-attention** flag: a stored connection that fails the schema still appears,
  raw values intact, with an edit-to-fix path.
- **Hard-invalid** (blocks use, routes to fix) vs. **soft-invalid** (usable with a
  warning) — the subtle distinction that most needs eyes on it.
- **Atomic import** reporting per-field issues instead of one generic toast.

## Files

- `fixtures.ts` — hand-built valid / hard / soft connections + import-error payload.
- `PrototypeSwitcher.tsx` — the floating dev-only variant bar (`?variant=`, arrow keys).
- `VariantA.tsx`, `VariantB.tsx`, `VariantC.tsx` — the three variants.
- `scaffold.tsx` — the shared two-panel frame; each variant is otherwise free.
- `index.tsx` — host that switches on `?variant=` and renders the switcher.
- Mounted from `routes/Connections/Connections.tsx` behind `?prototype=connection-validation`.
