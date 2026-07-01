import dedent from "ts-dedent";
import { generateTwentyViewFields } from "./generate-twenty-view-fields.js";
import type { IRField } from "./types.js";
import { toUidVarName } from "./utils/to-uid-var-name.js";
import { toUidVarStatement } from "./utils/to-uid-var-statement.js";

export function generateTwentyView(
  viewName: string,
  viewFilePath: string,
  objectUidVarName: string,
  objectFilePath: string,
  fields: Array<IRField>
): {
  viewUidVarName: string;
  output: string;
} {
  const viewUidVarName = toUidVarName(viewName, "VIEW");
  const viewUidVarStatement = toUidVarStatement(viewUidVarName);

  const { fieldMetadataUidsImportStatement, viewFields } =
    generateTwentyViewFields(
      objectUidVarName,
      objectFilePath,
      viewFilePath,
      fields
    );

  const output = dedent`import { defineView, ViewFilterOperand, ViewKey } from "twenty-sdk/define";
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

  return {
    viewUidVarName,
    output,
  };
}
