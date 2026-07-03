import dedent from "ts-dedent";
import { v4 } from "uuid";

export function generateTwentyConstants(
  ...uidVarNames: Array<string>
): string {
  return uidVarNames
    .map((name) => {
      return dedent`
        export const ${name} =
          "${v4()}"`.trimStart();
    })
    .join("\n");
}
