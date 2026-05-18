import { themeSchema, type SchemaSection } from "../Dictionaries/themeSchema";
import SchemaTabs from "../Orginisms/SchemaTabs";

type StyletabsProps = {
	updatedThemeValue?: unknown;
	schema?: SchemaSection[];
};

const Styletabs = ({ updatedThemeValue: _updatedThemeValue, schema }: StyletabsProps) => {
	return <SchemaTabs schema={schema ?? themeSchema} />;
};

export default Styletabs;
