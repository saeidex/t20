import { plural, singular } from "pluralize";
import { OutputDirs } from "../resolvers/resolve-output-directories.js";
import {
  toCamelCase,
  toKebabCase,
  toTitleCase,
} from "./case-transformation.js";

function toObjectNameSingular(objectNamePlural: string): string {
  return `${toCamelCase(singular(objectNamePlural))}`;
}

function toObjectNamePlural(objectNameSingular: string): string {
  return `${toCamelCase(plural(objectNameSingular))}`;
}

function toObjectFileName(objectNameSingular: string): string {
  return `${toKebabCase(
    singular(objectNameSingular)
  )}.object.ts`;
}

function toViewName(objectName: string): string {
  const name = toTitleCase(singular(objectName)).toLowerCase();
  if (name.includes("item")) return `All ${name}s`;
  return `All ${name} items`;
}

function toViewFileName(objectNameSingular: string): string {
  return `${toKebabCase(singular(objectNameSingular))}.view.ts`;
}

function toNavMenuItemName(objectName: string): string {
  return `${toKebabCase(singular(objectName))}`;
}

function toNavMenuItemFileName(objectName: string): string {
  return `${toKebabCase(
    singular(objectName)
  )}.navigation-menu-item.ts`;
}

const fileNameTransformers: {
  [key in keyof Omit<OutputDirs, "root">]: (
    name: string
  ) => string;
} = {
  objects: toObjectFileName,
  views: toViewFileName,
  navMenuItems: toNavMenuItemFileName,
} as const;

export {
  // entity name transformers
  toViewName,
  toNavMenuItemName,
  toObjectNameSingular,
  toObjectNamePlural,

  // file name transformers
  fileNameTransformers,
  toObjectFileName,
  toViewFileName,
  toNavMenuItemFileName,
};
