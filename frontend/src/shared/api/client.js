import axios from "axios";
import { getToken } from "../../features/auth/authStorage";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

// Attach token automatically
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Example request function (for testing)
export async function getHealth() {
    const res = await api.get("/health");
    return res.data;
}