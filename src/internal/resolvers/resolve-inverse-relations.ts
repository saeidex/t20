import { plural, singular } from "pluralize";
import {
    FieldType,
    OnDeleteAction,
    RelationType,
} from "twenty-sdk/define";
import type { IRFieldRelation, ObjectsMap } from "../types.js";
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

      // Find candidate inverse fields
      const candidates = targetEntry.fields.filter(
        (f) =>
          f.kind === FieldType.RELATION &&
          f.relation?.type === wantType &&
          f.relation.targetObjectName === objectName
      );

      let hasInverse: boolean;
      if (field.relation.relationKey && candidates.length > 0) {
        // Use relationKey to disambiguate
        hasInverse = candidates.some(
          (f) => f.relation?.relationKey === field.relation?.relationKey
        );
      } else {
        // Fallback: check if any candidate exists
        hasInverse = candidates.length > 0;
      }

      if (hasInverse) continue;

      const inverseName =
        wantType === RelationType.ONE_TO_MANY
          ? toCamelCase(plural(objectName))
          : toCamelCase(singular(objectName));

      const inverseRelation: IRFieldRelation = {
        type: wantType,
        onDelete: OnDeleteAction.CASCADE,
        targetObjectName: objectName,
        targetFieldName: "id",
      };

      if (field.relation.relationKey) {
        inverseRelation.relationKey = field.relation.relationKey;
      }

      targetEntry.fields.push({
        name: inverseName,
        kind: FieldType.RELATION,
        relation: inverseRelation,
      });
    }
  }
}
