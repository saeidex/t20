import { toSnakeCase } from "./case-transformation.js";

type EntityType =
  | "OBJECT"
  | "FIELD"
  | "VIEW"
  | "NAV_MENU_ITEM"
  | "RELATION_FIELD"
  | "CUSTOM";

export function toUidVarName(
  name: string,
  entityType: EntityType
): string {
  name = `${toSnakeCase(name).toUpperCase()}`;

  if (entityType === "CUSTOM") return name;

  if (entityType === "RELATION_FIELD")
    return `REF_${name}_FIELD_UNIVERSAL_IDENTIFIER`;

  return `${name}_${entityType}_UNIVERSAL_IDENTIFIER`;
}
