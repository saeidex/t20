import { expect, test } from "vitest";
import { extractObjectNodeNames } from "./extract-object-node-names.js";
import { parseTypeScriptAST } from "../parse-typescript-ast.js";

const TEST_FILE = "src/__tests__/types.d.ts";

test("Extract object node names", () => {
  const { checker, sourceFile } = parseTypeScriptAST(TEST_FILE);
  const objectNodeNames = extractObjectNodeNames(
    sourceFile,
    checker
  );

  const expected = [
    "Address",
    "BaseFields",
    "Category",
    "Child",
    "Company",
    "DateAndStringFields",
    "IBaseFields",
    "NativeFields",
    "Parent",
    "People",
    "Product",
    "Project",
    "School",
    "SelectFields",
    "Student",
    "Teacher",
    "multiSelectFields",
  ];

  expect(objectNodeNames).toEqual(expected);
});
