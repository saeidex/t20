import type { ObjectMapEntry } from "../types.js";

import dedent from "ts-dedent";

import { v4 } from "uuid";
import { deriveUuid } from "../utils/derive-uuid.js";
import { getCliOptions } from "../create-cli.js";
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
  const seed = getCliOptions().seed;

  entry.fields.forEach((field, position) => {
    const fieldUidVarName = toUidVarName(field.name, "FIELD");
    const viewFieldUid = seed
      ? deriveUuid(
          `${seed}:${entry.objectNodeName}:view-field:${field.name}`
        )
      : v4();
    viewFields += getFieldString(
      position,
      fieldUidVarName,
      viewFieldUid
    );
    viewFields += fieldSeperator;
  });

  viewFields = viewFields.trimEnd();

  return {
    fieldMetadataUidsImportStatement,
    viewFields,
  };
}

function getFieldString(
  idx: number,
  fieldUidVarName: string,
  uid: string
) {
  return dedent`{
           universalIdentifier: "${uid}",
           fieldMetadataUniversalIdentifier: ${fieldUidVarName},
           position: ${idx},
           isVisible: true,
           size: 200,
         }`;
}
