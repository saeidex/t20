import { expect, test } from "vitest";
import { toImportStatement } from "./to-import-statement.js";
import dedent from "ts-dedent";

test("Import Statement :: Same directory", () => {
  const from = "hello.ts";
  const to = "world.ts";
  const content = "greetings";
  const importStatement = toImportStatement(from, to, content);

  const expectedImportStatement = dedent`import {
      ${content}
    } from "./hello"
  `;

  expect(importStatement).toBe(expectedImportStatement);
});

test("Import Statement :: Neighbouring directory", () => {
  const from = "src/hello/hello.ts";
  const to = "src/world/world.ts";
  const content = "greetings";
  const importStatement = toImportStatement(from, to, content);

  const expectedImportStatement = dedent`import {
      ${content}
    } from "../hello/hello"
  `;

  expect(importStatement).toBe(expectedImportStatement);
});

test("Import Statement :: Root directory", () => {
  const from = "hello/hello.ts";
  const to = "world/world.ts";
  const content = "greetings";
  const importStatement = toImportStatement(from, to, content);

  const expectedImportStatement = dedent`import {
      ${content}
    } from "../hello/hello"
  `;

  expect(importStatement).toBe(expectedImportStatement);
});
