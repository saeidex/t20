import {
  FieldType,
  OnDeleteAction,
  RelationType,
} from "twenty-sdk/define";
import { plural, singular } from "pluralize";
import type { ObjectsMap } from "../types.js";
import { toCamelCase } from "../utils/case-transformation.js";

const inverseType = (type: RelationType): RelationType =>
  type === RelationType.MANY_TO_ONE
    ? RelationType.ONE_TO_MANY
    : RelationType.MANY_TO_ONE;

// mutate objectsMap: inject missing reverse-side relation field on target object
export function resolveInverseRelations(
  objectsMap: ObjectsMap
): void {
  for (const [objectName, entry] of objectsMap) {
    for (const field of [...entry.fields]) {
      if (field.kind !== FieldType.RELATION || !field.relation)
        continue;

      const targetEntry = objectsMap.get(
        field.relation.targetObjectName
      );
      if (!targetEntry) continue; // target not in map, unresolved

      const wantType = inverseType(field.relation.type);

      const hasInverse = targetEntry.fields.some(
        (f) =>
          f.kind === FieldType.RELATION &&
          f.relation?.type === wantType &&
          f.relation.targetObjectName === objectName
      );
      if (hasInverse) continue;

      const inverseName =
        wantType === RelationType.ONE_TO_MANY
          ? toCamelCase(plural(objectName))
          : toCamelCase(singular(objectName));

      targetEntry.fields.push({
        name: inverseName,
        kind: FieldType.RELATION,
        relation: {
          type: wantType,
          onDelete: OnDeleteAction.SET_NULL,
          targetObjectName: objectName,
        },
      });
    }
  }
}
