// ChakraProvider.tsx
import React from "react";
import { ChakraProvider as ChakraUIProvider } from "@chakra-ui/react";
import { system } from "./theme";

interface CustomComponentProps {
	children: React.ReactNode;
}

const ChakraProvider: React.FC<CustomComponentProps> = ({ children }) => {
	return <ChakraUIProvider value={system}>{children}</ChakraUIProvider>;
};

export default ChakraProvider;
