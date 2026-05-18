import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { customStyleNumericValuesAtom } from "../store/customizationValueStore";
import { HStack, Input } from "@chakra-ui/react";
import { Field } from "../ui/field";
import store from "store2";

interface DemoProps {
	label: string;
	placehoder?: string;
	id: string;
	refData: { pre: string; current: string };
	type?: string;
}

const InputField: React.FC<DemoProps> = ({
	label,
	placehoder,
	id,
	refData,
	type = "text",
}) => {
	const [recoilValue, setRecoilValue] = useRecoilState(
		customStyleNumericValuesAtom(id)
	);

	// const isFirstRender = useRef(true);
	// const debounced = useDebouncedCallback(() => {
	// 	console.log({
	// 		[id]: recoilValue,
	// 		companyId: "xxxxxxx",
	// 	});
	// }, 800);

	// useEffect(() => {
	// 	if (isFirstRender.current) {
	// 		isFirstRender.current = false;
	// 		return;
	// 	}

	// 	if (recoilValue) {
	// 		debounced();
	// 	}
	// 	// eslint-disable-next-line
	// }, [recoilValue]);

	useEffect(() => {
		if (refData) {
			setRecoilValue((previous) => ({
				...previous,
				pre: refData.pre,
			}));
		}
	}, [id]);

	const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = event.target.value;

		// If it's the first interaction with the input, set the 'value' field in recoilValue
		if (!recoilValue.pre) {
			setRecoilValue((previous) => ({
				...previous,
				value: inputValue,
			}));
		} else {
			// Set the 'current' field in recoilValue if it has been modified
			setRecoilValue((previous) => ({
				...previous,
				value: inputValue,
				current: true,
			}));
		}
		store(id, inputValue); //storeTessting

		const changedList = store("changedList") || [];

		if (!changedList.includes(id)) {
			changedList.push(id);
			store("changedList", changedList);
		}
	};

	return (
		<HStack gap="10" width="full">
			<Field label={label}>
				<Input
					onChange={handleColorChange}
					placeholder={placehoder}
					value={store(id) || recoilValue.value} //handleing num from local storage
					type={type}
					variant="outline"
					minW="50px"
				/>
			</Field>
		</HStack>
	);
};

export default InputField;
