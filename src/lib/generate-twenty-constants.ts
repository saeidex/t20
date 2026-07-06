import { dedent } from "ts-dedent";
import { v4 } from "uuid";
import { Context } from "./resolvers/resolve-context.js";
import fs from "node:fs";

export function generateTwentyConstants(
  ctx: Context,
  ...uidVarNames: Array<string>
): string {
  const existingContents = ctx.paths.constants
    .filter((path) => fs.existsSync(path))
    .map((path) => fs.readFileSync(path, "utf-8"));

  return uidVarNames
    .map((name) => {
      const varDecl = `export const ${name}`;
      const isDuplicate = existingContents.some((content) =>
        content.includes(varDecl)
      );
      if (isDuplicate) return undefined;

      return dedent`
        ${varDecl} =
          "${v4()}"`.trimStart();
    })
    .filter((line): line is string => line !== undefined)
    .join("\n")
    .trim();
}
