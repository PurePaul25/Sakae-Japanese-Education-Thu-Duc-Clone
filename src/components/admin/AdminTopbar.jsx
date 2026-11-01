import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Sun, Moon, Calendar, User, Settings, LogOut } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const MotionDiv = motion.div;

const AdminTopbar = ({ admin, onLogout }) => {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [showClock, setShowClock] = useState(localStorage.getItem('sakae_admin_show_clock') !== 'false');

    const notiRef = useRef(null);
    const profileRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const syncSettings = () => {
            const isDark = localStorage.getItem('theme') === 'dark';
            setIsDarkMode(isDark);
            setShowClock(localStorage.getItem('sakae_admin_show_clock') !== 'false');
        };
        syncSettings();
        window.addEventListener('sakae-admin-settings-changed', syncSettings);
        return () => window.removeEventListener('sakae-admin-settings-changed', syncSettings);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notiRef.current && !notiRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDarkMode = () => {
        const isDark = !isDarkMode;
        setIsDarkMode(isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        window.dispatchEvent(new CustomEvent('sakae-admin-settings-changed'));
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-6 flex items-center justify-between transition-colors duration-300">
            {/* Right Actions */}
            <div className="flex items-center gap-4 ml-auto">
                {/* Date/Time */}
                {showClock && (
                    <div className="hidden lg:flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[15px] bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <Calendar className="w-5 h-5" />
                        <span>{formatDate(currentTime)}</span>
                        <span className="font-bold ml-1 text-slate-700 dark:text-slate-200">
                            {formatTime(currentTime)}
                        </span>
                    </div>
                )}

                {/* Theme Toggle */}
                <div className="relative group">
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                        {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
                    </button>
                    {/* Tooltip */}
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        {isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}
                    </div>
                </div>

                {/* Notifications */}
                <div className="relative group" ref={notiRef}>
                    <button
                        type="button"
                        aria-expanded={isNotificationsOpen}
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className={`p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg relative transition-colors cursor-pointer ${isNotificationsOpen ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                    >
                        <Bell size={20} />
                    </button>

                    {/* Tooltip (only if not open) */}
                    {!isNotificationsOpen && (
                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            Thông báo
                        </div>
                    )}

                    {/* Dropdown */}
                    <AnimatePresence>
                        {isNotificationsOpen && (
                            <MotionDiv
                                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                transition={{ duration: 0.16, ease: 'easeOut' }}
                                className="absolute right-0 mt-3 w-80 origin-top-right rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-50"
                            >
                                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-800 dark:text-white">Thông báo</h3>
                                </div>
                                <div className="px-5 py-8 text-center">
                                    <Bell className="mx-auto mb-2 text-slate-300 dark:text-slate-600" size={24} />
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                        Chưa có thông báo
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        Trung tâm thông báo chưa được kết nối.
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsNotificationsOpen(false);
                                        navigate('/admin/dashboard/cai-dat/thong-bao');
                                    }}
                                    className="w-full p-3 text-sm font-bold text-slate-500 hover:text-red-600 border-t border-slate-100 dark:border-slate-800 transition-colors"
                                >
                                    Cài đặt thông báo
                                </button>
                            </MotionDiv>
                        )}
                    </AnimatePresence>
                </div>

                {/* Divider */}
                <div className="h-8 w-[1px] bg-slate-200 dark:border-slate-700 hidden sm:block"></div>

                {/* Admin Profile */}
                <div className="relative group" ref={profileRef}>
                    <button
                        type="button"
                        aria-expanded={isProfileOpen}
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className={`flex items-center gap-3 pl-2 cursor-pointer p-1 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${isProfileOpen ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-800 dark:text-white leading-none">
                                {admin?.fullName || 'Quản trị viên'}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
                                {admin?.role === 'ADMIN' || admin?.role === 'admin'
                                    ? 'Quản trị viên'
                                    : admin?.role || 'Quản trị viên'}
                            </p>
                        </div>
                        <div className="w-9 h-9 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 font-bold border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden ring-2 ring-transparent group-hover:ring-red-500/20 transition-all">
                            {admin?.avatar ? (
                                <img src={admin.avatar} alt="admin" className="w-full h-full object-cover" />
                            ) : (
                                admin?.fullName?.charAt(0) || 'A'
                            )}
                        </div>
                    </button>

                    {/* Tooltip (only if not open) */}
                    {!isProfileOpen && (
                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            Tài khoản
                        </div>
                    )}

                    {/* Dropdown */}
                    <AnimatePresence>
                        {isProfileOpen && (
                            <MotionDiv
                                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                transition={{ duration: 0.16, ease: 'easeOut' }}
                                className="absolute right-0 mt-3 w-56 origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-50"
                            >
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                        {admin?.fullName}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">{admin?.email}</p>
                                </div>
                                <div className="p-2">
                                    <button
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            navigate('/admin/dashboard/cai-dat/ho-so-ca-nhan');
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                                    >
                                        <User size={16} />
                                        Hồ sơ cá nhân
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            navigate('/admin/dashboard/cai-dat/chung');
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                                    >
                                        <Settings size={16} />
                                        Cài đặt hệ thống
                                    </button>
                                </div>
                                <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        onClick={onLogout}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer font-bold"
                                    >
                                        <LogOut size={16} />
                                        Đăng xuất
                                    </button>
                                </div>
                            </MotionDiv>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

export default AdminTopbar;
