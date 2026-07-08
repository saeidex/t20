import type {
  FieldType,
  OnDeleteAction,
  RelationType,
} from "twenty-sdk/define";

// FirstOfAll
// T[] same as Array<T>

// @ts-ignore for refernce only
type _FieldType = Extract<
  FieldType,
  //ONE_TO_MANY | MANY_TO_ONE
  //R = ObjectName|InterfaceName
  //RelationField
  | FieldType.RELATION // R | R[]
  //
  //MorphRelationField
  | FieldType.MORPH_RELATION // { morphId: R | R[] }
>;

export type FieldOption = {
  position: number;
  label: string;
  value: string;
  color: string;
};

export type FieldRelation = {
  relationTargetObjectMetadataUniversalIdentifier: string;
  relationTargetFieldMetadataUniversalIdentifier: string;
  universalSettings: {
    relationType: RelationType;
    onDelete: OnDeleteAction;
  };
};

type IRFieldRelation = {
  type: RelationType;
  onDelete: OnDeleteAction;
  targetObjectName: string;
};

export type IRField = {
  name: string;
  kind: FieldType;
  options?: Array<FieldOption>;
  relation?: IRFieldRelation;
};
