import type { ObjectMapEntry } from "../types.js";

import dedent from "ts-dedent";

import { v4 } from "uuid";
import { toUidVarName } from "../utils/to-uid-var-name.js";
import { fieldUidVarNames } from "../utils/fields.js";
import { toImportStatement } from "../utils/to-import-statement.js";

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

  entry.fields.forEach((field, position) => {
    const fieldUidVarName = toUidVarName(field.name, "FIELD");
    viewFields += getFieldString(position, fieldUidVarName);
    viewFields += fieldSeperator;
  });

  viewFields = viewFields.trimEnd();

  return {
    fieldMetadataUidsImportStatement,
    viewFields,
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
