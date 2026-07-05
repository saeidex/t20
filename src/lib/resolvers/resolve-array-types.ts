import ts from "typescript";
import { FieldType } from "twenty-sdk/define";
import type { IRField } from "../types.js";

export function resolveArrayType(
  checker: ts.TypeChecker,
  name: string,
  type: ts.Type
): IRField | undefined {
  if (!checker.isArrayType(type) && !checker.isTupleType(type)) {
    return undefined;
  }

  const typeArgs = checker.getTypeArguments(
    type as ts.TypeReference
  );
  const elementType = typeArgs[0];
  if (!elementType) return undefined;

  // exclude named entity element — that's RELATION's job
  const isNamedEntity = elementType.symbol?.declarations?.some(
    (d) =>
      ts.isInterfaceDeclaration(d) || ts.isClassDeclaration(d)
  );
  if (isNamedEntity) return undefined;

  return { name, kind: FieldType.ARRAY };
}
