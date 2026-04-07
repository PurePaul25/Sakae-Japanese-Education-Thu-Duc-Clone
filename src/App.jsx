import { useLocation } from 'react-router-dom';
import './App.css';
import Footer from './components/layout/Footer';
import Navbar from './components/layout/Navbar';
import ScrollToTop from './components/layout/ScrollToTop';
import Toast from './components/ui/Toast';
import AppRoutes from './routes/AppRoutes';

function App() {
    const location = useLocation();
    const isExamPage = location.pathname.includes('/thi-thu-JLPT/exam');
    const isAuthPage = location.pathname.includes('/dang-nhap') || location.pathname.includes('/dang-ky');

    return (
        <div className="flex flex-col min-h-screen">
            {!isExamPage && !isAuthPage && <Navbar />}
            <ScrollToTop />
            <Toast />
            <main className="flex-grow">
                <AppRoutes />
            </main>
            {!isExamPage && !isAuthPage && <Footer />}
        </div>
    );
}

export default App;
