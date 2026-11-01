import { defineNavigationMenuItem, NavigationMenuItemType } from "twenty-sdk/define";
import {
  CLIENT_VIEW_UNIVERSAL_IDENTIFIER
} from "..\views/client.view"
export const CLIENT_NAV_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  "82580257-5ad1-590d-a62c-09efa3d7969e";

export default defineNavigationMenuItem({
  universalIdentifier: CLIENT_NAV_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: "client",
  icon: "IconList",
  position: 1,
  color: "Gold",
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: CLIENT_VIEW_UNIVERSAL_IDENTIFIER,
});