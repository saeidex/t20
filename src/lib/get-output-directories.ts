import path from "node:path";

export type OutputDir = {
  root: string;
  objects: string;
  views: string;
  navMenuItems: string;
};

const DEFAULT_ROOT_DIR = "src";
const OBJECTS_DIR = "objects";
const VIEWS_DIR = "views";
const NAV_MENU_ITEMS_DIR = "navigation-menu-items";

export function getOutputDirectories(
  outputroot?: string
): OutputDir {
  const root = outputroot ?? DEFAULT_ROOT_DIR;
  const objects = path.join(`${root}/${OBJECTS_DIR}`);
  const views = path.join(`${root}/${VIEWS_DIR}`);
  const navMenuItems = path.join(
    `${root}/${NAV_MENU_ITEMS_DIR}`
  );

  return {
    root,
    objects,
    views,
    navMenuItems,
  };
}
