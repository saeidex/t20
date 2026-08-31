import { expect, test } from "vitest";
import { deriveUuid } from "./derive-uuid.js";

const UUID_V5_SHAPE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

test("deriveUuid :: deterministic for same seed", () => {
  const a = deriveUuid(
    "workspace:PRODUCT_OBJECT_UNIVERSAL_IDENTIFIER"
  );
  const b = deriveUuid(
    "workspace:PRODUCT_OBJECT_UNIVERSAL_IDENTIFIER"
  );

  expect(a).toBe(b);
});

test("deriveUuid :: distinct for different seeds", () => {
  const a = deriveUuid(
    "workspace-a:PRODUCT_OBJECT_UNIVERSAL_IDENTIFIER"
  );
  const b = deriveUuid(
    "workspace-b:PRODUCT_OBJECT_UNIVERSAL_IDENTIFIER"
  );

  expect(a).not.toBe(b);
});

test("deriveUuid :: distinct for different keys, same workspace", () => {
  const a = deriveUuid(
    "workspace:PRODUCT_OBJECT_UNIVERSAL_IDENTIFIER"
  );
  const b = deriveUuid(
    "workspace:CATEGORY_OBJECT_UNIVERSAL_IDENTIFIER"
  );

  expect(a).not.toBe(b);
});

test("deriveUuid :: output matches UUIDv5 shape (version + variant nibbles)", () => {
  const inputs = [
    "workspace:NAME_FIELD_UNIVERSAL_IDENTIFIER",
    "",
    "a",
    "a-very-long-seed-string-with:multiple:colons:and-parts",
  ];

  for (const seed of inputs) {
    expect(deriveUuid(seed)).toMatch(UUID_V5_SHAPE);
  }
});

test("deriveUuid :: 36-character canonical UUID format", () => {
  const id = deriveUuid(
    "workspace:ORDER_ITEM_OBJECT_UNIVERSAL_IDENTIFIER"
  );

  expect(id).toHaveLength(36);
  expect(id.split("-").map((seg) => seg.length)).toEqual([
    8, 4, 4, 4, 12,
  ]);
});

test("deriveUuid :: namespacing prevents collision across objects sharing a field name", () => {
  // regression: same var name ("NAME_FIELD_UNIVERSAL_IDENTIFIER") must not
  // collide across two different owning objects once namespaced by object name
  const productName = deriveUuid(
    "workspace:Product:NAME_FIELD_UNIVERSAL_IDENTIFIER"
  );
  const categoryName = deriveUuid(
    "workspace:Category:NAME_FIELD_UNIVERSAL_IDENTIFIER"
  );

  expect(productName).not.toBe(categoryName);
});
