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
        // Skip auth routes
        if (config.url.includes('/auth/')) {
            return config;
        }

        const savedAdmin = localStorage.getItem('sakae_admin');
        const savedUser = localStorage.getItem('sakae_user');
        const dataToUse = savedAdmin || savedUser;

        if (dataToUse) {
            try {
                const parsedUser = JSON.parse(dataToUse);
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

let isAuthExpiredDispatched = false;

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Only handle session expiry if this is not an auth attempt
            if (error.config && !error.config.url.includes('/auth/')) {
                if (!isAuthExpiredDispatched) {
                    isAuthExpiredDispatched = true;
                    localStorage.removeItem('sakae_user');
                    localStorage.removeItem('sakae_admin');
                    
                    // Dispatch custom event to notify React context and components
                    window.dispatchEvent(
                        new CustomEvent('sakae-auth-expired', {
                            detail: { message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!' }
                        })
                    );
                    
                    // Reset flag after a delay to prevent duplicate toasts
                    setTimeout(() => {
                        isAuthExpiredDispatched = false;
                    }, 3000);
                }
            }
        }
        return Promise.reject(error);
    },
);

export default api;
