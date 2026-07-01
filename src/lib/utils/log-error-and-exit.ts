import { styleText } from "node:util";

export function logErrorAndExit(message: string) {
  const error = new Error(message);
  console.error(styleText("red", error.message));
  process.exit(1);
}
