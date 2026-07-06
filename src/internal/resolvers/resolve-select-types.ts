import ts from "typescript";
import { FieldType } from "twenty-sdk/define";
import type { IRField } from "../types.js";
import { createFieldOptions } from "./create-field-options.js";

export function resolveSelectTypes(
  name: string,
  type: ts.Type
): IRField | undefined {
  // enum
  if (type.symbol && type.symbol.flags & ts.SymbolFlags.Enum) {
    const declarations = type.symbol.declarations ?? [];
    const enumDecl = declarations.find(ts.isEnumDeclaration);

    if (enumDecl) {
      const options = createFieldOptions(
        enumDecl.members.map((member) => {
          const initializer = member.initializer;

          if (initializer) {
            if (ts.isStringLiteral(initializer))
              return initializer.text;
            if (ts.isNumericLiteral(initializer))
              return initializer.text;
          }

          return member.name.getText();
        })
      );

      return { name, kind: FieldType.SELECT, options };
    }
  }

  // "a" | "b" | "c"
  if (type.isUnion()) {
    const literalMembers = type.types.filter(
      (t) => t.isStringLiteral() || t.isNumberLiteral()
    );

    if (literalMembers.length === type.types.length) {
      return {
        name,
        kind: FieldType.SELECT,
        options: createFieldOptions(
          literalMembers.map((t) =>
            String((t as ts.LiteralType).value)
          )
        ),
      };
    }
  }

  return undefined;
}
