import {
  FieldType,
  OnDeleteAction,
  RelationType,
} from "twenty-sdk/define";
import ts from "typescript";
import type { ObjectsMap } from "../internal/types.js";

/**
 * Compile in-memory source string to get a real ts.Program + checker,
 * since resolveField needs actual TypeChecker type info — can't mock this.
 *
 * IMPORTANT: delegates everything except the virtual file to the real
 * default compiler host. If you stub out getSourceFile/readFile entirely,
 * lib.d.ts never loads and Array<T>, Record<K,V>, Date, etc. silently
 * resolve to `any` — every generic-type test will pass for the wrong
 * reason (or fail confusingly). Learned this the hard way — verify with
 * `checker.typeToString(type)` if a resolver ever misbehaves only in tests.
 */
export function compile(source: string | TemplateStringsArray) {
  const fileName = "virtual.ts";
  const virtualSourceFile = ts.createSourceFile(
    fileName,
    source as string,
    ts.ScriptTarget.Latest,
    true
  );

  const defaultHost = ts.createCompilerHost({});
  const compilerHost: ts.CompilerHost = {
    ...defaultHost,
    fileExists: (name) =>
      name === fileName || defaultHost.fileExists(name),
    readFile: (name) =>
      name === fileName
        ? (source as string)
        : defaultHost.readFile(name),
    getSourceFile: (name, ...rest) =>
      name === fileName
        ? virtualSourceFile
        : defaultHost.getSourceFile(name, ...rest),
  };

  const program = ts.createProgram([fileName], {}, compilerHost);
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(fileName)!;
  return { checker, sourceFile };
}

export const oneToMany = (targetObjectName: string) => ({
  kind: FieldType.RELATION as const,
  relation: {
    type: RelationType.ONE_TO_MANY,
    targetObjectName,
    targetFieldName: "id",
    onDelete: OnDeleteAction.SET_NULL,
  },
});

export function buildMap(
  entries: Record<
    string,
    Array<{
      name: string;
      field: ReturnType<typeof oneToMany> | { kind: string };
    }>
  >
): ObjectsMap {
  const map = new Map();
  for (const [name, fields] of Object.entries(entries)) {
    map.set(name, {
      objectNodeName: name,
      objectSingularName: name,
      objectPluralName: name,
      fields: fields.map((f) => ({ name: f.name, ...f.field })),
      relations: [],
      isExtracted: true,
      isGenerated: false,
      isUserSelected: true,
      results: {} as never,
    });
  }
  return map as ObjectsMap;
}
