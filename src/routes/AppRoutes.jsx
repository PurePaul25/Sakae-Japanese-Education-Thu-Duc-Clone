import { Routes, Route, useNavigate } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';

// Lazy load các trang
const HomeLazy = lazy(() => import('../pages/Home'));
const AboutLazy = lazy(() => import('../pages/About'));
const ClassesLazy = lazy(() => import('../pages/Classes'));
const NewsLazy = lazy(() => import('../pages/News'));
const NewsDetailLazy = lazy(() => import('../pages/NewsDetail'));
const ContactLazy = lazy(() => import('../pages/Contact'));
const OpeningScheduleLazy = lazy(() => import('../pages/OpeningSchedule'));
const CourseDetailPageLazy = lazy(() => import('../features/courses/CourseDetailPage'));
const GalleryLazy = lazy(() => import('../pages/Gallerys'));
const JLPTMockTestLazy = lazy(() => import('../pages/JLPTMockTest'));
const SearchResultsLazy = lazy(() => import('../pages/SearchResults'));
const AuthLazy = lazy(() => import('../pages/Auth'));
const AdminAuthLazy = lazy(() => import('../pages/admin/AdminAuth'));
const AdminDashboardLazy = lazy(() => import('../pages/admin/AdminDashboard'));
const NotFoundLazy = lazy(() => import('../pages/NotFound'));
const UserDashboardLazy = lazy(() => import('../pages/user/UserDashboard'));
const UserProfileLazy = lazy(() => import('../pages/user/UserProfile'));
const MyNotificationsLazy = lazy(() => import('../pages/user/MyNotifications'));
const UserSettingsLazy = lazy(() => import('../pages/user/UserSettings'));
const SavedItemsLazy = lazy(() => import('../pages/user/SavedItems'));
const PublicProfileLazy = lazy(() => import('../pages/user/PublicProfile'));
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Component xử lý chuyển hướng từ sessionStorage
const RedirectHandler = () => {
    const navigate = useNavigate();
    useEffect(() => {
        const redirectPath = sessionStorage.redirect;
        if (redirectPath) {
            sessionStorage.removeItem('redirect');
            navigate(redirectPath, { replace: true });
        }
    }, [navigate]);
    return null;
};

function AppRoutes() {
    return (
        <Suspense
            fallback={
                <div className="text-center p-10 flex flex-col items-center justify-center space-y-4 my-30">
                    {/* Spinner Màu Đỏ và Thiết Kế Tinh Tế hơn */}
                    <div className="w-18 h-18 border-6 border-solid border-gray-300 border-t-transparent border-l-transparent rounded-full animate-spin"></div>

                    {/* Văn bản tải động và thu hút hơn */}
                    <p className="text-2xl font-semibold text-red-600 animate-pulse tracking-wider">ĐANG TẢI...</p>
                </div>
            }
        >
            <RedirectHandler />
            <Routes>
                <Route path="/" element={<HomeLazy />} />
                <Route path="/gioi-thieu" element={<AboutLazy />} />
                <Route path="/khoa-hoc-tieng-nhat" element={<ClassesLazy />} />
                <Route path="/tin-tuc" element={<NewsLazy />} />
                <Route path="/tin-tuc/:slug" element={<NewsDetailLazy />} />
                <Route path="/lien-he" element={<ContactLazy />} />
                <Route path="/lich-khai-giang" element={<OpeningScheduleLazy />} />
                <Route path="/khoa-hoc-tieng-nhat/:slug" element={<CourseDetailPageLazy />} />
                <Route path="/bo-suu-tap" element={<GalleryLazy />} />
                <Route path="/tim-kiem" element={<SearchResultsLazy />} />
                <Route path="/nguoi-dung/:id" element={<PublicProfileLazy />} />
                <Route path="/dang-nhap" element={<AuthLazy />} />
                <Route path="/dang-ky" element={<AuthLazy />} />
                <Route path="/dat-lai-mat-khau" element={<AuthLazy />} />
                <Route path="/thi-thu-JLPT/*" element={<JLPTMockTestLazy />} />

                {/* User Routes */}
                <Route
                    element={
                        <ProtectedRoute>
                            <UserDashboardLazy />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/profile" element={<UserProfileLazy />} />
                    <Route path="/thong-bao-cua-toi" element={<MyNotificationsLazy />} />
                    <Route path="/cai-dat" element={<UserSettingsLazy />} />
                    <Route path="/da-luu" element={<SavedItemsLazy />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin/dang-nhap" element={<AdminAuthLazy />} />
                <Route path="/admin/dashboard" element={<AdminDashboardLazy />} />
                <Route path="/admin/dashboard/:category" element={<AdminDashboardLazy />} />

                <Route path="*" element={<NotFoundLazy />} />
            </Routes>
        </Suspense>
    );
}

export default AppRoutes;
