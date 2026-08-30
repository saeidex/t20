import ts from "typescript";
import type { IRField } from "../types.js";
import {
  FieldType,
  OnDeleteAction,
  RelationType,
} from "twenty-sdk/define";

function stripReadonlyOperator(
  typeNode: ts.TypeNode
): ts.TypeNode {
  if (
    ts.isTypeOperatorNode(typeNode) &&
    typeNode.operator === ts.SyntaxKind.ReadonlyKeyword
  ) {
    return typeNode.type;
  }
  return typeNode;
}

function isNullishTypeNode(t: ts.TypeNode): boolean {
  if (t.kind === ts.SyntaxKind.UndefinedKeyword) return true;
  if (t.kind === ts.SyntaxKind.NullKeyword) return true;
  if (
    ts.isLiteralTypeNode(t) &&
    t.literal.kind === ts.SyntaxKind.NullKeyword
  ) {
    return true;
  }
  return false;
}

function stripNullable(typeNode: ts.TypeNode): ts.TypeNode {
  if (!ts.isUnionTypeNode(typeNode)) return typeNode;
  const nonNullish = typeNode.types.filter(
    (t) => !isNullishTypeNode(t)
  );
  return nonNullish.length === 1 ? nonNullish[0] : typeNode;
}

function normalize(typeNode: ts.TypeNode): ts.TypeNode {
  return stripNullable(stripReadonlyOperator(typeNode));
}

function unwrapArrayTypeNode(
  typeNode: ts.TypeNode
): ts.TypeNode | undefined {
  const node = stripReadonlyOperator(typeNode);

  if (ts.isArrayTypeNode(node)) return node.elementType;

  if (
    ts.isTypeReferenceNode(node) &&
    ts.isIdentifier(node.typeName) &&
    (node.typeName.text === "Array" ||
      node.typeName.text === "ReadonlyArray") &&
    node.typeArguments?.length === 1
  ) {
    return node.typeArguments[0];
  }

  return undefined;
}

type IndexedEntityInfo = {
  targetName: string;
  fieldName: string;
};

function indexedEntityInfo(
  typeNode: ts.TypeNode,
  knownObjectNames?: Set<string>
): IndexedEntityInfo | undefined {
  const node = normalize(typeNode);
  if (!ts.isIndexedAccessTypeNode(node)) return undefined;

  const objectType = node.objectType;
  if (
    !ts.isTypeReferenceNode(objectType) ||
    !ts.isIdentifier(objectType.typeName)
  ) {
    return undefined;
  }

  const targetName = objectType.typeName.text;
  if (knownObjectNames && !knownObjectNames.has(targetName)) {
    return undefined;
  }

  const indexType = node.indexType;
  if (
    !ts.isLiteralTypeNode(indexType) ||
    !ts.isStringLiteral(indexType.literal)
  ) {
    return undefined;
  }

  return { targetName, fieldName: indexType.literal.text };
}

export function resolveIndexedRelationType(
  name: string,
  typeNode: ts.TypeNode | undefined,
  knownObjectNames?: Set<string>
): IRField | undefined {
  if (!typeNode) return undefined;

  const normalized = normalize(typeNode);

  const arrayInner = unwrapArrayTypeNode(normalized);
  if (arrayInner) {
    const info = indexedEntityInfo(arrayInner, knownObjectNames);
    if (info) {
      return {
        name,
        kind: FieldType.RELATION,
        relation: {
          type: RelationType.ONE_TO_MANY,
          targetObjectName: info.targetName,
          targetFieldName: info.fieldName,
          onDelete: OnDeleteAction.SET_NULL,
        },
      };
    }
  }

  const info = indexedEntityInfo(normalized, knownObjectNames);
  if (info) {
    return {
      name,
      kind: FieldType.RELATION,
      relation: {
        type: RelationType.MANY_TO_ONE,
        targetObjectName: info.targetName,
        targetFieldName: info.fieldName,
        onDelete: OnDeleteAction.SET_NULL,
      },
    };
  }

  return undefined;
}
