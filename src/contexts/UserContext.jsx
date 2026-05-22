import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext();

const parseJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join(''),
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
};

const getTokenExpirationMs = (token) => {
    const payload = parseJwt(token);
    if (!payload?.exp) return null;
    return payload.exp * 1000 - Date.now();
};

const getAuthExpiredMessage = () => 'Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại!';

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const authExpiredTimerRef = useRef(null);

    const normalizeUserData = (rawData) => {
        const normalized = rawData?.data || rawData || {};
        const nestedUser = normalized?.user || {};
        const accessToken =
            normalized?.accessToken ||
            normalized?.token ||
            normalized?.data?.accessToken ||
            nestedUser?.accessToken ||
            null;

        const result = {
            ...nestedUser,
            ...normalized,
            accessToken,
        };

        delete result.user;
        delete result.data;

        return result;
    };

    const clearAuthExpiryTimer = useCallback(() => {
        if (authExpiredTimerRef.current) {
            clearTimeout(authExpiredTimerRef.current);
            authExpiredTimerRef.current = null;
        }
    }, []);

    const dispatchAuthExpiredEvent = useCallback((message) => {
        if (typeof window === 'undefined') return;
        window.__sakaeAuthExpiredDispatched = true;
        window.dispatchEvent(
            new CustomEvent('sakae-auth-expired', {
                detail: { message },
            }),
        );
    }, []);

    const scheduleTokenExpiry = useCallback(
        (token) => {
            clearAuthExpiryTimer();
            const expiresInMs = getTokenExpirationMs(token);
            if (expiresInMs === null) return;

            if (expiresInMs <= 0) {
                dispatchAuthExpiredEvent(getAuthExpiredMessage());
                return;
            }

            authExpiredTimerRef.current = setTimeout(() => {
                dispatchAuthExpiredEvent(getAuthExpiredMessage());
            }, expiresInMs + 1000);
        },
        [clearAuthExpiryTimer, dispatchAuthExpiredEvent],
    );

    // Initialize user from localStorage on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('sakae_user');
        const savedAdmin = localStorage.getItem('sakae_admin');

        const dataToUse = savedUser || savedAdmin;

        if (dataToUse) {
            try {
                const normalized = normalizeUserData(JSON.parse(dataToUse));
                setUser(normalized);
                if (normalized.accessToken) {
                    scheduleTokenExpiry(normalized.accessToken);
                }
            } catch (error) {
                console.error('Error loading user from localStorage:', error);
                localStorage.removeItem('sakae_user');
                localStorage.removeItem('sakae_admin');
            }
        }
        setIsLoading(false);
    }, [scheduleTokenExpiry]);

    const login = useCallback(
        (userData) => {
            const storedUser = normalizeUserData(userData);
            setUser(storedUser);
            localStorage.setItem('sakae_user', JSON.stringify(storedUser));
            clearAuthExpiryTimer();
            if (storedUser.accessToken) {
                scheduleTokenExpiry(storedUser.accessToken);
            }
            if (typeof window !== 'undefined') {
                window.__sakaeAuthExpiredDispatched = false;
            }
        },
        [clearAuthExpiryTimer, scheduleTokenExpiry],
    );

    const logout = useCallback(() => {
        clearAuthExpiryTimer();
        setUser(null);
        localStorage.removeItem('sakae_user');
        localStorage.removeItem('sakae_admin');
    }, [clearAuthExpiryTimer]);

    useEffect(() => {
        const handleAuthExpired = () => {
            logout();
        };
        window.addEventListener('sakae-auth-expired', handleAuthExpired);
        return () => window.removeEventListener('sakae-auth-expired', handleAuthExpired);
    }, [logout]);

    const updateUser = useCallback((newData) => {
        setUser((prevUser) => {
            const updatedUser = { ...prevUser, ...newData };
            localStorage.setItem('sakae_user', JSON.stringify(updatedUser));
            return updatedUser;
        });
    }, []);

    const value = {
        user,
        isLoading,
        login,
        logout,
        updateUser,
        setIsLoading,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => {
    const context = React.useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
