import React, { useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { useToast } from '../../contexts/ToastContext';

const Toast = () => {
    const { toasts, removeToast } = useToast();

    const getToastConfig = (type) => {
        const configs = {
            success: {
                icon: FaCheckCircle,
                bgColor: 'bg-green-50',
                borderColor: 'border-green-300',
                textColor: 'text-green-800',
                iconColor: 'text-green-600',
                progressColor: 'bg-green-500',
                title: 'Thành công',
            },
            error: {
                icon: FaTimesCircle,
                bgColor: 'bg-red-50',
                borderColor: 'border-red-300',
                textColor: 'text-red-800',
                iconColor: 'text-red-600',
                progressColor: 'bg-red-500',
                title: 'Lỗi',
            },
            info: {
                icon: FaInfoCircle,
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-300',
                textColor: 'text-blue-800',
                iconColor: 'text-blue-600',
                progressColor: 'bg-blue-500',
                title: 'Thông báo',
            },
        };
        return configs[type] || configs.info;
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    // Desktop animation (slide in from right)
    const toastVariantsDesktop = {
        hidden: { opacity: 0, x: 400, scale: 0.9 },
        visible: {
            opacity: 1,
            x: 0,
            scale: 1,
            transition: {
                duration: 0.4,
                ease: 'easeOut',
            },
        },
        exit: {
            opacity: 0,
            x: 400,
            scale: 0.9,
            transition: {
                duration: 0.3,
                ease: 'easeIn',
            },
        },
    };

    // Mobile animation (slide in from top)
    const toastVariantsMobile = {
        hidden: { opacity: 0, y: -100, scale: 0.9 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.2,
                ease: 'easeOut',
            },
        },
        exit: {
            opacity: 0,
            y: -100,
            scale: 0.9,
            transition: {
                duration: 0.3,
                ease: 'easeIn',
            },
        },
    };

    // Detect if mobile
    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toastVariants = isMobile ? toastVariantsMobile : toastVariantsDesktop;

    return (
        <>
            {/* Mobile: Top Center */}
            <motion.div
                className="fixed top-3 left-1/2 transform -translate-x-1/2 z-9999 w-11/12 max-w-md md:hidden"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <AnimatePresence>
                    {toasts.map((toast) => {
                        const config = getToastConfig(toast.type);
                        const Icon = config.icon;

                        return (
                            <motion.div
                                key={toast.id}
                                layout
                                variants={toastVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className={`mb-3 ${config.bgColor} border-2 ${config.borderColor} rounded-lg overflow-hidden shadow-lg backdrop-blur-sm`}
                            >
                                {/* Main Content */}
                                <div className="p-3 flex items-start gap-3">
                                    <Icon className={`${config.iconColor} text-xl mt-0.5 flex-shrink-0`} />
                                    <div className="flex-grow">
                                        <p className={`font-bold ${config.textColor}`}>{config.title}</p>
                                        <p className={`text-sm ${config.textColor} opacity-90`}>{toast.message}</p>
                                    </div>
                                    <button
                                        onClick={() => removeToast(toast.id)}
                                        className={`${config.iconColor} hover:${config.textColor} transition cursor-pointer flex-shrink-0 mt-0.5`}
                                    >
                                        <FaTimes size={14} />
                                    </button>
                                </div>

                                {/* Progress Bar */}
                                <motion.div
                                    initial={{ scaleX: 1 }}
                                    animate={{ scaleX: 0 }}
                                    transition={{
                                        duration: 4,
                                        ease: 'linear',
                                    }}
                                    className={`h-1 ${config.progressColor} origin-left`}
                                />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>

            {/* Desktop: Top Right */}
            <motion.div
                className="fixed top-3 right-6 z-9999 w-96 hidden md:block space-y-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <AnimatePresence>
                    {toasts.map((toast) => {
                        const config = getToastConfig(toast.type);
                        const Icon = config.icon;

                        return (
                            <motion.div
                                key={toast.id}
                                layout
                                variants={toastVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className={`${config.bgColor} border-2 ${config.borderColor} rounded-lg overflow-hidden shadow-xl backdrop-blur-sm`}
                            >
                                {/* Main Content */}
                                <div className="p-3 flex items-start gap-3">
                                    <Icon className={`${config.iconColor} text-xl mt-0.5 flex-shrink-0`} />
                                    <div className="flex-grow">
                                        <p className={`font-bold ${config.textColor}`}>{config.title}</p>
                                        <p className={`text-sm ${config.textColor} opacity-90`}>{toast.message}</p>
                                    </div>
                                    <button
                                        onClick={() => removeToast(toast.id)}
                                        className={`${config.iconColor} hover:${config.textColor} transition cursor-pointer flex-shrink-0 mt-0.5`}
                                    >
                                        <FaTimes size={14} />
                                    </button>
                                </div>

                                {/* Progress Bar */}
                                <motion.div
                                    initial={{ scaleX: 1 }}
                                    animate={{ scaleX: 0 }}
                                    transition={{
                                        duration: 4,
                                        ease: 'linear',
                                    }}
                                    className={`h-1 ${config.progressColor} origin-left`}
                                />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>
        </>
    );
};

export default Toast;
