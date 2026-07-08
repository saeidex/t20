import { FieldOption } from "../types.js";
import { toTitleCase } from "../utils/case-transformation.js";

export function createFieldOptions(
  values: Array<string>
): Array<FieldOption> {
  return values.map((value, position) => ({
    value,
    label: toTitleCase(value),
    position,
    color: "gray",
  }));
}
