import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

// Example request function (for testing)
export async function getHealth() {
    const res = await api.get("/health");
    return res.data;
}