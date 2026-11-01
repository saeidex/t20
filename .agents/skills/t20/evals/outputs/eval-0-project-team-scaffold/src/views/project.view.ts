import { defineView, ViewKey } from "twenty-sdk/define";
import {
  PROJECT_OBJECT_UNIVERSAL_IDENTIFIER
} from "..\objects/project.object"
import {
  TITLE_FIELD_UNIVERSAL_IDENTIFIER,
  BUDGET_FIELD_UNIVERSAL_IDENTIFIER,
  STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  TAGS_FIELD_UNIVERSAL_IDENTIFIER
} from "..\objects/project.object"

export const PROJECT_VIEW_UNIVERSAL_IDENTIFIER =
  "42cdfeb1-4716-5386-803b-b3205135c995";

export default defineView({
  universalIdentifier: PROJECT_VIEW_UNIVERSAL_IDENTIFIER,
  name: "All Projects",
  objectUniversalIdentifier: PROJECT_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: "IconList",
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    {
      universalIdentifier: "ea06104c-5c83-5ae6-a0a0-d0c812914ce4",
      fieldMetadataUniversalIdentifier: TITLE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: "7208658d-2d5e-5cbb-b1c8-dbf8c2456415",
      fieldMetadataUniversalIdentifier: BUDGET_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: "fea1f5e7-07f8-51dc-a2a3-dc94351ea62e",
      fieldMetadataUniversalIdentifier: STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: "00ac7f00-80f3-5443-862b-d80290260b15",
      fieldMetadataUniversalIdentifier: TAGS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 200,
    },
  ],
});