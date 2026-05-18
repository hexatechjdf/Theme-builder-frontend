import { createContext, useContext } from "react";

export interface MyContextType {
	state: { custom_css: string };
	setState: React.Dispatch<React.SetStateAction<{ custom_css: string }>>;
}

export const Context = createContext<MyContextType | undefined>(undefined);

// Make sure this hook is correctly exported
export const useCustomThemeContext = (): MyContextType => {
	const context = useContext(Context);
	if (!context) {
		throw new Error("useCustomThemeContext must be used within a MyProvider");
	}
	return context;
};
