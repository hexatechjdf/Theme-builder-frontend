// src/api/axiosInstance.ts
import axios from "axios";
import { SSO_TOKEN, APP_KEY } from "../utilities/appHeaders";
import { API_HOST } from "../utilities/apiConfig";

const api = axios.create({
  baseURL: API_HOST,
});

// Interceptor to attach Bearer token
api.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  config.headers["SSO-Token"] = SSO_TOKEN;
  config.headers["APP-KEY"] = APP_KEY;
  config.headers["Content-Type"] = "application/json";
  config.headers["bypass-tunnel-reminder"] = "11";
  config.headers.Accept = "application/json";

  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `${token}`;
  }
  // console.log("config.headers", config.headers);

  return config;
});

export default api;
