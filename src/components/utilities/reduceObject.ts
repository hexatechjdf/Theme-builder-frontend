import _ from "lodash";

interface ObjectSignature {
	[key: string]: string | boolean;
	pre: string;
	current: boolean;
}

const transformListToObject = (
	list: ObjectSignature[]
	// eslint-disable-next-line
): Record<string, any> => {
	return _.reduce(
		list,
		(result, obj) => {
			const [dynamicKey, value] = _.toPairs(obj)[0];
			if (obj.pre && !obj.current) {
				result[dynamicKey] = `var(--${obj.pre})`;
			} else {
				result[dynamicKey] = value;
			}

			return result;
		},
		// eslint-disable-next-line
		{} as Record<string, any>
	);
};

export default transformListToObject;
