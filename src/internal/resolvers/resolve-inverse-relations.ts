import { plural, singular } from "pluralize";
import {
  FieldType,
  OnDeleteAction,
  RelationType,
} from "twenty-sdk/define";
import type {
  IRField,
  IRFieldRelation,
  ObjectsMap,
} from "../types.js";
import { toCamelCase } from "../utils/case-transformation.js";

const inverseType = (type: RelationType): RelationType =>
  type === RelationType.MANY_TO_ONE
    ? RelationType.ONE_TO_MANY
    : RelationType.MANY_TO_ONE;

const isInverseCandidate = (
  field: IRField,
  wantType: RelationType,
  objectName: string
): boolean =>
  field.kind === FieldType.RELATION &&
  field.relation?.type === wantType &&
  field.relation.targetObjectName === objectName;

// mutate objectsMap: inject missing reverse-side relation field on target object
export function resolveInverseRelations(
  objectsMap: ObjectsMap
): void {
  for (const [objectName, entry] of objectsMap) {
    for (const field of [...entry.fields]) {
      if (field.kind !== FieldType.RELATION || !field.relation)
        continue;

      const relation = field.relation;
      const targetEntry = objectsMap.get(
        relation.targetObjectName
      );
      if (!targetEntry) continue; // target not in map, unresolved

      const wantType = inverseType(relation.type);

      // Named pairing — relation already knows which field on the target
      // it's paired with (e.g. junction fields set this explicitly).
      if (relation.inverseFieldName) {
        const named = targetEntry.fields.find(
          (f) => f.name === relation.inverseFieldName
        );

        if (
          named &&
          isInverseCandidate(named, wantType, objectName)
        ) {
          continue; // already exists
        }

        targetEntry.fields.push({
          name: relation.inverseFieldName,
          kind: FieldType.RELATION,
          relation: {
            type: wantType,
            onDelete: OnDeleteAction.CASCADE,
            targetObjectName: objectName,
            targetFieldName: "id",
            inverseFieldName: field.name,
          },
        });
        continue;
      }

      // Unnamed pairing — any candidate not already claimed by a named
      // pairing satisfies this relation.
      const hasInverse = targetEntry.fields.some(
        (f) =>
          isInverseCandidate(f, wantType, objectName) &&
          !f.relation?.inverseFieldName
      );
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

      targetEntry.fields.push({
        name: inverseName,
        kind: FieldType.RELATION,
        relation: inverseRelation,
      });
    }
  }
}
