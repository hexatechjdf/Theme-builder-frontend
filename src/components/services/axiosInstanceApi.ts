// src/api/axiosInstance.ts
import axios from "axios";
import { getGhlRuntimeContext } from "../utilities/ghlRuntimeContext";
import { API_HOST } from "../utilities/apiConfig";

const api = axios.create({
  baseURL: API_HOST,
});

// Interceptor to attach the live GHL SSO headers. Read per-request from the
// runtime singleton so a late SSO handshake is picked up without re-creating
// this instance.
api.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  const ghl = getGhlRuntimeContext();
  config.headers["SSO-Token"] = ghl.ssoToken;
  config.headers["APP-KEY"] = ghl.appKey;
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
