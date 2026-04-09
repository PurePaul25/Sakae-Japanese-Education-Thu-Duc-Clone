import React from 'react';
import { 
    LayoutDashboard, 
    Users, 
    BookOpen, 
    ClipboardCheck, 
    Newspaper, 
    Image as ImageIcon, 
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    GraduationCap
} from 'lucide-react';

const menuItems = [
    { id: 'dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard },
    { id: 'users', label: 'Người dùng', icon: Users },
    { id: 'courses', label: 'Khóa học', icon: BookOpen },
    { id: 'jlpt', label: 'Đề thi JLPT', icon: ClipboardCheck },
    { id: 'news', label: 'Tin tức', icon: Newspaper },
    { id: 'media', label: 'Thư viện media', icon: ImageIcon },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
];

const AdminSidebar = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed, onLogout }) => {
    return (
        <aside 
            className={`fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 z-50 ${
                isCollapsed ? 'w-20' : 'w-64'
            }`}
        >
            {/* Logo Section */}
            <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-200 dark:border-slate-800">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-200 dark:shadow-none">
                    <GraduationCap className="text-white w-5 h-5" />
                </div>
                {!isCollapsed && (
                    <span className="font-bold text-lg text-slate-800 dark:text-white truncate">
                        Sakae Admin
                    </span>
                )}
            </div>

            {/* Navigation */}
            <nav className={`p-4 space-y-2 h-[calc(100vh-120px)] ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto'}`}>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                                isActive 
                                    ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                        >
                            <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-red-600 dark:text-red-400' : ''}`} />
                            {!isCollapsed && <span className="font-medium">{item.label}</span>}
                            
                            {/* Tooltip - Fixed clipping and layout stretch */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-x-[-10px] group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap shadow-2xl z-[100]">
                                    {item.label}
                                    {/* Arrow */}
                                    <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                                </div>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Collapse Toggle */}
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="group absolute -right-4 top-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full p-1.5 shadow-sm text-slate-500 hover:text-red-600 cursor-pointer"
            >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}

                {/* Tooltip */}
                <div className="absolute -top-1 left-full ml-3.5 px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-x-[-10px] group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap shadow-2xl z-[100]">
                    {isCollapsed ? "Mở sidebar" : "Đóng sidebar"}
                    
                    {/* Arrow */}
                    <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                </div>
            </button>

            {/* Bottom Section */}
            <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-200 bg-white dark:border-slate-800">
                <button 
                    className="w-full group relative flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 transition-colors rounded-xl cursor-pointer"
                    onClick={onLogout}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium">Đăng xuất</span>}

                    {/* Tooltip - Fixed clipping and layout stretch */}
                    {isCollapsed && (
                        <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-x-[-10px] group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap shadow-2xl z-[100]">
                            Đăng xuất
                            <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                        </div>
                    )}
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
