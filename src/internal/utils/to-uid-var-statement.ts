import dedent from "ts-dedent";
import { v4 } from "uuid";
import { deriveUuid } from "./derive-uuid.js";

export const toUidVarStatement = (
  seed: string | undefined,
  ...uidVarNames: Array<string>
): string => {
  if (!uidVarNames || uidVarNames.length === 0) {
    return "";
  }

  return uidVarNames
    .map((uidVarName) => {
      const value = seed
        ? deriveUuid(`${seed}:${uidVarName}`)
        : v4();

      return dedent`
        export const ${uidVarName} =
          "${value}";`;
    })
    .join("\n");
};
