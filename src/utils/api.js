import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
});

const AUTH_EXPIRED_FLAG = '__sakaeAuthExpiredDispatched';

const getAuthExpiredDispatched = () => {
    if (typeof window === 'undefined') return false;
    return window[AUTH_EXPIRED_FLAG] === true;
};

const setAuthExpiredDispatched = (value) => {
    if (typeof window === 'undefined') return;
    window[AUTH_EXPIRED_FLAG] = value;
};

export const resetAuthExpiredDispatch = () => {
    setAuthExpiredDispatched(false);
};

// Add a request interceptor to add the bearer token to every request
api.interceptors.request.use(
    (config) => {
        if (config.data instanceof FormData) {
            if (config.headers) {
                delete config.headers['Content-Type'];
                delete config.headers['content-type'];
            }
        }

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

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Only handle session expiry if this is not an auth attempt
            if (error.config && !error.config.url.includes('/auth/')) {
                if (!getAuthExpiredDispatched()) {
                    setAuthExpiredDispatched(true);
                    localStorage.removeItem('sakae_user');
                    localStorage.removeItem('sakae_admin');

                    const message =
                        error.response?.data?.message || 'Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại!';

                    // Dispatch custom event to notify React context and components
                    window.dispatchEvent(
                        new CustomEvent('sakae-auth-expired', {
                            detail: { message },
                        }),
                    );
                }
            }
        }
        return Promise.reject(error);
    },
);

export default api;
