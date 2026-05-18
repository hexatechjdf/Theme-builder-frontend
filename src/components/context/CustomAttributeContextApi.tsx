import React, { useState, ReactNode } from "react";
import { Context } from "./contextHook"; // Correct import

interface MyProviderProps {
	children: ReactNode;
}

export const ContextProvider: React.FC<MyProviderProps> = ({ children }) => {
	// Initialize state with default value for custom_css
	const [state, setState] = useState<{ custom_css: string }>({
		custom_css: "", // Provide a default value for custom_css
	});

	return (
		<Context.Provider value={{ state, setState }}>{children}</Context.Provider>
	);
};
