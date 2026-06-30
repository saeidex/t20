import ts from "typescript";
import pc from "picocolors";

export type Option = {
  label: string;
  value: string;
  hint?: string;
};

export function extractObjectSelectOptions(
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker
): Array<Option> {
  const items: Array<Option> = [];

  sourceFile.forEachChild((node) => {
    if (
      ts.isTypeAliasDeclaration(node) ||
      ts.isInterfaceDeclaration(node)
    ) {
      const type = checker.getTypeAtLocation(node.name);

      if (isTrueObject(type, checker)) {
        items.push({
          label: pc.green(node.name.text),
          value: node.name.text,
          // hint: node.getText(),
        });
      }
    }
  });

  return items.sort((a, b) => a.label.localeCompare(b.label));
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
