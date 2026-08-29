import { FieldType } from "twenty-sdk/define";
import { styleText } from "node:util";
import type {
  IRField,
  FieldOption,
  ObjectsMap,
  ObjectMapEntry,
  IREnumMeta,
} from "../types.js";
import {
  toCamelCase,
  toTitleCase,
} from "../utils/case-transformation.js";
import { toUidVarName } from "../utils/to-uid-var-name.js";
import { fieldUidVarStatements } from "../utils/fields.js";
import { toImportStatement } from "../utils/to-import-statement.js";
import { resolveRelationRef } from "../resolvers/resolve-relation-refs.js";

const indent = (lines: Array<string>, spaces: number) =>
  lines
    .map((line) => (line ? " ".repeat(spaces) + line : ""))
    .join("\n");

const serializeOptions = (
  opts: Array<FieldOption> = [],
  enumMeta?: IREnumMeta
): string => {
  if (!opts.length) return "";

  const items = opts
    .map((o, i) => {
      const member = enumMeta?.members[i];
      const valueExpr = member
        ? `${enumMeta!.enumName}.${member.memberName}`
        : `"${o.value}"`;

      return indent(
        [
          `{`,
          `  value: ${valueExpr},`,
          `  label: "${o.label}",`,
          `  position: ${o.position},`,
          `  color: "${o.color}",`,
          `},`,
        ],
        4
      );
    })
    .join("\n");

  return `,\n  options: [\n${items}\n  ]`;
};

const serializeRelation = (
  relation: NonNullable<IRField["relation"]>,
  relationRef: ReturnType<typeof resolveRelationRef> & {}
): string => {
  return [
    `,`,
    `  relationTargetObjectMetadataUniversalIdentifier:`,
    `    ${relationRef!.targetObjectUidVarName},`,
    `  relationTargetFieldMetadataUniversalIdentifier:`,
    `    ${toUidVarName("refId", "FIELD")},`,
    `  universalSettings: {`,
    `    relationType: RelationType.${relation.type},`,
    `    onDelete: OnDeleteAction.${relation.onDelete},`,
    `  }`,
  ].join("\n");
};

export function generateTwentyObjectFields(
  objectEntry: ObjectMapEntry,
  objectsMap: ObjectsMap
): {
  fieldUidVarDeclarations: string;
  fieldObjects: string;
  relationImportStatements: string;
} {
  const relationImports = new Set<string>();

  const fieldObjects = objectEntry.fields
    .map((field) => {
      let extra = "";

      if (field.kind === FieldType.RELATION && field.relation) {
        const relationRef = resolveRelationRef(
          objectsMap,
          objectEntry.objectNodeName,
          field
        );

        if (relationRef) {
          extra = serializeRelation(field.relation, relationRef);
          relationImports.add(
            toImportStatement(
              relationRef.targetObjectFilePath,
              objectEntry.results.object.filePath,
              relationRef.targetObjectUidVarName,
              `${toUidVarName("id", "FIELD")} as ${toUidVarName(
                "refId",
                "FIELD"
              )}`
            )
          );
        } else {
          console.warn(
            styleText(
              "yellow",
              `[WARNING]: No inverse field resolved for relation "${field.name}" -> run resolveInverseRelations first`
            )
          );
        }
      } else {
        extra = serializeOptions(field.options, field.enumMeta);
      }

      return indent(
        [
          `{`,
          `  universalIdentifier: ${toUidVarName(
            field.name,
            "FIELD"
          )},`,
          `  name: "${toCamelCase(field.name)}",`,
          `  label: "${toTitleCase(toTitleCase(field.name))}",`,
          `  type: FieldType.${field.kind}${extra},`,
          `},`,
        ],
        0
      );
    })
    .join("\n");

  return {
    fieldUidVarDeclarations: fieldUidVarStatements(
      objectEntry.fields
    ).join("\n"),
    fieldObjects,
    relationImportStatements: [...relationImports].join("\n"),
  };
}
