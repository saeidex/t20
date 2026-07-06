import ts from "typescript";

export function parseTypeScriptAST(filePath: string) {
  const program = ts.createProgram([filePath], {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.CommonJS,
  });
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(filePath);

  if (!sourceFile) {
    throw new Error(`Failed to read source file: ${filePath}`);
  }

  return { sourceFile, checker };
}
