import {
  defineObject,
  FieldType,
  RelationType,
  OnDeleteAction,
} from "twenty-sdk/define";
import {
  PROJECT_TEAM_OBJECT_UNIVERSAL_IDENTIFIER,
  TEAM_FIELD_UNIVERSAL_IDENTIFIER as REF_TEAM_PROJECTS_FIELD_UNIVERSAL_IDENTIFIER,
  PROJECT_FIELD_UNIVERSAL_IDENTIFIER as REF_TEAM_PROJECTS_JUNCTION_TARGET_FIELD_UNIVERSAL_IDENTIFIER
} from "./project-team.object"

export const TEAM_OBJECT_UNIVERSAL_IDENTIFIER =
  "8c4481f6-1313-5cc5-958d-f372321ad1da";

export const PROJECTS_FIELD_UNIVERSAL_IDENTIFIER =
  "9593c68f-a39f-522e-851e-7d8cc5a408fe";

export default defineObject({
  universalIdentifier: TEAM_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: "team",
  namePlural: "teams",
  labelSingular: "Team",
  labelPlural: "Teams",
  icon: "IconBox",
  fields: [
    {
      universalIdentifier: PROJECTS_FIELD_UNIVERSAL_IDENTIFIER,
      name: "projects",
      label: "Projects",
      type: FieldType.RELATION,
      relationTargetObjectMetadataUniversalIdentifier:
        PROJECT_TEAM_OBJECT_UNIVERSAL_IDENTIFIER,
      relationTargetFieldMetadataUniversalIdentifier:
        REF_TEAM_PROJECTS_FIELD_UNIVERSAL_IDENTIFIER,
      universalSettings: {
        relationType: RelationType.ONE_TO_MANY,
        junctionTargetFieldUniversalIdentifier: REF_TEAM_PROJECTS_JUNCTION_TARGET_FIELD_UNIVERSAL_IDENTIFIER,
      },
    },
  ],
});