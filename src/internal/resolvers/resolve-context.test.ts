import { expect, test } from "vitest";
import { resolveContext } from "./resolve-context-deprecated.js";
import { CliOptions } from "../create-cli.js";
import { ObjectName } from "../user-prompts.js";

test("multiple objects", () => {
  const input = {
    opts: {
      output: "src",
      objectsDir: "objects",
      viewsDir: "views",
      navMenuItemsDir: "navigation-menu-items",
    } as CliOptions,
    objectNames: [
      {
        objectName: "product",
        singular: "product",
        plural: "products",
      },
      {
        objectName: "brand",
        singular: "brand",
        plural: "brands",
      },
    ],
  };
  const expectedOutput = {
    names: {
      objects: [
        {
          objectName: "product",
          singular: "product",
          plural: "products",
          output: "product",
        },
        {
          objectName: "brand",
          singular: "brand",
          plural: "brands",
          output: "brand",
        },
      ],
      views: ["All product items", "All brand items"],
      navMenuItems: ["product", "brand"],
    },
    paths: {
      objects: [
        "src/objects/product.object.ts",
        "src/objects/brand.object.ts",
      ],
      views: [
        "src/views/product.view.ts",
        "src/views/brand.view.ts",
      ],
      navMenuItems: [
        "src/navigation-menu-items/product.navigation-menu-item.ts",
        "src/navigation-menu-items/brand.navigation-menu-item.ts",
      ],
    },
  };

  const names: Map<string, ObjectName> = new Map();
  input.objectNames.forEach((v) => {
    names.set(v.objectName, v);
  });

  const actualOutput = resolveContext(input.opts, names);

  expect(actualOutput).toStrictEqual(expectedOutput);
});
