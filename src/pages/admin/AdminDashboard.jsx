import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import AdminRegistrations from '../../components/admin/AdminRegistrations';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../../hooks/useSEO';
import { useUser } from '../../contexts/UserContext';
import { getAdminUsers, getUserStats } from '../../services/userService';

const AdminDashboard = () => {
    const { category } = useParams();
    const activeTab = category || 'dashboard';

    const navigate = useNavigate();
    const { addToast } = useToast();
    const { user: contextUser, logout } = useUser();
    const [authLoading, setAuthLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(false);
    const [userData, setUserData] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        openCourses: 0,
        studentCount: 0,
        activeRate: 0,
    });
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categories, setCategories] = useState([
        { key: 'all', label: 'Tất cả' },
        { key: 'ADMIN', label: 'Quản trị' },
        { key: 'STUDENT', label: 'Học viên' },
    ]);

    const filteredUsers = useMemo(() => {
        if (selectedCategory === 'all') return userData;
        return userData.filter((user) => user.role === selectedCategory);
    }, [selectedCategory, userData]);

    // Get admin info from multiple sources for robustness
    const localAdmin = JSON.parse(localStorage.getItem('sakae_admin') || '{}');
    const admin = contextUser?.role === 'ADMIN' ? contextUser : localAdmin.user || localAdmin;
    const adminName = admin.fullName || admin.user?.fullName || 'Quản trị viên';

    const normalizeRoleLabel = (role) => {
        if (role === 'ADMIN') return 'Quản trị';
        if (role === 'TEACHER') return 'Giảng viên';
        return 'Học viên';
    };

    const normalizeUser = (user) => ({
        id: user.id,
        fullName: user.fullName || user.username || 'Người dùng',
        email: user.email || '',
        role: user.role || 'STUDENT',
        status: user.isActive ? 'active' : 'inactive',
        joinedDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '',
    });

    const loadDashboardData = useCallback(async () => {
        setDataLoading(true);

        try {
            const [usersResponse, statsResponse] = await Promise.all([getAdminUsers(), getUserStats()]);

            const usersPayload = usersResponse?.data?.data ?? usersResponse?.data ?? {};
            const rawUsers = Array.isArray(usersPayload)
                ? usersPayload
                : Array.isArray(usersPayload?.data)
                  ? usersPayload.data
                  : [];
            const normalizedUsers = rawUsers.map(normalizeUser);

            const statsPayload = statsResponse?.data?.data ?? statsResponse?.data ?? {};

            setUserData(normalizedUsers);
            setStats({
                totalUsers: statsPayload.totalUsers ?? 0,
                openCourses: statsPayload.openCourses ?? 0,
                studentCount: statsPayload.studentCount ?? 0,
                activeRate: statsPayload.activeRate ?? 0,
            });

            const roleKeys = Array.from(new Set(normalizedUsers.map((user) => user.role))).filter(Boolean);
            setCategories([
                { key: 'all', label: 'Tất cả' },
                ...roleKeys.map((role) => ({ key: role, label: normalizeRoleLabel(role) })),
            ]);
        } catch (error) {
            const status = error?.response?.status;
            if (status === 401 || status === 403) {
                addToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
                logout();
                localStorage.removeItem('sakae_admin');
                localStorage.removeItem('sakae_user');
                navigate('/admin/dang-nhap');
                return;
            }

            console.error('Admin dashboard load error:', error);
            addToast('Không tải được dữ liệu quản trị. Vui lòng thử lại sau.', 'error');
        } finally {
            setDataLoading(false);
        }
    }, [addToast, logout, navigate]);

    useEffect(() => {
        const init = async () => {
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

            const showLoginToast = sessionStorage.getItem('showAdminLoginSuccessToast');
            if (showLoginToast) {
                addToast(`Đăng nhập thành công! Chào mừng ${adminName}!`, 'success');
                sessionStorage.removeItem('showAdminLoginSuccessToast');
            }

            setAuthLoading(false);
            await loadDashboardData();
        };

        init();
    }, [navigate, addToast, adminName, loadDashboardData]);

    const userColumns = [
        {
            key: 'fullName',
            label: 'Người dùng',
            render: (val, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-red-600 uppercase">
                        {val?.charAt(0) || 'U'}
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
            render: (val) => {
                const normalized = String(val).toUpperCase();
                const isAdmin = normalized === 'ADMIN';
                const isTeacher = normalized === 'TEACHER';
                return (
                    <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isAdmin
                                ? 'bg-red-100 text-red-600 dark:bg-red-900/30'
                                : isTeacher
                                  ? 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300'
                                  : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'
                        }`}
                    >
                        {isAdmin ? 'Quản trị' : isTeacher ? 'Giảng viên' : 'Học viên'}
                    </span>
                );
            },
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

    const renderContent = () => {
        if (authLoading) {
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
                    <DashboardHome
                        stats={stats}
                        userData={filteredUsers}
                        userColumns={userColumns}
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                        isLoading={dataLoading}
                    />
                );
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
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm mb-6">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Người dùng</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        Danh sách chi tiết tất cả học viên và giáo viên.
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                    <label
                                        htmlFor="listUserRoleFilter"
                                        className="text-sm font-medium text-slate-600 dark:text-slate-300"
                                    >
                                        Lọc theo vai trò
                                    </label>
                                    <select
                                        id="listUserRoleFilter"
                                        value={selectedCategory}
                                        onChange={(event) => setSelectedCategory(event.target.value)}
                                        disabled={dataLoading}
                                        className="min-w-[160px] cursor-pointer rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-700 dark:text-slate-200 p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
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
                        </div>
                        <DataTable hideToolbar columns={userColumns} data={filteredUsers} isLoading={dataLoading} />
                    </motion.div>
                );
            case 'khoa-hoc':
                return <AdminCourses />;
            case 'dang-ky':
                return (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                        <AdminRegistrations />
                    </motion.div>
                );
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
