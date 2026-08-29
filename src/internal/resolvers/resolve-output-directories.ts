import path from "node:path";
import type { CliOptions } from "../create-cli.js";

export type OutputDirs = {
  root: string;
  objects: string;
  views: string;
  navMenuItems: string;
};

const getRelativePathFromCwd = (targetPath: string): string =>
  path.relative(".", targetPath);

export function resolveOutputDirectories(
  opts: CliOptions
): OutputDirs {
  const root = getRelativePathFromCwd(opts.output);

  const getDir = (dir: string): string => root + `/${dir}`;

  const objects = getDir(opts.objectsDir);
  const views = getDir(opts.viewsDir);
  const navMenuItems = getDir(opts.navMenuItemsDir);

  return {
    root,
    objects,
    views,
    navMenuItems,
  };
}
