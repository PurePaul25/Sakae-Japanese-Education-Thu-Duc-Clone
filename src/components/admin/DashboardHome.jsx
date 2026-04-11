import React from 'react';
import { 
    Users, 
    BookOpen, 
    GraduationCap, 
    Activity,
    Plus,
    TrendingUp,
    Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import StatsCard from './StatsCard';
import DataTable from './DataTable';

const DashboardHome = ({ userData, userColumns }) => {
    return (
        <div className="space-y-8">
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
        </div>
    );
};

export default DashboardHome;
