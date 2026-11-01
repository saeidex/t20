import { defineNavigationMenuItem, NavigationMenuItemType } from "twenty-sdk/define";
import {
  TEAM_VIEW_UNIVERSAL_IDENTIFIER
} from "..\views/team.view"
export const TEAM_NAV_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  "221b4dbf-949e-557a-8786-84d99d55fbbe";

export default defineNavigationMenuItem({
  universalIdentifier: TEAM_NAV_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: "team",
  icon: "IconList",
  position: 2,
  color: "Gold",
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: TEAM_VIEW_UNIVERSAL_IDENTIFIER,
});