import './App.css';
import Footer from './components/layout/Footer';
import Navbar from './components/layout/Navbar';
import ScrollToTop from './components/layout/ScrollToTop';
import AppRoutes from './routes/AppRoutes';

function App() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <ScrollToTop />
            <main className="flex-grow">
                <AppRoutes />
            </main>
            <Footer />
        </div>
    );
}

export default App;
