#!/usr/bin/env node
import * as prompts from "@clack/prompts";
import clipboard from "copy-paste";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import dedent from "ts-dedent";

import { generateTwentyObject } from "../lib/generate-twenty-object.js";
import { createCLI } from "../lib/create-cli.js";
import { extractObjectSelectOptions } from "../lib/extract-object-select-options.js";
import {
  finalPrompt,
  objectNamePrompts,
  selectedObjectPrompt,
  sourcePathPrompt,
} from "../lib/user-prompts.js";
import { extractObjectFields } from "../lib/extract-object-fields.js";
import { generateTwentyView } from "../lib/generate-twenty-view.js";
import {
  toNavMenuItemFileName,
  toNavMenuItemName,
  toObjectFileName,
  toViewFileName,
  toViewName,
} from "../lib/utils/to-names.js";
import { renderTitle } from "../lib/utils/render-title.js";
import { logErrorAndExit } from "../lib/utils/log-error-and-exit.js";
import { markedTerm } from "../lib/marked-term.js";
import { generateTwentyNavMenuItem } from "../lib/generate-twenty-nav-menu-item.js";
import { getOutputDirectories } from "../lib/get-output-directories.js";
import { createEmptyDirectories } from "../lib/utils/create-empty-directories.js";

async function main() {
  prompts.intro(renderTitle());

  const cli = createCLI();

  let sourcePath = await sourcePathPrompt(cli.input);
  const program = ts.createProgram([sourcePath], {});
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(sourcePath);

  if (!sourceFile) {
    logErrorAndExit(`Failed to read source file: ${sourcePath}`);
    return;
  }

  const objectOptions = extractObjectSelectOptions(
    sourceFile,
    checker
  );

  if (objectOptions.length === 0) {
    logErrorAndExit("No exported types/interfaces found.");
  }

  const selectedObject = await selectedObjectPrompt(
    objectOptions
  );

  if (!selectedObject) {
    logErrorAndExit("No object selected.");
  }

  const objectNames = await objectNamePrompts(selectedObject);

  const outputDir = getOutputDirectories(cli.output);

  const objectFields = extractObjectFields(
    sourceFile,
    checker,
    selectedObject
  );

  const { objectUidVarName, output: outputTwentyObject } =
    generateTwentyObject({
      nameSingular: objectNames.singular,
      namePlural: objectNames.plural,
      fields: objectFields,
    });
  const outputObjectFileName = toObjectFileName(
    objectNames.singular
  );
  const outputObjectFilePath = path.join(
    outputDir.objects,
    outputObjectFileName
  );

  const viewName = toViewName(objectNames.plural);
  const outputViewFileName = toViewFileName(objectNames.plural);
  const outputViewFilePath = path.join(
    outputDir.views,
    outputViewFileName
  );
  const { output: outputTwentyObjectView } = generateTwentyView(
    viewName,
    outputViewFilePath,
    objectUidVarName,
    outputObjectFilePath,
    objectFields
  );

  const navMenuItemName = toNavMenuItemName(objectNames.plural);
  const navMenuItemFileName = toNavMenuItemFileName(
    objectNames.plural
  );
  const outputNavMenuItemFilePath = path.join(
    outputDir.navMenuItems,
    navMenuItemFileName
  );

  const { output: outputTwentyNavMenuItem } =
    generateTwentyNavMenuItem(
      navMenuItemName,
      outputNavMenuItemFilePath,
      outputObjectFilePath,
      objectUidVarName
    );

  if (!cli.printOnly) {
    createEmptyDirectories(outputDir);

    fs.writeFileSync(outputObjectFilePath, outputTwentyObject);
    fs.writeFileSync(outputViewFilePath, outputTwentyObjectView);
    fs.writeFileSync(
      outputNavMenuItemFilePath,
      outputTwentyNavMenuItem
    );

    finalPrompt({
      objects: [outputObjectFilePath],
      views: [outputViewFilePath],
      navMenuItems: [outputNavMenuItemFilePath],
    });
  }

  const markedOutput = markedTerm.parse(dedent`
    \`\`\`ts
    /* ${outputObjectFilePath} */
    ${outputTwentyObject}\n
    /* ${outputViewFilePath} */
    ${outputTwentyObjectView}\n
    /* ${outputNavMenuItemFilePath} */
    ${outputTwentyNavMenuItem}
    \`\`\``);

  if (cli.clipboard) {
    clipboard.copy(markedOutput);
  }

  if (cli.print || cli.printOnly) {
    setTimeout(() => {
      console.clear();
      console.log(markedOutput);
    }, 500);
  }
}

main();
