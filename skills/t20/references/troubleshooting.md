# t20 troubleshooting

## Output symptoms

### `--dry-run` or `--print` shows `/* undefined */ undefined`

Known bug in 0.8.19. `generateResult()` returns `{ [filePath]: content }`, but `resultOutput()` destructures `{ content, file }`. `--clipboard` is affected too.

Workaround: write files with `-o` and read them, or use `scripts/render.ts --print`. Do not build CI checks on the printed output.

### Generated imports use backslashes on Windows

`toImportStatement()` and `resolveOutputDirectories()` use `path.relative`, which returns `..\objects\...` on Windows. The generated code contains `from "..\objects/product.object"`, which is not a valid module specifier (the backslash is consumed as an escape).

Workarounds:

1. Generate under WSL/Linux/macOS.
2. Rewrite generated import specifiers from `\` to `/` after generation.
3. Fix `toImportStatement()` and `resolveOutputDirectories()` to normalize to POSIX separators if changing t20.

The repo test suite has the same issue: three path tests fail on Windows at this commit.

### `--plural-file-names` errors with `argument missing`

The option is declared as `<string>`, so it requires a value:

```bash
t20 -i types.ts --plural-file-names true
```

Any non-empty value enables it. Passing the flag alone exits.

### `[WARNING]: No Field founds!`

The generated view has no fields. Views exclude `id` and all relation fields. A relations-only object, or an object whose only non-key field is a relation, produces this warning and an empty `fields: []` view. Add a scalar field or accept the empty view.

### `--skip-related-entities` leaves broken imports

The flag skips generation of related objects that were auto-pulled in. A selected object can still import the skipped object's UID. Either:

- select/generate the full relation closure, or
- keep the default (generate related entities), or
- manually patch/remove the relation after generation.

Junctions are always generated, even with this flag.

### Only some files were written after `-e`

`-e` filters writing/printing, not generation. `-e view` writes views that import object files that were not written. Include `object` unless those files already exist.

### Re-running changes every UUID

No `--seed` means UUIDv4 for every object, field, view, nav item, and view field. Use `--seed <stable-name>` for repeatable output. If you adopt a seed after generating without one, expect a one-time churn of all identifiers.

### Names collide or look wrong

`pluralize` handles irregulars, but review unusual names with `--review-names`. Names are derived from the **type node name**, not from a `name` property (which is skipped). Renaming affects file names, display names, and UID variable names.

## Input symptoms

### A field came out as `TEXT` instead of a relation

The target type is probably imported from another file. t20 only knows top-level interfaces/type aliases declared in the input file. Move the related types into the same file.

Also check that the target is a top-level type in that file and that the property is not named `id` or `name`.

### `orderId: string` is `TEXT`, but `valid: string` is `UUID`

The name heuristic only looks for literal lowercase `id` or uppercase `ID`. CamelCase `Id` does not match, and the `*Id` suffix branch is unreachable. Use `FieldType.UUID` explicitly for `orderId`, `userId`, `categoryId`, etc.

### `createdAt: string` became `DATE_TIME`

`*At` names override the declared type. That is usually desired for timestamps. Rename the field if it is genuinely text.

### `string[]` became a multi-select with no options

By design in 0.8.19. `string[]` → `MULTI_SELECT`, but no options are generated. Use a literal union or enum for a usable multi-select.

### A field is missing entirely

`id` and `name` are skipped unconditionally. Junction objects get their own `name`/`id`; normal objects rely on Twenty's built-ins.

### An explicit `FieldType.RELATION` has no target/settings

Bare `FieldType.RELATION` carries no relation metadata and is emitted without `relationTargetObjectMetadataUniversalIdentifier`. Use an object-typed property or indexed access (`Other["field"]`) instead.

### Interface/class/type from a `.d.ts` dependency is not listed

Only top-level declarations in the provided source file are selectable. t20 does not enumerate imported modules. Put object types in the input file.

## CLI symptoms

### The command hangs waiting for input

Object selection is always a multiselect prompt, even when `-i` is provided. There is no non-interactive selection flag in 0.8.19. Run it in a real terminal, or use `scripts/render.ts` with an explicit object list in this repo.

### `Invalid entity name(s): constants`

`constant` was removed. Valid values are `object`, `view`, `navItem`.

### `Please provide a valid TypeScript(.d.ts/.ts) file`

`-i` must end in `.ts` or `.d.ts` and exist. `.tsx`, `.mts`, and globs are rejected.

### Help text says "Generate twenty fields from types(Object/Interface)"

That is the command name in `create-cli.ts`, not an error. Use `-h` for options.

## When behavior is unclear

Trace `src/cli/main.ts` and the resolver order in `src/internal/resolvers/resolve-field.ts`. The README is not authoritative: it predates relations, junctions, seeds, and the current entity set.
