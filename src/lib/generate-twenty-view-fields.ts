import dedent from "ts-dedent";
import { v4 } from "uuid";
import type { IRField } from "./types.js";
import { toUidVarName } from "./utils/to-uid-var-name.js";
import { fieldUidVarNames } from "./utils/fields.js";
import { toKebabCase } from "./utils/case-transformation.js";

export function generateTwentyViewFields(
  objectName: string,
  fields: Array<IRField>,
): {
  fieldMetadataUidsImportStatement: string;
  viewFields: string;
} {
  const objectPath = `../objects/${toKebabCase(objectName)}.object`;

  const fieldMetadataUidsImportStatement = dedent`
    import {
      ${toUidVarName(objectName, "OBJECT")},

      ${fieldUidVarNames(fields).join(",\n")};
    } from "${objectPath}";`;

  let viewFields: Array<string> = [];

  fields.forEach((field, idx) => {
    viewFields.push(
      dedent`{
        universalIdentifier: "${v4()}",
        fieldMetadataUniversalIdentifier: ${toUidVarName(field.name, "FIELD")},
        position: ${idx},
        isVisible: true,
        size: 200,
      }`,
    );
  });

  return {
    fieldMetadataUidsImportStatement,
    viewFields: viewFields.join(",\n"),
  };
}
