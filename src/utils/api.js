import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the bearer token to every request
api.interceptors.request.use(
    (config) => {
        const savedUser = localStorage.getItem('sakae_user');
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                const accessToken =
                    parsedUser?.accessToken ||
                    parsedUser?.token ||
                    parsedUser?.data?.accessToken ||
                    parsedUser?.user?.accessToken ||
                    null;

                if (accessToken) {
                    config.headers = config.headers || {};
                    config.headers.Authorization = `Bearer ${accessToken}`;
                }
            } catch (error) {
                console.error('Failed to parse sakae_user from localStorage', error);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized error (e.g., redirect to login or refresh token)
            // localStorage.removeItem('sakae_user');
            // window.location.href = '/dang-nhap';
        }
        return Promise.reject(error);
    },
);

export default api;
