import ts from "typescript";
import { logErrorAndExit } from "../utils/log-error-and-exit.js";

export function extractObjectNodeNames(
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  exportOnly: boolean = false
): Array<string> {
  const names: Array<string> = [];

  sourceFile.forEachChild((node) => {
    if (
      ts.isTypeAliasDeclaration(node) ||
      ts.isInterfaceDeclaration(node)
    ) {
      if (exportOnly && !isExported(node)) return;

      const type = checker.getTypeAtLocation(node.name);

      if (isTrueObject(type, checker)) {
        names.push(node.name.text);
      }
    }
  });

  if (names.length === 0) {
    logErrorAndExit(
      "No Interfaces/Object were found in your input file."
    );
  }

  return names.sort();
}

function isExported(
  node: ts.InterfaceDeclaration | ts.TypeAliasDeclaration
): boolean {
  return (
    (ts.getCombinedModifierFlags(node) &
      ts.ModifierFlags.Export) !==
    0
  );
}

function isTrueObject(
  type: ts.Type,
  checker: ts.TypeChecker
): boolean {
  const isObject = (type.flags & ts.TypeFlags.Object) !== 0;
  if (!isObject) return false;

  const isArrayOrTuple =
    checker.isArrayType(type) || checker.isTupleType(type);
  if (isArrayOrTuple) return false;

  const signatures = type.getCallSignatures();
  if (signatures.length > 0) return false;

  return true;
}
