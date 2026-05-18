function resolveCssVar(color: string, variables: Record<string, string>): string {
    const varMatch = color.match(/var\((--[\w-]+)\)/);
    if (varMatch) {
        const varName = varMatch[1];
        return variables[varName] || "#000"; // fallback to black if not found
    }
    return color;
}
export default resolveCssVar