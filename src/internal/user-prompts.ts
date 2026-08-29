import * as prompts from "@clack/prompts";
import * as v from "valibot";
import fs from "node:fs";
import { plural, singular } from "pluralize";
import { handlePromptCancel } from "./utils/handle-prompt-cancel.js";
import { toTitleCase } from "./utils/case-transformation.js";
import { styleText } from "node:util";
import { logErrorAndExit } from "./utils/log-error-and-exit.js";
import dedent from "ts-dedent";
import { renderTitle } from "./utils/render-title.js";
import type { ObjectsMap } from "./types.js";
import { getCliOptions } from "./create-cli.js";
import { isEntityIncludes } from "./utils/is-entity-includes.js";

const objectNameSchema = v.pipe(
  v.string(),
  v.minLength(1, "Object name cannot be empty"),
  v.maxLength(
    30,
    "Object name cannot be longer than 50 characters"
  )
);

export function introPrompt() {
  prompts.intro(renderTitle());
}

export async function sourcePathPrompt(
  filePath: string
): Promise<string> {
  if (filePath) {
    if (
      !filePath.endsWith(".ts") ||
      !filePath.endsWith(".d.ts")
    ) {
      logErrorAndExit(
        "Please provide a valid TypeScript(.d.ts/.ts) file"
      );
    }
    if (!fs.existsSync(filePath)) {
      logErrorAndExit(`File not found: ${filePath}`);
    }
    return filePath;
  }

  filePath = (await prompts.path({
    message: styleText("yellow", "Select input .ts/.d.ts file"),
    directory: false,
    root: process.cwd(),
    validate: v.pipe(
      v.string(),
      v.minLength(1, "File path cannot be empty"),
      v.maxLength(
        255,
        "File path cannot be longer than 255 characters"
      ),
      v.check(
        (value) =>
          value.endsWith(".ts") || value.endsWith(".d.ts"),
        "Please provide a valid TypeScript(.d.ts/.ts) file"
      ),
      v.check(
        (value) => fs.existsSync(value),
        "File does not exist"
      )
    ),
  })) as string;

  handlePromptCancel(filePath);

  return filePath;
}

export async function selectedObjectsPrompt(
  objectNodeNames: Array<string>
): Promise<Array<string>> {
  const selectedObjects = (await prompts.multiselect({
    message: styleText("yellow", "Select an Object/Interface"),
    options: objectNodeNames.map((name) => ({
      value: name,
      label: name,
    })),
  })) as Array<string>;

  handlePromptCancel(selectedObjects);

  if (!selectedObjects.length) {
    logErrorAndExit(
      `${selectedObjects} not found in your input file`
    );
  }

  return selectedObjects;
}

export type ObjectName = {
  objectName: string;
  singular: string;
  plural: string;
};

export async function objectNamePrompts(
  selectedObject: string,
  singularName?: string,
  pluralName?: string
): Promise<ObjectName> {
  let objectNameSingular;
  let objectNamePlural;

  objectNameSingular = (await prompts.text({
    message:
      styleText("red", selectedObject) +
      styleText("yellow", " -> Singular name"),
    placeholder: "product",
    initialValue:
      singularName ?? singular(toTitleCase(selectedObject)),
    validate: objectNameSchema,
  })) as string;

  handlePromptCancel(objectNameSingular);

  objectNamePlural = (await prompts.text({
    message:
      styleText("red", selectedObject) +
      styleText("yellow", " -> Plural name"),
    placeholder: "products",
    initialValue: pluralName ?? plural(objectNameSingular),
    validate: v.pipe(
      objectNameSchema,
      v.check(
        (value) => value !== objectNameSingular,
        "Plural name must be different from singular name"
      )
    ),
  })) as string;

  handlePromptCancel(objectNamePlural);

  return {
    objectName: selectedObject,
    singular: objectNameSingular,
    plural: objectNamePlural,
  };
}

export function finalPrompt(objectsMap: ObjectsMap) {
  const opts = getCliOptions();

  let objects = toTitle("objects");
  let views = toTitle("views");
  let navMenuItems = toTitle("nav menu items");

  for (const [_key, entry] of objectsMap.entries()) {
    const mark = entry.isGenerated
      ? styleText("green", "✓")
      : styleText("red", "✗");
    const related = entry.isUserSelected
      ? ""
      : styleText("blue", "(related)");

    if (isEntityIncludes(opts.entities, "object")) {
      objects += dedent`
      ${mark} ${entry.results.object.filePath}${related}\n
    `;
    } else {
      objects = "";
    }

    if (isEntityIncludes(opts.entities, "view")) {
      const sidenote = entry.results.view.hasLabelField
        ? ""
        : styleText("red", `(label field missing)`);
      views += dedent`
      ${mark} ${entry.results.view.filePath}${sidenote}\n
    `;
    } else {
      views = "";
    }

    if (isEntityIncludes(opts.entities, "navItem")) {
      navMenuItems += dedent`
      ${mark} ${entry.results.navMenuItem.filePath}\n
    `;
    } else {
      navMenuItems = "";
    }
  }

  prompts.note(objects + views + navMenuItems, "Output files");
}

const toTitle = (title: string) =>
  `${styleText("yellow", `[${toTitleCase(title, true)}]`)}\n`;
