import { cancel, isCancel } from "@clack/prompts";

export function handlePromptCancel(
  prompt: unknown,
  message?: string
) {
  if (isCancel(prompt)) {
    cancel(message ?? "Operation cancelled.");
    process.exit(0);
  }
}
