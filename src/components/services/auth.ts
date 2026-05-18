// src/api/auth.ts
import api from "./axiosInstanceApi";

export const loginApi =
    (formData: { email: string; password: string }) => {
        return api.post("/api/login", formData).then((res) => res.data);
    };


export const logoutApi = () => {
    return api.post("/api/logout", {
        token_type: "Bearer",
    }).then((res) => res.data);
};
