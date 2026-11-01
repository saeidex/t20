import { defineView, ViewKey } from "twenty-sdk/define";
import {
  PROJECT_TEAM_OBJECT_UNIVERSAL_IDENTIFIER
} from "..\objects/project-team.object"
import {
  NAME_FIELD_UNIVERSAL_IDENTIFIER
} from "..\objects/project-team.object"

export const PROJECT_TEAM_VIEW_UNIVERSAL_IDENTIFIER =
  "cd590250-baf0-57c2-aa1a-4fcfcde9755b";

export default defineView({
  universalIdentifier: PROJECT_TEAM_VIEW_UNIVERSAL_IDENTIFIER,
  name: "All Project Teams",
  objectUniversalIdentifier: PROJECT_TEAM_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: "IconList",
  key: ViewKey.INDEX,
  position: 3,
  fields: [
    {
      universalIdentifier: "517d62b6-e7f4-5ab5-9d6e-12921c03af3d",
      fieldMetadataUniversalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 200,
    },
  ],
});