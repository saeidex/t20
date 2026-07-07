#!/usr/bin/env node
import clipboard from "copy-paste";
import dedent from "ts-dedent";

import { createCLI } from "../internal/create-cli.js";
import { extractObjectSelectOptions } from "../internal/extractors/extract-object-select-options.js";
import {
  finalPrompt,
  introPrompt,
  ObjectName,
  objectNamePrompts,
  selectedObjectsPrompt,
  sourcePathPrompt,
} from "../internal/user-prompts.js";
import { markedTerm } from "../internal/marked-term.js";
import { isEntityIncludes } from "../internal/utils/is-entity-includes.js";
import { parseTypeScriptAST } from "../internal/parse-typescript-ast.js";
import { resolveContext } from "../internal/resolvers/resolve-context.js";
import { generateResult } from "../internal/generators/generate-result.js";
import { writeResult } from "../internal/write-result.js";

const WAIT_BEFORE_PRINT_MS = 500;

async function main() {
  introPrompt();
  const opts = createCLI();

  let sourcePath = await sourcePathPrompt(opts.input);
  const { sourceFile, checker } = parseTypeScriptAST(sourcePath);
  const objectOptions = extractObjectSelectOptions(
    sourceFile,
    checker
  );
  const rootObjects = await selectedObjectsPrompt(objectOptions);
  const objectNames: Array<ObjectName> = [];
  for (const obj of rootObjects) {
    const name = await objectNamePrompts(obj);
    objectNames.push(name);
  }
  const ctx = resolveContext(opts, objectNames);
  const result = generateResult(ctx, sourceFile, checker);

  if (!opts.dryRun) {
    writeResult(ctx, opts, result);

    finalPrompt({
      objects: isEntityIncludes(opts.entities, "object")
        ? ctx.paths.objects
        : undefined,
      views: isEntityIncludes(opts.entities, "view")
        ? ctx.paths.views
        : undefined,
      navMenuItems: isEntityIncludes(opts.entities, "navItem")
        ? ctx.paths.navMenuItems
        : undefined,
      constants: isEntityIncludes(opts.entities, "constant")
        ? ctx.paths.constants
        : undefined,
    });
  }

  const output = Array.from({ length: objectNames.length })
    .map((_, idx) => {
      return dedent`
        /* ${ctx.paths.objects[idx]} */
        ${result.objects[idx]}

        /* ${ctx.paths.views[idx]} */
        ${result.views[idx]}

        /* ${ctx.paths.navMenuItems[idx]} */
        ${result.navMenuItems[idx]}

        /* ${ctx.paths.constants[idx]} */
        ${result.constants[idx]}
      `.trimStart();
    })
    .join("\n");

  const markedOutput = markedTerm.parse(
    dedent`
      \`\`\`ts
      ${output}
      \`\`\`
      `
  );

  if (opts.clipboard) {
    clipboard.copy(output);
  }

  if (opts.print || opts.dryRun) {
    setTimeout(() => {
      console.clear();
      console.log(markedOutput);
    }, WAIT_BEFORE_PRINT_MS);
  }
}

main();
