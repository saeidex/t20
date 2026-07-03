import { Command } from "commander";
import packageJson from "../../package.json" with { type: "json" };
import { styleText } from "node:util";

export type Entity = "constant" | "object" | "view" | "navItem";

type CLIOptions = {
  input: string;
  output: string;
  entities: Array<Entity>;
  print: boolean;
  printOnly: boolean;
  clipboard: boolean;
};

export function createCLI() {
    return new Command()
        .name("Generate twenty fields from types(Object/Interface)")
        .option("-i, --input <path>", "*.ts/*.d.ts file")
        .option("-o, --output <dir>", "output directory")
        .option("-e, --entities [entities...]", `can specify single or multiple entities among: ${styleText("yellow", "(constant | object | view | navItem)")}`)
        .option("-p, --print", "print to console", false)
        .option("--print-only", "print only, do not write to disk", false)
        .option("-c, --clipboard", "copy object to clipboard", false)
        .version(packageJson.version, "-v, --version")
        .helpOption()
        .parse()
        .opts<CLIOptions>()
}
