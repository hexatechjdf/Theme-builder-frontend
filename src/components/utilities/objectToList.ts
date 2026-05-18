type Styles = {
	color: { [key: string]: string };
	numeric: { [key: string]: string };
	string: { [key: string]: string };
};

const transformToList = (obj: Styles): { [key: string]: string[] } => {
	const result: { [key: string]: string[] } = {};

	for (const key in obj) {
		if (obj[key] && typeof obj[key] === "object") {
			result[key] = Object.keys(obj[key]);
		}
	}

	return result;
};

export default transformToList;
