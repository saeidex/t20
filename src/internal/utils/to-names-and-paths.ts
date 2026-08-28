import {
  toConstantFileName,
  toNavMenuItemFileName,
  toNavMenuItemName,
  toObjectFileName,
  toObjectNamePlural,
  toObjectNameSingular,
  toViewFileName,
  toViewName,
} from "./to-names.js";
import { ResultEntity } from "../types.js";
import { toUidVarName } from "./to-uid-var-name.js";
import { resolveOutputDirectories } from "../resolvers/resolve-output-directories.js";
import { getCliOptions } from "../create-cli.js";

type NamesAndPathsResults = {
  constant: ResultEntity;
  object: ResultEntity;
  view: ResultEntity;
  navMenuItem: ResultEntity;
};

export function toNamesAndPaths(
  objectNodeName: string,
  objectNameSingular?: string,
  objectNamePlural?: string
): NamesAndPathsResults {
  const opts = getCliOptions();
  const dirs = resolveOutputDirectories(opts);

  // TODO: pluarl name should contain singular name
  // example: "user" -> "users"
  // possible fixes: invalid names pass to the user to review
  const objectPluralName =
    objectNameSingular ?? toObjectNamePlural(objectNodeName);
  const objectSingularName =
    objectNamePlural ?? toObjectNameSingular(objectPluralName);

  const viewName = toViewName(objectPluralName);
  const navMenuItemName = toNavMenuItemName(objectPluralName);

  const objectFileName = toObjectFileName(objectSingularName);
  const constantFileName = toConstantFileName(
    objectSingularName
  );
  const viewFileName = toViewFileName(objectSingularName);
  const navMenuItemFileName = toNavMenuItemFileName(
    objectSingularName
  );

  const objectFilePath = `${dirs.objects}/${objectFileName}`;
  const constantFilePath = `${dirs.constants}/${constantFileName}`;
  const viewFilePath = `${dirs.views}/${viewFileName}`;
  const navMenuItemFilePath = `${dirs.navMenuItems}/${navMenuItemFileName}`;

  return {
    object: {
      name: objectNodeName,
      fileName: objectFileName,
      filePath: objectFilePath,
      uidVarName: toUidVarName(objectSingularName, "OBJECT"),
    },
    constant: {
      name: "",
      fileName: constantFileName,
      filePath: constantFilePath,
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
