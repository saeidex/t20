#!/usr/bin/env node
import * as prompts from "@clack/prompts";
import clipboard from "copy-paste";
import dedent from "ts-dedent";

import { createCLI } from "../lib/create-cli.js";
import { extractObjectSelectOptions } from "../lib/extract-object-select-options.js";
import {
  finalPrompt,
  ObjectName,
  objectNamePrompts,
  selectedObjectsPrompt,
  sourcePathPrompt,
} from "../lib/user-prompts.js";
import { renderTitle } from "../lib/utils/render-title.js";
import { markedTerm } from "../lib/marked-term.js";
import { isEntityIncludes } from "../lib/utils/is-entity-includes.js";
import { parseTypeScriptAST } from "../lib/parse-typescript-ast.js";
import { resolveContext } from "../lib/resolvers/resolve-context.js";
import { generateResult } from "../lib/generate-result.js";
import { writeResult } from "../lib/write-result.js";

const WAIT_BEFORE_PRINT_MS = 500;

async function main() {
  prompts.intro(renderTitle());

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
