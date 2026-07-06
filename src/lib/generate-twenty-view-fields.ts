import type { IRField } from "./types.js";

import dedent from "ts-dedent";

import { v4 } from "uuid";
import { toUidVarName } from "./utils/to-uid-var-name.js";
import { fieldUidVarNames } from "./utils/fields.js";
import { FieldType } from "twenty-sdk/define";
import { toImportStatement } from "./utils/to-import-statement.js";

export function generateTwentyViewFields(
  objectFilePath: string,
  viewFilePath: string,
  fields: Array<IRField>
): {
  fieldMetadataUidsImportStatement: string;
  viewFields: string;
} {
  const fieldMetadataUidsImportStatement = toImportStatement(
    objectFilePath,
    viewFilePath,
    ...fieldUidVarNames(fields)
  );

  let viewFields: Array<string> = [];
  let labelField: string = "";
  let islabelFieldExists = false;
  let position = 0;

  fields.forEach((field) => {
    const fieldUidVarName = toUidVarName(field.name, "FIELD");

    if (!islabelFieldExists && field.kind === FieldType.TEXT) {
      labelField = getFieldString(0, fieldUidVarName);
      islabelFieldExists = true;
      return;
    }

    position += 1;
    viewFields.push(getFieldString(position, fieldUidVarName));
  });

  return {
    fieldMetadataUidsImportStatement,
    viewFields: (islabelFieldExists
      ? [labelField, ...viewFields]
      : viewFields
    ).join(",\n"),
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
