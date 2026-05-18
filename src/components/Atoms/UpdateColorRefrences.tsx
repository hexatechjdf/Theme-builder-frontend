import React, { useEffect } from "react";
import { customStyleColorValuesAtom } from "../store/customizationValueStore";
import { useRecoilState } from "recoil";

interface UpdateColorRefrencesProps {
	id: string;
	color: string;
}
const UpdateColorRefrences: React.FC<UpdateColorRefrencesProps> = ({
	id,
	color,
}) => {
	const [data, setData] = useRecoilState(customStyleColorValuesAtom(id));
	useEffect(() => {
		if (data.color !== color) {
			setData((prevState) => ({
				...prevState,
				color: color,
			}));
		}
		// eslint-disable-next-line
	}, [color, id]);
	return <></>;
};

export default UpdateColorRefrences;
