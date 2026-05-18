import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaShieldAlt, FaEnvelope, FaCheck, FaTimes } from 'react-icons/fa';
import { 
    calculatePasswordStrength, 
    checkPasswordRequirements, 
    isPasswordValid 
} from '../../utils/authUtils';
import { resetPasswordAPI, forgotPasswordAPI } from '../../utils/authAPI';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { ASSETS } from '../../constants/assets';

const ResetPasswordForm = ({ onSwitchMode, direction }) => {
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState(searchParams.get('token') || '');
    const [email, setEmail] = useState(searchParams.get('email') || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [timeLeft, setTimeLeft] = useState(90); // 90 seconds (1m30s)
    const [canResend, setCanResend] = useState(false);
    const [isResending, setIsResending] = useState(false);
    
    // Countdown Timer Effect
    useEffect(() => {
        if (timeLeft <= 0) {
            setCanResend(true);
            return;
        }
        
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleResendToken = async () => {
        if (!email) {
            addToast('Vui lòng nhập email để nhận lại mã', 'error');
            return;
        }
        setIsResending(true);
        try {
            await forgotPasswordAPI(email);
            setTimeLeft(90);
            setCanResend(false);
            addToast('Mã xác nhận mới đã được gửi tới email của bạn!', 'success');
        } catch (error) {
            addToast(error.message, 'error');
        } finally {
            setIsResending(false);
        }
    };
    
    const navigate = useNavigate();
    const { addToast } = useToast();

    const passwordStrength = calculatePasswordStrength(newPassword);
    const passwordRequirements = checkPasswordRequirements(newPassword);

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!email) {
            addToast('Vui lòng nhập email', 'error');
            return;
        }

        if (!email.toLowerCase().endsWith('@gmail.com')) {
            addToast('Hệ thống chỉ hỗ trợ bằng Gmail cá nhân (kết thúc bằng @gmail.com)', 'error');
            return;
        }

        if (!token) {
            addToast('Vui lòng nhập mã xác thực', 'error');
            return;
        }

        if (timeLeft <= 0) {
            addToast('Mã xác nhận của bạn đã hết hạn. Vui lòng bấm "Gửi lại mã" để nhận mã mới.', 'error');
            return;
        }

        if (!newPassword) {
            addToast('Vui lòng nhập mật khẩu mới', 'error');
            return;
        }

        if (!isPasswordValid(newPassword)) {
            addToast('Mật khẩu chưa đủ mạnh', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            addToast('Mật khẩu xác nhận không khớp', 'error');
            return;
        }

        setIsLoading(true);
        try {
            await resetPasswordAPI(email, token, newPassword);
            setIsSuccess(true);
            addToast('Đặt lại mật khẩu thành công!', 'success');
            
            setTimeout(() => {
                if (onSwitchMode) {
                    onSwitchMode('login', -1);
                } else {
                    navigate('/dang-nhap');
                }
            }, 3000);
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

    if (isSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-white/50 text-center"
            >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                    <FaShieldAlt size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Thành Công!</h2>
                <p className="text-gray-500 mb-6">Mật khẩu của bạn đã được thay đổi. Đang chuyển hướng về trang đăng nhập...</p>
                <button
                    onClick={() => onSwitchMode ? onSwitchMode('login', -1) : navigate('/dang-nhap')}
                    className="text-red-600 font-bold hover:underline"
                >
                    Đăng nhập ngay
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            custom={direction}
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-lg bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-6 border border-white/50 relative overflow-hidden"
        >
            {/* Header */}
            <div className="text-center mb-6 relative z-10">
                <div className="flex justify-center">
                    <img src={ASSETS.LOGO} alt="Sakae Logo" className="h-30 w-auto object-contain drop-shadow-sm" />
                </div>
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent mb-1">
                    Đặt Lại Mật Khẩu
                </h1>
                <p className="text-gray-500 text-sm">Nhập mật khẩu mới an toàn cho tài khoản của bạn</p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4 relative z-10">
                {/* Email Field */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Email</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                            <FaEnvelope size={16} />
                        </div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Nhập email tài khoản"
                            className="w-full pl-10 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 transition-all"
                        />
                    </div>
                </div>

                {/* Token Field */}
                <div>
                    <div className="flex justify-between items-center mb-1 ml-1">
                        <label className="block text-sm font-semibold text-gray-700">Mã xác nhận</label>
                        <span className={`text-xs font-bold ${timeLeft <= 0 ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
                            {timeLeft <= 0 ? 'Mã đã hết hạn' : `Hiệu lực: ${formatTime(timeLeft)}`}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative group flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                                <FaShieldAlt size={16} />
                            </div>
                            <input
                                type="text"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="Mã 6 chữ số"
                                className="w-full pl-10 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 transition-all font-mono text-center tracking-[0.2em] font-bold text-lg"
                                maxLength={6}
                            />
                        </div>
                        <button
                            type="button"
                            disabled={!canResend || isResending}
                            onClick={handleResendToken}
                            className={`px-4 py-3.5 cursor-pointer rounded-xl text-xs font-bold transition-all border ${
                                canResend 
                                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                                    : 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
                            }`}
                        >
                            {isResending ? 'Đang gửi...' : 'Gửi lại mã'}
                        </button>
                    </div>
                </div>

                {/* New Password */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Mật khẩu mới</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                            <FaLock size={16} />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Mật khẩu mới"
                            className="w-full pl-10 pr-10 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3.5 cursor-pointer flex items-center text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
                        >
                            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                        </button>
                    </div>

                    {/* Strength Indicator */}
                    {newPassword && (
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
                    <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Xác nhận mật khẩu</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                            <FaLock size={16} />
                        </div>
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Nhập lại mật khẩu"
                            className="w-full pl-10 pr-10 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3.5 cursor-pointer flex items-center text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
                        >
                            {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 cursor-pointer rounded-xl font-bold text-white transition-all shadow-lg ${
                        isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 shadow-red-200'
                    }`}
                >
                    {isLoading ? 'Đang cập nhật...' : 'Đổi Mật Khẩu'}
                </button>
            </form>

            <button
                onClick={() => onSwitchMode('login', -1)}
                className="w-full mt-6 cursor-pointer flex items-center justify-center gap-2 text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors"
            >
                <FaArrowLeft /> Quay lại đăng nhập
            </button>
        </motion.div>
    );
};

export default ResetPasswordForm;
