import {
  toNavMenuItemFileName,
  toNavMenuItemName,
  toObjectFileName,
  toObjectNamePlural,
  toObjectNameSingular,
  toViewFileName,
  toViewName,
} from "./to-names.js";
import type { Results } from "../types.js";
import { toUidVarName } from "./to-uid-var-name.js";
import { resolveOutputDirectories } from "../resolvers/resolve-output-directories.js";
import { getCliOptions } from "../create-cli.js";

export function toResultsMap(
  objectNodeName: string,
  objectNameSingular?: string,
  objectNamePlural?: string
): Results {
  const opts = getCliOptions();
  const dirs = resolveOutputDirectories(opts);

  // TODO: pluarl name should contain singular name
  // example: "user" -> "users"
  // possible fixes: invalid names pass to the user to review
  const objectPluralName =
    objectNamePlural ?? toObjectNamePlural(objectNodeName);
  const objectSingularName =
    objectNameSingular ?? toObjectNameSingular(objectPluralName);

  const viewName = toViewName(objectSingularName);
  const navMenuItemName = toNavMenuItemName(objectSingularName);

  const objectFileName = toObjectFileName(objectSingularName);
  const viewFileName = toViewFileName(objectSingularName);
  const navMenuItemFileName = toNavMenuItemFileName(
    objectSingularName
  );

  const objectFilePath = `${dirs.objects}/${objectFileName}`;
  const viewFilePath = `${dirs.views}/${viewFileName}`;
  const navMenuItemFilePath = `${dirs.navMenuItems}/${navMenuItemFileName}`;

  return {
    object: {
      name: objectNodeName,
      fileName: objectFileName,
      filePath: objectFilePath,
      uidVarName: toUidVarName(objectSingularName, "OBJECT"),
    },
    view: {
      name: viewName,
      fileName: viewFileName,
      filePath: viewFilePath,
      uidVarName: toUidVarName(viewName, "VIEW"),
    },
    navMenuItem: {
      name: navMenuItemName,
      fileName: navMenuItemFileName,
      filePath: navMenuItemFilePath,
      uidVarName: toUidVarName(navMenuItemName, "NAV_MENU_ITEM"),
    },
  };
}
