import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaArrowLeft } from 'react-icons/fa';
import { isValidEmail } from '../../utils/authUtils';
import { loginAPI } from '../../utils/authAPI';
import api from '../../utils/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { useUser } from '../../contexts/UserContext';
import { ASSETS } from '../../constants/assets';

const LoginForm = ({ onSwitchMode, direction }) => {
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberPassword, setRememberPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { addToast } = useToast();
    const { login, updateUser } = useUser();

    const handleLogin = async (e) => {
        e.preventDefault();

        // Validation checks
        if (!loginEmail) {
            addToast('Vui lòng nhập email', 'error');
            return;
        }

        if (!isValidEmail(loginEmail)) {
            addToast('Email không hợp lệ, vui lòng kiểm tra lại', 'error');
            return;
        }

        if (!loginPassword) {
            addToast('Vui lòng nhập mật khẩu', 'error');
            return;
        }

        if (loginPassword.length < 6) {
            addToast('Mật khẩu phải có ít nhất 6 ký tự', 'error');
            return;
        }

        // Try login with fake API
        setIsLoading(true);
        try {
            const userData = await loginAPI(loginEmail, loginPassword);
            login(userData);
            addToast('Đăng nhập thành công! Chào mừng bạn quay lại Sakae!', 'success');

            // Fetch the full user profile after successful login so Navbar can display fullName
            try {
                const profileResponse = await api.get('/users/profile');
                const profileData = profileResponse.data.data || profileResponse.data;
                updateUser(profileData);
            } catch (profileError) {
                console.warn('Unable to fetch profile after login:', profileError);
            }

            // Redirect to previous page or home
            const origin = location.state?.from?.pathname || '/';
            navigate(origin);
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
                    Chào Mừng Trở Lại
                </h1>
                <p className="text-gray-500 text-sm">Vui lòng đăng nhập để tiếp tục</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5 relative z-10">
                {/* Email */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Email của bạn</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                            <FaEnvelope />
                        </div>
                        <input
                            type="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            placeholder="example@gmail.com"
                            className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 shadow-sm"
                        />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Mật khẩu</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                            <FaLock />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="Nhập mật khẩu"
                            className="w-full px-11 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 shadow-sm"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 cursor-pointer flex items-center text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
                        >
                            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                        </button>
                    </div>
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between px-1">
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                checked={rememberPassword}
                                onChange={(e) => setRememberPassword(e.target.checked)}
                                className="peer sr-only"
                            />
                            <div className="w-5 h-5 rounded border-2 border-gray-300 peer-checked:bg-red-500 peer-checked:border-red-500 transition-all"></div>
                            <svg
                                className="absolute w-3.5 h-3.5 left-0.5 top-0.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                                viewBox="0 0 17 12"
                                fill="none"
                            >
                                <path
                                    d="M1 5.5L6 10.5L16 1.5"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                            Ghi nhớ tôi
                        </span>
                    </label>
                    <button
                        type="button"
                        onClick={() => onSwitchMode('forgot', 1)}
                        className="text-sm cursor-pointer font-semibold text-red-600 hover:text-red-700 transition-colors"
                    >
                        Quên mật khẩu?
                    </button>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3.5 cursor-pointer rounded-xl font-bold text-white transition-all duration-300 ${
                        isLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-500 hover:shadow-[0_12px_20px_-6px_rgba(220,38,38,0.6)] transform hover:-translate-y-0.5 active:translate-y-0'
                    }`}
                >
                    {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6 relative z-10">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-gray-400 text-sm font-medium">hoặc</span>
                <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Switch to Signup */}
            <p className="text-center text-gray-600 text-sm font-medium relative z-10">
                Chưa có tài khoản?{' '}
                <button
                    onClick={() => onSwitchMode('signup', 1)}
                    className="text-red-600 cursor-pointer font-bold hover:text-red-700 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-red-600 after:transition-all"
                >
                    Đăng ký ngay
                </button>
            </p>

            {/* Decorative background circle */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -z-0 opacity-50"></div>
        </motion.div>
    );
};

export default LoginForm;
