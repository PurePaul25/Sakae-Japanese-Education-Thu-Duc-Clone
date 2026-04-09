import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { 
    Users, 
    BookOpen, 
    GraduationCap, 
    TrendingUp, 
    Clock, 
    Plus,
    Activity
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import StatsCard from '../../components/admin/StatsCard';
import DataTable from '../../components/admin/DataTable';
import MediaLibrary from '../../components/admin/MediaLibrary';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isLoading, setIsLoading] = useState(true);

    const admin = JSON.parse(localStorage.getItem('sakae_admin') || '{}');

    useEffect(() => {
        // Authenticate
        const adminData = localStorage.getItem('sakae_admin');
        if (!adminData) {
            navigate('/admin/dang-nhap');
            return;
        }

        // Show login success toast
        const showLoginToast = sessionStorage.getItem('showAdminLoginSuccessToast');
        if (showLoginToast) {
            addToast(`Đăng nhập thành công! Chào mừng ${admin.fullName}!`, 'success');
            sessionStorage.removeItem('showAdminLoginSuccessToast');
        }

        setTimeout(() => setIsLoading(false), 800);
    }, [navigate, addToast]);

    const userColumns = [
        { 
            key: 'fullName', 
            label: 'Người dùng',
            render: (val, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-red-600 uppercase">
                        {val.charAt(0)}
                    </div>
                    <div>
                        <p className="font-semibold text-slate-800 dark:text-white">{val}</p>
                        <p className="text-xs text-slate-500">{row.email}</p>
                    </div>
                </div>
            )
        },
        { key: 'role', label: 'Vai trò', render: (val) => (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                val === 'admin' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'
            }`}>
                {val === 'admin' ? 'Quản trị' : 'Học viên'}
            </span>
        )},
        { key: 'status', label: 'Trạng thái', render: (val) => (
            <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${val === 'active' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                <span className="capitalize">{val === 'active' ? 'Hoạt động' : 'Ngoại tuyến'}</span>
            </div>
        )},
        { key: 'joinedDate', label: 'Ngày tham gia' },
    ];

    const userData = [
        { id: 1, fullName: 'Nguyễn Văn A', email: 'vana@gmail.com', role: 'user', status: 'active', joinedDate: '2024-03-15' },
        { id: 2, fullName: 'Trần Thị B', email: 'thib@gmail.com', role: 'admin', status: 'active', joinedDate: '2024-02-10' },
        { id: 3, fullName: 'Lê Văn C', email: 'vanc@gmail.com', role: 'user', status: 'inactive', joinedDate: '2024-03-20' },
        { id: 4, fullName: 'Phạm Minh D', email: 'minhd@gmail.com', role: 'user', status: 'active', joinedDate: '2024-04-01' },
    ];

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 font-medium">Đang tải bảng điều khiển...</p>
                </div>
            );
        }

        switch (activeTab) {
            case 'dashboard':
                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatsCard 
                                title="Tổng người dùng" 
                                value="2,543" 
                                icon={Users} 
                                trend="up" 
                                trendValue="12.5%" 
                                color="red" 
                            />
                            <StatsCard 
                                title="Khóa học đang mở" 
                                value="48" 
                                icon={BookOpen} 
                                trend="up" 
                                trendValue="4.2%" 
                                color="orange" 
                            />
                            <StatsCard 
                                title="Học viên dự thi" 
                                value="1,205" 
                                icon={GraduationCap} 
                                trend="down" 
                                trendValue="2.1%" 
                                color="green" 
                            />
                            <StatsCard 
                                title="Hoạt động hàng ngày" 
                                value="84%" 
                                icon={Activity} 
                                trend="up" 
                                trendValue="8.4%" 
                                color="purple" 
                            />
                        </div>

                        {/* Recent Users Table */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <DataTable 
                                    title="Người dùng mới" 
                                    description="Quản lý và xem các học viên mới đăng ký."
                                    columns={userColumns} 
                                    data={userData} 
                                />
                            </div>
                            
                            {/* Quick Actions / Activity Feed */}
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Thao tác nhanh</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all border border-transparent hover:border-red-200 cursor-pointer">
                                            <Plus size={20} className="mb-2" />
                                            <span className="text-xs font-semibold">Khóa học mới</span>
                                        </button>
                                        <button className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 transition-all border border-transparent hover:border-orange-200 cursor-pointer">
                                            <TrendingUp size={20} className="mb-2" />
                                            <span className="text-xs font-semibold">Báo cáo</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Hoạt động gần đây</h3>
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((item) => (
                                            <div key={item} className="flex gap-3">
                                                <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 shrink-0">
                                                    <Clock size={14} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                                        <span className="font-semibold text-slate-900 dark:text-white">Admin</span> đã cập nhật khóa học <span className="text-red-600">Ngữ pháp N3</span>.
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-0.5">2 giờ trước</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="w-full mt-6 py-2 text-sm font-semibold text-slate-500 hover:text-red-600 transition-all cursor-pointer">
                                        Xem tất cả hoạt động
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            case 'media':
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Thư viện media</h2>
                            <p className="text-slate-500 mt-1">Quản lý hình ảnh, biểu ngữ và tài liệu khóa học.</p>
                        </div>
                        <MediaLibrary />
                    </motion.div>
                );
            case 'users':
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <DataTable 
                            title="Tất cả người dùng" 
                            description="Danh sách chi tiết tất cả học viên và nhân viên."
                            columns={userColumns} 
                            data={[...userData, ...userData]} 
                        />
                    </motion.div>
                );
            default:
                return (
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
                        <Activity size={48} className="mb-4 opacity-20" />
                        <h2 className="text-xl font-bold">Sắp ra mắt</h2>
                        <p>Mô-đun {activeTab} đang trong quá trình phát triển.</p>
                    </div>
                );
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('sakae_admin');
        addToast('Đã đăng xuất thành công!', 'success');
        setTimeout(() => {
            navigate('/admin/dang-nhap');
        }, 500);
    };

    return (
        <AdminLayout 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            admin={admin}
            onLogout={handleLogout}
        >
            <AnimatePresence mode="wait">
                {renderContent()}
            </AnimatePresence>
        </AdminLayout>
    );
};

export default AdminDashboard;

