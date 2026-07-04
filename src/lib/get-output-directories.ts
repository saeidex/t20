import path from "node:path";
import { CliOptions } from "../cli/create-cli.js";

export type OutputDir = {
  root: string;
  constants: string;
  objects: string;
  views: string;
  navMenuItems: string;
};

const getRelativePathFromCwd = (targetPath: string): string =>
  path.relative(".", targetPath);

export function getOutputDirectories(
  opts: CliOptions
): OutputDir {
  const root = getRelativePathFromCwd(opts.output);

  const getDir = (dir: string): string => root + `/${dir}`;

  const constants = getDir(opts.constantsDir);
  const objects = getDir(opts.objectsDir);
  const views = getDir(opts.viewsDir);
  const navMenuItems = getDir(opts.navMenuItemsDir);

  return {
    root,
    constants,
    objects,
    views,
    navMenuItems,
  };
}
