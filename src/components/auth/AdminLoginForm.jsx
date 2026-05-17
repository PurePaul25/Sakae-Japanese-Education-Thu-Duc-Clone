import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaArrowLeft } from 'react-icons/fa';
import { isValidEmail } from '../../utils/authUtils';
import { adminLoginAPI } from '../../utils/authAPI';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { useUser } from '../../contexts/UserContext';
import { ASSETS } from '../../constants/assets';

const AdminLoginForm = ({ direction }) => {
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { addToast } = useToast();
    const { login } = useUser();

    const handleAdminLogin = async (e) => {
        e.preventDefault();

        // Validation checks
        if (!adminEmail) {
            addToast('Vui lòng nhập email', 'error');
            return;
        }

        if (!isValidEmail(adminEmail)) {
            addToast('Email không hợp lệ, vui lòng kiểm tra lại', 'error');
            return;
        }

        if (!adminPassword) {
            addToast('Vui lòng nhập mật khẩu', 'error');
            return;
        }

        if (adminPassword.length < 6) {
            addToast('Mật khẩu phải có ít nhất 6 ký tự', 'error');
            return;
        }

        // Try login
        setIsLoading(true);
        try {
            const adminData = await adminLoginAPI(adminEmail, adminPassword);

            // Save to context and localStorage
            login(adminData);
            localStorage.setItem('sakae_admin', JSON.stringify(adminData));

            // Store flag to show toast on admin dashboard
            sessionStorage.setItem('showAdminLoginSuccessToast', 'true');

            // Redirect immediately to admin dashboard
            navigate('/admin/dashboard');
        } catch (error) {
            addToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const formVariants = {
        hidden: (direction) => ({
            opacity: 0,
            x: direction > 0 ? 100 : -100,
        }),
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.4, ease: 'easeOut' },
        },
        exit: (direction) => ({
            opacity: 0,
            x: direction > 0 ? -100 : 100,
            transition: { duration: 0.3, ease: 'easeIn' },
        }),
    };

    return (
        <motion.div
            custom={direction}
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-lg bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-6 border border-white/50 relative overflow-hidden"
        >
            {/* Back to Home */}
            <button
                onClick={() => navigate('/')}
                className="group flex items-center gap-2 cursor-pointer text-gray-500 hover:text-red-600 transition-all duration-300 relative z-10"
            >
                <FaArrowLeft className="transition-all duration-300 group-hover:-translate-x-1" />
                <span className="transition-all duration-300 group-hover:translate-x-1">Trang chủ</span>
            </button>

            {/* Logo and Header */}
            <div className="text-center mb-6 relative z-10">
                <div className="flex justify-center">
                    <img src={ASSETS.LOGO} alt="Sakae Logo" className="h-30 w-auto object-contain drop-shadow-sm" />
                </div>
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent mb-2">
                    Đăng Nhập Quản Trị
                </h1>
                <p className="text-gray-500 text-sm">Đăng nhập vào bảng quản trị</p>
            </div>

            {/* Form */}
            <form onSubmit={handleAdminLogin} className="space-y-5 relative z-10">
                {/* Email */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Email Admin</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                            <FaEnvelope />
                        </div>
                        <input
                            type="email"
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                            placeholder="Nhập email admin"
                            className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 shadow-sm"
                        />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Mật khẩu Admin</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                            <FaLock />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            placeholder="Nhập mật khẩu"
                            className="w-full px-11 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 shadow-sm"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute cursor-pointer inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
                        >
                            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 cursor-pointer bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Đang xử lý...
                        </div>
                    ) : (
                        'Đăng Nhập Admin'
                    )}
                </button>
            </form>
        </motion.div>
    );
};

export default AdminLoginForm;
