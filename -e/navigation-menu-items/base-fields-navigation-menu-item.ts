import { defineNavigationMenuItem, NavigationMenuItemType } from "twenty-sdk/define";
import {
  BASE_FIELDS_NAV_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  BASE_FIELD_OBJECT_UNIVERSAL_IDENTIFIER
} from "../constants/base-field.constants"

export default defineNavigationMenuItem({
  universalIdentifier: BASE_FIELDS_NAV_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: "base-fields",
  icon: "IconList",
  position: 0,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: BASE_FIELD_OBJECT_UNIVERSAL_IDENTIFIER,
});