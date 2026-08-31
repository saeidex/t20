import { FieldType, RelationType } from "twenty-sdk/define";
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
import { getCliOptions } from "../create-cli.js";

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
  relationRef: ReturnType<typeof resolveRelationRef> & {},
  targetFieldUid: string,
  joinColumnName?: string
): string => {
  const settingsLines = [
    `    relationType: RelationType.${relation.type},`,
  ];

  if (relation.type === RelationType.MANY_TO_ONE) {
    settingsLines.push(
      `    onDelete: OnDeleteAction.${relation.onDelete},`
    );
    if (joinColumnName) {
      settingsLines.push(
        `    joinColumnName: "${joinColumnName}",`
      );
    }
  }

  return [
    `,`,
    `  relationTargetObjectMetadataUniversalIdentifier:`,
    `    ${relationRef!.targetObjectUidVarName},`,
    `  relationTargetFieldMetadataUniversalIdentifier:`,
    `    ${targetFieldUid},`,
    `  universalSettings: {`,
    ...settingsLines,
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
  const cliSeed = getCliOptions().seed;
  const fieldSeed = cliSeed
    ? `${cliSeed}:${objectEntry.objectNodeName}`
    : undefined;

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
          const targetFieldUid = toUidVarName(
            `${objectEntry.objectNodeName}_${field.name}`,
            "RELATION_FIELD"
          );
          const joinColumnName =
            field.relation.type === RelationType.MANY_TO_ONE
              ? `${toCamelCase(field.name)}Id`
              : undefined;

          extra = serializeRelation(
            field.relation,
            relationRef,
            targetFieldUid,
            joinColumnName
          );

          relationImports.add(
            toImportStatement(
              relationRef.targetObjectFilePath,
              objectEntry.results.object.filePath,
              relationRef.targetObjectUidVarName,
              `${relationRef.inverseFieldUidVarName} as ${targetFieldUid}`
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
      objectEntry.fields,
      fieldSeed
    ).join("\n"),
    fieldObjects,
    relationImportStatements: [...relationImports].join("\n"),
  };
}
