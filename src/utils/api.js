import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://sakae-japanese-api.onrender.com/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the bearer token to every request
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('sakae_user'));
        if (user && user.accessToken) {
            config.headers.Authorization = `Bearer ${user.accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
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
    }
);

export default api;
