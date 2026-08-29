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
      interface Product {
        id: number;
        userId: string;
        categoryId: number;
      }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Product"
    );
    expect(fields).toEqual([
      { name: "id", kind: "UUID" },
      { name: "userId", kind: "TEXT" },
      { name: "categoryId", kind: "NUMBER" },
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
        enumMeta: {
          enumName: "Priority",
          members: [
            {
              memberName: "LOW",
              value: "low",
            },
            {
              memberName: "HIGH",
              value: "high",
            },
          ],
        },
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
        enumMeta: {
          enumName: "Role",
          members: [
            {
              memberName: "ADMIN",
              value: "admin",
            },
            {
              memberName: "USER",
              value: "user",
            },
            {
              memberName: "GUEST",
              value: "guest",
            },
          ],
        },
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

  it("MultiSelect types :: string[] -> MULTI_SELECT with empty options", () => {
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

  it("MultiSelect types :: Array<string> -> MULTI_SELECT with empty options", () => {
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

  it("MultiSelect types :: literal-union array -> MULTI_SELECT with options", () => {
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
        enumMeta: {
          enumName: "Roles",
          members: [
            {
              memberName: "ADMIN",
              value: "admin",
            },
            {
              memberName: "USER",
              value: "user",
            },
          ],
        },
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

  it("MultiSelect types :: enum array -> MULTI_SELECT with options", () => {
    const { checker, sourceFile } = compile(`
      enum Role { ADMIN = "admin", USER = "user" }
      interface Product { roles: Role[]; }
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
        enumMeta: {
          enumName: "Role",
          members: [
            {
              memberName: "ADMIN",
              value: "admin",
            },
            {
              memberName: "USER",
              value: "user",
            },
          ],
        },
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

  it("Relation :: object and interface fields", () => {
    const { checker, sourceFile } = compile(`
      interface Address { street: string; }
      type Category = { name: string; };
      interface Product { address: Array<Address>; category: Array<Category>; }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Product"
    );
    expect(fields).toEqual([
      {
        name: "address",
        kind: "RELATION",
        relation: {
          onDelete: "SET_NULL",
          type: "ONE_TO_MANY",
          targetObjectName: "Address",
        },
      },
      {
        name: "category",
        kind: "RELATION",
        relation: {
          onDelete: "SET_NULL",
          type: "ONE_TO_MANY",
          targetObjectName: "Category",
        },
      },
    ]);
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

describe("Relation :: indexed-access foreign key pattern", () => {
  it('MANY_TO_ONE :: Entity["id"]', () => {
    const { checker, sourceFile } = compile(`
      interface Parent { id: string; }
      interface Child { parent: Parent["id"]; }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Child",
      new Set(["Parent", "Child"])
    );
    expect(fields[0]).toEqual({
      name: "parent",
      kind: "RELATION",
      relation: {
        onDelete: "SET_NULL",
        type: "MANY_TO_ONE",
        targetObjectName: "Parent",
      },
    });
  });

  it('ONE_TO_MANY :: Array<Entity["id"]>', () => {
    const { checker, sourceFile } = compile(`
      interface Child { id: string; }
      interface Parent { childs: Array<Child["id"]>; }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Parent",
      new Set(["Parent", "Child"])
    );
    expect(fields[0]).toEqual({
      name: "childs",
      kind: "RELATION",
      relation: {
        onDelete: "SET_NULL",
        type: "ONE_TO_MANY",
        targetObjectName: "Child",
      },
    });
  });

  it('ONE_TO_MANY :: Entity["id"][]', () => {
    const { checker, sourceFile } = compile(`
      interface Child { id: string; }
      interface Parent { childs: Child["id"][]; }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Parent",
      new Set(["Parent", "Child"])
    );
    expect(fields[0]).toEqual({
      name: "childs",
      kind: "RELATION",
      relation: {
        onDelete: "SET_NULL",
        type: "ONE_TO_MANY",
        targetObjectName: "Child",
      },
    });
  });

  it('ONE_TO_MANY :: ReadonlyArray<Entity["id"]>', () => {
    const { checker, sourceFile } = compile(`
      interface Child { id: string; }
      interface Parent { childs: ReadonlyArray<Child["id"]>; }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Parent",
      new Set(["Parent", "Child"])
    );
    expect(fields[0]).toEqual({
      name: "childs",
      kind: "RELATION",
      relation: {
        onDelete: "SET_NULL",
        type: "ONE_TO_MANY",
        targetObjectName: "Child",
      },
    });
  });

  it('ONE_TO_MANY :: readonly Entity["id"][]', () => {
    const { checker, sourceFile } = compile(`
      interface Child { id: string; }
      interface Parent { childs: readonly Child["id"][]; }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Parent",
      new Set(["Parent", "Child"])
    );
    expect(fields[0]).toEqual({
      name: "childs",
      kind: "RELATION",
      relation: {
        onDelete: "SET_NULL",
        type: "ONE_TO_MANY",
        targetObjectName: "Child",
      },
    });
  });

  it('MANY_TO_ONE :: nullable indexed-access (Entity["id"] | null)', () => {
    const { checker, sourceFile } = compile(`
      interface Parent { id: string; }
      interface Child { parent: Parent["id"] | null; }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Child",
      new Set(["Parent", "Child"])
    );
    expect(fields[0]).toEqual({
      name: "parent",
      kind: "RELATION",
      relation: {
        onDelete: "SET_NULL",
        type: "MANY_TO_ONE",
        targetObjectName: "Parent",
      },
    });
  });

  it('MANY_TO_ONE :: optional prop (parent?: Parent["id"])', () => {
    const { checker, sourceFile } = compile(`
      interface Parent { id: string; }
      interface Child { parent?: Parent["id"]; }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Child",
      new Set(["Parent", "Child"])
    );
    expect(fields[0]).toEqual({
      name: "parent",
      kind: "RELATION",
      relation: {
        onDelete: "SET_NULL",
        type: "MANY_TO_ONE",
        targetObjectName: "Parent",
      },
    });
  });

  it("self-referential relation (tree structure)", () => {
    const { checker, sourceFile } = compile(`
      interface Category {
        id: string;
        parentCategory: Category["id"];
        subCategories: Array<Category["id"]>;
      }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Category",
      new Set(["Category"])
    );
    expect(
      fields.find((f) => f.name === "parentCategory")
    ).toEqual({
      name: "parentCategory",
      kind: "RELATION",
      relation: {
        onDelete: "SET_NULL",
        type: "MANY_TO_ONE",
        targetObjectName: "Category",
      },
    });
    expect(
      fields.find((f) => f.name === "subCategories")
    ).toEqual({
      name: "subCategories",
      kind: "RELATION",
      relation: {
        onDelete: "SET_NULL",
        type: "ONE_TO_MANY",
        targetObjectName: "Category",
      },
    });
  });

  it("type alias declarations support indexed-access relations", () => {
    const { checker, sourceFile } = compile(`
      type Parent = { id: string; };
      type Child = { id: string; parent: Parent["id"]; siblings: Array<Child["id"]>; };
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Child",
      new Set(["Parent", "Child"])
    );
    expect(fields.find((f) => f.name === "parent")).toEqual({
      name: "parent",
      kind: "RELATION",
      relation: {
        onDelete: "SET_NULL",
        type: "MANY_TO_ONE",
        targetObjectName: "Parent",
      },
    });
    expect(fields.find((f) => f.name === "siblings")).toEqual({
      name: "siblings",
      kind: "RELATION",
      relation: {
        onDelete: "SET_NULL",
        type: "ONE_TO_MANY",
        targetObjectName: "Child",
      },
    });
  });

  it("indexed access on non-'id' property still treated as relation", () => {
    const { checker, sourceFile } = compile(`
      interface Parent { uuid: string; }
      interface Child { parent: Parent["uuid"]; }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Child",
      new Set(["Parent", "Child"])
    );
    expect(fields[0]).toEqual({
      name: "parent",
      kind: "RELATION",
      relation: {
        onDelete: "SET_NULL",
        type: "MANY_TO_ONE",
        targetObjectName: "Parent",
      },
    });
  });

  it("knownObjectNames excludes indexed target -> falls through, not relation", () => {
    const { checker, sourceFile } = compile(`
      interface Parent { id: string; }
      interface Child { parent: Parent["id"]; }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Child",
      new Set(["Child"]) // Parent excluded
    );
    expect(fields[0]).toEqual({ name: "parent", kind: "TEXT" });
  });

  it("knownObjectNames undefined -> accepts any indexed target", () => {
    const { checker, sourceFile } = compile(`
      interface Parent { id: string; }
      interface Child { parent: Parent["id"]; }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Child"
    );
    expect(fields[0]).toEqual({
      name: "parent",
      kind: "RELATION",
      relation: {
        onDelete: "SET_NULL",
        type: "MANY_TO_ONE",
        targetObjectName: "Parent",
      },
    });
  });

  it("qualified (namespaced) object type is not treated as relation", () => {
    const { checker, sourceFile } = compile(`
      namespace NS { export interface Entity { id: string; } }
      interface Foo { ref: NS.Entity["id"]; }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Foo",
      new Set(["Entity"])
    );
    expect(fields).toEqual([{ name: "ref", kind: "TEXT" }]);
  });

  it("indexed-access wins over Id-suffix naming heuristic", () => {
    const { checker, sourceFile } = compile(`
      interface Parent { id: string; }
      interface Child { id: string; parentId: Parent["id"]; }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Child",
      new Set(["Parent", "Child"])
    );
    expect(fields.find((f) => f.name === "parentId")).toEqual({
      name: "parentId",
      kind: "RELATION",
      relation: {
        onDelete: "SET_NULL",
        type: "MANY_TO_ONE",
        targetObjectName: "Parent",
      },
    });
  });

  it("regression :: plain id: string still resolves as UUID, not relation", () => {
    const { checker, sourceFile } = compile(`
      interface Product { id: string; name: string; }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Product"
    );
    expect(fields).toEqual([
      { name: "id", kind: "UUID" },
      { name: "name", kind: "TEXT" },
    ]);
  });

  it("old direct-entity pattern and new indexed-access pattern coexist", () => {
    const { checker, sourceFile } = compile(`
      interface Address { street: string; }
      interface Category { id: string; }
      interface Product {
        address: Array<Address>;
        category: Category["id"];
      }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Product",
      new Set(["Address", "Category", "Product"])
    );
    expect(fields).toEqual([
      {
        name: "address",
        kind: "RELATION",
        relation: {
          onDelete: "SET_NULL",
          type: "ONE_TO_MANY",
          targetObjectName: "Address",
        },
      },
      {
        name: "category",
        kind: "RELATION",
        relation: {
          onDelete: "SET_NULL",
          type: "MANY_TO_ONE",
          targetObjectName: "Category",
        },
      },
    ]);
  });

  it("kitchen sink :: relation + scalar + enum + multiselect together", () => {
    const { checker, sourceFile } = compile(`
      enum Status { Active = "active", Inactive = "inactive" }
      interface Category { id: string; }
      interface Product {
        id: string;
        name: string;
        price: number;
        active: boolean;
        createdAt: Date;
        status: Status;
        tags: string[];
        category: Category["id"];
      }
    `);
    const fields = extractObjectFields(
      sourceFile,
      checker,
      "Product",
      new Set(["Category", "Product"])
    );
    expect(fields.map((f) => [f.name, f.kind])).toEqual([
      ["id", "UUID"],
      ["name", "TEXT"],
      ["price", "NUMBER"],
      ["active", "BOOLEAN"],
      ["createdAt", "DATE_TIME"],
      ["status", "SELECT"],
      ["tags", "MULTI_SELECT"],
      ["category", "RELATION"],
    ]);
  });
});

it('MANY_TO_ONE :: explicit union with undefined (Entity["id"] | undefined)', () => {
  const { checker, sourceFile } = compile(`
    interface Parent { id: string; }
    interface Child { parent: Parent["id"] | undefined; }
  `);
  const fields = extractObjectFields(
    sourceFile,
    checker,
    "Child",
    new Set(["Parent", "Child"])
  );
  expect(fields[0]).toEqual({
    name: "parent",
    kind: "RELATION",
    relation: {
      onDelete: "SET_NULL",
      type: "MANY_TO_ONE",
      targetObjectName: "Parent",
    },
  });
});

it('ONE_TO_MANY :: readonly + nullable combined (readonly Entity["id"][] | null)', () => {
  const { checker, sourceFile } = compile(`
    interface Child { id: string; }
    interface Parent { childs: readonly Child["id"][] | null; }
  `);
  const fields = extractObjectFields(
    sourceFile,
    checker,
    "Parent",
    new Set(["Parent", "Child"])
  );
  expect(fields[0]).toEqual({
    name: "childs",
    kind: "RELATION",
    relation: {
      onDelete: "SET_NULL",
      type: "ONE_TO_MANY",
      targetObjectName: "Child",
    },
  });
});

it("KNOWN GAP :: nullable enum union falls through to TEXT instead of SELECT", () => {
  const { checker, sourceFile } = compile(`
    enum Priority { Low = "low", High = "high" }
    interface Product { status: Priority | null; }
  `);
  const fields = extractObjectFields(
    sourceFile,
    checker,
    "Product"
  );
  // TODO: should be SELECT with options — resolveSelectTypes doesn't strip
  // nullable unions the way resolveIndexedRelationType now does.
  expect(fields[0]).toEqual({ name: "status", kind: "TEXT" });
});
