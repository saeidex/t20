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
import { toUidVarStatement } from "./to-uid-var-statement.js";

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

  const objectUidVarName = toUidVarName(
    objectSingularName,
    "OBJECT"
  );
  const viewUidVarName = toUidVarName(
    objectSingularName,
    "VIEW"
  );
  const navMenuItemUidVarName = toUidVarName(
    objectSingularName,
    "NAV_MENU_ITEM"
  );

  return {
    object: {
      name: objectNodeName,
      fileName: objectFileName,
      filePath: objectFilePath,
      uidVarName: objectUidVarName,
      uidVarStatement: toUidVarStatement(
        opts.seed,
        objectUidVarName
      ),
    },
    view: {
      name: viewName,
      fileName: viewFileName,
      filePath: viewFilePath,
      uidVarName: viewUidVarName,
      uidVarStatement: toUidVarStatement(
        opts.seed,
        viewUidVarName
      ),
    },
    navMenuItem: {
      name: navMenuItemName,
      fileName: navMenuItemFileName,
      filePath: navMenuItemFilePath,
      uidVarName: navMenuItemUidVarName,
      uidVarStatement: toUidVarStatement(
        opts.seed,
        navMenuItemUidVarName
      ),
    },
  };
}
