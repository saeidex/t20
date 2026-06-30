import * as prompts from "@clack/prompts";
import * as v from "valibot";
import pc from "picocolors";
import fs from "node:fs";
import path from "node:path";
import { plural, singular } from "pluralize";
import { handlePromptCancel } from "./utils/handle-prompt-cancel.js";
import { toTitleCase } from "./utils/case-transformation.js";
import type { Option } from "./extract-object-select-options.ts";

const objectNameSchema = v.pipe(
  v.string(),
  v.minLength(1, "Object name cannot be empty"),
  v.maxLength(
    30,
    "Object name cannot be longer than 50 characters"
  )
);

export async function sourcePathPrompt(
  filePath: string
): Promise<string> {
  if (filePath) {
    if (
      !filePath.endsWith(".ts") ||
      !filePath.endsWith(".d.ts")
    ) {
      console.error(
        pc.red(
          "Please provide a valid TypeScript(.d.ts/.ts) file"
        )
      );
      process.exit(1);
    }
    if (!fs.existsSync(filePath)) {
      console.error(pc.red(`File not found: ${filePath}`));
      process.exit(1);
    }
    return filePath;
  }

  filePath = (await prompts.path({
    message: pc.yellow("Select input .ts/.d.ts file"),
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
    message: pc.yellow("Select an Object/Interface"),
    options: objectOptions,
    placeholder: "Products",
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
    message: pc.yellow("(Singular) Object name"),
    placeholder: "product",
    initialValue: singular(toTitleCase(selectedObject)),
    validate: objectNameSchema,
  })) as string;

  handlePromptCancel(objectNameSingular);

  const objectNamePlural = (await prompts.text({
    message: pc.yellow("(Plural) Object name"),
    placeholder: "products",
    initialValue: plural(toTitleCase(selectedObject)),
    validate: objectNameSchema,
  })) as string;

  handlePromptCancel(objectNamePlural);

  return {
    singular: objectNameSingular,
    plural: objectNamePlural,
  };
}

type OutputDir = {
  root: string;
  objects: string;
  views: string;
};

export async function outputDirPrompt(
  outputRootDir?: string
): Promise<OutputDir> {
  let rootDir = outputRootDir;

  if (!rootDir) {
    rootDir = (await prompts.text({
      message: pc.yellow("Output Root directory"),
      placeholder: "src",
      initialValue: "src",
      validate: v.pipe(
        v.string(),
        v.minLength(1, "Output directory cannot be empty"),
        v.maxLength(
          255,
          "Output directory cannot be longer than 255 characters"
        )
      ),
    })) as string;

    handlePromptCancel(rootDir);

    console.log(
      pc.blue(`objects output dir: ${rootDir}/objects`)
    );
    console.log(pc.blue(`views output dir: ${rootDir}/views`));
  }

  const outputObjectsDir = path.join(`${rootDir}/objects`);
  const outputViewsDir = path.join(`${rootDir}/views`);

  fs.mkdirSync(rootDir, { recursive: true });
  fs.mkdirSync(outputObjectsDir, { recursive: true });
  fs.mkdirSync(outputViewsDir, { recursive: true });

  return {
    root: rootDir,
    objects: outputObjectsDir,
    views: outputViewsDir,
  };
}
