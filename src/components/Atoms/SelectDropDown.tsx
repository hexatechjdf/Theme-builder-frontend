"use client";

import React, { useEffect, useRef, useState } from "react";
import { Heading, Stack, createListCollection } from "@chakra-ui/react";
import {
	SelectContent,
	SelectItem,
	SelectLabel,
	SelectRoot,
	SelectTrigger,
	SelectValueText,
} from "../ui/select";
import { useRecoilState } from "recoil";
import { dropDownsInputAtom } from "../store/customizationValueStore";
import { useDebouncedCallback } from "use-debounce";
import store from "store2";

interface OptionsObject {
	value: string;
	label: string;
}


interface DropDownProps {
	label: string;
	placeholder?: string;
	id: string;
	options: OptionsObject[];
}

const DropDownMenu: React.FC<DropDownProps> = ({ label, placeholder = "Select an option", id, options, }) => {

	const [dropDownState, setDropDownState] = useRecoilState(dropDownsInputAtom(id));
	const [isReady, setIsReady] = useState(false); // ✅ Render guard

	const debounced = useDebouncedCallback(() => {
		console.log({
			[id]: dropDownState,
			companyId: "xxxxxxx",
		});
	}, 800);



	useEffect(() => {
		const saved = store.get(`dropdown_${id}`);
		if (saved) {
			setDropDownState(saved);
		}
		setIsReady(true); // ✅ Only render dropdown once ready
	}, [id, setDropDownState]);




	useEffect(() => {
		if (dropDownState) {
			store.set(`dropdown_${id}`, dropDownState);
			debounced();
		}
	}, [dropDownState, debounced, id]);



	const handleColorChange = (selectedValue: {
		value: Array<string>;
		label: string;
	}) => {
		const selected = selectedValue.value[0];
		setDropDownState(selected);
		store.set(`dropdown_${id}`, selected); // ✅ Persist
	};



	const optionList = createListCollection({ items: options });

	return (
		<Stack gap="5" width="320px">
			{isReady && (
				<SelectRoot
					variant="outline"
					collection={optionList}
					value={dropDownState ? [dropDownState] : []}
					onValueChange={handleColorChange}
					positioning={{ placement: "bottom", flip: false }}
				>
					<SelectLabel>{label}</SelectLabel>
					<SelectTrigger>
						<SelectValueText placeholder={placeholder} />
					</SelectTrigger>
					<SelectContent h="200px">
						{optionList.items.map((item) => (
							<SelectItem item={item} key={item.value}>
								{item.label}
							</SelectItem>
						))}
					</SelectContent>
				</SelectRoot>
			)}
		</Stack>
	);
};

export default DropDownMenu;
