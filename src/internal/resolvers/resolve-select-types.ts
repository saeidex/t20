import ts from "typescript";

import type { IRField } from "../types.js";

import { FieldType } from "twenty-sdk/define";
import { createFieldOptions } from "./create-field-options.js";
import {
  toPascalCase,
  toSnakeCase,
} from "../utils/case-transformation.js";

export function resolveSelectTypes(
  name: string,
  type: ts.Type
): IRField | undefined {
  // enum
  if (type.symbol && type.symbol.flags & ts.SymbolFlags.Enum) {
    const declarations = type.symbol.declarations ?? [];
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
          value,
        };
      });

      return {
        name,
        kind: FieldType.SELECT,
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

  // "a" | "b" | "c"
  if (type.isUnion()) {
    const literalMembers = type.types.filter(
      (t) => t.isStringLiteral() || t.isNumberLiteral()
    );

    if (literalMembers.length === type.types.length) {
      const values = literalMembers.map((t) =>
        String((t as ts.LiteralType).value)
      );

      return {
        name,
        kind: FieldType.SELECT,
        options: createFieldOptions(values),
        enumMeta: {
          enumName: toPascalCase(name),
          members: values.map((v) => ({
            memberName: toSnakeCase(v).toUpperCase(),
            value: v,
          })),
        },
      };
    }
  }

  return undefined;
}
