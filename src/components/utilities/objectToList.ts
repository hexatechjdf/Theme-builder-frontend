type Styles = {
	color: { [key: string]: string };
	numeric: { [key: string]: string };
	string: { [key: string]: string };
};

const transformToList = (obj: Styles): { [key: string]: string[] } => {
	const result: { [key: string]: string[] } = {};

	for (const key in obj) {
		const value = obj[key as keyof Styles];
		if (value && typeof value === "object") {
			result[key] = Object.keys(value);
		}
	}

	return result;
};

export default transformToList;
