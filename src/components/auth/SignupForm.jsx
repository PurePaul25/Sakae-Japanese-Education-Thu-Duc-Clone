import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaCheck, FaTimes, FaArrowLeft } from 'react-icons/fa';
import {
    calculatePasswordStrength,
    checkPasswordRequirements,
    isPasswordValid,
    isValidEmail,
    isValidUsername,
} from '../../utils/authUtils';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { signupAPI } from '../../utils/authAPI';
import { ASSETS } from '../../constants/assets';
import VerificationModal from './VerificationModal';

const SignupForm = ({ onSwitchMode, direction }) => {
    const [signupUsername, setSignupUsername] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const navigate = useNavigate();
    const { addToast } = useToast();

    const passwordStrength = calculatePasswordStrength(signupPassword);
    const passwordRequirements = checkPasswordRequirements(signupPassword);

    const handleSignup = async (e) => {
        e.preventDefault();

        // Validation checks
        if (!signupUsername) {
            addToast('Vui lòng nhập tên người dùng', 'error');
            return;
        }

        if (!isValidUsername(signupUsername)) {
            addToast('Tên phải trên 3 ký tự, tối đa 21 ký tự', 'error');
            return;
        }

        if (!signupEmail) {
            addToast('Vui lòng nhập email', 'error');
            return;
        }

        if (!isValidEmail(signupEmail)) {
            addToast('Email không hợp lệ, vui lòng kiểm tra lại', 'error');
            return;
        }

        if (!signupPassword) {
            addToast('Vui lòng tạo mật khẩu', 'error');
            return;
        }

        if (!isPasswordValid(signupPassword)) {
            addToast('Mật khẩu phải có: Số, chữ, chữ hoa và trên 7 ký tự', 'error');
            return;
        }

        if (signupPassword !== signupConfirmPassword) {
            addToast('Mật khẩu xác nhận không khớp', 'error');
            return;
        }

        setIsLoading(true);
        try {
            await signupAPI(signupUsername, signupEmail, signupPassword, signupUsername, 'OTHER');
            addToast('Đăng ký thành công! Vui lòng kiểm tra email để lấy mã xác thực.', 'success');
            setShowVerifyModal(true);
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
            <div className="text-center mb-6 relative z-10">
                <div className="flex justify-center">
                    <img src={ASSETS.LOGO} alt="Sakae Logo" className="h-30 w-auto object-contain drop-shadow-sm" />
                </div>
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent mb-1">
                    Tạo Tài Khoản
                </h1>
                <p className="text-gray-500 text-sm">Hành trình học tiếng Nhật bắt đầu từ đây</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSignup} className="space-y-4 relative z-10">
                {/* Username */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Tên người dùng</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                            <FaUser size={16} />
                        </div>
                        <input
                            type="text"
                            value={signupUsername}
                            onChange={(e) => setSignupUsername(e.target.value)}
                            placeholder="Tên của bạn"
                            className="w-full pl-10 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all shadow-sm"
                        />
                    </div>
                    {signupUsername && !isValidUsername(signupUsername) && (
                        <p className="text-[11px] text-red-500 mt-1 ml-1">Tên phải trên 3 ký tự, tối đa 21 ký tự</p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Email</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                            <FaEnvelope size={16} />
                        </div>
                        <input
                            type="email"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            placeholder="Nhập email"
                            className="w-full pl-10 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Mật khẩu</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                            <FaLock size={16} />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            placeholder="Tạo mật khẩu"
                            className="w-full pl-10 pr-10 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all shadow-sm"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3.5 cursor-pointer flex items-center text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
                        >
                            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                        </button>
                    </div>

                    {/* Password Strength */}
                    {signupPassword && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-2.5 space-y-2 bg-gray-50 p-2.5 rounded-lg border border-gray-200"
                        >
                            <div className="flex justify-between items-center px-1">
                                <span className="text-xs font-medium text-gray-500">Độ mạnh:</span>
                                <span
                                    className={`text-xs font-bold ${
                                        passwordStrength.level === 'predictable'
                                            ? 'text-red-500'
                                            : passwordStrength.level === 'weak'
                                              ? 'text-red-500'
                                              : passwordStrength.level === 'fair'
                                                ? 'text-yellow-600'
                                                : passwordStrength.level === 'good'
                                                  ? 'text-blue-500'
                                                  : 'text-green-500'
                                    }`}
                                >
                                    {passwordStrength.text}
                                </span>
                            </div>
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${passwordStrength.percentage || 0}%` }}
                                    transition={{ duration: 0.3 }}
                                    className={`h-full rounded-full ${passwordStrength.color}`}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-1 pt-1">
                                {[
                                    { label: 'Số (0-9)', check: passwordRequirements.hasNumber },
                                    { label: 'Chữ (a-z)', check: passwordRequirements.hasLetter },
                                    { label: 'Hoa (A-Z)', check: passwordRequirements.hasUppercase },
                                    { label: 'Trên 7 ký tự', check: passwordRequirements.isLongEnough },
                                ].map((req, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5">
                                        {req.check ? (
                                            <FaCheck className="text-green-500 text-[11px]" />
                                        ) : (
                                            <FaTimes className="text-red-400 text-[11px]" />
                                        )}
                                        <span
                                            className={`text-[11px] ${req.check ? 'text-green-600' : 'text-gray-500'}`}
                                        >
                                            {req.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Xác nhận</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                            <FaLock size={16} />
                        </div>
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={signupConfirmPassword}
                            onChange={(e) => setSignupConfirmPassword(e.target.value)}
                            placeholder="Nhập lại mật khẩu"
                            className="w-full pl-10 pr-10 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-allshadow-sm"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
                        >
                            {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                        </button>
                    </div>
                    {signupConfirmPassword && signupPassword !== signupConfirmPassword && (
                        <p className="text-xs text-red-500 mt-1 ml-1">Mật khẩu không khớp</p>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 cursor-pointer rounded-xl font-bold text-white transition-all duration-300 mt-2 ${
                        isLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-500 shadow-[0_8px_16px_-6px_rgba(220,38,38,0.5)] hover:shadow-[0_12px_20px_-6px_rgba(220,38,38,0.6)] transform hover:-translate-y-0.5 active:translate-y-0'
                    }`}
                >
                    {isLoading ? 'Đang đăng ký...' : 'Đăng Ký'}
                </button>
            </form>

            <div className="flex items-center gap-4 my-5 relative z-10">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-gray-400 text-sm font-medium">hoặc</span>
                <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <p className="text-center text-gray-600 text-sm font-medium relative z-10">
                Đã có tài khoản?{' '}
                <button
                    onClick={() => onSwitchMode('login', -1)}
                    className="text-red-600 font-bold hover:text-red-700 cursor-pointer transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-red-600 after:transition-all"
                >
                    Đăng nhập
                </button>
            </p>

            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -z-0 opacity-50"></div>
            
            <VerificationModal 
                isOpen={showVerifyModal} 
                email={signupEmail}
                onClose={() => setShowVerifyModal(false)}
                onSuccess={() => {
                    // Success logic is handled inside modal (redirect to home)
                }}
            />
        </motion.div>
    );
};

export default SignupForm;
