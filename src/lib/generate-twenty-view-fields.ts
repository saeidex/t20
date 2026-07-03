import dedent from "ts-dedent";
import { v4 } from "uuid";
import type { IRField } from "./types.js";
import { toUidVarName } from "./utils/to-uid-var-name.js";
import { fieldUidVarNames } from "./utils/fields.js";
import path from "node:path";
import { FieldType } from "twenty-sdk/define";

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
  const { dir, name } = path.parse(
    path.relative(fromDir, objectFilePath)
  );
  const objectFileImportPath = `${dir}/${name}`;

  const fieldMetadataUidsImportStatement = dedent`
    import {
      ${objectUidVarName},

      ${fieldUidVarNames(fields).join(",\n")},
    } from "${objectFileImportPath}";`;

  let viewFields: Array<string> = [];
  let labelField: string = "";
  let islabelFieldExists = false;

  fields.forEach((field, idx) => {
    const fieldUidVarName = toUidVarName(field.name, "FIELD");

    if (!islabelFieldExists && field.kind == FieldType.TEXT) {
      labelField = getFieldString(0, fieldUidVarName);
      islabelFieldExists = true;
    } else {
      idx = islabelFieldExists ? idx : idx + 1;
      viewFields.push(getFieldString(idx, fieldUidVarName));
    }
  });

  return {
    fieldMetadataUidsImportStatement,
    viewFields: [labelField, ...viewFields].join(",\n"),
  };
}

function getFieldString(idx: number, fieldUidVarName: string) {
  return dedent`{
           universalIdentifier: "${v4()}",
           fieldMetadataUniversalIdentifier: ${fieldUidVarName},
           position: ${idx},
           isVisible: true,
           size: 200,
         }`;
}
