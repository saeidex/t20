# t20 - Types to Twenty

**A scaffolding CLI tool for [Twenty CRM](https://github.com/twentyhq/twenty).** Automatically generate objects, fields, views & directly from your TypeScript definitions.

![screenshot](https://raw.githubusercontent.com/saeidex/t20/refs/heads/main/public/screenshot.png?token=GHSAT0AAAAAAEA725WLTK3MYINYVPOYU4DI2SDI7JQ)

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
```

#### Options

* `-i, --input <path>` : Path to TypeScript file (e.g., `types.ts`). **(Required)**
* `-o, --output <dir>` : Directory to save generated metadata.
* `-p, --print`        : Output result directly to the terminal.
* `-c, --clipboard`    : Copy result straight to clipboard.
* `-h, --help`         : Show help interface.

#### Examples

```bash
# Print fields to console
t20 -i ./types.ts -p

# Export files to a folder
t20 -i ./types.ts -o ./packages/my-twenty-app/src
```

## Twenty Field Compatibility Checklist

Below is the status checklist for mapping TypeScript code definitions into Twenty's `FieldType/FieldMetadataType`.

### 🟩 Supported & Implemented

* [x] **`UUID`** *Triggers on `string` variables where the property name contains `id`, `uuid`, or `universalidentifier` (case-insensitive).*
* [x] **`DATE_TIME`** *Triggers if explicitly typed as `Date`, or if the property name contains the substring `at` (e.g., `createdAt: any`).*
* [x] **`SELECT`** *Triggers on explicit TypeScript `enum` properties or inline string literal unions (e.g., `"ACTIVE" | "INACTIVE"`).*
* [x] **`TEXT`** *The default fallback for standard `string` fields.*
* [x] **`NUMBER`** *The default fallback for standard `number` fields.*
* [x] **`BOOLEAN`** *The default fallback for standard `boolean` fields.*

### 🟥 Unsupported / Not Implemented

* [ ] **`ARRAY`**
* [ ] **`ACTOR`**
* [ ] **`ADDRESS`**
* [ ] **`CURRENCY`** *(Falls back to `NUMBER`)*
* [ ] **`DATE`** *(Falls back to `DATE_TIME`)*
* [ ] **`EMAILS`** *(Falls back to `TEXT`)*
* [ ] **`FILES`**
* [ ] **`FULL_NAME`** *(Falls back to `TEXT`)*
* [ ] **`LINKS`** *(Falls back to `TEXT`)*
* [ ] **`MORPH_RELATION`**
* [ ] **`MULTI_SELECT`**
* [ ] **`NUMERIC`** *(Falls back to `NUMBER`)*
* [ ] **`PHONES`** *(Falls back to `TEXT`)*
* [ ] **`POSITION`** *(Falls back to `NUMBER`)*
* [ ] **`RATING`** *(Falls back to `NUMBER`)*
* [ ] **`RAW_JSON`**
* [ ] **`RELATION`**
* [ ] **`RICH_TEXT`**
* [ ] **`TS_VECTOR`**

---

## Example Mapping

```ts
export type Product = {
  id: number;                     // 🟥 NUMBER (Needs to be a string to map to UUID)
  sku?: string;                   // 🟩 TEXT
  name: string;                   // 🟩 TEXT
  slug: string;                   // 🟩 TEXT
  permalink: string;              // 🟥 TEXT (LINKS not supported)
  status: ProductStatus;          // 🟩 SELECT
  type: ProductType;              // 🟩 SELECT
  description?: string;           // 🟩 TEXT
  shortDescription?: string;      // 🟩 TEXT
  price: number;                  // 🟥 NUMBER (CURRENCY not supported)
  regularPrice: number;           // 🟥 NUMBER
  salePrice: number;              // 🟥 NUMBER
  onSale: boolean;                // 🟩 BOOLEAN
  purchasable: boolean;           // 🟩 BOOLEAN
  totalSales: number;             // 🟩 NUMBER
  taxStatus: TaxStatus;           // 🟩 SELECT
  stockQuantity: number;          // 🟩 NUMBER
  stockStatus: StockStatus;       // 🟩 SELECT
  backordersAllowed: boolean;     // 🟩 BOOLEAN
  weight?: number;                // 🟩 NUMBER
  purchaseNoteToCustomer: string; // 🟩 TEXT
  createdAt?: Date;               // 🟩 DATE_TIME
  updatedAt?: Date;               // 🟩 DATE_TIME
};
```

Here is the resulting object fields for the `Product` type mapping based on the implemented rules and unsupported fallbacks:

```json
[
  { "name": "id", "kind": "NUMBER" },
  { "name": "sku", "kind": "TEXT" },
  { "name": "name", "kind": "TEXT" },
  { "name": "slug", "kind": "TEXT" },
  { "name": "permalink", "kind": "TEXT" },
  { 
    "name": "status", 
    "kind": "SELECT", 
    "options": [/* options inferred from ProductStatus enum */] 
  },
  { 
    "name": "type", 
    "kind": "SELECT", 
    "options": [/* options inferred from ProductType enum */] 
  },
  { "name": "description", "kind": "TEXT" },
  { "name": "shortDescription", "kind": "TEXT" },
  { "name": "price", "kind": "NUMBER" },
  { "name": "regularPrice", "kind": "NUMBER" },
  { "name": "salePrice", "kind": "NUMBER" },
  { "name": "onSale", "kind": "BOOLEAN" },
  { "name": "purchasable", "kind": "BOOLEAN" },
  { "name": "totalSales", "kind": "NUMBER" },
  { 
    "name": "taxStatus", 
    "kind": "SELECT", 
    "options": [/* options inferred from TaxStatus enum */] 
  },
  { "name": "stockQuantity", "kind": "NUMBER" },
  { 
    "name": "stockStatus", 
    "kind": "SELECT", 
    "options": [/* options inferred from StockStatus enum */] 
  },
  { "name": "backordersAllowed", "kind": "BOOLEAN" },
  { "name": "weight", "kind": "NUMBER" },
  { "name": "purchaseNoteToCustomer", "kind": "TEXT" },
  { "name": "createdAt", "kind": "DATE_TIME" },
  { "name": "updatedAt", "kind": "DATE_TIME" }
]
```
