import ts from "typescript";
import { FieldType } from "twenty-sdk/define";
import type { IRField, FieldOption } from "./types.js";
import { toTitleCase } from "./utils/case-transformation.js";

function createOptions(
  values: Array<string>
): Array<FieldOption> {
  return values.map((value, position) => ({
    value,
    label: toTitleCase(value),
    position,
    color: "gray",
  }));
}

function getArrayElementType(
  checker: ts.TypeChecker,
  type: ts.Type
): ts.Type | undefined {
  if (!checker.isArrayType(type) && !checker.isTupleType(type)) {
    return undefined;
  }

  const typeArgs = checker.getTypeArguments(
    type as ts.TypeReference
  );

  return typeArgs[0];
}

export function resolveType(
  checker: ts.TypeChecker,
  name: string,
  type: ts.Type
): IRField {
  if (name.toLowerCase().endsWith("at")) {
    return {
      name,
      kind: FieldType.DATE_TIME,
    };
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
      return {
        name,
        kind: FieldType.UUID,
      };
    }

    return {
      name,
      kind: FieldType.TEXT,
    };
  }

  if (
    type.isNumberLiteral() ||
    type.flags &
      (ts.TypeFlags.Number ||
        ts.TypeFlags.BigInt ||
        ts.TypeFlags.BigIntLiteral)
  ) {
    return {
      name,
      kind: FieldType.NUMBER,
    };
  }

  if (
    type.flags & ts.TypeFlags.Boolean ||
    type.flags & ts.TypeFlags.BooleanLiteral
  ) {
    return {
      name,
      kind: FieldType.BOOLEAN,
    };
  }

  // enum
  if (type.symbol && type.symbol.flags & ts.SymbolFlags.Enum) {
    const declarations = type.symbol.declarations ?? [];

    const enumDecl = declarations.find(ts.isEnumDeclaration);

    if (enumDecl) {
      const options = createOptions(
        enumDecl.members.map((member) => {
          const initializer = member.initializer;

          if (initializer && ts.isStringLiteral(initializer)) {
            return initializer.text;
          }

          return member.name.getText();
        })
      );

      return {
        name,
        kind: FieldType.SELECT,
        options,
      };
    }
  }

  // "a" | "b" | "c"
  if (type.isUnion()) {
    const literalMembers = type.types.filter(
      (t) => t.isStringLiteral() || t.isNumberLiteral()
    );

    if (literalMembers.length === type.types.length) {
      return {
        kind: FieldType.SELECT,
        name,
        options: createOptions(
          literalMembers.map((t) =>
            String((t as ts.LiteralType).value)
          )
        ),
      };
    }
  }

  // Array<"a" | "b">
  const elementType = getArrayElementType(checker, type);

  if (elementType && elementType.isUnion()) {
    const literalMembers = elementType.types.filter(
      (t) => t.isStringLiteral() || t.isNumberLiteral()
    );

    if (literalMembers.length === elementType.types.length) {
      return {
        kind: FieldType.MULTI_SELECT,
        name,
        options: createOptions(
          literalMembers.map((t) =>
            String((t as ts.LiteralType).value)
          )
        ),
      };
    }
  }

  // Date
  if (checker.typeToString(type) === "Date") {
    return {
      kind: FieldType.DATE_TIME,
      name,
    };
  }

  // type[]
  if (checker.isArrayType(type)) {
    const elementType = getArrayElementType(checker, type);

    if (elementType) {
      return {
        kind: FieldType.ARRAY,
        name,
      };
    }
  }

  return {
    kind: FieldType.TEXT,
    name,
  };
}
