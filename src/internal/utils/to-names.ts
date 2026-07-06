import { OutputDir } from "../resolvers/resolve-output-directories.js";
import {
  toKebabCase,
  toTitleCase,
} from "./case-transformation.js";

export function toObjectFileName(
  objectNameSingular: string
): string {
  return `${toKebabCase(objectNameSingular)}.object.ts`;
}

export function toViewName(objectNamePlural: string): string {
  return `All ${toTitleCase(objectNamePlural).toLowerCase()}`;
}

export function toViewFileName(viewName: string): string {
  return `${toKebabCase(viewName)}-view.ts`;
}

export function toNavMenuItemName(
  objectNamePlural: string
): string {
  return `${toTitleCase(objectNamePlural)}`;
}

export function toNavMenuItemFileName(
  navItemName: string
): string {
  return `${toKebabCase(navItemName)}-navigation-menu-item.ts`;
}

export function toConstantFileName(
  objectNameSingular: string
): string {
  return `${toKebabCase(objectNameSingular)}.constants.ts`;
}

export const fileNameTransformers: {
  [key in keyof Omit<OutputDir, "root">]: (
    name: string
  ) => string;
} = {
  constants: toConstantFileName,
  objects: toObjectFileName,
  views: toViewFileName,
  navMenuItems: toNavMenuItemFileName,
} as const;
