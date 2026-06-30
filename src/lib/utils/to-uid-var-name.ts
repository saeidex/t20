import { toSnakeCase } from "./case-transformation.js";

type EntityType = "OBJECT" | "FIELD" | "VIEW";

export const toUidVarName = (
  name: string,
  entityType: EntityType,
): string => {
  return `${toSnakeCase(name).toUpperCase()}_${entityType}_UNIVERSAL_IDENTIFIER`;
};
