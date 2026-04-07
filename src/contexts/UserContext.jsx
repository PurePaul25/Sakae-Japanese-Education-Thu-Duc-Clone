import React, { createContext, useState, useCallback, useEffect } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Initialize user from localStorage on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('sakae_user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error('Error loading user from localStorage:', error);
                localStorage.removeItem('sakae_user');
            }
        }
    }, []);

    const login = useCallback((userData) => {
        setUser(userData);
        localStorage.setItem('sakae_user', JSON.stringify(userData));
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('sakae_user');
    }, []);

    const value = {
        user,
        isLoading,
        login,
        logout,
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
