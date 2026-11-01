# t20 — Agent Skill

[![skills.sh](https://skills.sh/b/saeidex/t20)](https://skills.sh/saeidex/t20)

> Teach your AI coding agent how to scaffold [Twenty CRM](https://github.com/twentyhq/twenty) objects, fields, views, and navigation-menu items from TypeScript type definitions using the [`@saeidex/t20`](https://www.npmjs.com/package/@saeidex/t20) CLI.

---

## What This Skill Does

This skill gives your agent deep, accurate knowledge of the `t20` CLI (v0.8.19) — including behaviors the published README gets wrong. Load it and your agent can:

- **Write correct `types.ts` input files** that produce the right field types, relations, and many-to-many junctions
- **Construct the exact `t20` command** with the right flags (`-i`, `-o`, `--seed`, etc.)
- **Diagnose generation bugs** — `--dry-run` output showing `undefined`, Windows backslash imports, dead `*Id` UUID heuristic
- **Predict all generated files**, including synthesized junction objects your agent never declared
- **Run generation headlessly** via `scripts/render.ts` without the interactive CLI prompt

## Installation

Add this skill to your project with the `skills` CLI:

```bash
# Install just the t20 skill
npx skills add saeidex/t20 --skill t20
```

Or install all skills in this repo:

```bash
npx skills add saeidex/t20
```

### Supported Agents

| Agent | Supported |
|---|---|
| Claude Code | ✅ |
| Cursor | ✅ |
| GitHub Copilot | ✅ |
| Codex | ✅ |
| OpenCode | ✅ |
| Antigravity (AGY) | ✅ |

---

## Skill Contents

```
.agents/skills/t20/
├── SKILL.md                          # Main instructions (loaded by your agent)
├── scripts/
│   └── render.ts                     # Headless generator — bypasses interactive CLI
└── references/
    ├── type-mapping.md               # Full field-type resolution table with examples
    └── troubleshooting.md            # Symptom → cause → fix for common t20 issues
```

---

## Quick Example

Given this prompt to your agent:

> *"Scaffold Project, Client, and Team objects for a Twenty CRM app from a TypeScript file"*

With this skill loaded, your agent will:

1. Write a correct `types.ts` with reciprocal arrays on `Project` and `Team` to trigger junction synthesis
2. Know that `t20` will auto-generate a `ProjectTeam` junction object you didn't declare
3. Provide the right command: `npx @saeidex/t20 -i ./types.ts -o ./src --seed <name>`
4. Warn you that selection is interactive (no `--objects` flag) and offer `scripts/render.ts` as a headless alternative
5. Flag Windows backslash import issues before they break `tsc`

---

## Key Gotchas Documented

| Gotcha | What the skill teaches |
|---|---|
| `orderId` → `TEXT` not `UUID` | The `*Id` suffix branch is dead code; use `FieldType.UUID` explicitly |
| `--dry-run` prints `undefined` | Shape mismatch in `resultOutput()`; write files and read from disk |
| Windows backslash imports | `path.relative` issue; generate on WSL or normalize `\` → `/` |
| `name` / `id` fields silently dropped | Twenty provides them; declaring them does nothing |
| README is stale | Relations, junctions, `--seed`, `--review-names` are all post-README additions |

---

## About t20

[`@saeidex/t20`](https://github.com/saeidex/t20) is a CLI tool that reads a TypeScript file, lets you pick which interfaces are Twenty CRM objects, and generates `defineObject` / `defineView` / `defineNavigationMenuItem` files ready to drop into any Twenty SDK app.

```bash
npx @saeidex/t20 -i ./types/crm.ts -o ./src --seed my-app
```
