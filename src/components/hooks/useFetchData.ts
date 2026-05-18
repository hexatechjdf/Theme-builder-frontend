// src/hooks/reactQuery.ts
import { useQuery, UseQueryResult } from "react-query";
// import { postData, PostData } from "../services/api";

import { fetchData } from "../utilities/axiosConfig";
// Custom hook with TypeScript support
const useFetchData = <T>(
	url: string,
	options = {},
	queryKey: string | string[] = ["fetchData", url] // 👈 allow custom key
): UseQueryResult<T, Error> => {
	return useQuery<T, Error>(
		queryKey, // 👈 use passed key
		() => fetchData<T>(url),
		{
			keepPreviousData: true,
			retry: 2,
			staleTime: 60000,
			cacheTime: 300000,
			refetchOnWindowFocus: false,
			...options,
		}
	);
};

export default useFetchData;
