# Eval 1 — Diagnose Generation Gotchas Report

Fixtures used:
- Input: `fixtures/order-types.ts`
- Generated object: `fixtures/generated/objects/order.object.ts`
- CI log: `fixtures/ci-log.txt`

---

## Issue 1: `orderId` is `FieldType.TEXT`, not `UUID`

### Symptom
In `order.object.ts`, `orderId` is generated as:
```ts
{
  name: "orderId",
  type: FieldType.TEXT,
}
```

### Root Cause — Name Heuristic in `resolve-date-suffix-and-uuid-types.ts`

The UUID name heuristic is:
```ts
const isUUID = (name: string) =>
  /(id|ID)/.test(name) || /universalidentifier/i.test(name);
```

This matches **literal lowercase `id` or uppercase `ID` anywhere in the name**. The word `orderId` contains the suffix `Id` (capital I, lowercase d) — **this does not match** `id` (both lowercase) or `ID` (both uppercase).

There is a `*Id` suffix branch (`isIdSuffix`) that does match `orderId`:
```ts
const isIdSuffix = (name: string) =>
  /(?:Id|ID|_[iI]d|-[iI]d|[uU][uU][iI]d)$|^[iI][dD]$/.test(name);
```

But its guard condition is:
```ts
if (isIdSuffix(name) && !ts.TypeFlags.String && !ts.TypeFlags.Number) {
```

`ts.TypeFlags.String` and `ts.TypeFlags.Number` are **numeric enum values** (truthy integers). `!truthy` is always `false`, so the conjunction `!ts.TypeFlags.String && !ts.TypeFlags.Number` is always `false`. **This branch is dead code and never executes.**

Names that also do *not* match:
- `userId` → camelCase `Id` → **TEXT**
- `categoryId` → camelCase `Id` → **TEXT**
- `externalId` → camelCase `Id` → **TEXT**

Names that *do* match and become UUID (surprising):
- `valid` → contains literal lowercase `id` → **UUID**
- `userid` → contains literal lowercase `id` → **UUID**
- `paid` → contains literal lowercase `id` → **UUID**

### Fix / Workaround

Declare `FieldType.UUID` explicitly:

```ts
import type { FieldType } from "twenty-sdk/define";

export interface Order {
  orderId: FieldType.UUID;   // explicit — not subject to name heuristics
  // ...
}
```

The explicit `FieldType.X` resolver runs first and always wins.

---

## Issue 2: `--dry-run` prints `undefined` blocks

### Symptom (from `ci-log.txt`)
```
[CI] $ npx @saeidex/t20 -i src/types.ts -o src --dry-run
[CI] /* undefined */
[CI] undefined
[CI] /* undefined */
[CI] undefined
```

### Root Cause — Shape Mismatch in `write-result.ts`

`generateResult()` returns:
```ts
type Result = {
  objects: Array<Record<string, string>>;  // { [filePath]: content }
  views:   Array<Record<string, string>>;
  navMenuItems: Array<Record<string, string>>;
};
```

But `resultOutput()` (used by `--dry-run`, `--print`, and `--clipboard`) destructures each item as:
```ts
result.objects.forEach(({ content, file }) => {
  res += `\n/* ${file} */\n${content}\n`;
});
```

There are no `content` or `file` keys in the items — they are `{ [filePath]: content }` objects. Both `file` and `content` destructure as `undefined`, producing the `/* undefined */\nundefined` output.

### Fix / Workaround

**Do not rely on `--dry-run`, `--print`, or `--clipboard` in 0.8.19.** Instead:

1. Write files normally with `-o <dir>`.
2. Read the written files from disk to inspect output.
3. Use `scripts/render.ts --print` from a t20 repo checkout (it reads files after writing them, so it avoids the destructuring bug).

---

## Issue 3: TypeScript fails on backslash imports on Windows

### Symptom (from `ci-log.txt`)
```
src/views/order.view.ts(3,38): error TS2307: Cannot find module '..\objects/order.object'
```

### Root Cause — `path.relative` on Windows

`toImportStatement()` and `resolveOutputDirectories()` call `path.relative()` to compute cross-directory import paths. On Windows, `path.relative` returns paths with **backslash separators** (`..\\objects\\order.object`). TypeScript module resolution treats the backslash as an escape character, not a path separator, making the specifier invalid.

This is a known t20 0.8.19 bug. The repo test suite has three failing path tests on Windows for the same reason.

### Workarounds

1. **Generate on WSL / Linux / macOS.** `path.relative` returns POSIX paths there.
2. **Post-process imports.** After generation, replace `\\` with `/` in all generated files:
   ```bash
   # PowerShell
   Get-ChildItem src -Recurse -Filter "*.ts" |
     ForEach-Object { (Get-Content $_.FullName) -replace '\\\\', '/' | Set-Content $_.FullName }
   ```
3. **Fix t20 itself.** Change `toImportStatement()` to call `.split(path.sep).join('/')` or use `import { posix } from 'node:path'` when building specifiers.

---

## Is the README Trustworthy?

**No.** The README is stale and predates several major features and behavioral changes:

| Claim | Reality |
|---|---|
| Relations are unsupported | Relations, inverse fields, and many-to-many junctions are fully supported |
| `constant` is a valid entity | `constant` was removed; `--constants-dir` is gone; using `-e constant` exits with an error |
| `*Id` fields become UUID | The `*Id` suffix branch is unreachable dead code |
| `--export-only`, `--review-names`, `--seed`, `--plural-file-names`, `--skip-related-entities` are absent | All are implemented |
| Relations need manual wiring | t20 adds inverse relations automatically |

Always read `src/cli/main.ts`, `src/internal/create-cli.ts`, and `src/internal/resolvers/` for current behavior.
