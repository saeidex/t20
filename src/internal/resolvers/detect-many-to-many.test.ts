import { FieldType } from "twenty-sdk/define";
import { expect, test } from "vitest";
import { detectManyToManyPairs } from "./detect-many-to-many.js";
import { buildMap, oneToMany } from "../../__tests__/utils.js";

test("mutual array fields -> one pair", () => {
  const map = buildMap({
    Product: [
      { name: "categories", field: oneToMany("Category") },
    ],
    Category: [
      { name: "products", field: oneToMany("Product") },
    ],
  });

  expect(detectManyToManyPairs(map)).toEqual([
    {
      objectA: "Product",
      fieldA: "categories",
      objectB: "Category",
      fieldB: "products",
      selfReferential: false,
    },
  ]);
});

test("one-sided array -> no false positive", () => {
  const map = buildMap({
    Product: [
      { name: "categories", field: oneToMany("Category") },
    ],
    Category: [
      { name: "name", field: { kind: FieldType.TEXT } },
    ],
  });

  const pairs = detectManyToManyPairs(map);
  expect(pairs).toHaveLength(0);
  expect(pairs).toEqual([]);
});

test("self-referential -> one pair, distinct fields", () => {
  const map = buildMap({
    User: [
      { name: "following", field: oneToMany("User") },
      { name: "followers", field: oneToMany("User") },
    ],
  });

  const pairs = detectManyToManyPairs(map);
  expect(pairs).toHaveLength(1);
  expect(pairs[0].selfReferential).toBe(true);
});
