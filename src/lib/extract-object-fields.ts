import ts from "typescript";
import type { IRField } from "./types.js";
import { resolveType } from "./resolvers/resolve-type.js";

export function extractObjectFields(
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  objectName: string
): Array<IRField> {
  const fields: Array<IRField> = [];

  function visit(node: ts.Node) {
    if (
      (ts.isInterfaceDeclaration(node) ||
        ts.isTypeAliasDeclaration(node)) &&
      node.name.text === objectName
    ) {
      if (ts.isInterfaceDeclaration(node)) {
        node.members.forEach((member) => {
          if (ts.isPropertySignature(member) && member.name) {
            const name = member.name.getText();
            const type = checker.getTypeAtLocation(member);
            const resolved = resolveType(checker, name, type);
            if (Array.isArray(resolved)) {
              fields.push(...resolved);
            } else {
              fields.push(resolved);
            }
          }
        });
      } else if (ts.isTypeAliasDeclaration(node)) {
        const type = checker.getTypeAtLocation(node.name);
        const properties = type.getProperties();

        properties.forEach((property) => {
          const name = property.getName();
          const declaration =
            property.valueDeclaration ??
            property.declarations?.[0];

          if (declaration) {
            const propType = checker.getTypeOfSymbolAtLocation(
              property,
              declaration
            );
            const resolved = resolveType(
              checker,
              name,
              propType
            );
            if (Array.isArray(resolved)) {
              fields.push(...resolved);
            } else {
              fields.push(resolved);
            }
          }
        });
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return fields;
}
