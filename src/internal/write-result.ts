import fs from "node:fs";

import { isEntityIncludes } from "./utils/is-entity-includes.js";
import { getCliOptions } from "./create-cli.js";
import { resolveOutputDirectories } from "./resolvers/resolve-output-directories.js";
import type { Result } from "./generators/generate-result.js";
import { markedTerm } from "./marked-term.js";
import dedent from "ts-dedent";

export function writeResultOnFiles(result: Result): void {
  const opts = getCliOptions();
  const dirs = resolveOutputDirectories(opts);

  if (isEntityIncludes(opts.entities, "object")) {
    fs.mkdirSync(dirs.objects, { recursive: true });

    result.objects.forEach((item) => {
      Object.entries(item).forEach(([file, content]) => {
        fs.writeFileSync(file, content, "utf-8");
      });
    });
  }

  if (isEntityIncludes(opts.entities, "view")) {
    fs.mkdirSync(dirs.views, { recursive: true });

    result.views.forEach((item) => {
      Object.entries(item).forEach(([file, content]) => {
        fs.writeFileSync(file, content, "utf-8");
      });
    });
  }

  if (isEntityIncludes(opts.entities, "navItem")) {
    fs.mkdirSync(dirs.navMenuItems, { recursive: true });

    result.navMenuItems.forEach((item) => {
      Object.entries(item).forEach(([file, content]) => {
        fs.writeFileSync(file, content, "utf-8");
      });
    });
  }
}

export function resultOutput(result: Result): string {
  const opts = getCliOptions();
  let res = "";

  if (isEntityIncludes(opts.entities, "object")) {
    result.objects.forEach(({ content, file }) => {
      res += `\n/* ${file} */\n${content}\n`;
    });
  }

  if (isEntityIncludes(opts.entities, "view")) {
    result.views.forEach(({ content, file }) => {
      res += `\n/* ${file} */\n${content}\n`;
    });
  }

  if (isEntityIncludes(opts.entities, "navItem")) {
    result.navMenuItems.forEach(({ content, file }) => {
      res += `\n/* ${file} */\n${content}\n`;
    });
  }

  return dedent(res.trimStart());
}

export function markedResultOutput(content: string) {
  const markedOutput = markedTerm.parse(
    dedent`
        \`\`\`ts
        ${content}
        \`\`\`
        `
  );

  return markedOutput;
}
