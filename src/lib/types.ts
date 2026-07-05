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
  // BaseField
  | FieldType.TEXT // #default string
  | FieldType.UUID
  | FieldType.NUMERIC
  | FieldType.RATING
  | FieldType.NUMBER // #default number
  | FieldType.POSITION
  | FieldType.BOOLEAN // #default boolean
  | FieldType.DATE_TIME // #default Date
  | FieldType.DATE
  | FieldType.ARRAY
  | FieldType.RAW_JSON // #default object
  | FieldType.FULL_NAME
  | FieldType.ADDRESS
  | FieldType.CURRENCY
  | FieldType.EMAILS
  | FieldType.PHONES
  | FieldType.RICH_TEXT
  | FieldType.LINKS
  | FieldType.ACTOR
  | FieldType.FILES
  //
  // SelectField
  | FieldType.SELECT // enum or "x" | "y" | "z"
  //
  //MultiSelectField
  | FieldType.MULTI_SELECT // string[]
  //
  //ONE_TO_MANY | MANY_TO_ONE
  //R = ObjectName|InterfaceName
  //RelationField
  | FieldType.RELATION // R | R[]
  //
  //MorphRelationField
  | FieldType.MORPH_RELATION // { morphId: R | R[] }
>;

export type IRFieldOption = {
  position: number;
  label: string;
  value: string;
  color: string;
};

export type IRField = {
  name: string;
  kind: FieldType;
  options?: Array<IRFieldOption>;
};

type BaseField = {
  universalIdentifier: string;
  name: string;
  label: string;
  type: FieldType;
};

type FieldWithOptions = BaseField & {
  options: Array<IRFieldOption>;
};

export type SelectField = FieldWithOptions;
export type MultiSelectField = FieldWithOptions;

type RelationField = BaseField & {
  relationTargetObjectMetadataUniversalIdentifier: string;
  relationTargetFieldMetadataUniversalIdentifier: string;
  universalSettings: {
    relationType: RelationType;
    onDelete: OnDeleteAction;
  };
};

type MorphRelationField = BaseField & {
  morphId: string;
};

export type Field =
  | BaseField
  | SelectField
  | MultiSelectField
  | RelationField
  | MorphRelationField;
