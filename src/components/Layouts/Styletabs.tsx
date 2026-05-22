import type { ReactNode } from "react";
import { themeSchema, type SchemaSection } from "../Dictionaries/themeSchema";
import SchemaTabs from "../Orginisms/SchemaTabs";

type StyletabsProps = {
	updatedThemeValue?: unknown;
	schema?: SchemaSection[];
	// Action toolbar forwarded into the sticky zone alongside the tabs.
	toolbar?: ReactNode;
};

const Styletabs = ({
	updatedThemeValue: _updatedThemeValue,
	schema,
	toolbar,
}: StyletabsProps) => {
	return <SchemaTabs schema={schema ?? themeSchema} toolbar={toolbar} />;
};

export default Styletabs;
