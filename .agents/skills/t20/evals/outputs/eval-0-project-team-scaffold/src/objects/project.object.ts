import {
  defineObject,
  FieldType,
  RelationType,
  OnDeleteAction,
} from "twenty-sdk/define";
import {
  CLIENT_OBJECT_UNIVERSAL_IDENTIFIER,
  PROJECTS_FIELD_UNIVERSAL_IDENTIFIER as REF_PROJECT_CLIENT_FIELD_UNIVERSAL_IDENTIFIER
} from "./client.object"
import {
  PROJECT_TEAM_OBJECT_UNIVERSAL_IDENTIFIER,
  PROJECT_FIELD_UNIVERSAL_IDENTIFIER as REF_PROJECT_TEAMS_FIELD_UNIVERSAL_IDENTIFIER,
  TEAM_FIELD_UNIVERSAL_IDENTIFIER as REF_PROJECT_TEAMS_JUNCTION_TARGET_FIELD_UNIVERSAL_IDENTIFIER
} from "./project-team.object"

 enum Status {
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  DONE = "DONE",
}

enum Tags {
  INTERNAL = "INTERNAL",
  CLIENT = "CLIENT",
  URGENT = "URGENT",
} 

export const PROJECT_OBJECT_UNIVERSAL_IDENTIFIER =
  "ffc3722c-6298-5fe2-b650-f6235e24940c";

export const TITLE_FIELD_UNIVERSAL_IDENTIFIER =
  "d0bac58f-d180-5672-8240-253964be37b6";
export const BUDGET_FIELD_UNIVERSAL_IDENTIFIER =
  "82474072-b128-5b2f-969a-5b5e7babd148";
export const STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  "8f949eb6-a181-5b3e-a84e-c072adc6e5e4";
export const TAGS_FIELD_UNIVERSAL_IDENTIFIER =
  "95972f01-82ed-53fa-9b9c-ae7ad6866845";
export const CLIENT_FIELD_UNIVERSAL_IDENTIFIER =
  "4903d1d9-92af-5de7-88e4-38fbe6b6b589";
export const TEAMS_FIELD_UNIVERSAL_IDENTIFIER =
  "91c68a64-02e3-550c-aa96-de6f98f812a9";

export default defineObject({
  universalIdentifier: PROJECT_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: "project",
  namePlural: "projects",
  labelSingular: "Project",
  labelPlural: "Projects",
  icon: "IconBox",
  fields: [
    {
      universalIdentifier: TITLE_FIELD_UNIVERSAL_IDENTIFIER,
      name: "title",
      label: "Title",
      type: FieldType.TEXT,
    },
    {
      universalIdentifier: BUDGET_FIELD_UNIVERSAL_IDENTIFIER,
      name: "budget",
      label: "Budget",
      type: FieldType.NUMBER,
    },
    {
      universalIdentifier: STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      name: "status",
      label: "Status",
      type: FieldType.SELECT,
      options: [
        {
          value: Status.ACTIVE,
          label: "Active",
          position: 0,
          color: "gray",
        },
        {
          value: Status.PAUSED,
          label: "Paused",
          position: 1,
          color: "gray",
        },
        {
          value: Status.DONE,
          label: "Done",
          position: 2,
          color: "gray",
        },
      ],
    },
    {
      universalIdentifier: TAGS_FIELD_UNIVERSAL_IDENTIFIER,
      name: "tags",
      label: "Tags",
      type: FieldType.MULTI_SELECT,
      options: [
        {
          value: Tags.INTERNAL,
          label: "Internal",
          position: 0,
          color: "gray",
        },
        {
          value: Tags.CLIENT,
          label: "Client",
          position: 1,
          color: "gray",
        },
        {
          value: Tags.URGENT,
          label: "Urgent",
          position: 2,
          color: "gray",
        },
      ],
    },
    {
      universalIdentifier: CLIENT_FIELD_UNIVERSAL_IDENTIFIER,
      name: "client",
      label: "Client",
      type: FieldType.RELATION,
      relationTargetObjectMetadataUniversalIdentifier:
        CLIENT_OBJECT_UNIVERSAL_IDENTIFIER,
      relationTargetFieldMetadataUniversalIdentifier:
        REF_PROJECT_CLIENT_FIELD_UNIVERSAL_IDENTIFIER,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: OnDeleteAction.CASCADE,
        joinColumnName: "clientId",
      },
    },
    {
      universalIdentifier: TEAMS_FIELD_UNIVERSAL_IDENTIFIER,
      name: "teams",
      label: "Teams",
      type: FieldType.RELATION,
      relationTargetObjectMetadataUniversalIdentifier:
        PROJECT_TEAM_OBJECT_UNIVERSAL_IDENTIFIER,
      relationTargetFieldMetadataUniversalIdentifier:
        REF_PROJECT_TEAMS_FIELD_UNIVERSAL_IDENTIFIER,
      universalSettings: {
        relationType: RelationType.ONE_TO_MANY,
        junctionTargetFieldUniversalIdentifier: REF_PROJECT_TEAMS_JUNCTION_TARGET_FIELD_UNIVERSAL_IDENTIFIER,
      },
    },
  ],
});