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

export function toViewFileName(
  objectNamePlural: string
): string {
  return `all-${toKebabCase(objectNamePlural)}-view.ts`;
}

export function toNavMenuItemName(
  objectNamePlural: string
): string {
  return `${toTitleCase(objectNamePlural)}`;
}

export function toNavMenuItemFileName(
  objectNamePlural: string
): string {
  return `all-${toKebabCase(
    objectNamePlural
  )}-navigation-menu-item.ts`;
}

export function toConstantFileName(
  objectNameSingular: string
): string {
  return `${toKebabCase(objectNameSingular)}.constants.ts`;
}
