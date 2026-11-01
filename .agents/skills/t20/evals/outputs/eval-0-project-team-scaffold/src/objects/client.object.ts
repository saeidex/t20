import {
  defineObject,
  FieldType,
  RelationType,
  OnDeleteAction,
} from "twenty-sdk/define";
import {
  PROJECT_OBJECT_UNIVERSAL_IDENTIFIER,
  CLIENT_FIELD_UNIVERSAL_IDENTIFIER as REF_CLIENT_PROJECTS_FIELD_UNIVERSAL_IDENTIFIER
} from "./project.object"

export const CLIENT_OBJECT_UNIVERSAL_IDENTIFIER =
  "2901fe97-2bbe-5198-8567-c5a59752da33";

export const COMPANY_FIELD_UNIVERSAL_IDENTIFIER =
  "6f995681-bf4c-526d-a7d0-57524fafc46c";
export const PROJECTS_FIELD_UNIVERSAL_IDENTIFIER =
  "e264d9e9-3f62-5d6f-b989-a49753e0b7c2";

export default defineObject({
  universalIdentifier: CLIENT_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: "client",
  namePlural: "clients",
  labelSingular: "Client",
  labelPlural: "Clients",
  icon: "IconBox",
  fields: [
    {
      universalIdentifier: COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
      name: "company",
      label: "Company",
      type: FieldType.TEXT,
    },
    {
      universalIdentifier: PROJECTS_FIELD_UNIVERSAL_IDENTIFIER,
      name: "projects",
      label: "Projects",
      type: FieldType.RELATION,
      relationTargetObjectMetadataUniversalIdentifier:
        PROJECT_OBJECT_UNIVERSAL_IDENTIFIER,
      relationTargetFieldMetadataUniversalIdentifier:
        REF_CLIENT_PROJECTS_FIELD_UNIVERSAL_IDENTIFIER,
      universalSettings: {
        relationType: RelationType.ONE_TO_MANY,
      },
    },
  ],
});