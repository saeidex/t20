import { FieldType } from "twenty-sdk/define";

type BaseFields = {
  text: FieldType.TEXT; // #default string
  uuid: FieldType.UUID;
  numeric: FieldType.NUMERIC;
  rating: FieldType.RATING;
  number: FieldType.NUMBER; // #default number
  position: FieldType.POSITION;
  boolean: FieldType.BOOLEAN; // #default boolean
  dateTime: FieldType.DATE_TIME; // #default Date
  date: FieldType.DATE;
  array: FieldType.ARRAY;
  rawJson: FieldType.RAW_JSON; // #default object
  full_name: FieldType.FULL_NAME;
  address: FieldType.ADDRESS;
  currency: FieldType.CURRENCY;
  emails: FieldType.EMAILS;
  phones: FieldType.PHONES;
  richText: FieldType.RICH_TEXT;
  links: FieldType.LINKS;
  actor: FieldType.ACTOR;
  files: FieldType.FILES;
};

interface IBaseFields {
  text: FieldType.TEXT; // #default string
  uuid: FieldType.UUID;
  numeric: FieldType.NUMERIC;
  rating: FieldType.RATING;
  number: FieldType.NUMBER; // #default number
  position: FieldType.POSITION;
  boolean: FieldType.BOOLEAN; // #default boolean
  dateTime: FieldType.DATE_TIME; // #default Date
  date: FieldType.DATE;
  array: FieldType.ARRAY;
  rawJson: FieldType.RAW_JSON; // #default object
  fullUame: FieldType.FULL_NAME;
  address: FieldType.ADDRESS;
  currency: FieldType.CURRENCY;
  emails: FieldType.EMAILS;
  phones: FieldType.PHONES;
  richText: FieldType.RICH_TEXT;
  links: FieldType.LINKS;
  actor: FieldType.ACTOR;
  files: FieldType.FILES;
}

type DateAndStringFields = {
  id: any;
  uuid: any;
  orderId: any;
  createdAt: any;
  updatedAt: any;
};

type NativeFields = {
  text: string;
  number: number;
  boolean: boolean;
  rawJson: object;
  array: unknown[];
  dateTime: Date;
};

enum Priority {
  Low = "low",
  Medium = "medium",
  High = "high",
}

type SelectFields = {
  priority: Priority;
  role: "admin" | "user" | "guest";
};

type multiSelectFields = {};

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
