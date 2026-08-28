// src/internal/resolvers/resolve-relation-refs.ts
import { FieldType, RelationType } from "twenty-sdk/define";
import type { IRField, ObjectsMap } from "../types.js";
import { toUidVarName } from "../utils/to-uid-var-name.js";

export type RelationRef = {
  targetContantFilePath: string;
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

// find target object's UID + its inverse field's UID, for cross-file import
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
  if (!inverseField) return undefined; // run resolveInverseRelations first

  return {
    targetObjectUidVarName: toUidVarName(
      targetEntry.objectNodeName,
      "OBJECT"
    ),
    targetContantFilePath: targetEntry.results.constant.filePath,
    targetObjectFilePath: targetEntry.results.object.filePath,
    targetObjectName: targetEntry.objectNodeName,
    targetObjectFileName: targetEntry.results.object.fileName,
    inverseFieldUidVarName: toUidVarName(
      inverseField.name,
      "FIELD"
    ),
  };
}
