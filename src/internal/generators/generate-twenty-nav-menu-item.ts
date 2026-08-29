import dedent from "ts-dedent";

import { NavigationMenuItemType } from "twenty-sdk/define";
import { toImportStatement } from "../utils/to-import-statement.js";
import { tempStore } from "../utils/temp-store.js";
import type { ObjectMapEntry } from "../types.js";
import { toUidVarStatement } from "../utils/to-uid-var-statement.js";

export function generateTwentyNavMenuItem(
  entry: ObjectMapEntry
): string {
  const objectUidImportStatement = toImportStatement(
    entry.results.object.filePath,
    entry.results.navMenuItem.filePath,
    entry.results.object.uidVarName
  );

  const uidVarDeclarationStatement = toUidVarStatement(
    entry.results.navMenuItem.uidVarName
  );

  const navMenuItemsPositionStore =
    tempStore().navMenuItemsPositionStore;

  const output = dedent`import { defineNavigationMenuItem, NavigationMenuItemType } from "twenty-sdk/define";
                ${objectUidImportStatement}
                ${uidVarDeclarationStatement}

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
