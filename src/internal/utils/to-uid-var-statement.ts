import dedent from "ts-dedent";
import { v4 } from "uuid";

export const toUidVarStatement = (
  ...uidVarNames: Array<string>
): string => {
  if (!uidVarNames || uidVarNames.length === 0) {
    return "";
  }

  return uidVarNames
    .map(
      (uidVarName) => dedent`
        export const ${uidVarName} =
          "${v4()}";`
    )
    .join("\n");
};
