import path from "node:path";
import dedent from "ts-dedent";
import { logErrorAndExit } from "./log-error-and-exit.js";

export function toImportStatement(
  importFromFile: string,
  importToFile: string,
  ...vars: Array<string>
): string {
  if (vars.length == 0) {
    logErrorAndExit(
      "[To_IMPORT_STATEMENT]: Variables not found!"
    );
  }

  const fromDir = path.dirname(importToFile);
  const { dir, name } = path.parse(
    path.relative(fromDir, importFromFile)
  );
  const fromRelativePath = `${dir}/${name}`;

  return dedent`import {
      ${vars.join(",\n")}
    } from "${fromRelativePath}"`;
}
