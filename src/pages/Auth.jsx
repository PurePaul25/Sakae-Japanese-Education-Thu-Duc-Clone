import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';

const Auth = () => {
    const location = useLocation();
    const [authMode, setAuthMode] = useState('login'); // 'login', 'signup', 'forgot'
    const [direction, setDirection] = useState(0);

    // Set auth mode based on route
    useEffect(() => {
        if (location.pathname.includes('/dang-ky')) {
            setAuthMode('signup');
        } else {
            setAuthMode('login');
        }
    }, [location.pathname]);

    const handleSwitchMode = (newMode, newDirection) => {
        setDirection(newDirection);
        // User requested to reload page when switching to login
        if (newMode === 'login' && !location.pathname.includes('/dang-nhap')) {
            // setTimeout allows the exit animation to begin playing before browser unloads the document
            setAuthMode(newMode);
            setTimeout(() => {
                window.location.href = '/dang-nhap';
            }, 50);
            return;
        }
        setAuthMode(newMode);
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 flex items-center justify-center px-4 py-6 overflow-hidden z-0">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-red-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-blob"></div>
            <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-orange-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-10%] left-[30%] w-[600px] h-[600px] bg-yellow-200 rounded-full mix-blend-multiply filter blur-[150px] opacity-20 animate-blob animation-delay-4000"></div>

            <div className="w-full max-w-xl relative z-10 flex justify-center">
                <AnimatePresence mode="wait" custom={direction}>
                    {authMode === 'login' && (
                        <LoginForm key="login" onSwitchMode={handleSwitchMode} direction={direction} />
                    )}

                    {authMode === 'signup' && (
                        <SignupForm key="signup" onSwitchMode={handleSwitchMode} direction={direction} />
                    )}

                    {authMode === 'forgot' && (
                        <ForgotPasswordForm key="forgot" onSwitchMode={handleSwitchMode} direction={direction} />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Auth;
