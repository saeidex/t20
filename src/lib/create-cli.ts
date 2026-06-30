import { Command } from "commander";

type CLIOptions = {
  input: string;
  output: string;
  print: boolean;
  clipboard: boolean;
};

export function createCLI() {
  return new Command()
    .name("Generate twenty fields from types(Object/Interface)")
    .option("-i, --input <path>", "index.d.ts path")
    .option("-o, --output <dir>", "output directory")
    .option("-p, --print", "print to console", false)
    .option("-c, --clipboard", "copy to clipboard", false)
    .helpOption()
    .parse()
    .opts<CLIOptions>();
}
