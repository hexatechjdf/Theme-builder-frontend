import { selectorFamily } from "recoil";
import {
	customStyleColorValuesAtom,
	customStyleNumericValuesAtom,
	customStyleImagesInputAtom,
	dropDownsInputAtom,
	customStyleThemePresetInputAtom,
} from "./customizationValueStore"; // Adjust the import path as needed

export const customStyleColorValuesSelector = selectorFamily({
	key: "customStyleColorValuesSelector",
	get:
		(
			{ keys, optionalParam }: { keys: string[]; optionalParam?: string } // Accepting an object
		) =>
		({ get }) => {
			return keys
				.map((key) => {
					const atomValue = get(customStyleColorValuesAtom(key));
					return {
						[key]: atomValue.color,
						pre: atomValue.pre,
						current: atomValue.current,
					};
				})
				.filter((item) => {
					if (optionalParam) {
						return item.pre === optionalParam;
					}
					return true;
				});
		},
});
export const customStyleNumericValuesSelector = selectorFamily({
	key: "customStyleNumericValuesSelector",

	get:
		(
			{ keys, optionalParam }: { keys: string[]; optionalParam?: string } // Accepting an object
		) =>
		({ get }) => {
			return keys
				.map((key) => {
					const atomValue = get(customStyleNumericValuesAtom(key));
					return {
						[key]: atomValue.value,
						pre: atomValue.pre,
						current: atomValue.current,
					};
				})
				.filter((item) => {
					if (optionalParam) {
						return item.pre === optionalParam;
					}
					return true;
				});
		},
});
// Selector for customStyleColorValues

// Selector for customStyleImagesInput
export const customStyleImagesInputSelector = selectorFamily({
	key: "customStyleImagesInputSelector",
	get:
		(keys: string[]) =>
		({ get }) => {
			return keys.map((key) => {
				const atomValue = get(customStyleImagesInputAtom(key));
				return {
					key: key, // dynamic key passed to atom
					value: atomValue, // image URL or input string stored in the atom
				};
			});
		},
});

// Selector for dropDownsInput
export const dropDownsInputSelector = selectorFamily({
	key: "dropDownsInputSelector",
	get:
		(keys: string[]) =>
		({ get }) => {
			return keys.map((key) => {
				const atomValue = get(dropDownsInputAtom(key));
				return {
					key: key, // dynamic key passed to atom
					value: atomValue, // dropdown selection stored in the atom
				};
			});
		},
});

// Selector for customStyleThemePresetInput
export const customStyleThemePresetInputSelector = selectorFamily({
	key: "customStyleThemePresetInputSelector",
	get:
		(keys: string[]) =>
		({ get }) => {
			return keys.map((key) => {
				const atomValue = get(customStyleThemePresetInputAtom(key));
				return {
					key: key, // dynamic key passed to atom
					value: atomValue, // theme preset value stored in the atom
				};
			});
		},
});




// Getting specific values 

// export const getValueByKeySelector = selectorFamily({
//   key: 'getValueByKeySelector',
//   get: (i) => ({ get }) => {
//     const value = get(customStyleColorValuesAtom(i));
//     return value !== undefined ? value : false;
//   },
// });