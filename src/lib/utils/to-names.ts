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

export function toNavMenuItemFileName(name: string): string {
  return `${toKebabCase(name)}-navigation-menu-item.ts`;
}
