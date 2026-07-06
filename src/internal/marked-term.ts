import { marked } from "marked";
import { markedTerminal } from "marked-terminal";

export const markedTerm = marked
  .use(markedTerminal() as any)
  .setOptions({
    gfm: true,
  });
