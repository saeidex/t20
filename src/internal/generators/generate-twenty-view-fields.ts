import type { ObjectMapEntry } from "../types.js";

import dedent from "ts-dedent";

import { v4 } from "uuid";
import { toUidVarName } from "../utils/to-uid-var-name.js";
import { fieldUidVarNames } from "../utils/fields.js";
import { FieldType } from "twenty-sdk/define";
import { toImportStatement } from "../utils/to-import-statement.js";
// import { styleText } from "node:util";

const fieldSeperator = ",\n";

export function generateTwentyViewFields(
  entry: ObjectMapEntry
): {
  fieldMetadataUidsImportStatement: string;
  viewFields: string;
} {
  const fieldMetadataUidsImportStatement = toImportStatement(
    entry.results.object.filePath,
    entry.results.view.filePath,
    ...fieldUidVarNames(entry.fields)
  );

  let viewFields: string = "";
  let labelField: string = "";
  let islabelFieldExists = false;
  let position = 0;

  entry.fields.forEach((field) => {
    const fieldUidVarName = toUidVarName(field.name, "FIELD");

    if (!islabelFieldExists && field.kind === FieldType.TEXT) {
      labelField = getFieldString(0, fieldUidVarName);
      islabelFieldExists = true;
      return;
    }

    position += 1;
    viewFields += getFieldString(position, fieldUidVarName);
    viewFields += fieldSeperator;
  });

  viewFields = viewFields.trimEnd();
  entry.results.view.hasLabelField = islabelFieldExists;

  if (!islabelFieldExists) {
    labelField = dedent`
      // @ts-expect-error No label field found!
      // :: Position 0 is reserved for the label field.
      // :: Please add a text field to your object to be used as the label field.`;
    // console.error(
    //   styleText(
    //     "red",
    //     dedent`
    //       |
    //       |  [ERROR]: No label field found: ${entry.results.view.filePath}.
    //       |           Please add a text field to your object to be used as the label field.`
    //   )
    // );
  }

  const labelFieldSeperator = islabelFieldExists
    ? fieldSeperator
    : "\n";

  return {
    fieldMetadataUidsImportStatement,
    viewFields: labelField + labelFieldSeperator + viewFields,
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
