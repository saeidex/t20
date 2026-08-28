import { dedent } from "ts-dedent";
import { FieldType } from "twenty-sdk/define";
import { toTitleCase } from "../utils/case-transformation.js";
import type { ObjectsMap } from "../types.js";
import { toUidVarName } from "../utils/to-uid-var-name.js";
import { generateTwentyObjectFields } from "./generate-twenty-object-fields.js";
import { toImportStatement } from "../utils/to-import-statement.js";

export function generateTwentyObject(
  objectNodeName: string,
  objectsMap: ObjectsMap
): string {
  const objectEntry = objectsMap.get(objectNodeName);
  if (!objectEntry) {
    throw new Error(
      `Object with node name "${objectNodeName}" not found in objectsMap.`
    );
  }

  const {
    fieldObjects,
    fieldUidVarDeclarations,
    relationImportStatements,
  } = generateTwentyObjectFields(objectEntry, objectsMap);

  const objectUidVarName = toUidVarName(
    objectNodeName,
    "OBJECT"
  );
  const objectUidImportStatement = toImportStatement(
    objectEntry.results.constant.filePath,
    objectEntry.results.object.filePath,
    objectUidVarName
  );

  const hasRelations = objectEntry.fields.some(
    (f) => f.kind === FieldType.RELATION
  );

  const output = dedent`
    import { defineObject, FieldType${
      hasRelations ? ", RelationType, OnDeleteAction" : ""
    } } from "twenty-sdk/define";
    ${objectUidImportStatement}
    ${relationImportStatements}

    ${fieldUidVarDeclarations}

    export default defineObject({
      universalIdentifier: ${objectUidVarName},
      nameSingular: "${objectEntry.objectSingularName}",
      namePlural: "${objectEntry.objectPluralName}",
      labelSingular: "${toTitleCase(
        objectEntry.objectSingularName
      )}",
      labelPlural: "${toTitleCase(
        objectEntry.objectPluralName
      )}",
      icon: "IconBox",
      fields: [
        ${fieldObjects}
      ],
    });
    `;

  return output;
}
