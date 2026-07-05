import ts from "typescript";
import { FieldType } from "twenty-sdk/define";
import type { IRField } from "../types.js";

export function resolveNativeTypes(
  checker: ts.TypeChecker,
  name: string,
  type: ts.Type
): IRField | undefined {
  if (type.flags & ts.TypeFlags.String) {
    return { name, kind: FieldType.TEXT };
  }

  if (type.flags & (ts.TypeFlags.Number | ts.TypeFlags.BigInt)) {
    return { name, kind: FieldType.NUMBER };
  }

  if (type.flags & ts.TypeFlags.Boolean) {
    return { name, kind: FieldType.BOOLEAN };
  }

  if (checker.typeToString(type) === "Date") {
    return { name, kind: FieldType.DATE_TIME };
  }

  const isNamedEntity = type.symbol?.declarations?.some(
    (d) =>
      ts.isInterfaceDeclaration(d) || ts.isClassDeclaration(d)
  );

  if (
    (type.flags & ts.TypeFlags.Object ||
      type.flags & ts.TypeFlags.NonPrimitive) &&
    !checker.isArrayType(type) &&
    !checker.isTupleType(type) &&
    !isNamedEntity
  ) {
    return { name, kind: FieldType.RAW_JSON };
  }

  return undefined;
}
