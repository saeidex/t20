import path from "node:path";
import type { ObjectName } from "../user-prompts.js";
import {
  fileNameTransformers,
  toNavMenuItemName,
  toViewName,
} from "../utils/to-names.js";
import type { CliOptions } from "../create-cli.js";
import type {
  OutputDirs} from "./resolve-output-directories.js";
import {
  resolveOutputDirectories,
} from "./resolve-output-directories.js";

export type Context = {
  names: {
    [key in keyof Omit<
      OutputDirs,
      "root" | "objects"
    >]: Array<string>;
  } & {
    objects: Array<
      ObjectName & {
        output: string;
      }
    >;
  };
  paths: {
    [key in keyof Omit<OutputDirs, "root">]: Array<string>;
  };
};

export function resolveContext(
  cliOptions: CliOptions,
  objectNames: Map<string, ObjectName>
): Context {
  const pluralNames = Array.from(objectNames.values()).map(
    (name) => name.plural
  );

  const names = {
    objects: Array.from(objectNames.values()).map((name) => {
      return {
        ...name,
        output: name.singular,
      };
    }),
    views: pluralNames.map((name) => toViewName(name)),
    navMenuItems: pluralNames.map((name) =>
      toNavMenuItemName(name)
    ),
  } as const satisfies Context["names"];

  const dirs = resolveOutputDirectories(cliOptions);
  const paths = getInitialPaths();

  for (const key of Object.keys(names) as Array<
    keyof Context["names"]
  >) {
    const entries =
      key === "views" ? names["objects"] : names[key];
    const transformer = fileNameTransformers[key];

    entries.forEach((e, idx) => {
      paths[key][idx] = path.join(
        dirs[key],
        transformer(typeof e === "string" ? e : e.output)
      );
    });
  }

  return {
    names,
    paths,
  };
}

const getInitialPaths = () => {
  return {
    objects: [],
    views: [],
    navMenuItems: [],
  } as Context["paths"];
};
