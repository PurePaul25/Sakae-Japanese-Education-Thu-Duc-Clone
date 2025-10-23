import { Routes, Route, useNavigate } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';

// Lazy load các trang
const HomeLazy = lazy(() => import('../pages/Home'));
const AboutLazy = lazy(() => import('../pages/About'));
const ClassesLazy = lazy(() => import('../pages/Classes'));
const NewsLazy = lazy(() => import('../pages/News'));
const ContactLazy = lazy(() => import('../pages/Contact'));
const NotFoundLazy = lazy(() => import('../pages/NotFound'));

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
                <Route path="/thong-tin-lop-hoc" element={<ClassesLazy />} />
                <Route path="/tin-tuc" element={<NewsLazy />} />
                <Route path="/lien-he" element={<ContactLazy />} />
                <Route path="*" element={<NotFoundLazy />} />
            </Routes>
        </Suspense>
    );
}

export default AppRoutes;
