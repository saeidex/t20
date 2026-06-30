import dedent from "ts-dedent";
import { generateTwentyViewFields } from "./generate-twenty-view-fields.js";
import type { IRField } from "./types.js";
import { toCamelCase } from "./utils/case-transformation.js";
import { toUidVarName } from "./utils/to-uid-var-name.js";
import { toUidVarStatement } from "./utils/to-uid-var-statement.js";

export function generateTwentyView(
  viewName: string,
  objectName: string,
  fields: Array<IRField>
): string {
  const viewUidVarName = toUidVarName(viewName, "VIEW");
  const viewUidVarStatement = toUidVarStatement(viewUidVarName);
  const objectUidVarName = toUidVarName(objectName, "OBJECT");

  const { fieldMetadataUidsImportStatement, viewFields } =
    generateTwentyViewFields(objectName, fields);

  return dedent`import { defineView, ViewFilterOperand, ViewKey } from "twenty-sdk/define";
                ${fieldMetadataUidsImportStatement}

                ${viewUidVarStatement}

                export default defineView({
                  universalIdentifier: ${viewUidVarName},
                  name: "${viewName}",
                  objectUniversalIdentifier: ${objectUidVarName},
                  icon: "IconList",
                  key: ViewKey.INDEX,
                  position: 0,
                  fields: [
                    ${viewFields}
                  ],
                });
         `;
}
