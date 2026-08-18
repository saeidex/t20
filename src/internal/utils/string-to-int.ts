import { styleText } from "node:util";

export const stringToInt = (str: any): number => {
  let num = parseInt(str as string, 10);

  if (isNaN(num)) {
    console.error(
      styleText(
        "red",
        `Cannot convert "${str}" to an integer. Falling back to 0.`
      )
    );

    num = 0;
  }

  return num;
};
