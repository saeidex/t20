import { defineView, ViewKey } from "twenty-sdk/define";
import {
  CLIENT_OBJECT_UNIVERSAL_IDENTIFIER
} from "..\objects/client.object"
import {
  COMPANY_FIELD_UNIVERSAL_IDENTIFIER
} from "..\objects/client.object"

export const CLIENT_VIEW_UNIVERSAL_IDENTIFIER =
  "f22a2b4d-c332-5100-b96e-e0ec41a3381f";

export default defineView({
  universalIdentifier: CLIENT_VIEW_UNIVERSAL_IDENTIFIER,
  name: "All Clients",
  objectUniversalIdentifier: CLIENT_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: "IconList",
  key: ViewKey.INDEX,
  position: 1,
  fields: [
    {
      universalIdentifier: "abf0aefa-cb79-5bbc-a2ea-c526c7f48692",
      fieldMetadataUniversalIdentifier: COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 200,
    },
  ],
});