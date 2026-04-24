import axios from 'axios';
import { getToken } from '../../features/auth/authStorage';

function getApiBaseUrl() {
    const envUrl = import.meta.env.VITE_API_URL?.trim();

    if (envUrl) {
        return envUrl.replace(/\/+$/, '');
    }

    const isLocalhost =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';

    if (isLocalhost) {
        return 'http://localhost:5000';
    }

    return '';
}

export const api = axios.create({
    baseURL: getApiBaseUrl(),
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
    const res = await api.get('/health');
    return res.data;
}