import { atom, atomFamily } from "recoil";
import store from "store2";
// interface MyObject {
// 	[key: string]: any;
// }

// export const changedObjects = atom<MyObject>({
// 	key: "myObjectAtom",
// 	default: {},
// });
interface DrawerState {
	isOpen: boolean;
	color: string;
	 original: string;
	pre: string;
	current: boolean;
	isLoaded: boolean;
	
	
}

export const customStyleColorValuesAtom = atomFamily<DrawerState, string>({
  key: "customStyleColorValues",
  default: {
    isOpen: false,
    color: "#000000",  // valid fallback
    original: "",      // original value from backend
    pre: "",
    current: false,
    isLoaded: false,
  },
});


interface customStyle {
	value: string;
	pre: string;
	current: boolean;
}

export const customStyleNumericValuesAtom = atomFamily<customStyle, string>({
	key: "customStyleNumericValues",
	default: {
		value: "",
		pre: "",
		current: false,
	},
});

// interface customStyle {
// 	value: string;
// 	pre: string;
// 	current: boolean;
// }

export const customStyleImagesInputAtom = atomFamily<string, string>({
	key: "customStyleImagesInput",
	default: "",
});

export const dropDownsInputAtom = atomFamily<string, string>({
	key: "dropDownsInput",
	default: "no_theme",
});

export const customStyleThemePresetInputAtom = atomFamily<string, string>({
	key: "customStyleInput",
	default: "no_theme",
});

// export const  customThemeAttributes = atom({
// 	key: "customThemeAttributes",
// 	default: {},
// });
