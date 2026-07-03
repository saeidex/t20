import dedent from "ts-dedent";

import { NavigationMenuItemType } from "twenty-sdk/define";
import { toUidVarName } from "./utils/to-uid-var-name.js";
import { toUidVarStatement } from "./utils/to-uid-var-statement.js";
import { toImportStatement } from "./utils/to-import-statement.js";
import { toKebabCase } from "./utils/case-transformation.js";

export function generateTwentyNavMenuItem(
  navItemName: string,
  navItemFilePath: string,
  viewUidVarName: string,
  viewFilePath: string
): {
  navMenuItemUidVarName: string;
  output: string;
} {
  const navMenuItemUidVarName = toUidVarName(
    navItemName,
    "NAV_MENU_ITEM"
  );
  const navItemUidVarStatement = toUidVarStatement(
    navMenuItemUidVarName
  );

  const viewImportStatement = toImportStatement(
    viewFilePath,
    navItemFilePath,
    viewUidVarName
  );

  const output = dedent`import { defineNavigationMenuItem, NavigationMenuItemType } from "twenty-sdk/define";
                ${viewImportStatement}

                ${navItemUidVarStatement}

                export default defineNavigationMenuItem({
                  universalIdentifier: ${navMenuItemUidVarName},
                  name: "${toKebabCase(navItemName)}",
                  icon: "IconList",
                  position: 0,
                  type: NavigationMenuItemType.${
                    NavigationMenuItemType.VIEW
                  },
                  viewUniversalIdentifier: "${viewUidVarName}",
                });
         `;

  return {
    navMenuItemUidVarName,
    output,
  };
}
