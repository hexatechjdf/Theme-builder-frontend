// import _ from "lodash";

// interface CssVariables {
// 	[key: string]: string;
// }

// const parseCssVariables = (cssCode: string): CssVariables => {
// 	const regex = /--([a-zA-Z0-9-_]+)\s*:\s*(var\([^)]+\)|[^;]+);/g;
// 	let match;
// 	const variables: { key: string; value: string }[] = [];

// 	while ((match = regex.exec(cssCode)) !== null) {
// 		// eslint-disable-next-line @typescript-eslint/no-unused-vars
// 		const [_, key, value] = match;
// 		variables.push({ key, value: value.trim() });
// 	}

// 	const variablesObject: CssVariables = _.reduce(
// 		variables,
// 		(result, { key, value }) => {
// 			result[key] = value;
// 			return result;
// 		},
// 		{} as CssVariables
// 	);

// 	return variablesObject;
// };

// export default parseCssVariables;
