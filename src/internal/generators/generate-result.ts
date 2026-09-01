import { generateTwentyObject } from "./generate-twenty-object.js";
import { generateTwentyView } from "./generate-twenty-view.js";
import { generateTwentyNavMenuItem } from "./generate-twenty-nav-menu-item.js";
import type { ObjectsMap } from "../types.js";
import { getCliOptions } from "../create-cli.js";

export type Result = {
  objects: Array<Record<string, string>>;
  views: Array<Record<string, string>>;
  navMenuItems: Array<Record<string, string>>;
};

export function generateResult(objectsMap: ObjectsMap): Result {
  const opts = getCliOptions();

  const result: Result = {
    objects: [],
    views: [],
    navMenuItems: [],
  };

  for (const [objectNodeName, entry] of objectsMap.entries()) {
    if (
      opts.skipRelatedEntities &&
      !entry.isUserSelected &&
      !entry.isJunction
    )
      continue;

    const twentyObject = generateTwentyObject(
      objectNodeName,
      objectsMap
    );
    const twentyView = generateTwentyView(entry);
    const twentyNavMenuItem = generateTwentyNavMenuItem(entry);

    result.objects.push({
      [entry.results.object.filePath]: twentyObject,
    });
    result.views.push({
      [entry.results.view.filePath]: twentyView,
    });
    result.navMenuItems.push({
      [entry.results.navMenuItem.filePath]: twentyNavMenuItem,
    });

    entry.isGenerated = true;
  }

  return result;
}
