import type { SchemaField, SchemaSection } from "../Dictionaries/themeSchema";

// Pure helpers for the "design-token cascade" feature. Field schemas carry
// an optional `baseRoot` string that declares which parent CSS variable(s)
// they depend on:
//
//   • Single-key form: baseRoot = "--moreDark-bg-color"
//     → linked value is `var(--moreDark-bg-color)`
//
//   • Expression form: baseRoot = "linear-gradient(45deg, var(--a), var(--b)) !important;"
//     → linked value is the expression itself; depends on every `--key`
//       that appears inside `var(...)` references.
//
// Nothing here touches React or `store2` — these helpers are framework-free.

// Matches a single `var(--something-with-dashes)` token. We allow an
// optional fallback (`var(--x, fallback)`) but only capture the variable
// name itself.
const VAR_REF_REGEX = /var\(\s*(--[\w-]+)\s*(?:,[^)]*)?\)/g;

/**
 * Returns every parent variable key the `baseRoot` depends on.
 *   parentKeysFromBaseRoot("--moreDark-bg-color")        → ["--moreDark-bg-color"]
 *   parentKeysFromBaseRoot("linear-gradient(45deg, var(--a), var(--b))")
 *                                                       → ["--a", "--b"]
 */
export const parentKeysFromBaseRoot = (baseRoot: string): string[] => {
	if (!baseRoot) return [];
	const trimmed = baseRoot.trim();
	// Plain "--key" form (no parens) → single parent.
	if (/^--[\w-]+$/.test(trimmed)) return [trimmed];
	// Expression form — extract every `var(--key)` reference. De-dupe so a
	// gradient referencing the same parent twice doesn't list it twice.
	const seen = new Set<string>();
	for (const match of trimmed.matchAll(VAR_REF_REGEX)) {
		seen.add(match[1]);
	}
	return Array.from(seen);
};

/**
 * The literal CSS string the field must hold to be considered "linked".
 *   • Single-key baseRoot → `var(--key)`
 *   • Expression baseRoot → the expression itself
 *   • No baseRoot         → null
 */
export const linkedExpressionFor = (field: SchemaField): string | null => {
	const base = field.baseRoot?.trim();
	if (!base) return null;
	if (/^--[\w-]+$/.test(base)) return `var(${base})`;
	return base;
};

/**
 * Does the field's current stored value match its linked expression?
 * Returns false for fields without a baseRoot (nothing to link).
 */
export const isFieldLinked = (
	field: SchemaField,
	currentValue: string | undefined | null
): boolean => {
	const linked = linkedExpressionFor(field);
	if (!linked) return false;
	if (currentValue == null) return false;
	return String(currentValue).trim() === linked.trim();
};

/**
 * Build a Map<parentKey, child[]> across all sections passed in. A child
 * can appear under multiple parents if its baseRoot is a multi-ref
 * expression (gradient with several `var(--key)`s).
 *
 * Pass in only the sections for the current Save section (theme OR login),
 * never both — links don't cross theme/login namespaces.
 *
 * IMPORTANT — fields with `enabled: false` are skipped on BOTH sides of the
 * relation. The product spec says disabled fields still round-trip through
 * the save payload (handled by buildRoots), but they don't participate in
 * the propagation popup. Adding them is a next-phase concern.
 */
export const buildDependencyGraph = (
	sections: SchemaSection[] | undefined
): Map<string, SchemaField[]> => {
	const graph = new Map<string, SchemaField[]>();
	if (!sections || sections.length === 0) return graph;
	sections.forEach((section) => {
		section.fields.forEach((field) => {
			if (!field?.baseRoot) return;
			if (field.enabled === false) return; // child side
			const parents = parentKeysFromBaseRoot(field.baseRoot);
			parents.forEach((parentKey) => {
				const existing = graph.get(parentKey);
				if (existing) {
					if (!existing.includes(field)) existing.push(field);
				} else {
					graph.set(parentKey, [field]);
				}
			});
		});
	});
	return graph;
};

/**
 * Convenience: look up a field by its `key` across sections. Returns
 * `undefined` if the key isn't in the schema or the matching field is
 * `enabled: false` (disabled parents shouldn't trigger the popup).
 */
export const findFieldByKey = (
	sections: SchemaSection[] | undefined,
	key: string
): SchemaField | undefined => {
	if (!sections) return undefined;
	for (const section of sections) {
		const match = section.fields.find((f) => f.key === key);
		if (match && match.enabled !== false) return match;
	}
	return undefined;
};
