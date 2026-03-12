import { useLocation } from 'react-router-dom';
import './App.css';
import Footer from './components/layout/Footer';
import Navbar from './components/layout/Navbar';
import ScrollToTop from './components/layout/ScrollToTop';
import AppRoutes from './routes/AppRoutes';

function App() {
    const location = useLocation();
    const isExamPage = location.pathname.includes('/thi-thu-JLPT/exam');

    return (
        <div className="flex flex-col min-h-screen">
            {!isExamPage && <Navbar />}
            <ScrollToTop />
            <main className="flex-grow">
                <AppRoutes />
            </main>
            {!isExamPage && <Footer />}
        </div>
    );
}

export default App;
