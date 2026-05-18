import _ from "lodash";

interface CustomObjectSignature {
	color: Record<string, { label: string }>;
	numeric: Record<string, { label: string }>;
	string: Record<string, { label: string }>;
}

interface CustomObjectPlainSignature {
	color: string[];
	numeric: string[];
	string: string[];
}

function makePlain(obj: CustomObjectSignature): CustomObjectPlainSignature {
	return _.mapValues(obj, (value) => {
		if (_.isObject(value)) {
			return _.keys(value);
		}
		return [];
	}) as CustomObjectPlainSignature;
}

export default makePlain;
