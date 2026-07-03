import path from "node:path";

export type OutputDir = {
  root: string;
  constants: string;
  objects: string;
  views: string;
  navMenuItems: string;
};

const DEFAULT_ROOT_DIR = "src";
const DEFAULT_CONSTANTS_DIR = "constants";
const DEFAULT_OBJECTS_DIR = "objects";
const DEFAULT_VIEWS_DIR = "views";
const DEFAULT_NAV_MENU_ITEMS_DIR = "navigation-menu-items";

const getDir = (root: string, child: string) => {
  return path.join(`${root}/${child}`);
};

export function getOutputDirectories(
  outputroot?: string
): OutputDir {
  let root = outputroot ?? DEFAULT_ROOT_DIR;
  if (path.isAbsolute(root))
    root = path.relative(path.dirname("."), root);

  const constants = getDir(root, DEFAULT_CONSTANTS_DIR);
  const objects = getDir(root, DEFAULT_OBJECTS_DIR);
  const views = getDir(root, DEFAULT_VIEWS_DIR);
  const navMenuItems = getDir(root, DEFAULT_NAV_MENU_ITEMS_DIR);

  return {
    root,
    constants,
    objects,
    views,
    navMenuItems,
  };
}
