import React, { createContext, useState, useCallback, useEffect } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

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

    // Initialize user from localStorage on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('sakae_user');
        if (savedUser) {
            try {
                setUser(normalizeUserData(JSON.parse(savedUser)));
            } catch (error) {
                console.error('Error loading user from localStorage:', error);
                localStorage.removeItem('sakae_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = useCallback((userData) => {
        const storedUser = normalizeUserData(userData);
        setUser(storedUser);
        localStorage.setItem('sakae_user', JSON.stringify(storedUser));
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('sakae_user');
    }, []);

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
