import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
    withCredentials: true,
});

const AUTH_EXPIRED_FLAG = '__sakaeAuthExpiredDispatched';
const AUTH_ENDPOINTS_WITHOUT_REFRESH = [
    '/auth/me',
    '/auth/login',
    '/auth/admin/login',
    '/auth/register',
    '/auth/verify-email',
    '/auth/refresh',
    '/auth/logout',
];
let csrfToken = null;
let csrfRequest = null;
let refreshRequest = null;
let hasAuthenticatedSession = false;

export const resetCsrfToken = () => {
    csrfToken = null;
};

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

export const setAuthenticatedSession = (authenticated) => {
    hasAuthenticatedSession = authenticated;
    if (!authenticated) setAuthExpiredDispatched(false);
};

const getCsrfToken = async () => {
    if (csrfToken) return csrfToken;
    if (!csrfRequest) {
        csrfRequest = axios
            .get(`${api.defaults.baseURL}/auth/csrf`, { withCredentials: true })
            .then((response) => {
                csrfToken = response.data?.data?.csrfToken ?? response.data?.csrfToken ?? null;
                if (!csrfToken) throw new Error('CSRF token was missing from the server response');
                return csrfToken;
            })
            .finally(() => {
                csrfRequest = null;
            });
    }
    return csrfRequest;
};

api.interceptors.request.use(
    async (config) => {
        if (config.data instanceof FormData) {
            if (config.headers) {
                delete config.headers['Content-Type'];
                delete config.headers['content-type'];
            }
        }

        config.headers = config.headers || {};
        delete config.headers.Authorization;

        const method = (config.method || 'get').toLowerCase();
        const isUnsafeMethod = !['get', 'head', 'options'].includes(method);
        if (isUnsafeMethod && !config.url?.includes('/auth/csrf')) {
            config.headers['X-CSRF-Token'] = await getCsrfToken();
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const request = error.config;
        if (
            error.response?.status === 403 &&
            (error.response?.data?.message?.includes('CSRF') ||
                error.response?.data?.message?.includes('Phiên bảo mật')) &&
            request &&
            !request._csrfRetry
        ) {
            request._csrfRetry = true;
            csrfToken = null;
            csrfRequest = null;
            return api(request);
        }

        if (error.response && error.response.status === 401) {
            const isAuthEndpoint = AUTH_ENDPOINTS_WITHOUT_REFRESH.some((path) => request?.url?.includes(path));
            if (request?.url?.includes('/auth/me') && !request._bootstrapRefreshRetry) {
                request._bootstrapRefreshRetry = true;
                if (!refreshRequest) {
                    refreshRequest = api.post('/auth/refresh').finally(() => {
                        refreshRequest = null;
                    });
                }

                try {
                    await refreshRequest;
                    setAuthenticatedSession(true);
                    return api(request);
                } catch {
                    setAuthenticatedSession(false);
                }
            } else if (request?.url?.includes('/auth/me')) {
                setAuthenticatedSession(false);
            } else if (request && !isAuthEndpoint && hasAuthenticatedSession && !request._authRetry) {
                request._authRetry = true;
                if (!refreshRequest) {
                    refreshRequest = api.post('/auth/refresh').finally(() => {
                        refreshRequest = null;
                    });
                }

                try {
                    await refreshRequest;
                    setAuthenticatedSession(true);
                    setAuthExpiredDispatched(false);
                    return api(request);
                } catch (refreshError) {
                    if (!getAuthExpiredDispatched()) {
                        setAuthenticatedSession(false);
                        setAuthExpiredDispatched(true);
                        window.dispatchEvent(
                            new CustomEvent('sakae-auth-expired', {
                                detail: {
                                    message:
                                        refreshError.response?.data?.message ||
                                        'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!',
                                },
                            }),
                        );
                    }
                }
            }
        }
        return Promise.reject(error);
    },
);

export default api;
