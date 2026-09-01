import { expect, test } from "vitest";
import {
  toObjectFileName,
  toViewFileName,
  toViewName,
} from "./to-names.js";

test("toViewName", () => {
  expect(toViewName("orderItems")).toBe("All Order Items");
});

test("toViewFileName", () => {
  expect(toViewFileName("allOrderItem")).toBe(
    "all-order-item.view.ts"
  );
});

test("toObjectFileName", () => {
  expect(toObjectFileName("orderItem")).toBe(
    "order-item.object.ts"
  );
});
