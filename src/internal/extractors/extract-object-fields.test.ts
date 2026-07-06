import { compile } from "../../__tests__/utils.js";
import { extractObjectFields } from "./extract-object-fields.js";
import { describe, it, expect } from "vitest";

describe("extractObjectFields", () => {
  it("Base types :: explicit FieldType literal", () => {
    const { checker, sourceFile } = compile(`
      enum FieldType { TEXT = "TEXT", UUID = "UUID" }
      interface IBaseFields {
        explicitText: FieldType.TEXT;
        explicitUuid: FieldType.UUID;
      }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "IBaseFields"
    );
    expect(fields).toEqual([
      { name: "explicitText", kind: "TEXT" },
      { name: "explicitUuid", kind: "UUID" },
    ]);
  });

  it("Base types :: plain string -> TEXT", () => {
    const { checker, sourceFile } = compile(`
      interface Product { name: string; }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Product"
    );
    expect(fields).toEqual([{ name: "name", kind: "TEXT" }]);
  });

  it("Base types :: id-pattern string -> UUID", () => {
    const { checker, sourceFile } = compile(`
      interface Product { id: string; userId: string; }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Product"
    );
    expect(fields).toEqual([
      { name: "id", kind: "UUID" },
      { name: "userId", kind: "UUID" },
    ]);
  });

  it("Base types :: *At suffix -> DATE_TIME", () => {
    const { checker, sourceFile } = compile(`
      interface Product { createdAt: Date; updatedAt: string; }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Product"
    );
    expect(fields).toEqual([
      { name: "createdAt", kind: "DATE_TIME" },
      { name: "updatedAt", kind: "DATE_TIME" },
    ]);
  });

  it("Base types :: does not false-positive on names containing 'at'", () => {
    const { checker, sourceFile } = compile(`
      interface Product { category: string; format: string; }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Product"
    );
    expect(fields).toEqual([
      { name: "category", kind: "TEXT" },
      { name: "format", kind: "TEXT" },
    ]);
  });

  it("Native types :: number -> NUMBER, boolean -> BOOLEAN", () => {
    const { checker, sourceFile } = compile(`
      interface Product { price: number; active: boolean; }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Product"
    );
    expect(fields).toEqual([
      { name: "price", kind: "NUMBER" },
      { name: "active", kind: "BOOLEAN" },
    ]);
  });

  it("Native types :: object / Record<string, unknown> -> RAW_JSON", () => {
    const { checker, sourceFile } = compile(`
      interface Product { metadata: object; config: Record<string, unknown>; }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Product"
    );
    expect(fields).toEqual([
      { name: "metadata", kind: "RAW_JSON" },
      { name: "config", kind: "RAW_JSON" },
    ]);
  });

  it("Select types :: string enum -> SELECT with options", () => {
    const { checker, sourceFile } = compile(`
      enum Priority { Low = "low", High = "high" }
      interface Product { status: Priority; }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Product"
    );
    expect(fields).toEqual([
      {
        name: "status",
        kind: "SELECT",
        options: [
          {
            value: "low",
            label: "Low",
            position: 0,
            color: "gray",
          },
          {
            value: "high",
            label: "High",
            position: 1,
            color: "gray",
          },
        ],
      },
    ]);
  });

  it("Select types :: numeric enum, falling back to member name when unlabeled", () => {
    const { checker, sourceFile } = compile(`
      enum Priority { Low = 1, High = 2 }
      interface Product { status: Priority; }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Product"
    );
    expect(fields[0].kind).toBe("SELECT");
    expect(fields[0].options).toEqual([
      { value: "1", label: "1", position: 0, color: "gray" },
      { value: "2", label: "2", position: 1, color: "gray" },
    ]);
  });

  it("Select types :: string literal union -> SELECT with options", () => {
    const { checker, sourceFile } = compile(`
      interface Product { role: "admin" | "user" | "guest"; }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Product"
    );
    expect(fields).toEqual([
      {
        name: "role",
        kind: "SELECT",
        options: [
          {
            value: "admin",
            label: "Admin",
            position: 0,
            color: "gray",
          },
          {
            value: "user",
            label: "User",
            position: 1,
            color: "gray",
          },
          {
            value: "guest",
            label: "Guest",
            position: 2,
            color: "gray",
          },
        ],
      },
    ]);
  });

  it("Select types :: string[] -> MULTI_SELECT with empty options", () => {
    const { checker, sourceFile } = compile(`
      interface Product { tags: string[]; }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Product"
    );
    expect(fields).toEqual([
      { name: "tags", kind: "MULTI_SELECT", options: [] },
    ]);
  });

  it("Select types :: Array<string> -> MULTI_SELECT with empty options", () => {
    const { checker, sourceFile } = compile(`
      interface Product { tags: Array<string>; }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Product"
    );
    expect(fields).toEqual([
      { name: "tags", kind: "MULTI_SELECT", options: [] },
    ]);
  });

  it("Select types :: literal-union array -> MULTI_SELECT with options", () => {
    const { checker, sourceFile } = compile(`
      interface Product { roles: ("admin" | "user")[]; }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Product"
    );
    expect(fields).toEqual([
      {
        name: "roles",
        kind: "MULTI_SELECT",
        options: [
          {
            value: "admin",
            label: "Admin",
            position: 0,
            color: "gray",
          },
          {
            value: "user",
            label: "User",
            position: 1,
            color: "gray",
          },
        ],
      },
    ]);
  });

  it("Array types :: number[] -> ARRAY (not MULTI_SELECT)", () => {
    const { checker, sourceFile } = compile(`
      interface Product { scores: number[]; }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Product"
    );
    expect(fields).toEqual([{ name: "scores", kind: "ARRAY" }]);
  });

  it("Array types :: Array<number> as ARRAY", () => {
    const { checker, sourceFile } = compile(`
      interface Product { scores: Array<number>; }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Product"
    );
    expect(fields).toEqual([{ name: "scores", kind: "ARRAY" }]);
  });

  it("Relation :: falls back to TEXT for named interface fields (relation not yet implemented)", () => {
    const { checker, sourceFile } = compile(`
      interface Address { street: string; }
      interface Product { address: Address; }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Product"
    );
    // TODO: once resolveRelationType lands, this should become
    // { name: "address", kind: "RELATION", relation: { type: "MANY_TO_ONE", targetObjectName: "Address" } }
    expect(fields).toEqual([{ name: "address", kind: "TEXT" }]);
  });

  it("Relation :: resolves type alias declarations, not just interfaces", () => {
    const { checker, sourceFile } = compile(`
      type Product = { name: string; price: number; };
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Product"
    );
    expect(fields).toEqual([
      { name: "name", kind: "TEXT" },
      { name: "price", kind: "NUMBER" },
    ]);
  });
});
