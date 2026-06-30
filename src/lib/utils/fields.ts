import type { IRField } from "../types.js";
import { toUidVarName } from "./to-uid-var-name.js";
import { toUidVarStatement } from "./to-uid-var-statement.js";

export const fieldUidVarNames = (
  fields: Array<IRField>
): Array<string> => {
  const uidVarNames = fields.map((field) => {
    return toUidVarName(field.name, "FIELD");
  });
  return uidVarNames;
};

export const fieldUidVarStatements = (
  fields: Array<IRField>
): Array<string> => {
  const uidVarNames = fieldUidVarNames(fields);
  const uidVarStatements = uidVarNames.map((uidVarName) => {
    return toUidVarStatement(uidVarName);
  });
  return uidVarStatements;
};
