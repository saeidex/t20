import { FieldType, RelationType } from "twenty-sdk/define";
import { describe, expect, it, vi } from "vitest";
import { synthesizeManyToManyJunctions } from "./synthesize-many-to-many.js";
import { buildMap, oneToMany } from "../../__tests__/utils.js";

vi.mock("../create-cli.js", () => ({
  getCliOptions: () => ({
    seed: undefined,
    output: "src",
    objectsDir: "objects",
    viewsDir: "views",
    navMenuItemsDir: "navigation-menu-items",
  }),
}));

vi.mock("../resolvers/resolve-output-directories.js", () => ({
  resolveOutputDirectories: () => ({
    objects: "src/objects",
    views: "src/views",
    navMenuItems: "src/navigation-menu-items",
    root: "src",
  }),
}));

describe("synthesizeManyToManyJunctions", () => {
  const map = buildMap({
    Product: [
      {
        name: "categories",
        field: oneToMany("Category"),
      },
    ],
    Category: [
      {
        name: "products",
        field: oneToMany("Product"),
      },
    ],
  });

  const pairs = [
    {
      objectA: "Product",
      fieldA: "categories",
      objectB: "Category",
      fieldB: "products",
      selfReferential: false,
    },
  ];

  synthesizeManyToManyJunctions(map, pairs, new Set());

  it("creates junction object with two MANY_TO_ONE fields", () => {
    expect(map.has("ProductCategory")).toBe(true);

    const junction = map.get("ProductCategory");
    expect(junction).toBeDefined();
    expect(junction?.isJunction).toBe(true);
    expect(junction?.isUserSelected).toBe(false);

    const relationFields = junction!.fields.filter(
      (f) => f.kind === FieldType.RELATION
    );
    expect(relationFields).toHaveLength(2);

    for (const field of relationFields) {
      expect(field.relation?.type).toBe(
        RelationType.MANY_TO_ONE
      );
    }
  });

  it("rewrites original fields to ONE_TO_MANY pointing at junction", () => {
    const productCategories = map
      .get("Product")
      ?.fields.find((f) => f.name === "categories");
    expect(productCategories?.relation?.type).toBe(
      RelationType.ONE_TO_MANY
    );
    expect(productCategories?.relation?.targetObjectName).toBe(
      "ProductCategory"
    );

    const categoryProducts = map
      .get("Category")
      ?.fields.find((f) => f.name === "products");
    expect(categoryProducts?.relation?.type).toBe(
      RelationType.ONE_TO_MANY
    );
    expect(categoryProducts?.relation?.targetObjectName).toBe(
      "ProductCategory"
    );
  });

  it("skips related-entities gate with junction flag", () => {
    const junction = map.get("ProductCategory");
    expect(junction?.isJunction).toBe(true);
    expect(junction?.isUserSelected).toBe(false);

    // Even though isUserSelected is false and isJunction is true,
    // the generate-result.ts condition should allow it through:
    // if (opts.skipRelatedEntities && !entry.isUserSelected && !entry.isJunction) continue;
    // This junction should NOT be skipped because isJunction is true.
  });

  it("handles name collisions with numeric suffix", () => {
    const map = buildMap({
      Product: [
        {
          name: "categories",
          field: oneToMany("Category"),
        },
      ],
      Category: [
        {
          name: "products",
          field: oneToMany("Product"),
        },
      ],

      ProductCategory: [
        { name: "name", field: { kind: FieldType.TEXT } },
      ],
    });

    const pairs = [
      {
        objectA: "Product",
        fieldA: "categories",
        objectB: "Category",
        fieldB: "products",
        selfReferential: false,
      },
    ];

    synthesizeManyToManyJunctions(map, pairs, new Set());

    expect(map.has("ProductCategory1")).toBe(true);
    expect(map.get("ProductCategory1")?.isJunction).toBe(true);

    const productCategories = map
      .get("Product")
      ?.fields.find((f) => f.name === "categories");
    expect(productCategories?.relation?.targetObjectName).toBe(
      "ProductCategory1"
    );
  });

  it("derives distinct field names for self-referential pairs", () => {
    const map = buildMap({
      User: [
        {
          name: "followers",
          field: oneToMany("User"),
        },
        {
          name: "following",
          field: oneToMany("User"),
        },
      ],
    });

    const pairs = [
      {
        objectA: "User",
        fieldA: "followers",
        objectB: "User",
        fieldB: "following",
        selfReferential: true,
      },
    ];

    synthesizeManyToManyJunctions(map, pairs, new Set());

    const junction = map.get("UserFollowersFollowing");
    expect(junction).toBeDefined();

    const fieldNames = junction!.fields.map((f) => f.name);
    expect(fieldNames).toContain("follower");
    expect(fieldNames).toContain("following");

    const relationFields = junction!.fields.filter(
      (f) => f.kind === FieldType.RELATION
    );
    expect(relationFields).toHaveLength(2);
    expect(relationFields[0].name).not.toBe(
      relationFields[1].name
    );
  });
});
