import { expect, test } from "vitest";
import { resolveContext } from "./resolve-context.js";

test("multiple objects", () => {
  const input = {
    root: "src",
    objectNames: [
      { singular: "product", plural: "products" },
      { singular: "brand", plural: "brands" },
    ],
  };
  const expectedOutput = {
    names: {
      constants: ["product", "brand"],
      objects: ["product", "brand"],
      views: ["All products", "All brands"],
      navMenuItems: ["Products", "Brands"],
    },
    paths: {
      constants: [
        "src/constants/product.constants.ts",
        "src/constants/brand.constants.ts",
      ],
      objects: [
        "src/objects/product.object.ts",
        "src/objects/brand.object.ts",
      ],
      views: [
        "src/views/all-products-view.ts",
        "src/views/all-brands-view.ts",
      ],
      navMenuItems: [
        "src/navigation-menu-items/products-navigation-menu-item.ts",
        "src/navigation-menu-items/brands-navigation-menu-item.ts",
      ],
    },
  };

  const actualOutput = resolveContext(
    input.root,
    input.objectNames
  );

  expect(actualOutput).toStrictEqual(expectedOutput);
});
