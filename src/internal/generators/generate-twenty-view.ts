import dedent from "ts-dedent";

import { generateTwentyViewFields } from "./generate-twenty-view-fields.js";
import type { ObjectMapEntry } from "../types.js";
import { toImportStatement } from "../utils/to-import-statement.js";
import { tempStore } from "../utils/temp-store.js";
import { toUidVarStatement } from "../utils/to-uid-var-statement.js";

export function generateTwentyView(
  entry: ObjectMapEntry
): string {
  const uidVarsImportStatement = toImportStatement(
    entry.results.object.filePath,
    entry.results.view.filePath,
    entry.results.object.uidVarName
  );

  const uidVarDeclarationStatement = toUidVarStatement(
    entry.results.view.uidVarName
  );

  const { fieldMetadataUidsImportStatement, viewFields } =
    generateTwentyViewFields(entry);

  const viewPositionStore = tempStore().viewsPositionStore;

  const output = dedent`import { defineView, ViewKey } from "twenty-sdk/define";
                ${uidVarsImportStatement}
                ${fieldMetadataUidsImportStatement}

                ${uidVarDeclarationStatement}

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
