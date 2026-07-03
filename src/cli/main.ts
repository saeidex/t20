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
  toConstantFileName,
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
import { generateTwentyConstants } from "../lib/generate-twenty-constants.js";
import { isEntityIncludes } from "../lib/utils/is-entity-includes.js";

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

  const objectName = objectNames.singular;
  const constantName = objectName;
  const viewName = toViewName(objectNames.plural);
  const navMenuItemName = toNavMenuItemName(objectNames.plural);

  const outputObjectFileName = toObjectFileName(objectName);
  const constantFileName = toConstantFileName(constantName);
  const outputViewFileName = toViewFileName(objectNames.plural);
  const navMenuItemFileName = toNavMenuItemFileName(
    objectNames.plural
  );

  const outputObjectFilePath = path.join(
    outputDir.objects,
    outputObjectFileName
  );
  const outputConstantFilePath = path.join(
    outputDir.constants,
    constantFileName
  );
  const outputNavMenuItemFilePath = path.join(
    outputDir.navMenuItems,
    navMenuItemFileName
  );
  const outputViewFilePath = path.join(
    outputDir.views,
    outputViewFileName
  );

  const { objectUidVarName, output: outputTwentyObject } =
    generateTwentyObject({
      nameSingular: objectNames.singular,
      namePlural: objectNames.plural,
      objectFilePath: outputObjectFilePath,
      constantFilePath: outputConstantFilePath,
      fields: objectFields,
    });

  const { viewUidVarName, output: outputTwentyObjectView } =
    generateTwentyView(
      viewName,
      outputViewFilePath,
      objectUidVarName,
      outputObjectFilePath,
      outputConstantFilePath,
      objectFields
    );

  const {
    navMenuItemUidVarName,
    output: outputTwentyNavMenuItem,
  } = generateTwentyNavMenuItem(
    navMenuItemName,
    outputNavMenuItemFilePath,
    outputObjectFilePath,
    objectUidVarName,
    outputConstantFilePath
  );

  const outputTwentyConstants = generateTwentyConstants(
    objectUidVarName,
    viewUidVarName,
    navMenuItemUidVarName
  );

  if (!cli.printOnly) {
    if (isEntityIncludes(cli.entities, "object")) {
      fs.mkdirSync(outputDir.objects, { recursive: true });
      fs.writeFileSync(outputObjectFilePath, outputTwentyObject);
    }
    if (isEntityIncludes(cli.entities, "view")) {
      fs.mkdirSync(outputDir.views, { recursive: true });
      fs.writeFileSync(
        outputViewFilePath,
        outputTwentyObjectView
      );
    }
    if (isEntityIncludes(cli.entities, "navItem")) {
      fs.mkdirSync(outputDir.navMenuItems, { recursive: true });
      fs.writeFileSync(
        outputNavMenuItemFilePath,
        outputTwentyNavMenuItem
      );
    }
    if (isEntityIncludes(cli.entities, "constant")) {
      if (fs.existsSync(outputConstantFilePath)) {
        fs.appendFileSync(
          outputConstantFilePath,
          outputTwentyConstants
        );
      } else {
        fs.mkdirSync(outputDir.constants, { recursive: true });
        fs.writeFileSync(
          outputConstantFilePath,
          outputTwentyConstants
        );
      }
    }

    finalPrompt({
      objects: isEntityIncludes(cli.entities, "object")
        ? [outputObjectFilePath]
        : undefined,
      views: isEntityIncludes(cli.entities, "view")
        ? [outputViewFilePath]
        : undefined,
      navMenuItems: isEntityIncludes(cli.entities, "navItem")
        ? [outputNavMenuItemFilePath]
        : undefined,
      constants: isEntityIncludes(cli.entities, "constant")
        ? [outputConstantFilePath]
        : undefined,
    });
  }

  const markedOutput = markedTerm.parse(dedent`
    \`\`\`ts
    /* ${outputObjectFilePath} */
    ${outputTwentyObject}\n
    /* ${outputViewFilePath} */
    ${outputTwentyObjectView}\n
    /* ${outputNavMenuItemFilePath} */
    ${outputTwentyNavMenuItem}\n
    /* ${outputConstantFilePath} */
    ${outputTwentyConstants}
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
