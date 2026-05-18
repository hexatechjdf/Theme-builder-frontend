import { postData, PostDataInterface } from "./../utilities/axiosConfig";
import { useMutation } from "react-query";

const usePostData = <T>(url: string, options = {}) => {
	return useMutation<T, Error, PostDataInterface>(
		(data: PostDataInterface) => postData<T>(url, data),
		{
			onError: (error: Error) => {
				// Handle error
				console.error("Error posting data:", error.message);
			},
			onSuccess: (data) => {
				// Handle success
				console.log("Data posted successfully:", data);
			},
			...options,
		}
	);
};

export default usePostData;
