import path from "node:path";
import { styleText } from "node:util";
import dedent from "ts-dedent";

export function toImportStatement(
  importFromFile: string,
  importToFile: string,
  ...vars: Array<string>
): string {
  if (vars.length == 0) {
    console.warn(
      styleText("yellow", "[WARNING]: No Field founds!")
    );
  }

  const fromDir = path.dirname(importToFile);
  const relativePath = path.relative(fromDir, importFromFile);

  const name = path.parse(relativePath).name;
  const dir = path.dirname(relativePath);

  const fromRelativePath = `${dir}/${name}`;

  return dedent`import {
      ${vars.join(",\n")}
    } from "${fromRelativePath}"`;
}
