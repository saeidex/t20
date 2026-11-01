import { defineNavigationMenuItem, NavigationMenuItemType } from "twenty-sdk/define";
import {
  PROJECT_VIEW_UNIVERSAL_IDENTIFIER
} from "..\views/project.view"
export const PROJECT_NAV_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  "aec5de84-4bc4-52aa-9b14-1086f1c3fecb";

export default defineNavigationMenuItem({
  universalIdentifier: PROJECT_NAV_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: "project",
  icon: "IconList",
  position: 0,
  color: "Gold",
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: PROJECT_VIEW_UNIVERSAL_IDENTIFIER,
});