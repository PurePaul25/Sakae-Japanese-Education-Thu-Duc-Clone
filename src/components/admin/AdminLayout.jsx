import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';

const AdminLayout = ({ children, activeTab, setActiveTab, admin, onLogout }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex">
            {/* Sidebar */}
            <AdminSidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                isCollapsed={isCollapsed} 
                setIsCollapsed={setIsCollapsed} 
                onLogout={onLogout}
            />

            {/* Main Content Area */}
            <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
                {/* Topbar */}
                <AdminTopbar admin={admin} onLogout={onLogout}/>

                {/* Page Content */}
                <main className="p-6 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
