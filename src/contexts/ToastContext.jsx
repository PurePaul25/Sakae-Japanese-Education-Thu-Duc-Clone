import React, { createContext, useState, useCallback } from 'react';

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success', duration = 4000) => {
        if (!message) return null;
        let addedId = null;

        setToasts((prev) => {
            const isDuplicate = prev.some((t) => t.message === message && t.type === type);
            if (isDuplicate) return prev;

            const id = Date.now() + Math.floor(Math.random() * 1000);
            addedId = id;
            return [...prev, { id, message, type }];
        });

        if (duration > 0) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.message !== message || t.type !== type));
            }, duration);
        }

        return addedId;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const value = {
        toasts,
        addToast,
        removeToast,
    };

    return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

export const useToast = () => {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
