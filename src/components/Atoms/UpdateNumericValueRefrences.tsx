import React, { useEffect } from "react";
import { customStyleNumericValuesAtom } from "../store/customizationValueStore";
import { useRecoilState } from "recoil";
import store from "store2";
interface UpdateNumericValueRefrencesProps {
	id: string;
	value: string;
}
const UpdateNumericValueRefrences: React.FC<
	UpdateNumericValueRefrencesProps
> = ({ id, value }) => {
	// eslint-disable-next-line
	const [data, setData] = useRecoilState(customStyleNumericValuesAtom(id));
	useEffect(() => {
		if (value) {
			setData((prevState) => ({
				...prevState,
				value: value,
			}));

			store(id, value); //storeTessting
		}
 
		// eslint-disable-next-line
	}, [value, id]);
	return <></>;
};

export default UpdateNumericValueRefrences;
