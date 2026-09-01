import { FieldType, RelationType } from "twenty-sdk/define";
import type { ObjectsMap } from "../types.js";

export type ManyToManyPair = {
  objectA: string;
  fieldA: string;
  objectB: string;
  fieldB: string;
  selfReferential: boolean;
};

export function detectManyToManyPairs(
  objectsMap: ObjectsMap
): Array<ManyToManyPair> {
  const pairs: Array<ManyToManyPair> = [];
  const seen = new Set<string>();

  for (const [objectA, entryA] of objectsMap) {
    for (const fieldA of entryA.fields) {
      if (
        fieldA.kind !== FieldType.RELATION ||
        fieldA.relation?.type !== RelationType.ONE_TO_MANY
      ) {
        continue;
      }

      const objectB = fieldA.relation.targetObjectName;
      const entryB = objectsMap.get(objectB);
      if (!entryB) continue;

      for (const fieldB of entryB.fields) {
        if (
          fieldB.kind !== FieldType.RELATION ||
          fieldB.relation?.type !== RelationType.ONE_TO_MANY ||
          fieldB.relation.targetObjectName !== objectA
        ) {
          continue;
        }

        const selfReferential = objectA === objectB;
        if (selfReferential && fieldA.name === fieldB.name)
          continue;

        const key = selfReferential
          ? [objectA, fieldA.name, fieldB.name].sort().join("::")
          : [objectA, fieldA.name, objectB, fieldB.name]
              .sort()
              .join("::");

        if (seen.has(key)) continue;
        seen.add(key);

        pairs.push({
          objectA,
          fieldA: fieldA.name,
          objectB,
          fieldB: fieldB.name,
          selfReferential,
        });
      }
    }
  }

  return pairs;
}
