import { atom } from "recoil";

export interface UserType {
    company_id: any;
    name: string;
    email: string;
}

export interface AuthType {
    isAuthenticated: boolean;
    token: string | null;
    user: UserType | null;
    companyId: string | null;
}

// Read from localStorage
const token = localStorage.getItem("token");
const userString = localStorage.getItem("user");
const companyId = localStorage.getItem("company_id");
let user: UserType | null = null;

try {
    user = userString ? JSON.parse(userString) : null;
} catch (e) {
    user = null;
    console.error("Failed to parse user from localStorage", e);
}

export const authState = atom<AuthType>({
    key: "authState",
    default: {
        isAuthenticated: !!token,
        token: token || null,
        user,
        companyId,
    },
});
