// "use client";

// import { HStack, createListCollection } from "@chakra-ui/react";
// import { Avatar } from "../ui/avatar";
// import {
// 	SelectContent,
// 	SelectItem,
// 	SelectLabel,
// 	SelectRoot,
// 	SelectTrigger,
// 	SelectValueText,
// } from "../ui/select";

// import { useRecoilState } from "recoil";
// import { dropDownsInputAtom } from "../store/customizationValueStore";
// import { useDebouncedCallback } from "use-debounce";
// import { useEffect, useRef } from "react";

// const SelectValueItem = () => (
// 	<SelectValueText placeholder="Select movie">
// 		{(items: Array<{ name: string; avatar: string }>) => {
// 			const { name, avatar } = items[0];
// 			return (
// 				<HStack>
// 					{/* <Avatar name={name} size="xs" src={avatar} /> */}
// 					{name}
// 				</HStack>
// 			);
// 		}}
// 	</SelectValueText>
// );

// interface ThemePreset {
// 	id: string;
// }

// const ThemePresetMenu: React.FC<ThemePreset> = ({ id }) => {
// 	const [dropDownState, setDropDownState] = useRecoilState(
// 		dropDownsInputAtom(id)
// 	);
// 	const isFirstRender = useRef(true);

// 	const debounced = useDebouncedCallback(() => {
// 		console.log({
// 			[id]: dropDownState,
// 			companyId: "xxxxxxx",
// 		});
// 	}, 100);

// 	// useEffect(() => {
// 	// 	if (isFirstRender.current) {
// 	// 		isFirstRender.current = false;
// 	// 		return;
// 	// 	}
// 	// 	if (dropDownState) {
// 	// 		debounced();
// 	// 	}
// 	// 	// eslint-disable-next-line
// 	// }, [dropDownState]);

// 	const handleColorChange = (selectedValue: {
// 		value: Array<string>;
// 		label: Array<string>;
// 	}) => {
// 		// setDropDownState(selectedValue.value[0]);
// 		// console.log(selectedValue);
// 	};

// 	return (
// 		<SelectRoot
// 			size="lg"
// 			collection={members}
// 			maxW="240px"
// 			defaultValue={["jessica_jones"]}
// 			positioning={{ sameWidth: true }}
// 			onValueChange={handleColorChange}
// 		>
// 			<SelectLabel fontSize="xs">Select theme preset</SelectLabel>
// 			<SelectTrigger>
// 				<SelectValueItem />
// 			</SelectTrigger>
// 			<SelectContent portalled={false}>
// 				{members.items.map((item) => (
// 					<SelectItem
// 						py={2}
// 						item={item}
// 						key={item.id}
// 						justifyContent="flex-start"
// 					>
// 						{/* <Avatar name={item.name} src={item.avatar} size="xs" /> */}
// 						{item.name}
// 					</SelectItem>
// 				))}
// 			</SelectContent>
// 		</SelectRoot>
// 	);
// };

// const members = createListCollection({
// 	items: [
// 		{
// 			name: "Jessica Jones",
// 			id: "jessica_jones",
// 		},
// 		{
// 			name: "Kenneth Johnson",
// 			id: "kenneth_johnson",
// 		},
// 		{
// 			name: "Kate Wilson",
// 			id: "kate_wilson",
// 		},
// 	],
// 	itemToString: (item) => item.name,
// 	itemToValue: (item) => item.id,
// });

// export default ThemePresetMenu;

"use client";

import { HStack, createListCollection } from "@chakra-ui/react";
import { Avatar } from "../ui/avatar";
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
import { useEffect, useRef } from "react";
import store from "store2";
import { SelectValueChangeDetails } from "@chakra-ui/react";

const SelectValueItem = () => (
	<SelectValueText placeholder="Select movie">
		{(items: Array<{ name: string; avatar: string }>) => {
			const { name, avatar } = items[0];
			return (
				<HStack>
					<Avatar name={name} size="xs" src={avatar} />
					{name}
				</HStack>
			);
		}}
	</SelectValueText>
);

interface ThemePreset {
	id: string;
}

const ThemePresetMenu: React.FC<ThemePreset> = ({ id }) => {
	const [dropDownState, setDropDownState] = useRecoilState(dropDownsInputAtom(id));
	const isFirstRender = useRef(true);


	useEffect(() => {
		const saved = store.get("themePreset");
		if (saved && isFirstRender.current) {
			setDropDownState(saved);
		}
	}, [id, setDropDownState]);



	const debounced = useDebouncedCallback(() => {
		console.log("theme", {
			[id]: dropDownState,
			companyId: "xxxxxxx",
		});
	}, 100);


	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		// Trigger the debounced function whenever dropDownState changes
		debounced();
	}, [dropDownState]);




	const handleColorChange = (
		details: SelectValueChangeDetails<{ name: string; id: string }>
	) => {
		const selectedItem = details.value[0]; // This will be a string, because itemToValue returns string
		if (selectedItem) {
			setDropDownState(selectedItem);
			store("themePreset", selectedItem);  //storeTessting
		}
	};


	return (
		<SelectRoot
			size="lg"
			collection={members}
			maxW="240px"
			value={[dropDownState]}
			positioning={{ sameWidth: true }}
			onValueChange={handleColorChange}
		>
			<SelectLabel fontSize="xs">Select theme preset</SelectLabel>

			<SelectTrigger>
				<SelectValueItem />
			</SelectTrigger>

			<SelectContent portalled={false}>
				{members.items.map((item) => (
					<SelectItem
						py={2}
						item={item}
						key={item.id}
						justifyContent="flex-start"
					>
						{/* <Avatar name={item.name} src={item.avatar} size="xs" /> */}
						{item.name}
					</SelectItem>
				))}
			</SelectContent>
		</SelectRoot>
	);
};

const members = createListCollection({
	items: [
		{
			name: "No Theme",
			id: "no_theme",
		},
		{
			name: "MonoKai Dark",
			id: "dark",
		},
		{
			name: "Blue Sky",
			id: "blue_sky",
		},
	],
	itemToString: (item) => item.name,
	itemToValue: (item) => item.id,
});

export default ThemePresetMenu;
