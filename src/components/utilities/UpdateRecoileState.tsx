// import { useSetRecoilState } from "recoil";
// import { customStyleColorValuesAtom } from "../store/customizationValueStore";

// // Type for the `key` parameter (it should be a string, based on your usage of `atomFamily`)
// type KeyType = string;

// // Type for the `newState` parameter, which should match the structure of `DrawerState`
// interface NewState {
// 	isOpen?: boolean;
// 	color?: string;
// 	pre?: string;
// 	current?: string;
// }

// // Custom hook to update the custom style color values
// export const useUpdateCustomStyleColorValues = () => {
// 	const setCustomStyleColorValues = useSetRecoilState(
// 		customStyleColorValuesAtom
// 	);

// 	// Function to update the state for a specific key
// 	const updateCustomStyleColorValues = (key: KeyType, newState: NewState) => {
// 		setCustomStyleColorValues(
// 			customStyleColorValuesAtom(key),
// 			(prevState: DrawerState) => ({
// 				...prevState,
// 				...newState, // Merge existing state with the new state
// 			})
// 		);
// 	};

// 	return updateCustomStyleColorValues;
// };
import React, { useEffect } from "react";
import { useRecoilValueLoadable, useSetRecoilState } from "recoil";
import { customStyleColorValuesAtom } from "../store/customizationValueStore";

interface updateRecoilStateProp {
	id: string;
	color: string;
}

const UpdateRecoilState: React.FC<updateRecoilStateProp> = ({ id, color }) => {
	const loadable = useRecoilValueLoadable(customStyleColorValuesAtom(id));
	const setData = useSetRecoilState(customStyleColorValuesAtom(id));

	useEffect(() => {
		if (loadable.state === "hasValue") {
			setData((prevState) => ({
				...prevState,
				color: color,
			}));
		}
	}, [loadable.state, id, color, setData]);

	return null;
};

export default UpdateRecoilState;

