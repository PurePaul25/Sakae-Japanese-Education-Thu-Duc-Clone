import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './App.css';
import Footer from './components/layout/Footer';
import Navbar from './components/layout/Navbar';
import ScrollToTop from './components/layout/ScrollToTop';
import Toast from './components/ui/Toast';
import AppRoutes from './routes/AppRoutes';

function App() {
    const location = useLocation();
    const isExamPage = location.pathname.includes('/exam') || location.pathname.includes('/result');
    const isAuthPage = location.pathname.includes('/dang-nhap') || location.pathname.includes('/dang-ky');
    const isAdminPage = location.pathname.includes('/admin');

    useEffect(() => {
        document.body.style.overflow = 'unset';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [location.pathname]);

    return (
        <div className="flex flex-col min-h-screen">
            {!isExamPage && !isAuthPage && !isAdminPage && <Navbar />}
            <ScrollToTop />
            <Toast />
            <main className="flex-grow">
                <AppRoutes />
            </main>
            {!isExamPage && !isAuthPage && !isAdminPage && <Footer />}
        </div>
    );
}

export default App;
