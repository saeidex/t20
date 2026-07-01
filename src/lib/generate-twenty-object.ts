import { dedent } from "ts-dedent";
import {
  toCamelCase,
  toTitleCase,
} from "./utils/case-transformation.js";
import type { IRField } from "./types.js";
import { toUidVarName } from "./utils/to-uid-var-name.js";
import { toUidVarStatement } from "./utils/to-uid-var-statement.js";
import { generateTwentyObjectFields } from "./generate-twenty-object-fields.js";

export function generateTwentyObject(data: {
  nameSingular: string;
  namePlural: string;
  fields: Array<IRField>;
}): {
  objectUidVarName: string;
  output: string;
} {
  const { fieldObjects, fieldUidVarDeclarations } =
    generateTwentyObjectFields(data.fields);

  const objectUidVarName = toUidVarName(
    data.nameSingular,
    "OBJECT"
  );
  const objectUidVarStatement =
    toUidVarStatement(objectUidVarName);

  const output = dedent`
    import { defineObject, FieldType } from "twenty-sdk/define";

    ${objectUidVarStatement}

    ${fieldUidVarDeclarations}

    export default defineObject({
      universalIdentifier: ${objectUidVarName},
      nameSingular: "${toCamelCase(data.nameSingular)}",
      namePlural: "${toCamelCase(data.namePlural)}",
      labelSingular: "${toTitleCase(data.nameSingular)}",
      labelPlural: "${toTitleCase(data.namePlural)}",
      icon: "IconBox",
      fields: [
        ${fieldObjects}
      ],
    });
    `;

  return {
    objectUidVarName,
    output,
  };
}
