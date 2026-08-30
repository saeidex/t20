import * as prompts from "@clack/prompts";

import type { ObjectsMap } from "./types.js";
import type { ObjectName } from "./user-prompts.js";
import { objectNamePrompts } from "./user-prompts.js";
import { handlePromptCancel } from "./utils/handle-prompt-cancel.js";
import { toResultsMap } from "./utils/to-results-map.js";
import { getCliOptions } from "./create-cli.js";
import { styleText } from "node:util";

export async function reviewObjectNames(objectsMap: ObjectsMap) {
  const opts = getCliOptions();
  const objectNames: Map<string, ObjectName> = new Map();

  for (const obj of objectsMap.values()) {
    if (!obj.isUserSelected) continue;

    const name = await objectNamePrompts(
      obj.objectNodeName,
      obj.objectSingularName,
      obj.objectPluralName
    );
    objectNames.set(obj.objectNodeName, name);
  }

  if (!opts.skipRelatedEntities) {
    const relatedObjectNames: Array<string> = [];

    objectsMap.forEach((v) => {
      if (v.isUserSelected) return;
      relatedObjectNames.push(v.objectNodeName);
    });

    const note = prompts.note(
      `Auto Selected: ${styleText(
        "blue",
        relatedObjectNames.join(", ")
      )}`,
      "Relations"
    );
    handlePromptCancel(note);

    for (const obj of objectsMap.values()) {
      if (obj.isUserSelected) continue;

      const name = await objectNamePrompts(
        obj.objectNodeName,
        obj.objectSingularName,
        obj.objectPluralName
      );
      objectNames.set(obj.objectNodeName, name);
    }
  }

  if (objectNames.size === 0) return;

  for (const [objectNodeName, object] of objectsMap.entries()) {
    const objectName = objectNames.get(objectNodeName);

    if (!objectName) continue;

    const results = toResultsMap(
      objectNodeName,
      objectName.singular,
      objectName.plural
    );
    object.results = results;
  }
}
