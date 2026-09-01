import type { ObjectMapEntry } from "../types.js";
import { FieldType } from "twenty-sdk/define";
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
  const viewableFields = entry.fields.filter(
    (field) =>
      field.name !== "id" &&
      field.kind !== FieldType.RELATION &&
      field.kind !== FieldType.MORPH_RELATION
  );

  const fieldMetadataUidsImportStatement = toImportStatement(
    entry.results.object.filePath,
    entry.results.view.filePath,
    ...fieldUidVarNames(viewableFields)
  );

  let viewFields: string = "";
  const seed = getCliOptions().seed;

  viewableFields.forEach((field, position) => {
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

  return { fieldMetadataUidsImportStatement, viewFields };
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
