import { Command } from "commander";
import packageJson from "../../package.json" with { type: "json" };

type CLIOptions = {
  input: string;
  output: string;
  print: boolean;
  printOnly: boolean;
  clipboard: boolean;
};

export function createCLI() {
  return new Command()
    .name("Generate twenty fields from types(Object/Interface)")
    .option("-i, --input <path>", "*.ts/*.d.ts file")
    .option("-o, --output <dir>", "output directory")
    .option("-p, --print", "print to console", false)
    .option("--print-only", "print only, do not write to disk", false)
    .option("-c, --clipboard", "copy object to clipboard", false)
    .version(packageJson.version)
    .helpOption()
    .parse()
    .opts<CLIOptions>();
}
