import { useEffect, useRef } from "react";
import { useRecoilState } from "recoil";
import { customStyleImagesInputAtom } from "../store/customizationValueStore";
import { useDebouncedCallback } from "use-debounce";
import {
	FileInput,
	FileUploadClearTrigger,
	FileUploadLabel,
	FileUploadRoot,
} from "../ui/file-upload";
import { CloseButton } from "../ui/close-button";
import { InputGroup } from "../ui/input-group";
import { LuFileUp } from "react-icons/lu";
import store from "store2";

interface FileUploadInputProps {
	label: string;
	id: string;
}

const FileUploadInput: React.FC<FileUploadInputProps> = ({ label, id }) => {
	const [recoileState, setRecoilState] = useRecoilState(
		customStyleImagesInputAtom(id)
	);
	const isFirstRender = useRef(true);

	const debounced = useDebouncedCallback(() => {
		// console.log({
		// 	[id]: recoileState,
		// 	companyId: "xxxxxxx",
		// });
	}, 800);

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}

		if (recoileState) {
			debounced();
		}
		// eslint-disable-next-line
	}, [recoileState]);

	useEffect(() => {
		const image = store(id);
		if (image) {
			setRecoilState(image); //storeTessting
		}
	}, [id, setRecoilState]);
	const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.value) {
			setRecoilState(event.target.value);
			store(id, event.target.value); //storeTessting 


			const changedList = store("changedList") || []; //storeTessting

			if (!changedList.includes(id)) {
				changedList.push(id);
				store("changedList", changedList);
			}
		}
	};
	return (
		<FileUploadRoot gap="1" maxWidth="300px" onChange={handleImageChange}>
			<FileUploadLabel>{label}</FileUploadLabel>
			<InputGroup
				w="full"
				overflow="hidden"
				startElement={<LuFileUp />}
				endElement={
					<FileUploadClearTrigger asChild>
						<CloseButton
							me="-1"
							size="xs"
							variant="plain"
							focusVisibleRing="inside"
							focusRingWidth="2px"
							pointerEvents="auto"
						/>
					</FileUploadClearTrigger>
				}
			>
				<FileInput placeholder="Select Image" />
			</InputGroup>
		</FileUploadRoot>
	);
};

export default FileUploadInput;
