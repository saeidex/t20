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
  | FieldType.RELATION // R["fieldName"] | Array<R["fieldName"]>
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

export type IRFieldRelation = {
  type: RelationType;
  onDelete: OnDeleteAction;
  targetObjectName: string;
  targetFieldName: string;
  inverseFieldName?: string;
  junctionTargetFieldName?: string;
};

type IREnumMember = {
  memberName: string;
  value: string;
};

export type IREnumMeta = {
  enumName: string;
  members: Array<IREnumMember>;
};

export type IRField = {
  name: string;
  kind: FieldType;
  enumMeta?: IREnumMeta;
  options?: Array<FieldOption>;
  relation?: IRFieldRelation;
};

export type RelationRecord = {
  parentObjectNodeName: string;
  relatedObjectNodeName: string;
  columnNodeName: string;
  relationType: RelationType;
};

export type ResultEntity = {
  name: string;
  fileName: string;
  filePath: string;
  uidVarName: string;
  uidVarStatement: string;
};

export type Results = {
  object: ResultEntity;
  view: ResultEntity;
  navMenuItem: ResultEntity;
};

export type ObjectMapEntry = {
  objectNodeName: string;
  objectSingularName: string;
  objectPluralName: string;
  fields: Array<IRField>;
  relations: Array<RelationRecord>;
  isExtracted: boolean;
  isGenerated: boolean;
  isUserSelected: boolean;
  isJunction?: boolean;
  results: Results;
};

export type ObjectsMap = Map<string, ObjectMapEntry>;
