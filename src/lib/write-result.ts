import fs from "node:fs";

import { CliOptions } from "../cli/create-cli.js";
import { getOutputDirectories } from "./get-output-directories.js";
import { isEntityIncludes } from "./utils/is-entity-includes.js";
import { Context } from "./resolve-context.js";
import { Result } from "./generate-result.js";

export function writeResult(
  ctx: Context,
  opts: CliOptions,
  result: Result
): void {
  const dirs = getOutputDirectories(opts);

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
      if (fs.existsSync(p)) {
        fs.appendFileSync(p, result.constants[i], "utf-8");
      } else {
        fs.mkdirSync(dirs.constants, { recursive: true });
        fs.writeFileSync(p, result.constants[i], "utf-8");
      }
    });
  }
}
