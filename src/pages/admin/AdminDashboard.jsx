import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { Activity } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import MediaLibrary from '../../components/admin/MediaLibrary';
import DashboardHome from '../../components/admin/DashboardHome';
import DataTable from '../../components/admin/DataTable';
import AdminCourses from '../../components/admin/AdminCourses';
import AdminSettings from '../../components/admin/AdminSettings';
import AdminBlog from '../../components/admin/AdminBlog';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../../hooks/useSEO';
import { useUser } from '../../contexts/UserContext';

const AdminDashboard = () => {
    const { category } = useParams();
    const activeTab = category || 'dashboard';

    const navigate = useNavigate();
    const { addToast } = useToast();
    const { user: contextUser, logout } = useUser();
    const [isLoading, setIsLoading] = useState(true);

    // Get admin info from multiple sources for robustness
    const localAdmin = JSON.parse(localStorage.getItem('sakae_admin') || '{}');
    const admin = contextUser?.role === 'ADMIN' ? contextUser : (localAdmin.user || localAdmin);
    const adminName = admin.fullName || admin.user?.fullName || 'Quản trị viên';

    useEffect(() => {
        // Authenticate - Check both potential sources of admin data
        const adminData = localStorage.getItem('sakae_admin');
        const userData = localStorage.getItem('sakae_user');
        
        let currentAdmin = null;
        if (adminData) {
            currentAdmin = JSON.parse(adminData);
        } else if (userData) {
            const parsedUser = JSON.parse(userData);
            if (parsedUser.role === 'ADMIN') {
                currentAdmin = parsedUser;
            }
        }

        if (!currentAdmin) {
            navigate('/admin/dang-nhap');
            return;
        }

        // Show login success toast
        const showLoginToast = sessionStorage.getItem('showAdminLoginSuccessToast');
        if (showLoginToast) {
            addToast(`Đăng nhập thành công! Chào mừng ${adminName}!`, 'success');
            sessionStorage.removeItem('showAdminLoginSuccessToast');
        }

        setTimeout(() => setIsLoading(false), 800);
    }, [navigate, addToast, adminName]);

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
            ),
        },
        {
            key: 'role',
            label: 'Vai trò',
            render: (val) => (
                <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        val === 'admin'
                            ? 'bg-red-100 text-red-600 dark:bg-red-900/30'
                            : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'
                    }`}
                >
                    {val === 'admin' ? 'Quản trị' : 'Học viên'}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (val) => (
                <div className="flex items-center gap-1.5">
                    <div
                        className={`w-1.5 h-1.5 rounded-full ${val === 'active' ? 'bg-green-500' : 'bg-slate-300'}`}
                    ></div>
                    <span className="capitalize">{val === 'active' ? 'Hoạt động' : 'Ngoại tuyến'}</span>
                </div>
            ),
        },
        { key: 'joinedDate', label: 'Ngày tham gia' },
    ];

    const userData = [
        {
            id: 1,
            fullName: 'Nguyễn Văn A',
            email: 'vana@gmail.com',
            role: 'user',
            status: 'active',
            joinedDate: '2024-03-15',
        },
        {
            id: 2,
            fullName: 'Trần Thị B',
            email: 'thib@gmail.com',
            role: 'admin',
            status: 'active',
            joinedDate: '2024-02-10',
        },
        {
            id: 3,
            fullName: 'Lê Văn C',
            email: 'vanc@gmail.com',
            role: 'user',
            status: 'inactive',
            joinedDate: '2024-03-20',
        },
        {
            id: 4,
            fullName: 'Phạm Minh D',
            email: 'minhd@gmail.com',
            role: 'user',
            status: 'active',
            joinedDate: '2024-04-01',
        },
    ];

    const jlptColumns = [
        { key: 'title', label: 'Tên bộ đề' },
        {
            key: 'level',
            label: 'Cấp độ',
            render: (val) => (
                <span className="px-2 py-0.5 rounded-lg bg-red-50 text-red-600 font-bold text-[10px] uppercase">
                    JLPT {val}
                </span>
            ),
        },
        { key: 'questions', label: 'Số câu hỏi' },
        { key: 'duration', label: 'Thời gian' },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (val) => (
                <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        val === 'published' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
                    }`}
                >
                    {val === 'published' ? 'Đã đăng' : 'Bản nháp'}
                </span>
            ),
        },
    ];

    const jlptData = [
        {
            id: 1,
            title: 'Đề thi thử N3 - Kì 1/2024',
            level: 'N3',
            questions: 105,
            duration: '140p',
            status: 'published',
        },
        { id: 2, title: 'Luyện tập Ngữ pháp N2', level: 'N2', questions: 45, duration: '60p', status: 'published' },
        { id: 3, title: 'Đề thi thử N5 cấp tốc', level: 'N5', questions: 80, duration: '100p', status: 'draft' },
        { id: 4, title: 'Tổng hợp Kanji N1', level: 'N1', questions: 60, duration: '45p', status: 'published' },
    ];

    const newsColumns = [
        {
            key: 'title',
            label: 'Tiêu đề bài viết',
            render: (val) => <span className="font-semibold text-slate-700">{val}</span>,
        },
        {
            key: 'category',
            label: 'Danh mục',
            render: (val) => <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{val}</span>,
        },
        { key: 'author', label: 'Người đăng' },
        { key: 'date', label: 'Ngày tạo' },
        {
            key: 'views',
            label: 'Lượt xem',
            render: (val) => <span className="text-xs font-mono">{val.toLocaleString()}</span>,
        },
    ];

    const newsData = [
        {
            id: 1,
            title: 'Thông báo lịch nghỉ lễ 30/4 - 1/5',
            category: 'Thông báo',
            author: 'Admin Tuyết',
            date: '2024-04-10',
            views: 1240,
        },
        {
            id: 2,
            title: 'Khai giảng lớp N4 buổi tối tháng 5',
            category: 'Khóa học',
            author: 'Hưng Sakae',
            date: '2024-04-05',
            views: 856,
        },
        {
            id: 3,
            title: 'Mẹo nhớ 2136 chữ Kanji thường dùng',
            category: 'Kiến thức',
            author: 'Sakae Sensei',
            date: '2024-04-02',
            views: 3210,
        },
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
                return <DashboardHome userData={userData} userColumns={userColumns} />;
            case 'thu-vien-anh':
                return (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="mb-5">
                            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Thư viện media</h2>
                            <p className="text-slate-500 mt-1">Quản lý hình ảnh, biểu ngữ và tài liệu khóa học.</p>
                        </div>
                        <MediaLibrary />
                    </motion.div>
                );
            case 'nguoi-dung':
                return (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                        <DataTable
                            title="Tất cả người dùng"
                            description="Danh sách chi tiết tất cả học viên và nhân viên."
                            columns={userColumns}
                            data={[...userData, ...userData]}
                        />
                    </motion.div>
                );
            case 'khoa-hoc':
                return <AdminCourses />;
            case 'cai-dat':
                return <AdminSettings admin={admin} />;
            case 'jlpt':
                return (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                        <DataTable
                            title="Quản lý đề thi JLPT"
                            description="Danh sách bộ đề thi thử và luyện tập từ N1-N5."
                            columns={jlptColumns}
                            data={jlptData}
                        />
                    </motion.div>
                );
            case 'tin-tuc':
                return (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                        <AdminBlog />
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
        logout(); // Clear user context, sakae_user, and sakae_admin
        localStorage.removeItem('sakae_admin');
        localStorage.removeItem('sakae_user');
        addToast('Đã đăng xuất thành công!', 'success');
        setTimeout(() => {
            navigate('/admin/dang-nhap');
        }, 500);
    };

    return (
        <AdminLayout admin={admin} onLogout={handleLogout}>
            <SEO page="adminDashboard" />

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </AdminLayout>
    );
};

export default AdminDashboard;
