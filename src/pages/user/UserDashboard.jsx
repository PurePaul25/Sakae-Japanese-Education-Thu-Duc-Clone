import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiBook, FiSettings, FiChevronRight, FiMenu, FiX, FiBookmark } from 'react-icons/fi';

const UserDashboard = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { path: '/profile', label: 'Hồ sơ cá nhân', icon: <FiUser /> },
        { path: '/khoa-hoc-cua-toi', label: 'Khóa học của tôi', icon: <FiBook /> },
        { path: '/da-luu', label: 'Đã lưu', icon: <FiBookmark /> },
        { path: '/cai-dat', label: 'Cài đặt tài khoản', icon: <FiSettings /> },
    ];

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="mb-6 px-2 flex justify-between items-center">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Trung tâm học viên</h2>
                <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="lg:hidden p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                    <FiX size={20} />
                </button>
            </div>
            <nav className="space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                                isActive
                                    ? 'bg-red-600 text-white shadow-md shadow-red-200'
                                    : 'text-gray-600 hover:bg-red-50 hover:text-red-600'
                            }`
                        }
                    >
                        <div className="flex items-center gap-3 font-semibold text-sm">
                            <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                            <span>{item.label}</span>
                        </div>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-gray-100">
                <div className="bg-red-50 rounded-xl p-4">
                    <p className="text-sm md:text-xs font-bold text-red-600 uppercase mb-1">Cần hỗ trợ?</p>
                    <p className="text-sm md:text-xs text-gray-500 mb-3 leading-relaxed">
                        Liên hệ đội ngũ Sakae để được giải đáp thắc mắc.
                    </p>
                    <button className="w-full cursor-pointer py-2 bg-white text-red-600 rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-shadow">
                        Chat ngay
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 pt-22 lg:pt-28 pb-12">
            <div className="max-w-7xl mx-auto px-3 md:px-4">
                {/* Mobile Header Toggle */}
                <div className="lg:hidden mb-6 flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                            {navItems.find((i) => i.path === location.pathname)?.icon || <FiMenu />}
                        </div>
                        <span className="font-bold text-gray-800">
                            {navItems.find((i) => i.path === location.pathname)?.label || 'Menu'}
                        </span>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 text-gray-600 hover:text-red-600 bg-gray-50 rounded-xl transition-colors"
                    >
                        <FiMenu size={24} />
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Desktop Sidebar Navigation */}
                    <aside className="hidden lg:block lg:w-72 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-28 h-fit">
                            <SidebarContent />
                        </div>
                    </aside>

                    {/* Mobile Sidebar Drawer */}
                    <AnimatePresence>
                        {isMobileMenuOpen && (
                            <>
                                {/* Overlay */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
                                />
                                {/* Drawer */}
                                <motion.aside
                                    initial={{ x: '-100%' }}
                                    animate={{ x: 0 }}
                                    exit={{ x: '-100%' }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                    className="fixed top-0 left-0 bottom-0 w-72 bg-white shadow-2xl z-[70] p-5 lg:hidden"
                                >
                                    <SidebarContent />
                                </motion.aside>
                            </>
                        )}
                    </AnimatePresence>

                    {/* Main Content Area */}
                    <main className="flex-grow min-w-0">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Outlet />
                        </motion.div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
