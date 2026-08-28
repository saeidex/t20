import ts from "typescript";
import { FieldType } from "twenty-sdk/define";
import type { ObjectsMap, RelationRecord } from "../types.js";
import { extractObjectFields } from "./extract-object-fields.js";
import { toNamesAndPaths } from "../utils/to-names-and-paths.js";
import {
  toObjectNamePlural,
  toObjectNameSingular,
} from "../utils/to-names.js";

export function extractObjectsMap(
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  selectedObjectNames: Array<string>,
  knownObjectNames: Set<string>
): ObjectsMap {
  const map: ObjectsMap = new Map();
  const seen = new Set<string>(selectedObjectNames);
  let queue: Array<string> = [...selectedObjectNames];

  while (queue.length > 0) {
    const nextQueue: Array<string> = [];

    for (const objectName of queue) {
      if (map.has(objectName)) continue;

      const fields = extractObjectFields(
        sourceFile,
        checker,
        objectName,
        knownObjectNames
      );

      const relations: Array<RelationRecord> = [];

      for (const field of fields) {
        if (
          (field.kind !== FieldType.RELATION &&
            field.kind !== FieldType.MORPH_RELATION) ||
          !field.relation
        ) {
          continue;
        }

        const relatedName = field.relation.targetObjectName;

        relations.push({
          parentObjectNodeName: objectName,
          relatedObjectNodeName: relatedName,
          columnNodeName: field.name,
          relationType: field.relation.type,
        });

        if (!seen.has(relatedName)) {
          seen.add(relatedName);
          nextQueue.push(relatedName);
        }
      }

      const isUserSelected =
        selectedObjectNames.includes(objectName);
      const objectPluralName = toObjectNameSingular(objectName);
      const objectSingularName = toObjectNamePlural(objectName);
      const results = toNamesAndPaths(
        objectName,
        objectSingularName,
        objectPluralName
      );

      map.set(objectName, {
        objectNodeName: objectName,
        objectSingularName,
        objectPluralName,
        fields,
        relations,
        isExtracted: true,
        isGenerated: false,
        isUserSelected,
        results,
      });
    }

    queue = nextQueue;
  }

  return map;
}
