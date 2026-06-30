import { expect, test } from "vitest";
import {
  toObjectFileName,
  toViewFileName,
  toViewName,
} from "./to-names.js";

test("toViewName", () => {
  expect(toViewName("orderItems")).toBe("All order items");
});

test("toViewFileName", () => {
  expect(toViewFileName("orderItems")).toBe(
    "all-order-items-view.ts"
  );
});

test("toObjectFileName", () => {
  expect(toObjectFileName("orderItems")).toBe(
    "order-items.object.ts"
  );
});
