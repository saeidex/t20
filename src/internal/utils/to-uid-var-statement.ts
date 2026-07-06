import { v4 } from "uuid";

export const toUidVarStatement = (
  uidVarName: string
): string => {
  return `export const ${uidVarName} = "${v4()}";`;
};
