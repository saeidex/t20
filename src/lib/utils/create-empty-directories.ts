import fs from "node:fs";

export function createEmptyDirectories(outputDirectories: {
  [key: string | number | symbol]: string;
}) {
  Object.values(outputDirectories).forEach((dir) => {
    fs.mkdirSync(dir, { recursive: true });
  });
}
