#!/usr/bin/env node
import * as prompts from "@clack/prompts";
import clipboard from "copy-paste";
import fs from "node:fs";
import pc from "picocolors";
import path from "node:path";
import ts from "typescript";
import dedent from "ts-dedent";

import { generateTwentyObject } from "../lib/generate-twenty-object.js";
import { toKebabCase } from "../lib/utils/case-transformation.js";
import { createCLI } from "../lib/create-cli.js";
import { extractObjectSelectOptions } from "../lib/extract-object-select-options.js";
import {
  objectNamePrompts,
  outputDirPrompt,
  selectedObjectPrompt,
  sourcePathPrompt,
} from "../lib/user-prompts.js";
import { extractObjectFields } from "../lib/extract-object-fields.js";
import { generateTwentyView } from "../lib/generate-twenty-view.js";

async function main() {
  prompts.intro(pc.cyan("◈ t20: Types to Twenty"));

  const cli = createCLI();

  let sourcePath = await sourcePathPrompt(cli.input);
  const program = ts.createProgram([sourcePath], {});
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(sourcePath);

  if (!sourceFile) {
    console.error(
      pc.red(`Failed to read source file: ${sourcePath}`),
    );
    process.exit(1);
  }

  const objectOptions = extractObjectSelectOptions(
    sourceFile,
    checker,
  );

  if (objectOptions.length === 0) {
    console.error(pc.red("No exported types/interfaces found."));
    process.exit(1);
  }

  const selectedObject =
    await selectedObjectPrompt(objectOptions);

  if (!selectedObject) {
    console.error(pc.red("No object selected."));
    process.exit(1);
  }

  const objectName = await objectNamePrompts(selectedObject);

  const outputDir = await outputDirPrompt(cli.output);

  const objectFields = extractObjectFields(
    sourceFile,
    checker,
    selectedObject,
  );

  const twentyObject = generateTwentyObject({
    nameSingular: objectName.singular,
    namePlural: objectName.plural,
    fields: objectFields,
  });
  const twentyObjectView = generateTwentyView(
    "default-view",
    selectedObject,
    objectFields,
  );

  if (cli.clipboard) {
    clipboard.copy(twentyObject);
  }

  const outputObjectName = `${toKebabCase(objectName.singular)}.object.ts`;
  const outputViewName = `${toKebabCase(objectName.singular)}-default-view.ts`;

  const outputObjectFilePath = path.resolve(
    outputDir.objects,
    outputObjectName,
  );
  const outputViewFilePath = path.resolve(
    outputDir.views,
    outputViewName,
  );

  fs.writeFileSync(outputObjectFilePath, twentyObject);
  fs.writeFileSync(outputViewFilePath, twentyObjectView);

  prompts.outro(dedent`\n
    ✨ ${pc.yellow("Generated: [OBJECT]:")} ${pc.green(outputObjectFilePath)}
    ✨ ${pc.yellow("Generated: [VIEW]:")} ${pc.green(outputViewFilePath)}`);

  if (cli.print) {
    setTimeout(() => {
      console.clear();
      console.log(twentyObject);
      console.log(twentyObjectView);
    }, 500);
  }
}

main();
