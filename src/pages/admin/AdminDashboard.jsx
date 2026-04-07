import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();

    useEffect(() => {
        // Check if admin is logged in
        const adminData = localStorage.getItem('sakae_admin');
        if (!adminData) {
            navigate('/admin/dang-nhap');
            return;
        }

        // Show login success toast if flag exists
        const showLoginToast = sessionStorage.getItem('showAdminLoginSuccessToast');
        if (showLoginToast) {
            const admin = JSON.parse(adminData);
            addToast(`Đăng nhập thành công! Chào mừng Admin ${admin.fullName}!`, 'success');
            sessionStorage.removeItem('showAdminLoginSuccessToast');
        }
    }, [navigate, addToast]);

    const handleLogout = () => {
        localStorage.removeItem('sakae_admin');
        addToast('Đã đăng xuất thành công!', 'success');
        setTimeout(() => {
            navigate('/admin/dang-nhap');
        }, 500);
    };

    const admin = JSON.parse(localStorage.getItem('sakae_admin') || '{}');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-600 mt-2">Chào mừng, {admin.fullName}!</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-semibold"
                    >
                        Đăng Xuất
                    </button>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Card 1 */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-600">
                        <h3 className="text-gray-600 text-sm font-semibold uppercase mb-2">Người Dùng</h3>
                        <p className="text-3xl font-bold text-gray-800">2</p>
                        <p className="text-gray-500 text-xs mt-1">Tổng tài khoản người dùng</p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
                        <h3 className="text-gray-600 text-sm font-semibold uppercase mb-2">Khóa Học</h3>
                        <p className="text-3xl font-bold text-gray-800">12</p>
                        <p className="text-gray-500 text-xs mt-1">Tổng khóa học đang hoạt động</p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
                        <h3 className="text-gray-600 text-sm font-semibold uppercase mb-2">Đơn Đăng Ký</h3>
                        <p className="text-3xl font-bold text-gray-800">8</p>
                        <p className="text-gray-500 text-xs mt-1">Chờ xử lý hôm nay</p>
                    </div>
                </div>

                {/* Features Coming Soon */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Các Tính Năng</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border border-gray-200 rounded-lg hover:border-red-500 transition cursor-pointer">
                            <h3 className="font-semibold text-gray-700 mb-1">👥 Quản Lý Người Dùng</h3>
                            <p className="text-gray-600 text-sm">Quản lý tài khoản người dùng</p>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-lg hover:border-red-500 transition cursor-pointer">
                            <h3 className="font-semibold text-gray-700 mb-1">📚 Quản Lý Khóa Học</h3>
                            <p className="text-gray-600 text-sm">Thêm, sửa, xóa khóa học</p>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-lg hover:border-red-500 transition cursor-pointer">
                            <h3 className="font-semibold text-gray-700 mb-1">📰 Quản Lý Tin Tức</h3>
                            <p className="text-gray-600 text-sm">Quản lý bài viết tin tức</p>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-lg hover:border-red-500 transition cursor-pointer">
                            <h3 className="font-semibold text-gray-700 mb-1">📊 Thống Kê</h3>
                            <p className="text-gray-600 text-sm">Xem báo cáo thống kê</p>
                        </div>
                    </div>
                </div>

                {/* Admin Info */}
                <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border-l-4 border-red-600">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Thông Tin Admin</h3>
                    <div className="space-y-2 text-sm">
                        <p>
                            <span className="font-semibold text-gray-600">Tên:</span> {admin.fullName}
                        </p>
                        <p>
                            <span className="font-semibold text-gray-600">Email:</span> {admin.email}
                        </p>
                        <p>
                            <span className="font-semibold text-gray-600">Role:</span>{' '}
                            <span className="text-red-600 font-semibold uppercase">{admin.role}</span>
                        </p>
                        <p>
                            <span className="font-semibold text-gray-600">ID:</span> {admin.id}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
