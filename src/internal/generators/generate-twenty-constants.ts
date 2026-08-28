import { dedent } from "ts-dedent";
import { v4 } from "uuid";
import fs from "node:fs";
import { ObjectMapEntry } from "../types.js";

export function generateTwentyConstants(
  entry: ObjectMapEntry
): string {
  const filePath = entry.results.constant.filePath;
  const existingContent = fs.existsSync(filePath)
    ? fs.readFileSync(filePath, "utf-8")
    : "";

  return [
    entry.results.object.uidVarName,
    entry.results.view.uidVarName,
    entry.results.navMenuItem.uidVarName,
  ]
    .map((name) => {
      const varDecl = `export const ${name}`;
      const isDuplicate = existingContent.includes(varDecl);

      if (isDuplicate) return undefined;

      return dedent`
        ${varDecl} =
          "${v4()}"`.trimStart();
    })
    .filter((line): line is string => line !== undefined)
    .join("\n")
    .trim();
}
