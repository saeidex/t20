import dedent from "ts-dedent";

import { generateTwentyViewFields } from "./generate-twenty-view-fields.js";
import type { ObjectMapEntry } from "../types.js";
import { toImportStatement } from "../utils/to-import-statement.js";
import { tempStore } from "../utils/temp-store.js";

export function generateTwentyView(
  objectEntry: ObjectMapEntry
): string {
  const viewUidImportStatement = toImportStatement(
    objectEntry.results.constant.filePath,
    objectEntry.results.view.filePath,
    objectEntry.results.object.uidVarName!,
    objectEntry.results.view.uidVarName!
  );

  const { fieldMetadataUidsImportStatement, viewFields } =
    generateTwentyViewFields(
      objectEntry.results.object.filePath,
      objectEntry.results.view.filePath,
      objectEntry.fields
    );

  const viewPositionStore = tempStore().viewsPositionStore;

  const output = dedent`import { defineView, ViewKey } from "twenty-sdk/define";
                ${viewUidImportStatement}
                ${fieldMetadataUidsImportStatement}

                export default defineView({
                  universalIdentifier: ${
                    objectEntry.results.view.uidVarName
                  },
                  name: "${objectEntry.results.view.name}",
                  objectUniversalIdentifier: ${
                    objectEntry.results.object.uidVarName
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
