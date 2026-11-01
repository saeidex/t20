# Eval 0 — Project/Team/Client Scaffold Report

## t20 Command

```bash
npx @saeidex/t20 \
  -i ./types.ts \
  -o ./src \
  --seed project-team-scaffold
```

> **Important:** Run from the directory containing `types.ts`. The command will open an **interactive multi-select prompt** — you must manually select `Project`, `Client`, and `Team`. There is no `--objects` / non-interactive selection flag in 0.8.19.

---

## 1. Objects and Files t20 Will Generate

t20 generates **4 objects** (3 declared + 1 synthesized junction):

| Object | Declared? | Reason |
|---|---|---|
| `Project` | ✅ | User-selected |
| `Client` | ✅ | User-selected |
| `Team` | ✅ | User-selected |
| `ProjectTeam` | ❌ (synthesized) | `Project.teams: Team[]` and `Team.projects: Project[]` are reciprocal arrays → many-to-many junction auto-created |

### Generated file layout

```
src/
├── objects/
│   ├── project.object.ts
│   ├── client.object.ts
│   ├── team.object.ts
│   └── project-team.object.ts          ← synthesized junction
├── views/
│   ├── project.view.ts
│   ├── client.view.ts
│   ├── team.view.ts
│   └── project-team.view.ts
└── navigation-menu-items/
    ├── project.navigation-menu-item.ts
    ├── client.navigation-menu-item.ts
    ├── team.navigation-menu-item.ts
    └── project-team.navigation-menu-item.ts
```

---

## 2. Behaviors That May Surprise a Naive User

### `id` and `name` fields are always skipped
`id` and `name` are stripped before field resolution on every object. Do **not** declare them — Twenty provides them as built-ins. Any explicitly declared `name` field on `Project`, `Client`, or `Team` would be ignored.

### Synthesized `ProjectTeam` junction object
Because `Project.teams: Team[]` and `Team.projects: Project[]` are both arrays of the same pair, t20 detects a many-to-many and synthesizes a `ProjectTeam` junction object with its own `id`, `name`, `project` (many-to-one), and `team` (many-to-one) fields. **Do not hand-write a junction type.** The two original sides are rewritten to point at the junction.

### Team has no scalar fields → `[WARNING]: No Field founds!`
`Team` only has `projects: Project[]`, a relation field. Views exclude `id` and all relation fields, so `team.view.ts` will have an empty `fields: []` and t20 emits `[WARNING]: No Field founds!`. Add a scalar field (e.g. `description: string`) if you want view columns.

### `status` and `tags` become enums with uppercased values
- `status: "active" | "paused" | "done"` → `SELECT` with a synthesized `Status` enum (`ACTIVE`, `PAUSED`, `DONE`), options colored `"gray"`.
- `tags: ("internal" | "client" | "urgent")[]` → `MULTI_SELECT` with a synthesized `Tags` enum.

### Windows: generated imports use backslashes
On Windows, `toImportStatement()` uses `path.relative`, which produces `..\\objects\\project.object` — **not** a valid TypeScript module specifier. Generate under WSL/Linux, or normalize `\` → `/` in the generated files before type-checking.

### UUIDs are re-randomized without `--seed`
Without `--seed`, every UUID is a fresh UUIDv4. Use `--seed project-team-scaffold` (or any stable string) for repeatable output.

### `--dry-run` and `--print` show `undefined` blocks (known bug)
`resultOutput()` destructures `{ content, file }` but `generateResult()` returns `{ [filePath]: content }`. Use `-o` to write files and inspect them on disk instead.

---

## 3. How to Actually Execute It

Because object selection is **always interactive**, the full CLI cannot be run headlessly:

1. Open a real terminal (not an agent shell).
2. Run:
   ```bash
   npx @saeidex/t20 -i ./types.ts -o ./src --seed project-team-scaffold
   ```
3. At the multi-select prompt, **select `Project`, `Client`, and `Team`** (do not select any pre-existing types if the file is extended later). Press Enter.
4. t20 writes files under `src/objects/`, `src/views/`, and `src/navigation-menu-items/`.
5. After generation, run `git diff` to review — generation **overwrites** all matching files.

**Alternative (headless, for CI/automation):** Use the repo helper `scripts/render.ts` with an explicit object list:

```bash
bun .agents/skills/t20/scripts/render.ts \
  --input ./types.ts \
  --output ./src \
  --seed project-team-scaffold \
  Project Client Team
```

This bypasses the interactive prompt and produces identical output.
