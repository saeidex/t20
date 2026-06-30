import type {
  FieldType as _FieldType,
  OnDeleteAction,
  RelationType,
} from "twenty-sdk/define";

type FieldType = Extract<
  _FieldType,
  // string
  | _FieldType.TEXT
  // number
  | _FieldType.NUMBER
  // boolean
  | _FieldType.BOOLEAN
  // enum || "a" | "b" | "c"
  | _FieldType.SELECT
  // any[]
  | _FieldType.ARRAY // doesn't support yet
  // Array<"a" | "b">
  | _FieldType.MULTI_SELECT // doesn't suppport yet
  // object relation
  | _FieldType.RELATION // doesn't suppport yet
  // date
  | _FieldType.DATE_TIME
  // uuid
  | _FieldType.UUID
>;

export type FieldOption = {
  position: number;
  label: string;
  value: string;
  color: string;
};

export type Field = {
  universalIdentifier: string;
  name: string;
  label: string;
  type: FieldType;
  options?: Array<FieldOption>;
  relationTargetObjectMetadataUniversalIdentifier?: string;
  relationTargetFieldMetadataUniversalIdentifier?: string;
  universalSettings?: {
    relationType: RelationType;
    onDelete: OnDeleteAction;
  };
};

export type IRField = {
  name: string;
  kind: FieldType;
  options?: Array<FieldOption>;
};
