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
    "DateAndStringFields",
    "IBaseFields",
    "NativeFields",
    "Product",
    "SelectFields",
    "multiSelectFields",
  ];

  expect(objectNodeNames).toEqual(expected);
});
