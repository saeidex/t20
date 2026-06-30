import { expect, test } from "vitest";
import {
  toCamelCase,
  toKebabCase,
  toTitleCase,
  toSnakeCase,
} from "./case-transformation.js";

test("toTitleCase", () => {
  const input = ["orderItems", "order_items", "order-items"];
  const output_one = "Order items";
  const output_two = "Order Items";

  for (const i of input) {
    expect(toTitleCase(i)).toBe(output_one);
    expect(toTitleCase(i, true)).toBe(output_two);
  }
});

test("toKebabCase", () => {
  const input = ["orderItems", "order_items", "order-items"];
  const output = "order-items";

  for (const i of input) {
    expect(toKebabCase(i)).toBe(output);
  }
});

test("toCamelCase", () => {
  const input = ["orderItems", "order_items", "order-items"];
  const output = "orderItems";

  for (const i of input) {
    expect(toCamelCase(i)).toBe(output);
  }
});

test("toSnakeCase", () => {
  const input = ["orderItems", "order_items", "order-items"];
  const output = "order_items";

  for (const i of input) {
    expect(toSnakeCase(i)).toBe(output);
  }
});
