import { singular } from "pluralize";
import {
  FieldType,
  OnDeleteAction,
  RelationType,
} from "twenty-sdk/define";
import type {
  IRField,
  ObjectsMap,
  RelationRecord,
} from "../types.js";
import {
  toCamelCase,
  toPascalCase,
} from "../utils/case-transformation.js";
import {
  toObjectNamePlural,
  toObjectNameSingular,
} from "../utils/to-names.js";
import { toResultsMap } from "../utils/to-results-map.js";
import type { ManyToManyPair } from "./detect-many-to-many.js";

function uniqueJunctionName(
  base: string,
  taken: Set<string>
): string {
  if (!taken.has(base)) return base;
  let serial = 1;
  while (taken.has(`${base}${serial}`)) serial += 1;
  return `${base}${serial}`;
}

function manyToOneField(
  name: string,
  targetObjectName: string,
  inverseFieldName: string
): IRField {
  return {
    name,
    kind: FieldType.RELATION,
    relation: {
      type: RelationType.MANY_TO_ONE,
      targetObjectName,
      targetFieldName: "id",
      onDelete: OnDeleteAction.CASCADE,
      inverseFieldName,
    },
  };
}

function replaceField(
  fields: Array<IRField>,
  name: string,
  next: IRField
): void {
  const index = fields.findIndex((f) => f.name === name);
  if (index === -1) {
    fields.push(next);
    return;
  }
  fields[index] = next;
}

function replaceRelation(
  relations: Array<RelationRecord>,
  columnNodeName: string,
  next: RelationRecord
): void {
  const index = relations.findIndex(
    (r) => r.columnNodeName === columnNodeName
  );
  if (index === -1) {
    relations.push(next);
    return;
  }
  relations[index] = next;
}

export function synthesizeManyToManyJunctions(
  objectsMap: ObjectsMap,
  pairs: Array<ManyToManyPair>,
  knownObjectNames: Set<string>
): void {
  const takenNames = new Set([
    ...knownObjectNames,
    ...objectsMap.keys(),
  ]);

  for (const pair of pairs) {
    const entryA = objectsMap.get(pair.objectA);
    const entryB = objectsMap.get(pair.objectB);
    if (!entryA || !entryB) continue;

    const baseName = pair.selfReferential
      ? `${toPascalCase(pair.objectA)}${toPascalCase(
          pair.fieldA
        )}${toPascalCase(pair.fieldB)}`
      : `${toPascalCase(pair.objectA)}${toPascalCase(
          pair.objectB
        )}`;
    const junctionNodeName = uniqueJunctionName(
      baseName,
      takenNames
    );
    takenNames.add(junctionNodeName);

    // junction's own field names pointing back to each side. self-referential
    // pairs derive from the original field names (can't both be
    // singular(objectA) — same object, would collide)
    const junctionFieldForA = pair.selfReferential
      ? toCamelCase(singular(pair.fieldA))
      : toCamelCase(singular(pair.objectA));
    const junctionFieldForB = pair.selfReferential
      ? toCamelCase(singular(pair.fieldB))
      : toCamelCase(singular(pair.objectB));

    const junctionPlural = toObjectNamePlural(junctionNodeName);
    const junctionSingular =
      toObjectNameSingular(junctionPlural);

    const fields: Array<IRField> = [
      { name: "name", kind: FieldType.TEXT },
      { name: "id", kind: FieldType.UUID },
      manyToOneField(
        junctionFieldForA,
        pair.objectA,
        pair.fieldA
      ),
      manyToOneField(
        junctionFieldForB,
        pair.objectB,
        pair.fieldB
      ),
    ];

    objectsMap.set(junctionNodeName, {
      objectNodeName: junctionNodeName,
      objectSingularName: junctionSingular,
      objectPluralName: junctionPlural,
      fields,
      relations: [
        {
          parentObjectNodeName: junctionNodeName,
          relatedObjectNodeName: pair.objectA,
          columnNodeName: junctionFieldForA,
          relationType: RelationType.MANY_TO_ONE,
        },
        {
          parentObjectNodeName: junctionNodeName,
          relatedObjectNodeName: pair.objectB,
          columnNodeName: junctionFieldForB,
          relationType: RelationType.MANY_TO_ONE,
        },
      ],
      isExtracted: true,
      isGenerated: false,
      isUserSelected: false,
      isJunction: true,
      results: toResultsMap(
        junctionNodeName,
        junctionSingular,
        junctionPlural
      ),
    });

    replaceField(entryA.fields, pair.fieldA, {
      name: pair.fieldA,
      kind: FieldType.RELATION,
      relation: {
        type: RelationType.ONE_TO_MANY,
        targetObjectName: junctionNodeName,
        targetFieldName: "id",
        onDelete: OnDeleteAction.SET_NULL,
        inverseFieldName: junctionFieldForA,
        junctionTargetFieldName: junctionFieldForB,
      },
    });

    replaceField(entryB.fields, pair.fieldB, {
      name: pair.fieldB,
      kind: FieldType.RELATION,
      relation: {
        type: RelationType.ONE_TO_MANY,
        targetObjectName: junctionNodeName,
        targetFieldName: "id",
        onDelete: OnDeleteAction.SET_NULL,
        inverseFieldName: junctionFieldForB,
        junctionTargetFieldName: junctionFieldForA,
      },
    });

    replaceRelation(entryA.relations, pair.fieldA, {
      parentObjectNodeName: pair.objectA,
      relatedObjectNodeName: junctionNodeName,
      columnNodeName: pair.fieldA,
      relationType: RelationType.ONE_TO_MANY,
    });

    replaceRelation(entryB.relations, pair.fieldB, {
      parentObjectNodeName: pair.objectB,
      relatedObjectNodeName: junctionNodeName,
      columnNodeName: pair.fieldB,
      relationType: RelationType.ONE_TO_MANY,
    });
  }
}
