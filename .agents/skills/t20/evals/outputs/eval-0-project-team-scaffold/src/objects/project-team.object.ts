import {
  defineObject,
  FieldType,
  RelationType,
  OnDeleteAction,
} from "twenty-sdk/define";
import {
  PROJECT_OBJECT_UNIVERSAL_IDENTIFIER,
  TEAMS_FIELD_UNIVERSAL_IDENTIFIER as REF_PROJECT_TEAM_PROJECT_FIELD_UNIVERSAL_IDENTIFIER
} from "./project.object"
import {
  TEAM_OBJECT_UNIVERSAL_IDENTIFIER,
  PROJECTS_FIELD_UNIVERSAL_IDENTIFIER as REF_PROJECT_TEAM_TEAM_FIELD_UNIVERSAL_IDENTIFIER
} from "./team.object"

export const PROJECT_TEAM_OBJECT_UNIVERSAL_IDENTIFIER =
  "f0927c2a-af81-56cd-ae7a-18f341b1c058";

export const NAME_FIELD_UNIVERSAL_IDENTIFIER =
  "91f2f166-b5f0-5677-959f-a2380833f725";
export const ID_FIELD_UNIVERSAL_IDENTIFIER =
  "f786e72a-a83d-52cf-91e2-8d7acd2c7b2a";
export const PROJECT_FIELD_UNIVERSAL_IDENTIFIER =
  "d06ac0e4-42cd-5dd7-8692-327fec73f3d2";
export const TEAM_FIELD_UNIVERSAL_IDENTIFIER =
  "990f068d-4a22-5c46-a30b-4392c1ece1c9";

export default defineObject({
  universalIdentifier: PROJECT_TEAM_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: "projectTeam",
  namePlural: "projectTeams",
  labelSingular: "Project team",
  labelPlural: "Project teams",
  icon: "IconBox",
  fields: [
    {
      universalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
      name: "name",
      label: "Name",
      type: FieldType.TEXT,
    },
    {
      universalIdentifier: ID_FIELD_UNIVERSAL_IDENTIFIER,
      name: "id",
      label: "Id",
      type: FieldType.UUID,
    },
    {
      universalIdentifier: PROJECT_FIELD_UNIVERSAL_IDENTIFIER,
      name: "project",
      label: "Project",
      type: FieldType.RELATION,
      relationTargetObjectMetadataUniversalIdentifier:
        PROJECT_OBJECT_UNIVERSAL_IDENTIFIER,
      relationTargetFieldMetadataUniversalIdentifier:
        REF_PROJECT_TEAM_PROJECT_FIELD_UNIVERSAL_IDENTIFIER,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: OnDeleteAction.CASCADE,
        joinColumnName: "projectId",
      },
    },
    {
      universalIdentifier: TEAM_FIELD_UNIVERSAL_IDENTIFIER,
      name: "team",
      label: "Team",
      type: FieldType.RELATION,
      relationTargetObjectMetadataUniversalIdentifier:
        TEAM_OBJECT_UNIVERSAL_IDENTIFIER,
      relationTargetFieldMetadataUniversalIdentifier:
        REF_PROJECT_TEAM_TEAM_FIELD_UNIVERSAL_IDENTIFIER,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: OnDeleteAction.CASCADE,
        joinColumnName: "teamId",
      },
    },
  ],
});