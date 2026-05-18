import axios, { AxiosResponse } from "axios";
import { SSO_TOKEN, APP_KEY } from "./appHeaders";
import { API_BASE_URL } from "./apiConfig";

export interface ApiResponse<T> {
	data: T;
	message: string;
	status: string;
}

export const axiosInstance = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
		"ngrok-skip-browser-warning": "1",
	},
});

axiosInstance.interceptors.request.use((config) => {
	config.headers = config.headers || {};
	config.headers["SSO-Token"] = SSO_TOKEN;
	config.headers["APP-KEY"] = APP_KEY;
	const token = localStorage.getItem("token");
	if (token) {
		config.headers.Authorization = token;
	}
	return config;
});

// Generic fetch function using axios
export const fetchData = async <T>(url: string): Promise<T> => {
	try {
		const response: AxiosResponse<T> = await axiosInstance.get(url);

		// console.log("fetchData response.data:", response.data);

		return response.data; // No `.data.data`, just return .data
	} catch (error: any) {
		throw new Error(
			error.response?.data?.message || "An error occurred while fetching data"
		);
	}
};


////////////////////////////////////////////////////
export interface PostDataInterface {
	custom_css?: string;
	roots: {
		[key: string]: string;
	};
	type: string;
	theme_id: string;
}

export const postData = async <T>(
	url: string,
	data: PostDataInterface
): Promise<T> => {
	try {
		// Send POST request using axios instance
		const response: AxiosResponse<ApiResponse<T>> = await axiosInstance.post(
			url,
			data
		);

		return response.data.data;
	} catch (error: any) {
		throw new Error(
			error.response?.data?.message || "An error occurred while posting data"
		);
	}
};
