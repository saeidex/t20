import ts from "typescript";

import type { IRField } from "../types.js";

import { FieldType } from "twenty-sdk/define";
import { createFieldOptions } from "./create-field-options.js";
import {
  toPascalCase,
  toSnakeCase,
} from "../utils/case-transformation.js";

export function resolveMultiSelectType(
  checker: ts.TypeChecker,
  name: string,
  type: ts.Type
): IRField | undefined {
  if (!checker.isArrayType(type)) return undefined;

  const typeArgs = checker.getTypeArguments(
    type as ts.TypeReference
  );
  const elementType = typeArgs[0];
  if (!elementType) return undefined;

  // string[] or Array<string>
  if (elementType.flags & ts.TypeFlags.String) {
    return { name, kind: FieldType.MULTI_SELECT, options: [] };
  }

  // Enum[] or Array<Enum>
  if (
    elementType.symbol &&
    elementType.symbol.flags & ts.SymbolFlags.Enum
  ) {
    const declarations = elementType.symbol.declarations ?? [];
    const enumDecl = declarations.find(ts.isEnumDeclaration);

    if (enumDecl) {
      const enumMembers = enumDecl.members.map((member) => {
        const memberName = member.name.getText();
        const initializer = member.initializer;
        const value =
          initializer && ts.isStringLiteral(initializer)
            ? initializer.text
            : initializer && ts.isNumericLiteral(initializer)
            ? initializer.text
            : memberName;
        return {
          memberName: toSnakeCase(memberName).toUpperCase(),
          value: toSnakeCase(value).toUpperCase(),
        };
      });

      return {
        name,
        kind: FieldType.MULTI_SELECT,
        options: createFieldOptions(
          enumMembers.map((m) => m.value)
        ),
        enumMeta: {
          enumName: enumDecl.name.text,
          members: enumMembers,
        },
      };
    }
  }

  // ("a"|"b")[] or Array<"a"|"b"> — literal union, synthesize enum
  if (elementType.isUnion()) {
    const literalMembers = elementType.types.filter(
      (t) => t.isStringLiteral() || t.isNumberLiteral()
    );
    if (literalMembers.length === elementType.types.length) {
      const values = literalMembers.map((t) =>
        String((t as ts.LiteralType).value)
      );

      return {
        name,
        kind: FieldType.MULTI_SELECT,
        options: createFieldOptions(values),
        enumMeta: {
          enumName: toPascalCase(name),
          members: values.map((v) => ({
            memberName: toSnakeCase(v).toUpperCase(),
            value: toSnakeCase(v).toUpperCase(),
          })),
        },
      };
    }
  }

  return undefined;
}
