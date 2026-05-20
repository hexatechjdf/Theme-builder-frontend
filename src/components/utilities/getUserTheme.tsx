import React, { useEffect, useState } from "react";
import useUserTheme from "../services/api";
import parseCSSVariables from "./csssStringToObject";
import store from "store2";
import { useCustomThemeContext } from "../context/contextHook";
import UpdateRecoilState from "./UpdateRecoileState";
import UpdateRecoilNumericState from "./UpdateRecoileNumericState";

interface ThemeSchema {
  theme?: any;
}
// Hydrates a CSS-variable value from the backend theme into store2. This is
// a LOAD, not a user edit — it must NOT touch `changedList`. Pushing keys
// here made every freshly-loaded page look dirty (spurious "unsaved changes"
// + the leave-page guard firing with no real edit). `changedList` is seeded
// only by genuine field-editor interactions.
function updateThemeValue(key: string, value: string) {
  const existing = store(key);
  if (existing !== value) {
    store(key, value);
  }
}

const GetUserCustomTheme: React.FC<ThemeSchema> = ({ theme = null }) => {
  const { setState } = useCustomThemeContext();
  const { data } = useUserTheme();


  const hasValidRoots = (obj: any) =>
    obj && obj.roots && typeof obj.roots === "object" && Object.keys(obj.roots).length > 0;

  const customThemeRoot = hasValidRoots(theme) ? theme : data;

  const getRawCSSString = () => {
    const roots = customThemeRoot?.roots;
    return Array.isArray(roots?.base) && typeof roots.base[0] === "string"
      ? roots.base[0]
      : "";
  };

  const cssString = getRawCSSString();
  const parsedVariables = parseCSSVariables(cssString);
  const customCSS = customThemeRoot?.custom_css || "";

  const [parsedData, setParsedData] = useState<{ [key: string]: string }>({});
  const [parsedDataNumeric, setParsedDataNumeric] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!parsedVariables || Object.keys(parsedVariables).length === 0) return;

    setState({ custom_css: customCSS });

    const numericVars: { [key: string]: string } = {};
    const stringVars: { [key: string]: string } = {};


    for (const [key, value] of Object.entries(parsedVariables)) {
      updateThemeValue(key, value);
      // document.documentElement.style.setProperty(`--${key}`, value);

      if (!isNaN(Number(value))) {
        numericVars[key] = value;
      } else {
        const match = value.match(/var\(--([^)]+)\)/);
        if (value[0] === "#" || value.startsWith("var(")) {
          stringVars[key] = value;
        } else {
          stringVars[key] = "#f00"; // fallback
        }
      }
    }

    setParsedData(stringVars);
    setParsedDataNumeric(numericVars);
  }, [cssString]);

  return (
    <>
      {Object.entries(parsedData).map(([key, value]) => (
        <UpdateRecoilState key={key} id={key} color={value} />
      ))}
      {Object.entries(parsedDataNumeric).map(([key, value]) => (
        <UpdateRecoilNumericState key={key} id={key} color={value} />
      ))}
    </>
  );
};

export default GetUserCustomTheme;
