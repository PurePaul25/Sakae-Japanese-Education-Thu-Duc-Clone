import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { FiLock, FiBell, FiShield, FiUser, FiGlobe, FiChevronDown, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import SEO from '../../hooks/useSEO';

const UserSettings = () => {
    const [activeSection, setActiveSection] = useState('general');
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        courseUpdates: true,
        reminders: true,
    });

    const toggleNotification = (key) => {
        setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const sections = [
        {
            id: 'security',
            icon: <FiLock />,
            label: 'Mật khẩu & Bảo mật',
            content: (
                <div className="space-y-4 pt-4">
                    <div className="flex flex-col md:flex-row justify-between md:items-center p-4 rounded-xl bg-gray-50 border border-gray-100 gap-4">
                        <div>
                            <p className="font-bold text-gray-700">Thay đổi mật khẩu</p>
                            <p className="text-sm text-gray-500">Cập nhật mật khẩu mới để bảo vệ tài khoản tốt hơn</p>
                        </div>
                        <button className="px-5 py-2 cursor-pointer bg-white border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
                            Cập nhật
                        </button>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between md:items-center p-4 rounded-xl bg-gray-50 border border-gray-100 gap-4">
                        <div>
                            <p className="font-bold text-gray-700">Xác thực 2 yếu tố (2FA)</p>
                            <p className="text-sm text-red-600 font-medium">Hiện tại chưa kích hoạt</p>
                        </div>
                        <button className="px-5 py-2 cursor-pointer bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors shadow-md">
                            Kích hoạt ngay
                        </button>
                    </div>
                </div>
            ),
        },
        {
            id: 'notifications',
            icon: <FiBell />,
            label: 'Thông báo',
            content: (
                <div className="space-y-1">
                    {[{ key: 'email', label: 'Thông báo qua Email', desc: 'Nhận tin tức và cập nhật qua hòm thư' }].map(
                        (item) => (
                            <div
                                key={item.key}
                                className="flex justify-between items-center py-4 border-b border-gray-100 last:border-0 px-2"
                            >
                                <div>
                                    <p className="font-bold text-gray-700">{item.label}</p>
                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={notifications[item.key]}
                                        onChange={() => toggleNotification(item.key)}
                                    />
                                    <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                </label>
                            </div>
                        ),
                    )}
                </div>
            ),
        },
        {
            id: 'privacy',
            icon: <FiShield />,
            label: 'Quyền riêng tư & Nguy hiểm',
            content: (
                <div className="space-y-6 pt-4">
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <p className="font-bold text-gray-700 mb-2">Chế độ riêng tư</p>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="private-profile"
                                className="w-5 h-5 cursor-pointer accent-red-600"
                            />
                            <label htmlFor="private-profile" className="text-sm text-gray-600">
                                Ẩn thông tin cá nhân với người dùng khác
                            </label>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
                        <h3 className="text-lg font-bold text-red-700 mb-2">Vùng nguy hiểm</h3>
                        <p className="text-sm text-red-600/80 mb-4">
                            Việc xóa tài khoản sẽ làm mất vĩnh viễn tất cả dữ liệu và các chứng chỉ của bạn. Hành động
                            này không thể hoàn tác.
                        </p>
                        <button className="px-6 py-2.5 cursor-pointer bg-white text-red-600 border border-red-200 rounded-xl text-sm font-black hover:bg-red-600 hover:text-white transition-all shadow-sm">
                            XÓA TÀI KHOẢN VĨNH VIỄN
                        </button>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <SEO page="userSettings" />

            <div>
                <h1 className="text-3xl font-black text-gray-800 tracking-tight">Cài đặt tài khoản</h1>
                <p className="text-gray-500 mt-1">Quản lý thông cá nhân và tùy chỉnh trải nghiệm của bạn</p>
            </div>

            <div className="space-y-4">
                {sections.map((section) => {
                    const isOpen = activeSection === section.id;
                    return (
                        <div
                            key={section.id}
                            className={`group bg-white rounded-3xl border transition-all duration-300 ${
                                isOpen
                                    ? 'border-red-200 shadow-xl shadow-red-50'
                                    : 'border-gray-100 shadow-sm hover:border-red-100'
                            }`}
                        >
                            {/* Accordion Header */}
                            <button
                                onClick={() => setActiveSection(isOpen ? null : section.id)}
                                className="w-full cursor-pointer flex items-center justify-between px-5 py-4 text-left transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`p-3 rounded-2xl transition-all ${
                                            isOpen
                                                ? 'bg-red-600 text-white shadow-lg shadow-red-200'
                                                : 'bg-gray-50 text-gray-400 group-hover:text-red-500'
                                        }`}
                                    >
                                        {section.icon}
                                    </div>
                                    <span
                                        className={`text-base md:text-lg font-bold transition-all ${
                                            isOpen ? 'text-gray-800' : 'text-gray-500 group-hover:text-gray-700'
                                        }`}
                                    >
                                        {section.label}
                                    </span>
                                </div>
                                <motion.div
                                    animate={{ rotate: isOpen ? 180 : 0 }}
                                    className={`text-2xl transition-all duration-50 ${isOpen ? 'text-red-600' : 'text-gray-300'}`}
                                >
                                    <FiChevronDown />
                                </motion.div>
                            </button>

                            {/* Accordion Content */}
                            <AnimatePresence initial={false}>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-5 pb-4 border-t border-gray-50">{section.content}</div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default UserSettings;
