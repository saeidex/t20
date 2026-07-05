enum FieldType {
  ACTOR = "ACTOR",
  ADDRESS = "ADDRESS",
  ARRAY = "ARRAY",
  BOOLEAN = "BOOLEAN",
  CURRENCY = "CURRENCY",
  DATE = "DATE",
  DATE_TIME = "DATE_TIME",
  EMAILS = "EMAILS",
  FILES = "FILES",
  FULL_NAME = "FULL_NAME",
  LINKS = "LINKS",
  MORPH_RELATION = "MORPH_RELATION",
  MULTI_SELECT = "MULTI_SELECT",
  NUMBER = "NUMBER",
  NUMERIC = "NUMERIC",
  PHONES = "PHONES",
  POSITION = "POSITION",
  RATING = "RATING",
  RAW_JSON = "RAW_JSON",
  RELATION = "RELATION",
  RICH_TEXT = "RICH_TEXT",
  SELECT = "SELECT",
  TEXT = "TEXT",
  TS_VECTOR = "TS_VECTOR",
  UUID = "UUID",
}

type BaseFields = {
  field1: FieldType.TEXT; // #default string
  field2: FieldType.UUID;
  field3: FieldType.NUMERIC;
  field4: FieldType.RATING;
  field5: FieldType.NUMBER; // #default number
  field6: FieldType.POSITION;
  field7: FieldType.BOOLEAN; // #default boolean
  field8: FieldType.DATE_TIME; // #default Date
  field9: FieldType.DATE;
  field10: FieldType.ARRAY;
  field11: FieldType.RAW_JSON; // #default object
  field12: FieldType.FULL_NAME;
  field13: FieldType.ADDRESS;
  field14: FieldType.CURRENCY;
  field15: FieldType.EMAILS;
  field16: FieldType.PHONES;
  field17: FieldType.RICH_TEXT;
  field18: FieldType.LINKS;
  field19: FieldType.ACTOR;
  field20: FieldType.FILES;
};

interface IBaseFields {
  field1: FieldType.TEXT; // #default string
  field2: FieldType.UUID;
  field3: FieldType.NUMERIC;
  field4: FieldType.RATING;
  field5: FieldType.NUMBER; // #default number
  field6: FieldType.POSITION;
  field7: FieldType.BOOLEAN; // #default boolean
  field8: FieldType.DATE_TIME; // #default Date
  field9: FieldType.DATE;
  field10: FieldType.ARRAY;
  field11: FieldType.RAW_JSON; // #default object
  field12: FieldType.FULL_NAME;
  field13: FieldType.ADDRESS;
  field14: FieldType.CURRENCY;
  field15: FieldType.EMAILS;
  field16: FieldType.PHONES;
  field17: FieldType.RICH_TEXT;
  field18: FieldType.LINKS;
  field19: FieldType.ACTOR;
  field20: FieldType.FILES;
}

enum Priority {
  Low = "low",
  Medium = "medium",
  High = "high",
}

interface Address {
  street: string;
  city: string;
}

interface Product {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: string;
  price: number;
  quantity: number;
  active: boolean;
  metadata: object;
  config: Record<string, unknown>;
  priority: Priority;
  role: "admin" | "user" | "guest";
  tags: string[];
  labels: Array<string>;
  permissions: ("read" | "write" | "delete")[];
  scores: number[];
  ratings: Array<number>;
  address: Address; // relation candidate — not implemented yet, falls to TEXT
}

// type alias form — same resolver pipeline applies
type Category = {
  name: string;
  slug: string;
  itemCount: number;
};
