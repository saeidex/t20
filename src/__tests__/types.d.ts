import type { FieldType } from "twenty-sdk/define";

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
  id: string;
  uuid: string;
  orderId: string;
  createdAt: string;
  updatedAt: string;
};

type NativeFields = {
  text: string;
  number: number;
  boolean: boolean;
  rawJson: object;
  array: Array<unknown>;
  dateTime: Date;
};

enum Priority {
  Low = "low",
  Medium = "medium",
  High = "high",
}

type Language =
  | "javascript"
  | "typescript"
  | "rust"
  | "python"
  | "php";

type SelectFields = {
  priority: Priority;
  role: "admin" | "user" | "guest";
  language: Language;
};

/// note: Array<T>, T[] are same
type multiSelectFields = {
  roles: Array<"admin" | "user" | "guest">;
  languages: Array<Language>;
  priorities: Array<Priority>;
};

interface Address {
  id: string;
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
  tags: Array<string>;
  labels: Array<string>;
  permissions: Array<"read" | "write" | "delete">;
  scores: Array<number>;
  ratings: Array<number>;
  address: Address;
}

// type alias form — same resolver pipeline applies
type Category = {
  name: string;
  slug: string;
  itemCount: number;
};

// Relationships example 1

type Child = {
  id: string;
  parent: Parent; // many to one
};

type Parent = {
  id: string;
  childs: Array<Child>; // one to many
};

// Relationships example 2

// work as a juncton table
type Company = {
  id: string;
  peoples: Array<People>; // one to many
  projects: Array<Project>; // one to many
};

type People = {
  id: string;
  company: Company; // many to one
};

type Project = {
  id: string;
  company: Company; // many to one
};

// Relationships example 3

// work as a juncton table
type School = {
  id: string;
  teachers: Array<Teacher["id"]>; // one to many
  students: Array<Student["id"]>; // one to many
};

type Teacher = {
  id: string;
  school: School["id"]; // many to one
};

type Student = {
  id: string;
  school: School["id"]; // many to one
};
