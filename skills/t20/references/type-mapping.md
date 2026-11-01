# t20 type mapping reference

Resolution lives in `src/internal/resolvers/resolve-field.ts`. The order below is the actual order; the first resolver that returns a field wins.

## 1. Explicit FieldType member

```ts
import type { FieldType } from "twenty-sdk/define";

type Product = {
  title: FieldType.TEXT;
  score: FieldType.RATING;
  payload: FieldType.RAW_JSON;
};
```

`FieldType` or `FieldMetadataType` members are copied through. A bare `FieldType.RELATION` is **not** wired to a target; use object references instead.

## 2. Indexed access relation

```ts
type School = {
  id: string;
  teachers: Array<Teacher["id"]>;
};

type Teacher = {
  id: string;
  school: School["id"];
};
```

- `Teacher["id"]` → many-to-one to `Teacher`, target field `id`.
- `Array<Teacher["id"]>` → one-to-many.
- `Readonly<...>`, `Array<...>`, `ReadonlyArray<...>`, and `| null | undefined` are unwrapped.
- The target type name must be a known top-level object in the same input file.

## 3. Name heuristics

These run before native/select/relation resolution, so they override the declared type.

| Name | Result | Why |
| --- | --- | --- |
| `createdAt`, `updatedAt`, `publishedAt` | `DATE_TIME` | matches `/(?:^|[a-z])At$/` |
| `id`, `userid`, `valid`, `paid`, `identity`, `USER_ID` | `UUID` | contains literal lowercase `id` or uppercase `ID` |
| `universalIdentifier`, `UniversalIdentifier` | `UUID` | matches `/universalidentifier/i` |
| `orderId`, `userId`, `externalId`, `categoryId` | **not** UUID | camelCase `Id` matches neither `/(id\|ID)/` nor the dead `*Id` branch |
| `At` | `DATE_TIME` | the regex allows the start of the string |

The `*Id` branch in `resolve-date-suffix-and-uuid-types.ts` is unreachable: its condition contains `!ts.TypeFlags.String && !ts.TypeFlags.Number`, which is always false because both enum values are truthy. Consequently:

```ts
type Order = {
  orderId: string; // TEXT
  valid: string;   // UUID (!)
};
```

Use `FieldType.UUID` explicitly when you need a UUID but the name is not a reliable signal:

```ts
type Order = {
  orderId: FieldType.UUID;
};
```

## 4. Enums → SELECT

```ts
enum Priority {
  Low = "low",
  High = "high",
}

type Task = {
  priority: Priority;
};
```

Emits:

```ts
enum Priority {
  LOW = "LOW",
  HIGH = "HIGH",
}
```

and a `FieldType.SELECT` field with options. Member names and values are snake-cased and uppercased. Option labels are Title Case of the value, color is always `"gray"`, positions are zero-based.

## 5. Literal unions → SELECT

```ts
type Task = {
  status: "todo" | "doing" | "done";
};
```

Synthesizes an enum named from the field (`Status`) with members `TODO`, `DOING`, `DONE`.

## 6. Array selects → MULTI_SELECT

```ts
type Task = {
  roles: ("admin" | "user")[];
  priorities: Priority[];
  labels: Array<"bug" | "feature">;
};
```

All produce `FieldType.MULTI_SELECT` with options and an emitted enum.

```ts
type Task = {
  tags: string[]; // MULTI_SELECT with NO options
  scores: number[]; // ARRAY
};
```

`string[]` becomes a multi-select without choices, which is usually not useful. Prefer a literal union.

## 7. Object relations

```ts
type Project = {
  id: string;
  client: Client;       // MANY_TO_ONE
  tasks: Task[];        // ONE_TO_MANY
};
```

- Single known object → many-to-one.
- Array of a known object → one-to-many.
- Both sides declaring arrays → t20 detects many-to-many and creates a junction object.
- Unknown/imported object types do not resolve as relations; they fall through to `TEXT` (named entity) or `RAW_JSON` (anonymous shape).

## 8. Native and fallback types

| TypeScript | FieldType |
| --- | --- |
| `string` | `TEXT` |
| `number`, `bigint` | `NUMBER` |
| `boolean` | `BOOLEAN` |
| `Date` | `DATE_TIME` |
| `object`, `Record<string, unknown>`, anonymous object literal | `RAW_JSON` |
| tuple or non-object array | `ARRAY` |
| no match | `TEXT` |

`id` and `name` are skipped before resolution, on every object.

## Many-to-many examples

### Simple junction

```ts
interface Student {
  id: string;
  courses: Course[];
}

interface Course {
  id: string;
  students: Student[];
}
```

Generates `StudentCourse` with `name`, `id`, `student` (many-to-one), and `course` (many-to-one). `Student` and `Course` both point at it with one-to-many fields.

### Self-referential

```ts
interface Node {
  id: string;
  children: Node[];
  parents: Node[];
}
```

Junction name is derived from the node plus both field names to avoid collisions.

### Indexed-access junction style

The repository test fixture uses:

```ts
export type School = {
  id: string;
  teachers: Array<Teacher["id"]>;
  students: Array<Student["id"]>;
};

type Teacher = {
  id: string;
  school: School["id"];
};

type Student = {
  id: string;
  school: School["id"];
};
```

Each indexed relation names its target field, so the inverse pairing is unambiguous. `School` acts as the junction because both sides are one-to-many toward it.

## Naming and output derivation

- Singular: `camelCase(singular(nodeName))`
- Plural: `camelCase(plural(singular))`
- Object file: `<kebab-singular>.object.ts`
- View file: `<kebab-singular>.view.ts`
- Nav file: `<kebab-singular>.navigation-menu-item.ts`
- View name: `All <Title Case Plural>`
- Nav name: kebab singular
- Labels: Title Case
- Field names: camelCase
- UID variables: `SCREAMING_SNAKE_<ENTITY>_UNIVERSAL_IDENTIFIER`

`--plural-file-names <anything>` switches the three file names to the plural form. It does not change view/nav display names.

## Seed derivation

With `--seed S`:

- Object/view/nav UUID: `deriveUuid("S:<UID_VAR_NAME>")`
- Field UUID: `deriveUuid("S:<ObjectNodeName>:<FIELD_UID_VAR_NAME>")`
- View-field UUID: `deriveUuid("S:<ObjectNodeName>:view-field:<fieldName>")`

`deriveUuid` is a UUIDv5-shaped SHA-1 hash, so values are stable across runs and distinct per seed. Without a seed, UUIDv4 values are random on every run.
