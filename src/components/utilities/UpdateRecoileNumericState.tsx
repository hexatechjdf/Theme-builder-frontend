import React, { useEffect } from "react";
import { useRecoilState } from "recoil";
import { customStyleNumericValuesAtom } from "../store/customizationValueStore";
interface updateRecoilStateProp {
	id: string;
	color: string;
}
const UpdateRecoilNumericState: React.FC<updateRecoilStateProp> = ({ id, color }) => {
	const [_, setData] = useRecoilState(customStyleNumericValuesAtom(id));

	useEffect(() => {
		setData((prevState) => ({
			...prevState,
			color: color,
		}));
	}, [id, color]);

	return true;
};

export default UpdateRecoilNumericState;
