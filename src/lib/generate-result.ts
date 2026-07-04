import ts from "typescript";
import { extractObjectFields } from "./extract-object-fields.js";
import { Context } from "./resolve-context.js";
import { generateTwentyObject } from "./generate-twenty-object.js";
import { generateTwentyView } from "./generate-twenty-view.js";
import { generateTwentyNavMenuItem } from "./generate-twenty-nav-menu-item.js";
import { generateTwentyConstants } from "./generate-twenty-constants.js";

export type Result = {
  constants: Array<string>;
  objects: Array<string>;
  views: Array<string>;
  navMenuItems: Array<string>;

  objectUidVars: Array<string>;
  viewUidVars: Array<string>;
  navMenuItemUidVars: Array<string>;
};

export function generateResult(
  ctx: Context,
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker
): Result {
  const result: Result = {
    constants: [],
    objects: [],
    views: [],
    navMenuItems: [],
    objectUidVars: [],
    viewUidVars: [],
    navMenuItemUidVars: [],
  };

  for (let i = 0; i < ctx.names.objects.length; i++) {
    const objectFields = extractObjectFields(
      sourceFile,
      checker,
      ctx.names.objects[i].output
    );

    const { objectUidVarName, output: outputObjects } =
      generateTwentyObject({
        nameSingular: ctx.names.objects[i].singular,
        namePlural: ctx.names.objects[i].plural,
        objectFilePath: ctx.paths.objects[i],
        constantFilePath: ctx.paths.constants[i],
        fields: objectFields,
      });
    result.objects.push(outputObjects);
    result.objectUidVars.push(objectUidVarName);

    const { viewUidVarName, output: outputViews } =
      generateTwentyView(
        ctx.names.views[i],
        ctx.paths.views[i],
        ctx.paths.objects[i],
        ctx.paths.constants[i],
        objectUidVarName,
        objectFields
      );
    result.views.push(outputViews);
    result.viewUidVars.push(viewUidVarName);

    const { navMenuItemUidVarName, output: outputNavMenuItem } =
      generateTwentyNavMenuItem(
        ctx.names.navMenuItems[i],
        ctx.paths.navMenuItems[i],
        ctx.paths.objects[i],
        ctx.paths.constants[i],
        objectUidVarName
      );
    result.navMenuItems.push(outputNavMenuItem);
    result.navMenuItemUidVars.push(navMenuItemUidVarName);

    const outputConstants = generateTwentyConstants(
      objectUidVarName,
      viewUidVarName,
      navMenuItemUidVarName
    );
    result.constants.push(outputConstants);
  }

  return result;
}
