import { Command } from "commander";
import { styleText } from "node:util";
import packageJson from "../../package.json" with { type: "json" };
import { logErrorAndExit } from "./utils/log-error-and-exit.js";
import { stringToInt } from "./utils/string-to-int.js";

export type Entity = "object" | "view" | "navItem";

const VALID_ENTITIES = new Set<Entity>([
  "object",
  "view",
  "navItem",
]);

export type CliOptions = {
  input: string;
  output: string;
  exportOnly: boolean;
  reviewNames: boolean;
  skipRelatedEntities: boolean;
  entities: Array<Entity>;
  objectsDir: string;
  viewsDir: string;
  navMenuItemsDir: string;
  viewsBasePosition: number;
  navMenuItemsBasePosition: number;
  print: boolean;
  dryRun: boolean;
  clipboard: boolean;
  seed?: string;
};


const DEFAULT_ROOT_DIR = "src";
const DEFAULT_OBJECTS_DIR = "objects";
const DEFAULT_VIEWS_DIR = "views";
const DEFAULT_NAV_MENU_ITEMS_DIR = "navigation-menu-items";

const DEFAULT_VIEWS_BASE_POSITION = "0";
const DEFAULT_NAV_MENU_ITEMS_BASE_POSITION = "0";

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


let opts: CliOptions | undefined;

export function createCLI(argv = process.argv) {
  new Command()
    .name("Generate twenty fields from types(Object/Interface)")
    .option("-i, --input <path>", "*.ts/*.d.ts file")
    .option("-o, --output <dir>", "output root directory", DEFAULT_ROOT_DIR)
    .option("--export-only", "only extract exported interfaces/types", false)
    .option("--review-names", "review names after selection", false)
    .option("--skip-related-entities", "skip generating related entities (views, navItems)", false)
    .option("-e, --entities [entities...]", `can specify single or multiple entities among: ${styleText("yellow", "(object | view | navItem)")}`)
    .option("--objects-dir <dir>", "output object directory", DEFAULT_OBJECTS_DIR)
    .option("--views-dir <dir>", "output views directory", DEFAULT_VIEWS_DIR)
    .option("--nav-menu-items-dir <dir>", "output navigation menu items directory", DEFAULT_NAV_MENU_ITEMS_DIR)
    .option("--views-base-position <number>", "offset for views starting index", DEFAULT_VIEWS_BASE_POSITION)
    .option("--nav-menu-items-base-position <number>", "offset for navigation menu items starting index", DEFAULT_NAV_MENU_ITEMS_BASE_POSITION)
    .option("-p, --print", "print to console", false)
    .option("-d, --dry-run", "print outputs to console, do not write on disk", false)
    .option("-c, --clipboard", "copy object to clipboard", false)
    .option("--seed <string>", "seed for deterministic UIDs — stable across re-runs, distinct per workspace")
    .version(packageJson.version, "-v, --version")
    .helpOption()
    .action((parsedOpts: CliOptions) => {
      validateEntities(normalizeEntities(parsedOpts.entities));

      const viewsBasePosition = stringToInt(parsedOpts.viewsBasePosition);
      const navMenuItemsBasePosition = stringToInt(parsedOpts.navMenuItemsBasePosition);

      opts = { ...parsedOpts, viewsBasePosition, navMenuItemsBasePosition};
    })
    .parse(argv);

  if (!opts) {
    logErrorAndExit("CLI options were not parsed.");
    process.exit(1); // unreachable (added for type safety)
  }

  return opts;
}

export function getCliOptions(): CliOptions {
  if (!opts) {
    logErrorAndExit("CLI options were not parsed.");
    process.exit(1); // unreachable (added for type safety)
  }

  return opts;
}
