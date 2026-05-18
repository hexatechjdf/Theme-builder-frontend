import _ from "lodash";

interface ParsedVariables {
  [key: string]: string;
}

function parseCSSVariables(cssString: string): ParsedVariables {
  if (!cssString || typeof cssString !== "string") return {};

  // Remove comments and trim
  const cleanedString = cssString
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(":root {", "")
    .replace("}", "")
    .trim();

  const rawVariables: ParsedVariables = cleanedString
    .split(";")
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .reduce((acc: ParsedVariables, declaration: string) => {
      const [property, value] = declaration.split(":").map((str) => str.trim());
      if (!property || !value) return acc;

      // Remove quotes and !important
      const cleanedValue = value
        .replace(/["']/g, "")
        .replace(/\s*!important\s*/gi, "");

      _.set(acc, property.replace(/^--/, ""), cleanedValue);
      return acc;
    }, {});

  // Now resolve var(--xxx) references
  const resolvedVariables: ParsedVariables = {};
  for (const [key, value] of Object.entries(rawVariables)) {
    const match = value.match(/^var\((--[\w-]+)\)$/);
    if (match) {
      const refKey = match[1].replace(/^--/, "");
      resolvedVariables[key] = rawVariables[refKey] || value; // fallback to original
    } else {
      resolvedVariables[key] = value;
    }
  }

  return resolvedVariables;
}

export default parseCSSVariables;
