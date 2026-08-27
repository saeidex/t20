import ts from "typescript";
import { logErrorAndExit } from "../utils/log-error-and-exit.js";

export function extractObjectNodeNames(
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker
): Array<string> {
  const names: Array<string> = [];

  sourceFile.forEachChild((node) => {
    if (
      ts.isTypeAliasDeclaration(node) ||
      ts.isInterfaceDeclaration(node)
    ) {
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
