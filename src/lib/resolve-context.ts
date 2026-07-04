import path from "node:path";
import {
  getOutputDirectories,
  OutputDir,
} from "./get-output-directories.js";
import { ObjectName } from "./user-prompts.js";
import {
  fileNameTransformers,
  toNavMenuItemName,
  toViewName,
} from "./utils/to-names.js";
import { CliOptions } from "../cli/create-cli.js";

export type Context = {
  names: {
    [key in keyof Omit<
      OutputDir,
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
    [key in keyof Omit<OutputDir, "root">]: Array<string>;
  };
};

export function resolveContext(
  cliOptions: CliOptions,
  objectNames: Array<ObjectName>
): Context {
  const names = {
    constants: objectNames.map((name) => name.singular),
    objects: objectNames.map((name) => ({
      ...name,
      output: name.singular,
    })),
    views: objectNames.map((name) => toViewName(name.plural)),
    navMenuItems: objectNames.map((name) =>
      toNavMenuItemName(name.plural)
    ),
  } as const satisfies Context["names"];

  const dirs = getOutputDirectories(cliOptions);
  const paths = getInitialPaths();

  for (const key of Object.keys(names) as Array<
    keyof Context["names"]
  >) {
    const entries = names[key];
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
    constants: [],
    objects: [],
    views: [],
    navMenuItems: [],
  } as Context["paths"];
};
