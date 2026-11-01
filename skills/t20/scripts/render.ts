#!/usr/bin/env bun
/**
 * Headless t20 generator for this repository.
 *
 * The real CLI always asks which objects to generate, which makes automated
 * verification awkward. This script runs the same pipeline as src/cli/main.ts
 * for an explicit object list and never prompts.
 *
 * Usage:
 *   bun .agents/skills/t20/scripts/render.ts \
 *     --input ./types.ts --output ./out --seed demo Project Client Team
 *
 * Run from a checkout of t20 (it imports src/internal/**).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

type Args = {
  input: string;
  output: string;
  seed?: string;
  exportOnly: boolean;
  pluralFileNames: boolean;
  skipRelatedEntities: boolean;
  entities: Array<string>;
  print: boolean;
  names: Array<string>;
};

const REPO_ROOT = fileURLToPath(
  new URL("../../../../", import.meta.url)
);

function usage(): never {
  console.log(`Usage: bun render.ts --input <file> --output <dir> [options] <Object>...

Options:
  -i, --input <path>            input .ts/.d.ts file (required)
  -o, --output <dir>            output root (required)
      --seed <string>           deterministic UIDs
      --export-only             only exported types are selectable
      --plural-file-names       plural file names (boolean form)
      --skip-related-entities   only selected objects and junctions
      --entities <list>         comma-separated: object,view,navItem
      --print                   print generated file contents
  -h, --help                    this help

Object names are positional and must match top-level type/interface names.
This helper is not part of the published CLI.`);
  process.exit(0);
}

function parseArgs(argv: Array<string>): Args {
  const args: Args = {
    input: "",
    output: "",
    exportOnly: false,
    pluralFileNames: false,
    skipRelatedEntities: false,
    entities: [],
    print: false,
    names: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "-h" || arg === "--help") usage();

    if (arg === "-i" || arg === "--input") {
      args.input = argv[++i] ?? "";
      continue;
    }

    if (arg === "-o" || arg === "--output") {
      args.output = argv[++i] ?? "";
      continue;
    }

    if (arg === "--seed") {
      args.seed = argv[++i];
      continue;
    }

    if (arg === "--export-only") {
      args.exportOnly = true;
      continue;
    }

    if (arg === "--plural-file-names") {
      args.pluralFileNames = true;
      continue;
    }

    if (arg === "--skip-related-entities") {
      args.skipRelatedEntities = true;
      continue;
    }

    if (arg === "--entities") {
      const value = argv[++i] ?? "";
      args.entities = value
        .split(",")
        .map((entity) => entity.trim())
        .filter(Boolean);
      continue;
    }

    if (arg === "--print") {
      args.print = true;
      continue;
    }

    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }

    args.names.push(arg);
  }

  if (!args.input) throw new Error("Missing --input");
  if (!args.output) throw new Error("Missing --output");
  if (args.names.length === 0) {
    throw new Error(
      "Pass at least one object name (top-level type/interface)."
    );
  }

  return args;
}

const args = parseArgs(process.argv.slice(2));

// create-cli.ts reads process.argv, and temp-store.ts calls it at import time.
// Build the equivalent CLI argv before importing any internal module.
const cliArgv = [
  "node",
  "t20",
  "-i",
  args.input,
  "-o",
  args.output.replace(/\\/g, "/"),
];

if (args.seed) cliArgv.push("--seed", args.seed);
if (args.exportOnly) cliArgv.push("--export-only");
if (args.pluralFileNames) {
  // The real option is <string>, not a boolean.
  cliArgv.push("--plural-file-names", "true");
}
if (args.skipRelatedEntities) {
  cliArgv.push("--skip-related-entities");
}
if (args.entities.length > 0) {
  cliArgv.push("-e", ...args.entities);
}

process.argv = cliArgv;

const importFromRepo = (relativePath: string) =>
  import(
    pathToFileURL(path.join(REPO_ROOT, relativePath)).href
  );

const { createCLI } = await importFromRepo(
  "src/internal/create-cli.ts"
);
createCLI();

const { parseTypeScriptAST } = await importFromRepo(
  "src/internal/parse-typescript-ast.ts"
);
const { extractObjectNodeNames } = await importFromRepo(
  "src/internal/extractors/extract-object-node-names.ts"
);
const { extractObjectsMap } = await importFromRepo(
  "src/internal/extractors/extract-objects-map.ts"
);
const { detectManyToManyPairs } = await importFromRepo(
  "src/internal/resolvers/detect-many-to-many.ts"
);
const { synthesizeManyToManyJunctions } = await importFromRepo(
  "src/internal/resolvers/synthesize-many-to-many.ts"
);
const { resolveInverseRelations } = await importFromRepo(
  "src/internal/resolvers/resolve-inverse-relations.ts"
);
const { generateResult } = await importFromRepo(
  "src/internal/generators/generate-result.ts"
);
const { writeResultOnFiles } = await importFromRepo(
  "src/internal/write-result.ts"
);

const { checker, sourceFile } = parseTypeScriptAST(args.input);
const allNodeNames = extractObjectNodeNames(sourceFile, checker);
const selectableNames = args.exportOnly
  ? extractObjectNodeNames(sourceFile, checker, true)
  : allNodeNames;

const unknown = args.names.filter(
  (name) => !selectableNames.includes(name)
);
if (unknown.length > 0) {
  throw new Error(
    `Unknown object name(s): ${unknown.join(
      ", "
    )}. Available: ${selectableNames.join(", ")}`
  );
}

const objectsMap = extractObjectsMap(
  sourceFile,
  checker,
  args.names,
  new Set(allNodeNames)
);

const pairs = detectManyToManyPairs(objectsMap);
synthesizeManyToManyJunctions(
  objectsMap,
  pairs,
  new Set(allNodeNames)
);
resolveInverseRelations(objectsMap);

const result = generateResult(objectsMap);
writeResultOnFiles(result);

const writesObjects =
  args.entities.length === 0 || args.entities.includes("object");
const writesViews =
  args.entities.length === 0 || args.entities.includes("view");
const writesNav =
  args.entities.length === 0 || args.entities.includes("navItem");

const sections: Array<[boolean, Array<Record<string, string>>]> = [
  [writesObjects, result.objects],
  [writesViews, result.views],
  [writesNav, result.navMenuItems],
];

console.log(`Generated ${objectsMap.size} object(s).`);
for (const [enabled, items] of sections) {
  if (!enabled) continue;
  for (const item of items) {
    for (const [file, content] of Object.entries(item)) {
      console.log(`  ${file}`);
      if (args.print) {
        console.log(fs.readFileSync(file, "utf-8"));
      }
    }
  }
}
