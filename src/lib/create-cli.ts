import { Command } from "commander";
import { styleText } from "node:util";
import packageJson from "../../package.json" with { type: "json" };
import { logErrorAndExit } from "./utils/log-error-and-exit.js";

export type Entity = "constant" | "object" | "view" | "navItem";

const VALID_ENTITIES = new Set<Entity>([
  "constant",
  "object",
  "view",
  "navItem",
]);

export type CliOptions = {
  input: string;
  output: string;
  constantsDir: string;
  objectsDir: string;
  viewsDir: string;
  navMenuItemsDir: string;
  entities: Array<Entity>;
  print: boolean;
  dryRun: boolean;
  clipboard: boolean;
};


const DEFAULT_ROOT_DIR = "src";
const DEFAULT_CONSTANTS_DIR = "constants";
const DEFAULT_OBJECTS_DIR = "objects";
const DEFAULT_VIEWS_DIR = "views";
const DEFAULT_NAV_MENU_ITEMS_DIR = "navigation-menu-items";

function validateEntities(entities: Array<string>) {
  if (entities.length === 0) return;

  const invalidEntities = entities.filter(
    (entity): entity is string => !VALID_ENTITIES.has(entity as Entity)
  );

  if (invalidEntities.length > 0) {
    logErrorAndExit(
      `Invalid entity name(s): ${invalidEntities.join(", ")}. Allowed values: ${Array.from(VALID_ENTITIES).join(", ")}.`
    );
  }
}

function normalizeEntities(entities: unknown): Array<string> {
  if (entities === undefined || entities === null || entities === false) {
    return [];
  }

  if (entities === true) {
    logErrorAndExit(
      `Option -e requires one or more entity names. Allowed values: ${Array.from(VALID_ENTITIES).join(", ")}.`
    );
  }

  if (Array.isArray(entities)) {
    return entities.filter((entity): entity is string => typeof entity === "string");
  }

  if (typeof entities === "string") {
    return [entities];
  }

  return [String(entities)];
}

export function createCLI(argv = process.argv) {
  let opts: CliOptions | undefined;

  new Command()
    .name("Generate twenty fields from types(Object/Interface)")
    .option("-i, --input <path>", "*.ts/*.d.ts file")
    .option("-o, --output <dir>", "output root directory", DEFAULT_ROOT_DIR)
    .option("--constants-dir <dir>", "output constants directory", DEFAULT_CONSTANTS_DIR)
    .option("--objects-dir <dir>", "output object directory", DEFAULT_OBJECTS_DIR)
    .option("--views-dir <dir>", "output views directory", DEFAULT_VIEWS_DIR)
    .option("--nav-menu-items-dir <dir>", "output navigation menu items directory", DEFAULT_NAV_MENU_ITEMS_DIR)
    .option("-e, --entities [entities...]", `can specify single or multiple entities among: ${styleText("yellow", "(constant | object | view | navItem)")}`)
    .option("-p, --print", "print to console", false)
    .option("-d, --dry-run", "print outputs to console, do not write on disk", false)
    .option("-c, --clipboard", "copy object to clipboard", false)
    .version(packageJson.version, "-v, --version")
    .helpOption()
    .action((parsedOpts: CliOptions) => {
      validateEntities(normalizeEntities(parsedOpts.entities));
      opts = parsedOpts;
    })
    .parse(argv);

  if (!opts) {
    logErrorAndExit("CLI options were not parsed.");
  }

  return opts;
}
