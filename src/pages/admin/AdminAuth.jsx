import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import AdminLoginForm from '../../components/auth/AdminLoginForm';
import SEO from '../../hooks/useSEO';

const AdminAuth = () => {
    const location = useLocation();
    const [direction, setDirection] = useState(0);

    // Check if admin is already logged in
    useEffect(() => {
        const adminData = localStorage.getItem('sakae_admin');
        if (adminData && location.pathname.includes('/admin/dang-nhap')) {
            window.location.href = '/admin/dashboard';
        }
    }, [location.pathname]);

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 flex items-center justify-center px-4 py-6 overflow-hidden z-0">
            <SEO page="adminAuth" />

            {/* Background elements */}
            <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-red-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-blob"></div>
            <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-orange-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-10%] left-[30%] w-[600px] h-[600px] bg-yellow-200 rounded-full mix-blend-multiply filter blur-[150px] opacity-20 animate-blob animation-delay-4000"></div>

            <div className="w-full max-w-xl relative z-10 flex justify-center">
                <AnimatePresence mode="wait" custom={direction}>
                    <AdminLoginForm key="admin-login" direction={direction} />
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminAuth;
