import dedent from "ts-dedent";
import { v4 } from "uuid";
import type { IRField } from "./types.js";
import { toUidVarName } from "./utils/to-uid-var-name.js";
import { fieldUidVarNames } from "./utils/fields.js";
import path from "node:path";

export function generateTwentyViewFields(
  objectUidVarName: string,
  objectFilePath: string,
  viewFilePath: string,
  fields: Array<IRField>
): {
  fieldMetadataUidsImportStatement: string;
  viewFields: string;
} {
  const fromDir = path.dirname(viewFilePath);
  const objectFileRealtivePath = path.relative(
    fromDir,
    objectFilePath
  );

  const fieldMetadataUidsImportStatement = dedent`
    import {
      ${objectUidVarName},

      ${fieldUidVarNames(fields).join(",\n")},
    } from "${objectFileRealtivePath}";`;

  let viewFields: Array<string> = [];

  fields.forEach((field, idx) => {
    viewFields.push(
      dedent`{
        universalIdentifier: "${v4()}",
        fieldMetadataUniversalIdentifier: ${toUidVarName(
          field.name,
          "FIELD"
        )},
        position: ${idx},
        isVisible: true,
        size: 200,
      }`
    );
  });

  return {
    fieldMetadataUidsImportStatement,
    viewFields: viewFields.join(",\n"),
  };
}
