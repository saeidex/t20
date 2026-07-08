import ts from "typescript";
import type { IRField } from "../types.js";
import {
  FieldType,
  OnDeleteAction,
  RelationType,
} from "twenty-sdk/define";

function isNamedEntityType(type: ts.Type): string | undefined {
  if (
    type.symbol &&
    type.symbol.flags &
      (ts.SymbolFlags.Interface | ts.SymbolFlags.Class)
  ) {
    return type.symbol.name;
  }
  if (type.aliasSymbol && type.getProperties().length > 0) {
    return type.aliasSymbol.name;
  }
  return undefined;
}

export function resolveRelationType(
  checker: ts.TypeChecker,
  name: string,
  type: ts.Type,
  knownObjectNames?: Set<string>
): IRField | undefined {
  const acceptTarget = (targetName: string | undefined) => {
    if (!targetName) return undefined;
    if (knownObjectNames && !knownObjectNames.has(targetName))
      return undefined;
    return targetName;
  };

  if (checker.isArrayType(type)) {
    const typeArgs = checker.getTypeArguments(
      type as ts.TypeReference
    );
    const elementType = typeArgs[0];
    if (elementType) {
      const target = acceptTarget(
        isNamedEntityType(elementType)
      );
      if (target) {
        return {
          name,
          kind: FieldType.RELATION,
          relation: {
            type: RelationType.ONE_TO_MANY,
            targetObjectName: target,
            onDelete: OnDeleteAction.SET_NULL,
          },
        };
      }
    }
    return undefined;
  }

  const target = acceptTarget(isNamedEntityType(type));
  if (target) {
    return {
      name,
      kind: FieldType.RELATION,
      relation: {
        type: RelationType.MANY_TO_ONE,
        targetObjectName: target,
        onDelete: OnDeleteAction.SET_NULL,
      },
    };
  }

  return undefined;
}
