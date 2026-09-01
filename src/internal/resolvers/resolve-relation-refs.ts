import { FieldType, RelationType } from "twenty-sdk/define";
import type { IRField, ObjectsMap } from "../types.js";
import { toUidVarName } from "../utils/to-uid-var-name.js";

export type RelationRef = {
  targetObjectUidVarName: string;
  targetObjectFilePath: string;
  inverseFieldUidVarName: string;
  targetObjectName: string;
  targetObjectFileName: string;
  junctionTargetFieldUidVarName: string | undefined;
};

const inverseType = (type: RelationType): RelationType =>
  type === RelationType.MANY_TO_ONE
    ? RelationType.ONE_TO_MANY
    : RelationType.MANY_TO_ONE;

export function resolveRelationRef(
  objectsMap: ObjectsMap,
  objectName: string,
  field: IRField
): RelationRef | undefined {
  if (field.kind !== FieldType.RELATION || !field.relation) {
    return undefined;
  }

  const targetEntry = objectsMap.get(
    field.relation.targetObjectName
  );
  if (!targetEntry) return undefined;

  const wantType = inverseType(field.relation.type);
  const relation = field.relation;

  const inverseField = relation.inverseFieldName
    ? targetEntry.fields.find(
        (f) => f.name === relation.inverseFieldName
      )
    : targetEntry.fields.find(
        (f) =>
          f.kind === FieldType.RELATION &&
          f.relation?.type === wantType &&
          f.relation.targetObjectName === objectName
      );

  if (!inverseField) return undefined;

  const junctionTargetField = relation.junctionTargetFieldName
    ? targetEntry.fields.find(
        (f) => f.name === relation.junctionTargetFieldName
      )
    : undefined;

  return {
    targetObjectUidVarName: toUidVarName(
      targetEntry.objectNodeName,
      "OBJECT"
    ),
    targetObjectFilePath: targetEntry.results.object.filePath,
    targetObjectName: targetEntry.objectNodeName,
    targetObjectFileName: targetEntry.results.object.fileName,
    inverseFieldUidVarName: toUidVarName(
      inverseField.name,
      "FIELD"
    ),
    junctionTargetFieldUidVarName: junctionTargetField
      ? toUidVarName(junctionTargetField.name, "FIELD")
      : undefined,
  };
}
