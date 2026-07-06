import ts from "typescript";
import { FieldType } from "twenty-sdk/define";
import type { IRField } from "../types.js";

function getParentEnumName(
  symbol: ts.Symbol
): string | undefined {
  const decl = symbol.declarations?.[0];
  if (
    decl &&
    ts.isEnumMember(decl) &&
    ts.isEnumDeclaration(decl.parent)
  ) {
    return decl.parent.name.text;
  }
  return undefined;
}

export function resolveBaseTypes(
  name: string,
  type: ts.Type
): IRField | undefined {
  const symbol = type.symbol;
  if (!symbol || !(symbol.flags & ts.SymbolFlags.EnumMember)) {
    return undefined;
  }

  const parentEnumName = getParentEnumName(symbol);

  if (
    parentEnumName !== "FieldMetadataType" &&
    parentEnumName !== "FieldType"
  ) {
    return undefined;
  }

  const memberName = symbol.name;
  const kind = FieldType[memberName as keyof typeof FieldType];
  return kind ? { name, kind } : undefined;
}
