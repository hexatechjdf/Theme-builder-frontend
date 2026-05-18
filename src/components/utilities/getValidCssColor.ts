export const getValidCssColor = (inputColor: string, fallback = "#000000"): string => {
    const test = new Option().style;
    test.color = inputColor;
    return test.color || fallback;
};
console.log(getValidCssColor)