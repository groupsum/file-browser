# Groupsum File Explorer

SSOT-governed Groupsum workspace for the `@groupsum/file-explorer` React package.

## Workspace

- Python workspace: `uv` with `ssot-registry` in the dev dependency group.
- JavaScript workspace: `pnpm` with packages under `packages/*`.
- Component package: `packages/file-explorer`.

## Commands

```powershell
uv sync
pnpm install
pnpm run typecheck
pnpm run build
uv run ssot validate .
```
