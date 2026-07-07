<div align="center">
  <img src="public/logo.png" width="144" height="144" alt="t20" />
  <h1>t20 - Types to Twenty</h1>

  <p>
      <strong>A scaffolding CLI tool for [Twenty CRM](https://github.com/twentyhq/twenty).</strong>Automatically generate objects, fields, views & directly from your TypeScript definitions.
  </p>
</div>

## Installation

```bash
# Global installation
npm install -g @saeidex/t20

# Run without installing
npx @saeidex/t20 -h
```

## Usage

```bash
t20 -i <path> [options]

# Dry run
t20 -i ./types.ts --dry-run

# Export files to a folder
t20 -i ./src/types.ts -o ./packages/my-twenty-app/src
```

#### Options

*  `-i, --input <path>`            *.ts/*.d.ts file
*  `-o, --output <dir>`            output root directory (default: "src")
*  `--constants-dir <dir>`         output constants directory (default: "constants")
*  `--objects-dir <dir>`           output object directory (default: "objects")
*  `--views-dir <dir>`             output views directory (default: "views")
*  `--nav-menu-items-dir <dir>`    output navigation menu items directory (default: "navigation-menu-items")
*  `-e, --entities [entities...]`  can specify single or multiple entities among: (constant | object | view | navItem)
*  `-p, --print`                   print to console (default: false)
*  `-d, --dry-run`                 print outputs to console, do not write on disk (default: false)
*  `-c, --clipboard`               copy object to clipboard (default: false)
*  `-v, --version`                 output the version number
*  `-h, --help`                    display help for command

### Example Types Definitions

> [!WARNING]
> Relation fields are not supported yet.

```ts
import { FieldType } from "twenty-sdk/define";

// ------------------------
// Types and Interface parse as Object
// ------------------------
type BaseFields = {
  text: FieldType.TEXT;
  uuid: FieldType.UUID;
  numeric: FieldType.NUMERIC;
  rating: FieldType.RATING;
  number: FieldType.NUMBER; 
  position: FieldType.POSITION;
  boolean: FieldType.BOOLEAN;
  dateTime: FieldType.DATE_TIME;
  date: FieldType.DATE;
  array: FieldType.ARRAY;
  rawJson: FieldType.RAW_JSON;
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
  text: FieldType.TEXT; 
  uuid: FieldType.UUID;
  numeric: FieldType.NUMERIC;
  rating: FieldType.RATING;
  number: FieldType.NUMBER; 
  position: FieldType.POSITION;
  boolean: FieldType.BOOLEAN; 
  dateTime: FieldType.DATE_TIME;
  date: FieldType.DATE;
  array: FieldType.ARRAY;
  rawJson: FieldType.RAW_JSON; 
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

// ------------------------
// `*At` fields are parse as `Date`
// ------------------------
type DateFields = {
  createdAt: string; // #sameAs `createdAt: FieldType.DATE_TIME;`
  updatedAt: string; // or #sameAs `updatedAt: Date;`
};

// ------------------------
// `id`, `uuid`, `UUID` and `*Id` fields are parse as `FieldType.UUID`
// ------------------------
type UUIDFields = {
  id: string; // #sameAs `id: FieldType.UUID;`
  uuid: string;
  orderId: string;
}

type NativeFields = {
  text: string; // #sameAs `text: FieldType.TEXT;`
  number: number; // #sameAs `number: FieldType.NUMBER;`
  boolean: boolean; // #sameAs `boolean: FieldType.BOOLEAN;`
  rawJson: object; // #sameAs `rawJson: FieldType.RAW_JSON;`
  array: unknown[]; // #sameAs `array: FieldType.ARRAY;`
  dateTime: Date; // #sameAs `dateTime: FieldType.DATE_TIME;`
};

// ------------------------
// SELECT and MULTI-SELECT
// ------------------------
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
  roles: ("admin" | "user" | "guest")[];
  languages: Array<Language>;
  priorities: Priority[];
};
```
