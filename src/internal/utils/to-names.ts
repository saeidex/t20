import { plural, singular } from "pluralize";
import type { OutputDirs } from "../resolvers/resolve-output-directories.js";
import {
  toCamelCase,
  toKebabCase,
  toTitleCase,
} from "./case-transformation.js";

function toObjectNameSingular(objectName: string): string {
  return `${toCamelCase(singular(objectName))}`;
}

function toObjectNamePlural(objectName: string): string {
  return `${toCamelCase(plural(objectName))}`;
}

function toObjectFileName(objectNameSingular: string): string {
  return `${toKebabCase(objectNameSingular)}.object.ts`;
}

function toViewName(objectNameSingular: string): string {
  const name = toTitleCase(objectNameSingular).toLowerCase();
  if (name.includes("items")) return `All ${name}`;
  if (name.includes("item")) return `All ${name}s`;
  return `All ${name} items`;
}

function toViewFileName(objectNameSingular: string): string {
  return `${toKebabCase(objectNameSingular)}.view.ts`;
}

function toNavMenuItemName(objectNameSingular: string): string {
  return `${toKebabCase(objectNameSingular)}`;
}

function toNavMenuItemFileName(
  objectNameSingular: string
): string {
  return `${toKebabCase(
    objectNameSingular
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
