import fs from "node:fs";

import { isEntityIncludes } from "./utils/is-entity-includes.js";
import { Context } from "./resolvers/resolve-context.js";
import { CliOptions } from "./create-cli.js";
import { resolveOutputDirectories } from "./resolvers/resolve-output-directories.js";
import { Result } from "./generators/generate-result.js";

export function writeResult(
  ctx: Context,
  opts: CliOptions,
  result: Result
): void {
  const dirs = resolveOutputDirectories(opts);

  if (isEntityIncludes(opts.entities, "object")) {
    fs.mkdirSync(dirs.objects, { recursive: true });
    ctx.paths.objects.forEach((p, i) => {
      fs.writeFileSync(p, result.objects[i], "utf-8");
    });
  }
  if (isEntityIncludes(opts.entities, "view")) {
    fs.mkdirSync(dirs.views, { recursive: true });
    ctx.paths.views.forEach((p, i) => {
      fs.writeFileSync(p, result.views[i], "utf-8");
    });
  }
  if (isEntityIncludes(opts.entities, "navItem")) {
    fs.mkdirSync(dirs.navMenuItems, { recursive: true });
    ctx.paths.navMenuItems.forEach((p, i) => {
      fs.writeFileSync(p, result.navMenuItems[i], "utf-8");
    });
  }
  if (isEntityIncludes(opts.entities, "constant")) {
    ctx.paths.constants.forEach((p, i) => {
      const content = result.constants[i];
      if (!content) return;

      if (fs.existsSync(p)) {
        fs.appendFileSync(p, "\n\n" + content, "utf-8");
      } else {
        fs.mkdirSync(dirs.constants, { recursive: true });
        fs.writeFileSync(p, content, "utf-8");
      }
    });
  }
}
