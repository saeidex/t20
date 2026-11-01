import { defineNavigationMenuItem, NavigationMenuItemType } from "twenty-sdk/define";
import {
  PROJECT_TEAM_VIEW_UNIVERSAL_IDENTIFIER
} from "..\views/project-team.view"
export const PROJECT_TEAM_NAV_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  "64546895-47a6-5bf8-a229-2f67ad07cd79";

export default defineNavigationMenuItem({
  universalIdentifier: PROJECT_TEAM_NAV_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: "project-team",
  icon: "IconList",
  position: 3,
  color: "Gold",
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: PROJECT_TEAM_VIEW_UNIVERSAL_IDENTIFIER,
});