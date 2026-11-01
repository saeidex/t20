import { defineView, ViewKey } from "twenty-sdk/define";
import {
  TEAM_OBJECT_UNIVERSAL_IDENTIFIER
} from "..\objects/team.object"
import {
  
} from "..\objects/team.object"

export const TEAM_VIEW_UNIVERSAL_IDENTIFIER =
  "1b240c85-11bf-5a1f-acc8-a2b5922a9e70";

export default defineView({
  universalIdentifier: TEAM_VIEW_UNIVERSAL_IDENTIFIER,
  name: "All Teams",
  objectUniversalIdentifier: TEAM_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: "IconList",
  key: ViewKey.INDEX,
  position: 2,
  fields: [
    
  ],
});