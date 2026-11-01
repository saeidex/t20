---
name: t20
description: Use the t20 CLI (@saeidex/t20) to scaffold Twenty CRM objects, fields, views, and navigation-menu items from TypeScript type definitions. Load this skill whenever the user mentions t20, "types to twenty", Twenty CRM code generation/scaffolding, twenty-sdk defineObject/defineView, generating Twenty objects from TS types, or asks to debug generated Twenty files, relation fields, enum options, or t20 CLI flags. It documents the current CLI behavior (0.8.19) because the repository README is outdated.
---

# t20 — TypeScript types to Twenty CRM scaffolding

t20 reads one TypeScript file, lets the user pick which top-level interfaces/type aliases are objects, then writes Twenty SDK definition files for objects, index views, and navigation-menu items. It also resolves relations, creates inverse fields, and synthesizes junction objects for many-to-many pairs.

t20 only writes files. It does not create a Twenty app, install dependencies, register the app, or run migrations. The generated files must live in a Twenty app that depends on `twenty-sdk`.

## Mental model

`src/cli/main.ts` is the source of truth. The pipeline is:

1. Parse `-i` (or ask for a file).
2. List selectable top-level interfaces/type aliases.
3. Multiselect objects interactively.
4. Extract fields, recursively pulling in related object types.
5. Detect many-to-many pairs and synthesize junction objects.
6. Inject missing inverse relations.
7. Optionally review singular/plural names (`--review-names`).
8. Generate object/view/nav-item files and write them.

Two consequences matter in practice:

- **Object selection is always interactive.** There is no `--objects` flag. An agent cannot run the full CLI headlessly; ask the user to run it in a real terminal, or use the bundled `scripts/render.ts` helper described below.
- **Generation is a snapshot, not a merge.** Files are overwritten. Re-running without `--seed` regenerates every UUID, so treat generated files as disposable or always use a seed.

## Quick start

```bash
# From the Twenty app root
npx @saeidex/t20 -i ./types/crm.ts -o ./src --seed my-crm-app
```

Then select objects in the prompt. Default output layout:

```text
src/
├── objects/<singular-kebab>.object.ts
├── views/<singular-kebab>.view.ts
└── navigation-menu-items/<singular-kebab>.navigation-menu-item.ts
```

Use `--seed` for stable universal identifiers across re-runs. Without it every run produces new UUIDv4 values.

## Current CLI options

These are the actual options in `create-cli.ts`, not the README list.

| Option | Meaning |
| --- | --- |
| `-i, --input <path>` | One `.ts` or `.d.ts` file. If omitted, t20 opens a file picker. |
| `-o, --output <dir>` | Output root. Default `src`. Relative to the current directory. |
| `--export-only` | Show only exported types in the object picker. Extraction of related types is unchanged. |
| `--review-names` | Prompt for singular/plural names after selection (selected objects first, then related ones). |
| `--plural-file-names <string>` | Use plural names in file names. **Requires a value**, e.g. `--plural-file-names true`; any value enables it. This is a `<string>` option, not a boolean. |
| `--skip-related-entities` | Generate only user-selected objects and synthesized junctions. Can leave imports pointing at files that were not generated; use only when the selection is relation-closed. |
| `-e, --entities [entities...]` | Limit written/printed entities to `object`, `view`, `navItem`. Invalid values exit. There is no `constant` entity anymore. |
| `--objects-dir <dir>` | Default `objects`. |
| `--views-dir <dir>` | Default `views`. |
| `--nav-menu-items-dir <dir>` | Default `navigation-menu-items`. |
| `--views-base-position <number>` | Starting `position` for views. Default `0`. |
| `--nav-menu-items-base-position <number>` | Starting `position` for nav items. Default `0`. |
| `-p, --print` | Print generated content to the terminal. |
| `-d, --dry-run` | Generate in memory, do not write files, print to terminal. |
| `-c, --clipboard` | Copy generated output to the clipboard. |
| `--seed <string>` | Deterministic UUIDs derived from the seed. |
| `-v, --version` / `-h, --help` | Version / help. |

### Version-specific gotchas (0.8.19)

- `--print`, `--dry-run`, and `--clipboard` are broken: `resultOutput()` in `write-result.ts` destructures `{ content, file }`, but `generateResult()` returns `{ [filePath]: content }`. The terminal shows `undefined` blocks. **Write files and inspect them instead.**
- `--plural-file-names` alone errors with `argument missing`.
- On Windows, generated imports use backslashes (`..\objects\product.object`) because `toImportStatement()` uses `path.relative`. Those are invalid TypeScript imports. Generate on WSL/Linux/macOS, or rewrite `\` to `/` before type-checking.
- `-e view` (without `object`) writes views that import object files that were not written. Include `object` too unless you intentionally have them already.
- If `t20` warns `[WARNING]: No Field founds!`, the object has no view-visible fields. Views exclude `id` and all relation fields, so a relations-only object still gets an empty view.

For a symptom → cause → fix table, see `references/troubleshooting.md`.

## Input rules

Declare every object as a **top-level** `interface` or `type` alias in the same input file. Related object types must also be declared there; imported types are not in the known-object set and will not become relations.

### Field type resolution

Resolution runs in this order, first match wins:

1. `FieldType.X` / `FieldMetadataType.X` enum members → that exact field type.
2. Indexed access `Other["fieldName"]` → relation with an explicit target field (single → many-to-one, array → one-to-many). Supports `Readonly`, `Array`, `ReadonlyArray`, and nullable/undefined wrappers.
3. **Name heuristics** (these override the TypeScript type):
   - `*At` camelCase (`createdAt`, `updatedAt`) → `DATE_TIME`.
   - A name containing lowercase `id` or uppercase `ID` anywhere, or `universalidentifier` case-insensitively → `UUID`.
   - The documented `*Id` suffix rule is effectively dead code in 0.8.19. `orderId`, `userId`, and `externalId` do **not** become UUID; `userid`, `USER_ID`, `valid`, and `paid` do. Declare `FieldType.UUID` explicitly when the name is not a reliable signal.
4. `enum` → `SELECT` with options and an emitted enum declaration.
5. String/number literal union (`"a" | "b"`) → `SELECT` with a synthesized enum named from the field.
6. `enum[]`, `Array<enum>`, or an array of a literal union → `MULTI_SELECT` with options.
7. `string[]` / `Array<string>` → `MULTI_SELECT` **with no options**. Use a literal union if you want actual choices.
8. Array of a known object type → `ONE_TO_MANY` relation.
9. Other arrays/tuples → `ARRAY`.
10. Known object type → `MANY_TO_ONE` relation.
11. Native types: `string` → `TEXT`, `number`/`bigint` → `NUMBER`, `boolean` → `BOOLEAN`, `Date` → `DATE_TIME`, `object`/`Record<...>`/anonymous object → `RAW_JSON`.
12. Anything else → `TEXT`.

`id` and `name` properties are **always skipped** during extraction. Do not declare them on normal objects; Twenty provides them. (Synthesized junction objects add their own `name`/`id`.)

### Relations

- A single object-typed property becomes many-to-one; an array becomes one-to-many.
- Declaring one side is enough. t20 adds the inverse field to the target using plural/singular names.
- Use indexed access when there are multiple relations between the same pair, or when the inverse field name matters:

  ```ts
  interface School {
    id: string;
    teachers: Array<Teacher["id"]>; // one-to-many, paired with Teacher.school
  }

  interface Teacher {
    id: string;
    school: School["id"]; // many-to-one
  }
  ```

- Two reciprocal arrays produce a many-to-many. t20 synthesizes a junction object named `ObjectAObjectB` (PascalCase), adds `name`, `id`, and two many-to-one fields, and rewrites both sides to point at the junction. Do not hand-write the junction type.
- Self-referential array relations are supported; the junction name includes both field names to stay unique.
- Morph/polymorphic relations are not implemented.
- Bare `FieldType.RELATION` is not wired to a target. Always use object references or indexed access.

See `references/type-mapping.md` for the full precedence table with examples.

## Generated files

- **Object** (`defineObject`): UUID exports, `nameSingular`/`namePlural`, title-cased labels, fixed `icon: "IconBox"`, and the field array. Select/multiselect enums are emitted above the object.
- **View** (`defineView`): `name: "All <Plural>"`, `key: ViewKey.INDEX`, fixed `icon: "IconList"`, sequential `position`, and one field entry per non-`id`, non-relation field. Relations are never shown in the generated index view.
- **Nav item** (`defineNavigationMenuItem`): name = singular kebab-case, `type: VIEW`, fixed `color: "Gold"`, and a reference to the generated view.
- UUID exports look like `PRODUCT_OBJECT_UNIVERSAL_IDENTIFIER`, `PRICE_FIELD_UNIVERSAL_IDENTIFIER`, `PRODUCT_VIEW_UNIVERSAL_IDENTIFIER`, `PRODUCT_NAV_MENU_ITEM_UNIVERSAL_IDENTIFIER`. Relation imports alias the inverse field as `REF_<OWNER>_<FIELD>_FIELD_UNIVERSAL_IDENTIFIER`.
- Imports between generated files are relative and omit the `.ts` extension.
- Names are derived from the node name: singular/plural via `pluralize`, labels via Title Case, file names kebab-case. Use `--review-names` to override names interactively.

## Non-interactive generation (repo helper)

Because object selection is interactive, this repo bundles `scripts/render.ts` to run the same pipeline for an explicit object list. It imports `src/internal/**`, so run it from a checkout of this repo with `bun`:

```bash
bun .agents/skills/t20/scripts/render.ts \
  --input ./types.ts --output ./out --seed demo \
  Project Client Team
```

It supports `--seed`, `--export-only`, `--plural-file-names`, `--skip-related-entities`, `--entities object,view,navItem`, and `--print`. It writes files exactly like the CLI but never prompts. Treat it as an automation/verification escape hatch, not a replacement for the published CLI.

## Verification checklist

After generation:

1. Confirm the expected files exist under the output root and that imports resolve.
2. Type-check inside the target Twenty app, not just the generated files.
3. Re-run with the same `--seed` and confirm UUIDs are unchanged.
4. Review `git diff` before committing: generation overwrites files and can reorder/rename entities.
5. When changing t20 itself, run `bun run build`, then `node dist/bin.cjs --help`. `bun run test` is the test suite; at this commit three path-separator tests fail on Windows only, so run them under WSL/Linux for a clean result.

## Do not trust these README claims

The README still says relations are unsupported, lists `constant` as an entity and `--constants-dir`, and omits `--export-only`, `--review-names`, `--plural-file-names`, `--skip-related-entities`, positional offsets, and `--seed`. It also implies `*Id` fields become UUID and that relations need manual wiring. Follow `src/cli/main.ts`, `create-cli.ts`, and the resolvers instead.
