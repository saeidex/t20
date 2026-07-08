import ts from "typescript";
import type { IRField } from "../types.js";
import { resolveField } from "../resolvers/resolve-field.js";

export function extractObjectFields(
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  objectName: string,
  knownObjectNames?: Set<string>
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
            fields.push(
              resolveField(
                checker,
                name,
                type,
                member.type,
                knownObjectNames
              )
            );
          }
        });
      } else if (ts.isTypeAliasDeclaration(node)) {
        const type = checker.getTypeAtLocation(node.name);
        type.getProperties().forEach((property) => {
          const name = property.getName();
          const declaration =
            property.valueDeclaration ??
            property.declarations?.[0];
          if (declaration) {
            const propType = checker.getTypeOfSymbolAtLocation(
              property,
              declaration
            );
            const typeNode =
              ts.isPropertySignature(declaration) ||
              ts.isPropertyDeclaration(declaration)
                ? declaration.type
                : undefined;
            fields.push(
              resolveField(
                checker,
                name,
                propType,
                typeNode,
                knownObjectNames
              )
            );
          }
        });
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return fields;
}
