import ts from "typescript";
import { FieldType } from "twenty-sdk/define";
import type { IRField } from "../types.js";

export function resolveDateSuffixAndUUIDTypes(
  checker: ts.TypeChecker,
  name: string,
  type: ts.Type
): IRField | undefined {
  // createdAt, updatedAt, etc — camelCase "At" suffix only
  if (isDateSuffix(name)) {
    return { name, kind: FieldType.DATE_TIME };
  }

  if (isUUID(name)) {
    return { name, kind: FieldType.UUID };
  }

  return undefined;
}

const isDateSuffix = (name: string) =>
  /(?:^|[a-z])At$/.test(name);

const isUUID = (name: string) => {
  const isUniversal = /universalidentifier/i.test(name);
  const isIdField =
    name === "id" ||
    /(?:Id|ID|_[iI]d|-[iI]d|[uU][uU][iI]d)$|^[iI][dD]$/.test(
      name
    );

  return isIdField || isUniversal;
};
