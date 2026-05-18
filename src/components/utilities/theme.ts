// util/theme.ts
export const objToCss = (vars: Record<string, string>) =>
    `:root {\n${Object.entries(vars)
        .map(([k, v]) => `  ${k}: ${v};`)
        .join('\n')}\n}`;
