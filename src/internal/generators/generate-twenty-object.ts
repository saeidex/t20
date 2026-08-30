import { dedent } from "ts-dedent";
import { FieldType } from "twenty-sdk/define";
import { toTitleCase } from "../utils/case-transformation.js";
import type { IRField, ObjectsMap } from "../types.js";
import { generateTwentyObjectFields } from "./generate-twenty-object-fields.js";
import { toUidVarStatement } from "../utils/to-uid-var-statement.js";

export function generateTwentyObject(
  objectNodeName: string,
  objectsMap: ObjectsMap
): string {
  const entry = objectsMap.get(objectNodeName);
  if (!entry) {
    throw new Error(
      `Object with node name "${objectNodeName}" not found in objectsMap.`
    );
  }

  const {
    fieldObjects,
    fieldUidVarDeclarations,
    relationImportStatements,
  } = generateTwentyObjectFields(entry, objectsMap);

  const objectUidVar = entry.results.object.uidVarName;

  const varDeclarationStatement =
    toUidVarStatement(objectUidVar);

  const hasRelations = entry.fields.some(
    (f) => f.kind === FieldType.RELATION
  );

  const importContent = hasRelations
    ? dedent`{
        defineObject,
        FieldType,
        RelationType,
        OnDeleteAction,
      }\n`
    : "{ defineObject, FieldType }";

  const enumDeclarations = serializeEnumDeclarations(
    entry.fields
  );

  const output = dedent`
    import ${importContent} from "twenty-sdk/define";
    ${relationImportStatements}
    ${enumDeclarations}
    ${varDeclarationStatement}

    ${fieldUidVarDeclarations}

    export default defineObject({
      universalIdentifier: ${objectUidVar},
      nameSingular: "${entry.objectSingularName}",
      namePlural: "${entry.objectPluralName}",
      labelSingular: "${toTitleCase(entry.objectSingularName)}",
      labelPlural: "${toTitleCase(entry.objectPluralName)}",
      icon: "IconBox",
      fields: [
        ${fieldObjects}
      ],
    });
    `;

  return output;
}

function serializeEnumDeclarations(
  fields: Array<IRField>
): string {
  const seen = new Set<string>();
  const blocks: Array<string> = [];

  for (const field of fields) {
    const meta = field.enumMeta;
    if (!meta || seen.has(meta.enumName)) continue;
    seen.add(meta.enumName);

    const members = meta.members
      .map((m) => `  ${m.memberName} = "${m.value}",`)
      .join("\n");

    blocks.push(`enum ${meta.enumName} {\n${members}\n}`);
  }

  if (blocks.length === 0) {
    return "";
  }

  return `\n ${blocks.join("\n\n")} \n`;
}
