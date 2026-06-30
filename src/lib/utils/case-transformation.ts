/*
 * snake_case
 * kebab-case
 * camelCase
 * Title case
 */

export const toSnakeCase = (value: string) => {
  return value
    .replace(/([a-zA-Z])(\d)/g, "$1_$2")
    .replace(/(\d)([a-zA-Z])/g, "$1_$2")
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toLowerCase();
};

export const toKebabCase = (value: string) => {
  return value
    .replace(/([a-zA-Z])(\d)/g, "$1-$2")
    .replace(/(\d)([a-zA-Z])/g, "$1-$2")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
};

export const toCamelCase = (value: string) => {
  return value
    .replace(/([a-zA-Z])(\d)/g, "$1 $2")
    .replace(/(\d)([a-zA-Z])/g, "$1 $2")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
};

export const toTitleCase = (
  value: string,
  capitalizeAll: boolean = false
): string => {
  const exceptions = [
    "and",
    "as",
    "at",
    "but",
    "by",
    "for",
    "in",
    "of",
    "on",
    "or",
    "the",
    "to",
    "with",
  ];

  value = value
    .replace(/([a-zA-Z])(\d)/g, "$1 $2")
    .replace(/(\d)([a-zA-Z])/g, "$1 $2")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .toLowerCase();

  if (!capitalizeAll) {
    return value
      .split(" ")
      .map((word, idx) => {
        if (idx > 0) return word;
        if (!word) return "";
        if (exceptions.includes(word)) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  }

  return value
    .split(" ")
    .map((word, index) => {
      if (!word) return "";
      if (index > 0 && exceptions.includes(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};
