import dedent from "ts-dedent";

import { NavigationMenuItemType } from "twenty-sdk/define";
import { toUidVarName } from "../utils/to-uid-var-name.js";
import { toImportStatement } from "../utils/to-import-statement.js";
import { toKebabCase } from "../utils/case-transformation.js";
import { tempStore } from "../utils/temp-store.js";

export function generateTwentyNavMenuItem(
  navItemName: string,
  navItemFilePath: string,
  constantFilePath: string,
  objectUidVarName: string
): {
  navMenuItemUidVarName: string;
  output: string;
} {
  const navMenuItemUidVarName = toUidVarName(
    navItemName,
    "NAV_MENU_ITEM"
  );
  const constantImportStatement = toImportStatement(
    constantFilePath,
    navItemFilePath,
    navMenuItemUidVarName,
    objectUidVarName
  );

  const navMenuItemsPositionStore =
    tempStore().navMenuItemsPositionStore;

  const output = dedent`import { defineNavigationMenuItem, NavigationMenuItemType } from "twenty-sdk/define";
                ${constantImportStatement}

                export default defineNavigationMenuItem({
                  universalIdentifier: ${navMenuItemUidVarName},
                  name: "${toKebabCase(navItemName)}",
                  icon: "IconList",
                  position: ${navMenuItemsPositionStore.getPositionAndIncrement()},
                  type: NavigationMenuItemType.${
                    NavigationMenuItemType.OBJECT
                  },
                  targetObjectUniversalIdentifier: ${objectUidVarName},
                });
         `;

  return {
    navMenuItemUidVarName,
    output,
  };
}
