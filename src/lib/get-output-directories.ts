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
  const constants = getRelativePathFromCwd(opts.constantsDir);
  const objects = getRelativePathFromCwd(opts.objectsDir);
  const views = getRelativePathFromCwd(opts.viewsDir);
  const navMenuItems = getRelativePathFromCwd(
    opts.navMenuItemsDir
  );

  return {
    root,
    constants,
    objects,
    views,
    navMenuItems,
  };
}
