import { IRFieldOption } from "../types.js";
import { toTitleCase } from "../utils/case-transformation.js";

export function createFieldOptions(
  values: Array<string>
): Array<IRFieldOption> {
  return values.map((value, position) => ({
    value,
    label: toTitleCase(value),
    position,
    color: "gray",
  }));
}
