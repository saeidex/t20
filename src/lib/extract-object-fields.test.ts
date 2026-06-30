import { extractObjectFields } from "./extract-object-fields.js";
import { expect, test } from "vitest";
import ts from "typescript";
import type { IRField } from "./types.js";

const createCompilerHost = (
  fileName: string,
  source: string,
  sourceFile: ts.SourceFile
): ts.CompilerHost => {
  const compilerHost: ts.CompilerHost = {
    getSourceFile: (name) =>
      name === fileName ? sourceFile : undefined,
    writeFile: () => {},
    getDefaultLibFileName: () => "lib.d.ts",
    useCaseSensitiveFileNames: () => true,
    getCanonicalFileName: (f) => f,
    getCurrentDirectory: () => "",
    getNewLine: () => "\n",
    fileExists: (name) => name === fileName,
    readFile: (name) => (name === fileName ? source : undefined),
  };

  return compilerHost;
};

const createSourceFile = (
  fileName: string,
  source: string
): ts.SourceFile => {
  return ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true
  );
};

const createTestProgram = (
  typeName: string,
  source: string,
  fileName = "input.ts"
): Array<IRField> => {
  const sourceFile = createSourceFile(fileName, source);
  const compilerHost = createCompilerHost(
    fileName,
    source,
    sourceFile
  );
  const program = ts.createProgram([fileName], {}, compilerHost);
  const checker = program.getTypeChecker();
  const actualFields = extractObjectFields(
    sourceFile,
    checker,
    typeName
  );
  return actualFields;
};

test("empty object literal fields", () => {
  const targetObjectName = "Something";
  const targetObject = `type ${targetObjectName} = {};`;

  const actualFields = createTestProgram(
    targetObjectName,
    targetObject
  );
  expect(actualFields).toEqual([]);
});

test("empty interface fields", () => {
  const targetInterfaceName = "Product";
  const targetInterface = ` interface ${targetInterfaceName} {};`;

  const actualFields = createTestProgram(
    targetInterfaceName,
    targetInterface
  );
  expect(actualFields).toEqual([]);
});

test("extract fields :: string => TEXT", () => {
  const targetObjectName = "Something";
  const targetObject = `type ${targetObjectName} = { a: string; };`;
  const expectedOutput = [{ name: "a", kind: "TEXT" }];

  const actualFields = createTestProgram(
    targetObjectName,
    targetObject
  );
  expect(actualFields).toEqual(expectedOutput);
});

test("extract fields :: number => NUMBER", () => {
  const targetObjectName = "Something";
  const targetObject = `type ${targetObjectName} = { a: number; };`;
  const expectedOutput = [{ name: "a", kind: "NUMBER" }];

  const actualFields = createTestProgram(
    targetObjectName,
    targetObject
  );
  expect(actualFields).toEqual(expectedOutput);
});

test("extract fields :: boolean => BOOLEAN", () => {
  const targetObjectName = "Something";
  const targetObject = `type ${targetObjectName} = { a: boolean; };`;
  const expectedOutput = [{ name: "a", kind: "BOOLEAN" }];

  const actualFields = createTestProgram(
    targetObjectName,
    targetObject
  );
  expect(actualFields).toEqual(expectedOutput);
});

test("extract fields :: array", () => {
  const targetObjectName = "Something";
  const targetObject = `type ${targetObjectName} = { array: string[]; };`;

  const actualFields = createTestProgram(
    targetObjectName,
    targetObject
  );
  expect(actualFields).toEqual([
    { name: "array", kind: "ARRAY" },
  ]);
});

test("extract fields :: enum => SELECT", () => {
  const targetObjectName = "Something";
  const targetObject = `
    enum Enum {
      Abc = "ABC",
      Bcd = "BCD",
      Cde = "CDE",
    };
    type ${targetObjectName} = { e: Enum; };
  `;
  const expectedOutput = [
    {
      name: "e",
      kind: "SELECT",
      options: [
        {
          position: 0,
          label: "Abc",
          value: "ABC",
          color: "gray",
        },
        {
          position: 1,
          label: "Bcd",
          value: "BCD",
          color: "gray",
        },
        {
          position: 2,
          label: "Cde",
          value: "CDE",
          color: "gray",
        },
      ],
    },
  ];

  const actualFields = createTestProgram(
    targetObjectName,
    targetObject
  );
  expect(actualFields).toEqual(expectedOutput);
});

test("extract fields :: 'a' | 'b' | 'c' => SELECT", () => {
  const targetObjectName = "Something";
  const targetObject = `
    type ${targetObjectName} = { e: "ABC" | "BCD" | "CDE"; };
  `;
  const expectedOutput = [
    {
      name: "e",
      kind: "SELECT",
      options: [
        {
          position: 0,
          label: "Abc",
          value: "ABC",
          color: "gray",
        },
        {
          position: 1,
          label: "Bcd",
          value: "BCD",
          color: "gray",
        },
        {
          position: 2,
          label: "Cde",
          value: "CDE",
          color: "gray",
        },
      ],
    },
  ];

  const actualFields = createTestProgram(
    targetObjectName,
    targetObject
  );
  expect(actualFields).toEqual(expectedOutput);
});

test("extract fields :: Date => DATE_TIME", () => {
  const targetObjectName = "Something";
  const targetObject = `type ${targetObjectName} = { any: Date; };`;
  const expectedOutput = [{ name: "any", kind: "DATE_TIME" }];

  const actualFields = createTestProgram(
    targetObjectName,
    targetObject
  );
  expect(actualFields).toEqual(expectedOutput);
});

test("extract fields :: any (key contains 'at') => DATE_TIME", () => {
  const targetObjectName = "Something";
  const targetObject = `type ${targetObjectName} = { createdAt: any; };`;
  const expectedOutput = [
    { name: "createdAt", kind: "DATE_TIME" },
  ];

  const actualFields = createTestProgram(
    targetObjectName,
    targetObject
  );
  expect(actualFields).toEqual(expectedOutput);
});

test("extract fields :: string (key contains 'id') => UUID", () => {
  const targetObjectName = "Something";
  const targetObject = `
    type ${targetObjectName} = {
      id: string;
      userId: string;
      product_id: string;
      uuid: string;
      UUID: string;
      text: string;
      paid: boolean;
      unpaid: string;
      paId: string;
      paID: string;
      universalidentifier: string;
      universalIdentifier: string;
    };`;
  const expectedOutput = [
    { name: "id", kind: "UUID" },
    { name: "userId", kind: "UUID" },
    { name: "product_id", kind: "UUID" },
    { name: "uuid", kind: "UUID" },
    { name: "UUID", kind: "UUID" },
    { name: "text", kind: "TEXT" },
    { name: "paid", kind: "BOOLEAN" },
    { name: "unpaid", kind: "TEXT" },
    { name: "paId", kind: "UUID" },
    { name: "paID", kind: "UUID" },
    { name: "universalidentifier", kind: "UUID" },
    { name: "universalIdentifier", kind: "UUID" },
  ];

  const actualFields = createTestProgram(
    targetObjectName,
    targetObject
  );
  expect(actualFields).toEqual(expectedOutput);
});
