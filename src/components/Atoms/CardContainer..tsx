import { Card } from "@chakra-ui/react";
import React, { ReactNode } from "react";

interface ContainerProps {
	children: ReactNode;
}

const CardContainer: React.FC<ContainerProps> = ({ children }) => {
	return (
		<Card.Root p={6} mx={[0, 2, 4, 6]} shadow="sm">
			{children}
		</Card.Root>
	);
};

export default CardContainer;
