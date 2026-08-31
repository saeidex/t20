import dedent from "ts-dedent";

import { generateTwentyViewFields } from "./generate-twenty-view-fields.js";
import type { ObjectMapEntry } from "../types.js";
import { toImportStatement } from "../utils/to-import-statement.js";
import { tempStore } from "../utils/temp-store.js";

export function generateTwentyView(
  entry: ObjectMapEntry
): string {
  const uidVarsImportStatement = toImportStatement(
    entry.results.object.filePath,
    entry.results.view.filePath,
    entry.results.object.uidVarName
  );

  const viewUidVarStatement = entry.results.view.uidVarStatement;

  const { fieldMetadataUidsImportStatement, viewFields } =
    generateTwentyViewFields(entry);

  const viewPositionStore = tempStore().viewsPositionStore;

  const output = dedent`import { defineView, ViewKey } from "twenty-sdk/define";
                ${uidVarsImportStatement}
                ${fieldMetadataUidsImportStatement}

                ${viewUidVarStatement}

                export default defineView({
                  universalIdentifier: ${
                    entry.results.view.uidVarName
                  },
                  name: "${entry.results.view.name}",
                  objectUniversalIdentifier: ${
                    entry.results.object.uidVarName
                  },
                  icon: "IconList",
                  key: ViewKey.INDEX,
                  position: ${viewPositionStore.getPositionAndIncrement()},
                  fields: [
                    ${viewFields}
                  ],
                });
         `;

  return output;
}
