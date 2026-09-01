#!/usr/bin/env node
import clipboard from "copy-paste";

import { createCLI } from "../internal/create-cli.js";
import { extractObjectNodeNames } from "../internal/extractors/extract-object-node-names.js";
import { extractObjectsMap } from "../internal/extractors/extract-objects-map.js";
import { generateResult } from "../internal/generators/generate-result.js";
import { parseTypeScriptAST } from "../internal/parse-typescript-ast.js";
import { detectManyToManyPairs } from "../internal/resolvers/detect-many-to-many.js";
import { resolveInverseRelations } from "../internal/resolvers/resolve-inverse-relations.js";
import { synthesizeManyToManyJunctions } from "../internal/resolvers/synthesize-many-to-many.js";
import { reviewObjectNames } from "../internal/review-object-names.js";
import {
  finalPrompt,
  introPrompt,
  selectedObjectsPrompt,
  sourcePathPrompt,
} from "../internal/user-prompts.js";
import {
  markedResultOutput,
  resultOutput,
  writeResultOnFiles,
} from "../internal/write-result.js";

const WAIT_BEFORE_PRINT_IN_MS = 500;

async function main() {
  introPrompt();

  const opts = createCLI();
  const sourcePath = await sourcePathPrompt(opts.input);
  const { checker, sourceFile } = parseTypeScriptAST(sourcePath);

  const allNodeNames = extractObjectNodeNames(
    sourceFile,
    checker
  );

  const nodeNames = opts.exportOnly
    ? extractObjectNodeNames(sourceFile, checker, true)
    : allNodeNames;

  const selectedObjects = await selectedObjectsPrompt(nodeNames);

  const objectsMap = extractObjectsMap(
    sourceFile,
    checker,
    selectedObjects,
    new Set(allNodeNames)
  );

  const m2mPairs = detectManyToManyPairs(objectsMap);
  synthesizeManyToManyJunctions(
    objectsMap,
    m2mPairs,
    new Set(allNodeNames)
  );

  resolveInverseRelations(objectsMap);

  if (!opts.skipReview) {
    await reviewObjectNames(objectsMap);
  }

  const result = generateResult(objectsMap);

  if (!opts.dryRun) {
    writeResultOnFiles(result);
    finalPrompt(objectsMap);
  }

  const output = resultOutput(result);

  if (opts.clipboard) {
    clipboard.copy(output);
  }

  if (opts.print || opts.dryRun) {
    const markedOutput = markedResultOutput(output);
    setTimeout(() => {
      console.clear();
      console.log(markedOutput);
    }, WAIT_BEFORE_PRINT_IN_MS);
  }
}

main();
