import { FieldType, RelationType } from "twenty-sdk/define";
import type { IRField, ObjectsMap } from "../types.js";
import { toUidVarName } from "../utils/to-uid-var-name.js";

export type RelationRef = {
  targetObjectUidVarName: string;
  targetObjectFilePath: string;
  inverseFieldUidVarName: string;
  targetObjectName: string;
  targetObjectFileName: string;
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

  const inverseField = targetEntry.fields.find(
    (f) =>
      f.kind === FieldType.RELATION &&
      f.relation?.type === wantType &&
      f.relation.targetObjectName === objectName
  );

  if (!inverseField) return undefined;

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
  };
}
