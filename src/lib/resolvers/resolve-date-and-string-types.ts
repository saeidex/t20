import ts from "typescript";
import { FieldType } from "twenty-sdk/define";
import type { IRField } from "../types.js";

export function resolveDateAndStringTypes(
  checker: ts.TypeChecker,
  name: string,
  type: ts.Type
): IRField | undefined {
  // createdAt, updatedAt, etc — camelCase "At" suffix only
  if (/(?:^|[a-z])At$/.test(name)) {
    return { name, kind: FieldType.DATE_TIME };
  }

  if (
    type.isStringLiteral() ||
    type.flags & ts.TypeFlags.String
  ) {
    const isUniversal = /universalidentifier/i.test(name);
    const isIdField =
      /(?:Id|ID|_[iI]d|-[iI]d|[uU][uU][iI]d)$|^[iI][dD]$/.test(
        name
      );

    if (isIdField || isUniversal) {
      return { name, kind: FieldType.UUID };
    }

    return { name, kind: FieldType.TEXT };
  }

  return undefined;
}
