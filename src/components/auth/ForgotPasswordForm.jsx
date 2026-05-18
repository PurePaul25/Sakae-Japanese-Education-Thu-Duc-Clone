import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { isValidEmail } from '../../utils/authUtils';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { forgotPasswordAPI } from '../../utils/authAPI';
import { ASSETS } from '../../constants/assets';

const ForgotPasswordForm = ({ onSwitchMode, direction }) => {
    const [forgotEmail, setForgotEmail] = useState('');
    const [resetSent, setResetSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { addToast } = useToast();

    const handleForgotPassword = async (e) => {
        e.preventDefault();

        if (!forgotEmail) {
            addToast('Vui lòng nhập email', 'error');
            return;
        }

        if (!isValidEmail(forgotEmail)) {
            addToast('Email không hợp lệ, vui lòng kiểm tra lại', 'error');
            return;
        }

        if (!forgotEmail.toLowerCase().endsWith('@gmail.com')) {
            addToast('Hệ thống chỉ hỗ trợ khôi phục bằng Gmail cá nhân (kết thúc bằng @gmail.com)', 'error');
            return;
        }

        setIsLoading(true);
        try {
            await forgotPasswordAPI(forgotEmail);
            setResetSent(true);
            addToast(`Link đặt lại mật khẩu đã được gửi tới ${forgotEmail}`, 'success');
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

            {/* Header */}
            <div className="text-center mb-4 relative z-10">
                <div className="flex justify-center">
                    <img src={ASSETS.LOGO} alt="Sakae Logo" className="h-30 w-auto object-contain drop-shadow-sm" />
                </div>
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent mb-2">
                    Quên Mật Khẩu
                </h1>
                <p className="text-gray-500 text-sm">Nhập email của bạn để nhận hướng dẫn đặt lại</p>
            </div>

            {/* Form */}
            <div className="relative z-10 min-h-[200px] flex flex-col justify-center">
                {!resetSent ? (
                    <motion.form
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onSubmit={handleForgotPassword}
                        className="space-y-6"
                    >
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                                Email khôi phục
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                                    <FaEnvelope />
                                </div>
                                <input
                                    type="email"
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    placeholder="example@gmail.com"
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all duration-300 shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3.5 cursor-pointer rounded-xl font-bold text-white transition-all duration-300 ${
                                isLoading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-500 shadow-[0_8px_16px_-6px_rgba(220,38,38,0.5)] hover:shadow-[0_12px_20px_-6px_rgba(220,38,38,0.6)] transform hover:-translate-y-0.5 active:translate-y-0'
                            }`}
                        >
                            {isLoading ? 'Đang gửi...' : 'Gửi Hướng Dẫn'}
                        </button>
                    </motion.form>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-4"
                    >
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl text-green-500">✓</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Yêu cầu đã gửi!</h2>
                        <p className="text-gray-500 text-sm mb-4">
                            Mã khôi phục đã được gửi tới <span className="font-semibold text-gray-700">{forgotEmail}</span>. <br/>
                            Vui lòng kiểm tra email của bạn.
                        </p>
                        <button
                            onClick={() => onSwitchMode('reset', 1)}
                            className="cursor-pointer text-red-600 text-sm font-bold hover:underline"
                        >
                            Tôi đã có mã, đặt lại mật khẩu ngay
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Back Button */}
            <div className="mt-6 relative z-10 w-full">
                <button
                    onClick={() => onSwitchMode('login', -1)}
                    className="w-full cursor-pointer flex items-center justify-center gap-2 text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors group py-2"
                >
                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Quay lại đăng nhập
                </button>
            </div>

            {/* Decorative background circle */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -z-0 opacity-50"></div>
        </motion.div>
    );
};

export default ForgotPasswordForm;
