import React, { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';

const AdminLayout = ({ children, admin, onLogout }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

    useEffect(() => {
        const syncTheme = () => setIsDarkMode(localStorage.getItem('theme') === 'dark');
        syncTheme();
        window.addEventListener('sakae-admin-settings-changed', syncTheme);
        return () => window.removeEventListener('sakae-admin-settings-changed', syncTheme);
    }, []);

    return (
        <div
            className={`admin-theme-root min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 flex dark:bg-slate-950 dark:text-slate-100 ${
                isDarkMode ? 'dark' : ''
            }`}
        >
            {/* Sidebar */}
            <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} onLogout={onLogout} />

            {/* Main Content Area */}
            <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
                {/* Topbar */}
                <AdminTopbar admin={admin} onLogout={onLogout} />

                {/* Page Content */}
                <main className="py-5 px-8">
                    <div className="max-w-7xl mx-auto">{children}</div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
