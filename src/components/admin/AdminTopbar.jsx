import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, Sun, Moon, Calendar, User, Settings, LogOut, Check, Clock } from 'lucide-react';

const AdminTopbar = ({ admin, onLogout }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const notiRef = useRef(null);
    const profileRef = useRef(null);

    const fakeNotifications = [
        { id: 1, text: 'Có học viên mới đăng ký khóa N3', time: '10 phút trước', read: false },
        { id: 2, text: 'Lịch thi JLPT tháng 7 đã được cập nhật', time: '2 giờ trước', read: true },
        { id: 3, text: 'Bài viết "Kinh nghiệm học Kanji" có bình luận mới', time: '5 giờ trước', read: false },
        { id: 4, text: 'Hệ thống sẽ bảo trì vào 0h ngày mai', time: '1 ngày trước', read: true },
    ];

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
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
        const isDark = document.documentElement.classList.toggle('dark');
        setIsDarkMode(isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
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
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-6 flex items-center justify-between transition-colors">
            {/* Search Bar */}
            <div className="flex-1 max-w-sm hidden md:flex items-center bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-transparent focus-within:border-red-400 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    className="bg-transparent border-none focus:ring-0 text-sm w-full ml-2 text-slate-600 dark:text-slate-300 outline-none"
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 ml-auto">
                {/* Date/Time */}
                <div className="hidden lg:flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(currentTime)}</span>
                    <span className="font-bold ml-1 text-slate-700 dark:text-slate-200">{formatTime(currentTime)}</span>
                </div>

                {/* Theme Toggle */}
                <div className="relative group">
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    {/* Tooltip */}
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        {isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}
                    </div>
                </div>

                {/* Notifications */}
                <div className="relative group" ref={notiRef}>
                    <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className={`p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative transition-colors cursor-pointer ${isNotificationsOpen ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                    >
                        <Bell size={20} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                    </button>

                    {/* Tooltip (only if not open) */}
                    {!isNotificationsOpen && (
                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            Thông báo
                        </div>
                    )}

                    {/* Dropdown */}
                    {isNotificationsOpen && (
                        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 dark:text-white">Thông báo</h3>
                                <button className="text-xs cursor-pointer text-red-600 font-semibold hover:underline">
                                    Đánh dấu đã đọc
                                </button>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {fakeNotifications.map((noti) => (
                                    <div
                                        key={noti.id}
                                        className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer flex gap-3 border-b border-slate-50 dark:border-slate-800 last:border-none ${!noti.read ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${noti.read ? 'bg-slate-100 dark:bg-slate-700 text-slate-400' : 'bg-red-100 dark:bg-red-900/40 text-red-600'}`}
                                        >
                                            <Bell size={14} />
                                        </div>
                                        <div className="flex-1">
                                            <p
                                                className={`text-sm ${noti.read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-slate-100 font-medium'}`}
                                            >
                                                {noti.text}
                                            </p>
                                            <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 uppercase tracking-tight">
                                                <Clock size={10} />
                                                {noti.time}
                                            </div>
                                        </div>
                                        {!noti.read && <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>}
                                    </div>
                                ))}
                            </div>
                            <button className="w-full p-3 text-sm font-bold text-slate-500 hover:text-red-600 border-t border-slate-100 dark:border-slate-800 transition-colors">
                                Xem tất cả thông báo
                            </button>
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="h-8 w-[1px] bg-slate-200 dark:border-slate-700 hidden sm:block"></div>

                {/* Admin Profile */}
                <div className="relative group" ref={profileRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className={`flex items-center gap-3 pl-2 cursor-pointer p-1 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${isProfileOpen ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-800 dark:text-white leading-none">
                                {admin?.fullName || 'Quản trị viên'}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
                                {admin?.role === 'admin' ? 'Người quản trị' : admin?.role || 'Quản trị viên'}
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
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                    {admin?.fullName}
                                </p>
                                <p className="text-xs text-slate-500 truncate">{admin?.email}</p>
                            </div>
                            <div className="p-2">
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer">
                                    <User size={16} />
                                    Hồ sơ cá nhân
                                </button>
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer">
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
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default AdminTopbar;
