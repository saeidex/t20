import type { IRField } from "../types.js";
import { toUidVarName } from "./to-uid-var-name.js";
import { toUidVarStatement } from "./to-uid-var-statement.js";

export const fieldUidVarNames = (
  fields: Array<IRField>
): Array<string> => {
  return fields.map((field) => {
    return toUidVarName(field.name, "FIELD");
  });
};

export const fieldUidVarStatements = (
  fields: Array<IRField>,
  seed?: string
): Array<string> => {
  return fields.map((f) => {
    return toUidVarStatement(
      seed,
      toUidVarName(f.name, "FIELD")
    );
  });
};
