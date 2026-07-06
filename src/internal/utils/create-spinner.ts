import * as prompts from "@clack/prompts";

export function createSpinner() {
  return prompts.spinner({
    cancelMessage: "Process cancelled",
    errorMessage: "Process failed",
    frames: [
      "🔸 ",
      "🔶 ",
      "🟠 ",
      "🟠 ",
      "🔶 ",
      "🔹 ",
      "🔷 ",
      "🔵 ",
      "🔵 ",
      "🔷 ",
    ],
  });
}
