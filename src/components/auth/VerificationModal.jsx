import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShieldAlt, FaEnvelope, FaClock, FaRedo } from 'react-icons/fa';
import { verifyEmailAPI, resendCodeAPI, cancelRegistrationAPI } from '../../utils/authAPI';
import { useToast } from '../../contexts/ToastContext';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const VerificationModal = ({ isOpen, email, onClose, onSuccess }) => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(90); // 90 seconds (1m30s)
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
    const { addToast } = useToast();
    const { login } = useUser();
    const navigate = useNavigate();

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        let interval;
        if (isOpen && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isOpen, timer]);

    const handleCodeChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        setError(''); // Clear error when typing
        setSuccessMessage(''); // Clear success message when typing

        const newCode = [...code];
        newCode[index] = value.slice(-1);
        setCode(newCode);

        // Move to next input
        if (value && index < 5) {
            inputRefs[index + 1].current.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs[index - 1].current.focus();
        }
    };

    const handleVerify = async () => {
        const fullCode = code.join('');
        if (fullCode.length !== 6) {
            setError('Vui lòng nhập đủ 6 chữ số');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const data = await verifyEmailAPI(email, fullCode);
            addToast('Xác thực email thành công! Chào mừng bạn đến với Nhật Ngữ Sakae!', 'success');
            
            // Login user with the tokens returned after verification
            login(data);
            
            if (onSuccess) onSuccess();
            onClose();
            navigate('/');
        } catch (err) {
            setError(err.message || 'Mã xác thực không chính xác');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        // Remove timer > 0 check to allow immediate resend
        setIsResending(true);
        setError('');
        setSuccessMessage('');
        try {
            await resendCodeAPI(email);
            setSuccessMessage('Mã xác thực mới đã được gửi!');
            setTimer(90);
            setCode(['', '', '', '', '', '']);
            inputRefs[0].current.focus();
        } catch (err) {
            setError(err.message || 'Không thể gửi lại mã');
        } finally {
            setIsResending(false);
        }
    };

    const handleCancel = async () => {
        setIsLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            await cancelRegistrationAPI(email);
            addToast('Đã hủy phiên đăng ký hiện tại.', 'success');
            onClose();
        } catch (err) {
            setError(err.message || 'Không thể hủy đăng ký');
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return ReactDOM.createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
                    >
                        {/* Decorative background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -z-0 opacity-50"></div>
                        
                        <div className="p-6 relative z-10">
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shadow-inner">
                                    <FaShieldAlt size={32} />
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Xác thực Email</h2>
                            <p className="text-center text-gray-500 mb-8 text-sm">
                                Chúng tôi đã gửi mã 6 chữ số đến <br />
                                <span className="font-semibold text-gray-800">{email}</span>
                            </p>

                            <div className="flex justify-between gap-1.5 sm:gap-2 mb-8">
                                {code.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={inputRefs[index]}
                                        type="text"
                                        maxLength={1}
                                        inputMode="numeric"
                                        value={digit}
                                        onChange={(e) => handleCodeChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-full h-12 sm:h-14 text-center text-xl sm:text-2xl font-bold bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all outline-none"
                                    />
                                ))}
                            </div>

                            <div className="flex items-center justify-center gap-2 mb-6 text-sm">
                                <FaClock className={timer > 0 ? 'text-orange-500' : 'text-gray-400'} />
                                <span className={timer > 0 ? 'text-gray-700 font-medium' : 'text-red-500 font-bold'}>
                                    {timer > 0 ? `Mã hiệu lực trong ${formatTime(timer)}` : 'Mã đã hết hạn'}
                                </span>
                            </div>

                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.p
                                        key="error"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-red-500 text-xs font-bold text-center mb-4 bg-red-50 py-2 rounded-lg border border-red-100"
                                    >
                                        {error}
                                    </motion.p>
                                )}
                                {successMessage && (
                                    <motion.p
                                        key="success"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-green-600 text-xs font-bold text-center mb-4 bg-green-50 py-2 rounded-lg border border-green-100"
                                    >
                                        {successMessage}
                                    </motion.p>
                                )}
                            </AnimatePresence>

                            <button
                                onClick={handleVerify}
                                disabled={isLoading || timer === 0}
                                className={`w-full py-3 cursor-pointer rounded-xl font-bold text-white transition-all shadow-lg ${
                                    isLoading || timer === 0
                                        ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                        : 'bg-red-600 hover:bg-red-500 hover:shadow-red-200 active:scale-[0.95]'
                                }`}
                            >
                                {isLoading ? 'Đang xác thực...' : 'Xác Nhận'}
                            </button>

                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="w-full mt-3 py-2.5 cursor-pointer rounded-xl font-bold text-slate-500 hover:text-red-600 hover:bg-slate-50 transition-all border border-slate-200"
                            >
                                {isLoading ? 'Đang hủy...' : 'Hủy & Đổi email khác'}
                            </button>

                            <div className="mt-6 text-center">
                                <p className="text-gray-500 text-sm">
                                    Không nhận được mã?{' '}
                                    <button
                                        onClick={handleResend}
                                        disabled={isResending}
                                        className={`font-bold inline-flex items-center gap-1.5 transition-colors ${
                                            isResending
                                                ? 'text-gray-300 cursor-not-allowed'
                                                : 'text-red-600 hover:text-red-700 cursor-pointer'
                                        }`}
                                    >
                                        <FaRedo className={isResending ? 'animate-spin' : ''} size={12} />
                                        Gửi lại mã
                                    </button>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default VerificationModal;
