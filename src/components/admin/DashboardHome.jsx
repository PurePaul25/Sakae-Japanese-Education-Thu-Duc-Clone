import React from 'react';
import { Users, BookOpen, GraduationCap, Activity, Plus, TrendingUp, Clock } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import StatsCard from './StatsCard';
import DataTable from './DataTable';

const DashboardHome = ({
    stats,
    userData,
    userColumns,
    categories,
    selectedCategory,
    onCategoryChange,
    isLoading = false,
}) => {
    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Tổng người dùng"
                    value={stats?.totalUsers ?? 0}
                    icon={Users}
                    trend="up"
                    trendValue={`${stats?.activeRate ?? 0}%`}
                    color="red"
                />
                <StatsCard
                    title="Khóa học đang mở"
                    value={stats?.openCourses ?? 0}
                    icon={BookOpen}
                    trend="up"
                    trendValue="+5%"
                    color="orange"
                />
                <StatsCard
                    title="Học viên dự thi"
                    value={stats?.studentCount ?? 0}
                    icon={GraduationCap}
                    trend="up"
                    trendValue="+8%"
                    color="green"
                />
                <StatsCard
                    title="Hoạt động hàng ngày"
                    value={`${stats?.activeRate ?? 0}%`}
                    icon={Activity}
                    trend="up"
                    trendValue="+4.8%"
                    color="purple"
                />
            </div>

            {/* Recent Users Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                        <div className="flex flex-row items-center justify-between gap-4 mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Người dùng mới</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                    Quản lý người dùng trực tiếp từ dữ liệu thực tế.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <label
                                    htmlFor="userRoleFilter"
                                    className="text-sm font-medium text-slate-600 dark:text-slate-300"
                                >
                                    Lọc theo vai trò
                                </label>
                                <select
                                    id="userRoleFilter"
                                    value={selectedCategory}
                                    onChange={(event) => onCategoryChange(event.target.value)}
                                    disabled={isLoading}
                                    className="min-w-[140px] cursor-pointer rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-700 dark:text-slate-200 p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    {categories.map((category) => (
                                        <option key={category.key} value={category.key}>
                                            {category.label}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    className="px-4 py-2 cursor-pointer rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm shadow-red-200 dark:shadow-none"
                                >
                                    Thêm mới
                                </button>
                            </div>
                        </div>

                        <DataTable hideToolbar columns={userColumns} data={userData} isLoading={isLoading} />
                    </div>
                </div>

                {/* Quick Actions / Activity Feed */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
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

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Hoạt động gần đây</h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map((item) => (
                                <div key={item} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 shrink-0">
                                        <Clock size={14} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-700 dark:text-slate-300">
                                            <span className="font-semibold text-slate-900 dark:text-white">Admin</span>{' '}
                                            đã cập nhật khóa học <span className="text-red-600">Ngữ pháp N3</span>.
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
