import ts from "typescript";
import { FieldType } from "twenty-sdk/define";
import type { IRField } from "../types.js";
import { createFieldOptions } from "./create-field-options.js";

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

  // string[] or Array<string> — no predefined options
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

      return {
        name,
        kind: FieldType.MULTI_SELECT,
        options,
      };
    }
  }

  // ("a"|"b")[] or Array<"a"|"b"> — literal union, derive options
  if (elementType.isUnion()) {
    const literalMembers = elementType.types.filter(
      (t) => t.isStringLiteral() || t.isNumberLiteral()
    );
    if (literalMembers.length === elementType.types.length) {
      return {
        name,
        kind: FieldType.MULTI_SELECT,
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
