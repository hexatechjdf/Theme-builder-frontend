/* eslint-disable @typescript-eslint/no-explicit-any */

import _ from "lodash";

function objectToString(obj: Record<string, any>): string {
	const result = _.transform(
		obj,
		(result: string[], value: any, key: string) => {
			result.push(`--jdf-${key}: ${value}`);
		},
		[]
	);

	return `:root {\r\n    ${result.join(";\r\n    ")}\r\n}`;
}

export default objectToString;
