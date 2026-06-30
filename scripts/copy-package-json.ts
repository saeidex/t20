import {
  cp,
  mkdir,
  readFile,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";

const json = JSON.parse(await readFile("package.json", "utf8"));

const pkg = {
  name: json.name,
  version: json.version,
  type: json.type,
  description: json.description,
  bin: "bin.cjs",
  engines: json.engines,
  dependencies: json.dependencies,
  peerDependencies: json.peerDependencies,
  repository: json.repository,
  author: json.author,
  license: json.license,
  bugs: json.bugs,
  homepage: json.homepage,
  tags: json.tags,
  keywords: json.keywords,
};

console.log("[Build] Copying package.json ...");

await mkdir("dist", { recursive: true });

await writeFile(
  join("dist", "package.json"),
  JSON.stringify(pkg, null, 2),
);

console.log("[Build] Copying README.md ...");

await cp("README.md", join("dist", "README.md"));

console.log("[Build] Build completed.");
