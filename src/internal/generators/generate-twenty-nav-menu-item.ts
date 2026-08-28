import dedent from "ts-dedent";

import { NavigationMenuItemType } from "twenty-sdk/define";
import { toImportStatement } from "../utils/to-import-statement.js";
import { tempStore } from "../utils/temp-store.js";
import { ObjectMapEntry } from "../types.js";

export function generateTwentyNavMenuItem(
  entry: ObjectMapEntry
): string {
  const constantImportStatement = toImportStatement(
    entry.results.constant.filePath,
    entry.results.navMenuItem.filePath,
    entry.results.navMenuItem.uidVarName!,
    entry.results.object.uidVarName!
  );

  const navMenuItemsPositionStore =
    tempStore().navMenuItemsPositionStore;

  const output = dedent`import { defineNavigationMenuItem, NavigationMenuItemType } from "twenty-sdk/define";
                ${constantImportStatement}

                export default defineNavigationMenuItem({
                  universalIdentifier: ${
                    entry.results.navMenuItem.uidVarName
                  },
                  name: "${entry.results.navMenuItem.name}",
                  icon: "IconList",
                  position: ${navMenuItemsPositionStore.getPositionAndIncrement()},
                  type: NavigationMenuItemType.${
                    NavigationMenuItemType.OBJECT
                  },
                  targetObjectUniversalIdentifier: ${
                    entry.results.object.uidVarName
                  },
                });
         `;

  return output;
}
