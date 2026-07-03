import * as prompts from "@clack/prompts";
import * as v from "valibot";
import fs from "node:fs";
import { plural, singular } from "pluralize";
import { handlePromptCancel } from "./utils/handle-prompt-cancel.js";
import { toTitleCase } from "./utils/case-transformation.js";
import type { Option } from "./extract-object-select-options.ts";
import { styleText } from "node:util";
import { logErrorAndExit } from "./utils/log-error-and-exit.js";
import dedent from "ts-dedent";
import { OutputDir } from "./get-output-directories.js";

const objectNameSchema = v.pipe(
  v.string(),
  v.minLength(1, "Object name cannot be empty"),
  v.maxLength(
    30,
    "Object name cannot be longer than 50 characters"
  )
);

function getFilteredOption<T>(
  searchText: string,
  option: prompts.Option<T>
): boolean {
  if (!searchText) {
    return true;
  }
  const label = (
    option.label ?? String(option.value ?? "")
  ).toLowerCase();
  const value = String(option.value).toLowerCase();
  const term = searchText.toLowerCase();

  return label.includes(term) || value.includes(term);
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

export async function selectedObjectPrompt(
  objectOptions: Array<Option>
): Promise<string> {
  const selectedObject = (await prompts.autocomplete({
    message: styleText("yellow", "Select an Object/Interface"),
    options: objectOptions,
    filter: getFilteredOption,
  })) as string;

  handlePromptCancel(selectedObject);

  return selectedObject;
}

type ObjectName = {
  singular: string;
  plural: string;
};

export async function objectNamePrompts(
  selectedObject: string
): Promise<ObjectName> {
  const objectNameSingular = (await prompts.text({
    message: styleText("yellow", "(Singular) Object name"),
    placeholder: "product",
    initialValue: singular(toTitleCase(selectedObject)),
    validate: objectNameSchema,
  })) as string;

  handlePromptCancel(objectNameSingular);

  const objectNamePlural = (await prompts.text({
    message: styleText("yellow", "(Plural) Object name"),
    placeholder: "products",
    initialValue: plural(objectNameSingular),
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
    singular: objectNameSingular,
    plural: objectNamePlural,
  };
}

export function finalPrompt(outputFilePaths: {
  [k in keyof OutputDir]?: Array<string> | undefined;
}) {
  prompts.note(
    Object.entries(outputFilePaths)
      .map(([key, value]) => {
        const title = `✨ ${styleText(
          "yellow",
          `[${toTitleCase(key, true)}]`
        )}`;
        const body = dedent`
      ${value?.map((file) => `:: ${file}`).join("\n")}`;
        return title + "\n" + body;
      })
      .join("\n"),
    "Output files"
  );
}
