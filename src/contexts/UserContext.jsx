import React, { createContext, useState, useCallback, useEffect } from 'react';
import api, { resetCsrfToken, setAuthenticatedSession } from '../utils/api';

const IDLE_TIMEOUT_MS = 45 * 60 * 1000;
const ACTIVITY_HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000;
const LAST_ACTIVITY_KEY_PREFIX = 'sakae_last_activity_';
const LAST_SERVER_ACTIVITY_KEY_PREFIX = 'sakae_last_server_activity_';

const getActivityKey = (prefix, userId) => `${prefix}${userId}`;

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext();

const normalizeUserData = (rawData) => {
    const normalized = rawData?.data || rawData || {};
    const nestedUser = normalized?.user || {};
    const safeUser = { ...nestedUser, ...normalized };
    delete safeUser.accessToken;
    delete safeUser.refreshToken;
    delete safeUser.token;
    delete safeUser.data;
    delete safeUser.user;
    return safeUser;
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const clearLocalSession = useCallback(
        (userId = user?.id) => {
            setUser(null);
            localStorage.removeItem('sakae_user');
            localStorage.removeItem('sakae_admin');
            sessionStorage.removeItem('showAdminLoginSuccessToast');
            if (userId) {
                localStorage.removeItem(getActivityKey(LAST_ACTIVITY_KEY_PREFIX, userId));
                localStorage.removeItem(getActivityKey(LAST_SERVER_ACTIVITY_KEY_PREFIX, userId));
            }
            setAuthenticatedSession(false);
            resetCsrfToken();
        },
        [user?.id],
    );

    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout');
            clearLocalSession();
            return true;
        } catch (error) {
            console.error('Unable to revoke the server session during logout:', error);
            return false;
        }
    }, [clearLocalSession]);

    useEffect(() => {
        let isMounted = true;
        localStorage.removeItem('sakae_user');
        localStorage.removeItem('sakae_admin');

        api.get('/auth/me', { timeout: 5000 })
            .then((response) => {
                setAuthenticatedSession(true);
                if (isMounted) setUser(normalizeUserData(response.data));
            })
            .catch((error) => {
                if (error.response?.status === 401) {
                    setAuthenticatedSession(false);
                } else {
                    setAuthenticatedSession(false);
                    console.error('Unable to restore the current session:', error);
                }
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const login = useCallback((userData) => {
        const normalizedUser = normalizeUserData(userData);
        setAuthenticatedSession(true);
        setUser(normalizedUser);
        if (normalizedUser.id) {
            const now = String(Date.now());
            localStorage.setItem(getActivityKey(LAST_ACTIVITY_KEY_PREFIX, normalizedUser.id), now);
            localStorage.setItem(getActivityKey(LAST_SERVER_ACTIVITY_KEY_PREFIX, normalizedUser.id), now);
        }
        if (typeof window !== 'undefined') {
            window.__sakaeAuthExpiredDispatched = false;
        }
    }, []);

    useEffect(() => {
        if (!user?.id) return undefined;

        const activityKey = getActivityKey(LAST_ACTIVITY_KEY_PREFIX, user.id);
        const serverActivityKey = getActivityKey(LAST_SERVER_ACTIVITY_KEY_PREFIX, user.id);
        let lastActivityAt = Number(localStorage.getItem(activityKey));
        let lastServerActivityAt = Number(localStorage.getItem(serverActivityKey)) || 0;
        let heartbeatInFlight = false;
        let expired = false;

        if (!Number.isFinite(lastActivityAt) || lastActivityAt <= 0) {
            lastActivityAt = Date.now();
            localStorage.setItem(activityKey, String(lastActivityAt));
        }

        const expireSession = () => {
            if (expired) return;
            expired = true;
            window.dispatchEvent(
                new CustomEvent('sakae-auth-expired', {
                    detail: {
                        message: 'Bạn đã tự động đăng xuất vì không hoạt động trong 45 phút.',
                    },
                }),
            );
        };

        const checkIdleTimeout = () => {
            const sharedActivityAt = Number(localStorage.getItem(activityKey)) || lastActivityAt;
            lastActivityAt = Math.max(lastActivityAt, sharedActivityAt);
            if (Date.now() - lastActivityAt >= IDLE_TIMEOUT_MS) {
                expireSession();
            }
        };

        const sendActivityHeartbeat = async (now) => {
            if (
                heartbeatInFlight ||
                now - lastServerActivityAt < ACTIVITY_HEARTBEAT_INTERVAL_MS
            ) {
                return;
            }

            heartbeatInFlight = true;
            lastServerActivityAt = now;
            try {
                await api.post('/auth/activity');
                lastServerActivityAt = Date.now();
                localStorage.setItem(serverActivityKey, String(lastServerActivityAt));
            } catch (error) {
                if (!error.response) {
                    console.error('Unable to update the active session heartbeat:', error);
                }
            } finally {
                heartbeatInFlight = false;
            }
        };

        const recordUserActivity = () => {
            checkIdleTimeout();
            if (expired) return;

            const now = Date.now();
            const shouldSyncActivity = now - lastActivityAt >= 1000;
            lastActivityAt = now;
            if (shouldSyncActivity) localStorage.setItem(activityKey, String(now));
            void sendActivityHeartbeat(now);
        };

        const handleStorageChange = (event) => {
            if (event.key === activityKey) checkIdleTimeout();
        };
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') checkIdleTimeout();
        };

        const idleCheckTimer = window.setInterval(checkIdleTimeout, 10_000);
        const initialCheckTimer = window.setTimeout(checkIdleTimeout, 0);
        const activityEvents = ['pointerdown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
        activityEvents.forEach((eventName) =>
            window.addEventListener(eventName, recordUserActivity, { passive: true }),
        );
        window.addEventListener('storage', handleStorageChange);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.clearInterval(idleCheckTimer);
            window.clearTimeout(initialCheckTimer);
            activityEvents.forEach((eventName) =>
                window.removeEventListener(eventName, recordUserActivity),
            );
            window.removeEventListener('storage', handleStorageChange);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [user?.id]);

    useEffect(() => {
        const handleAuthExpired = async () => {
            const revoked = await logout();
            if (!revoked) clearLocalSession();
        };
        window.addEventListener('sakae-auth-expired', handleAuthExpired);
        return () => window.removeEventListener('sakae-auth-expired', handleAuthExpired);
    }, [clearLocalSession, logout]);

    const updateUser = useCallback((newData) => {
        setUser((previousUser) => {
            if (!previousUser) return previousUser;
            return normalizeUserData({ ...previousUser, ...newData });
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
