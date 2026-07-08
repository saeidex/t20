import ts from "typescript";
import { FieldType } from "twenty-sdk/define";
import type { IRField } from "../types.js";
import { resolveBaseTypes } from "./resolve-base-types.js";
import { resolveNativeTypes } from "./resolve-native-types.js";
import { resolveDateAndStringTypes } from "./resolve-date-and-string-types.js";
import { resolveMultiSelectType } from "./resolve-multi-select-types.js";
import { resolveArrayType } from "./resolve-array-types.js";
import { resolveSelectTypes } from "./resolve-select-types.js";
import { resolveRelationType } from "./resolve-relation-types.js";

export function resolveField(
  checker: ts.TypeChecker,
  name: string,
  type: ts.Type,
  typeNode?: ts.TypeNode,
  knownObjectNames?: Set<string>
): IRField {
  return (
    resolveBaseTypes(name, type) ??
    resolveDateAndStringTypes(checker, name, type) ??
    resolveSelectTypes(name, type) ??
    resolveMultiSelectType(checker, name, type) ??
    resolveRelationType(checker, name, type, knownObjectNames) ??
    resolveArrayType(checker, name, type) ??
    resolveNativeTypes(checker, name, type) ?? {
      name,
      kind: FieldType.TEXT,
    }
  );
}
