import type { IRField, IRFieldOption } from "./types.js";
import {
  toCamelCase,
  toTitleCase,
} from "./utils/case-transformation.js";
import { toUidVarName } from "./utils/to-uid-var-name.js";
import { fieldUidVarStatements } from "./utils/fields.js";

const indent = (lines: Array<string>, spaces: number) =>
  lines
    .map((line) => (line ? " ".repeat(spaces) + line : ""))
    .join("\n");

const serializeOptions = (
  opts: Array<IRFieldOption> = []
): string => {
  if (!opts.length) return "";

  const items = opts
    .map((o) =>
      indent(
        [
          `{`,
          `  value: "${o.value}",`,
          `  label: "${o.label}",`,
          `  position: ${o.position},`,
          `  color: "${o.color}",`,
          `},`,
        ],
        4
      )
    )
    .join("\n");

  return `,\n  options: [\n${items}\n  ]`;
};

export function generateTwentyObjectFields(
  fields: Array<IRField>
): {
  fieldUidVarDeclarations: string;
  fieldObjects: string;
} {
  const fieldObjects = fields
    .map((field) =>
      indent(
        [
          `{`,
          `  universalIdentifier: ${toUidVarName(
            field.name,
            "FIELD"
          )},`,
          `  name: "${toCamelCase(field.name)}",`,
          `  label: "${toTitleCase(toTitleCase(field.name))}",`,
          `  type: FieldType.${field.kind}${serializeOptions(
            field.options
          )},`,
          `},`,
        ],
        0
      )
    )
    .join("\n");

  return {
    fieldUidVarDeclarations:
      fieldUidVarStatements(fields).join("\n"),
    fieldObjects,
  };
}
