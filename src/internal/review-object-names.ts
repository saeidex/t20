import * as prompts from "@clack/prompts";

import type { ObjectsMap } from "./types.js";
import type {
  ObjectName} from "./user-prompts.js";
import {
  objectNamePrompts,
} from "./user-prompts.js";
import { handlePromptCancel } from "./utils/handle-prompt-cancel.js";
import { toNamesAndPaths } from "./utils/to-names-and-paths.js";

export async function reviewObjectNames(objectsMap: ObjectsMap) {
  const objectNames: Map<string, ObjectName> = new Map();

  for (const obj of objectsMap.values()) {
    if (obj.isUserSelected) {
      const name = await objectNamePrompts(
        obj.objectNodeName,
        obj.objectSingularName,
        obj.objectPluralName
      );
      objectNames.set(obj.objectNodeName, name);
    }
  }

  for (const obj of objectsMap.values()) {
    if (!obj.isUserSelected) {
      const note = prompts.note("Auto Selected", "Relations");
      handlePromptCancel(note);

      const name = await objectNamePrompts(
        obj.objectNodeName,
        obj.objectSingularName,
        obj.objectPluralName,
        true
      );
      objectNames.set(obj.objectNodeName, name);
    }
  }

  for (const [objectNodeName, object] of objectsMap.entries()) {
    const objectName = objectNames.get(objectNodeName);

    if (!objectName) continue;

    const results = toNamesAndPaths(
      objectNodeName,
      objectName.singular,
      objectName.plural
    );

    object.results = results;
  }
}
