// Apply theme-roots key/value pairs as CSS custom properties on :root.
//
// Keys arrive from the backend with the `--` prefix already in place
// (e.g. "--button-bg-color"), so we set them verbatim instead of prepending
// another `--` (which would produce "----button-bg-color" and never match
// any consuming `var(--button-bg-color)`).
//
// Values are raw tuples per the format contract — admin-authored CSS wraps
// them, e.g. `color: rgb(var(--primary-color));`.
//
// Linked-field handling
// ---------------------
// A "linked" field's saved value is `var(--parent-key)` — that's how the
// backend preserves the design-token relationship. If we painted that
// expression onto `:root` verbatim, the browser's CSS cascade would
// auto-update the child every time `--parent-key` changes — exactly the
// behaviour the Apply Changes popup is supposed to gate. So before
// painting, we resolve any single `var(--ref)` value to the parent's
// LITERAL (taken from the same `roots` map). The result: `:root` holds
// frozen literals for linked children, and a later `writeRoot(parent, …)`
// in the same session does not cascade through them. The popup-confirm
// handler is what re-paints linked children after the user decides.
//
// We deliberately only resolve the "single `var(--ref)` wrapping the
// whole value" form (the common single-parent case). Multi-parent
// expressions like `linear-gradient(..., var(--a), var(--b))` would
// require wrapping raw tuples back into `rgb(...)` before substitution to
// stay valid CSS — that's a follow-up. For now multi-parent values pass
// through verbatim and DO auto-cascade in `:root`.
const SINGLE_VAR_REF = /^var\(\s*(--[\w-]+)\s*(?:,[^)]*)?\)\s*$/;

const resolveLiteral = (
  raw: string,
  roots: Record<string, string>,
  depth: number
): string => {
  if (depth > 8) return raw; // cycle safety
  if (typeof raw !== "string") return raw;
  const match = raw.trim().match(SINGLE_VAR_REF);
  if (!match) return raw;
  const refKey = match[1];
  const refRaw = roots[refKey];
  if (refRaw == null) return raw; // unresolvable — keep var() as-is
  return resolveLiteral(String(refRaw), roots, depth + 1);
};

export const applyThemeRoots = (roots: Record<string, string>) => {
  if (!roots) return;
  Object.entries(roots).forEach(([key, value]) => {
    if (!key) return;
    const cssKey = key.startsWith("--") ? key : `--${key}`;
    const literal = resolveLiteral(String(value), roots, 0);
    document.documentElement.style.setProperty(cssKey, literal);
  });
};
