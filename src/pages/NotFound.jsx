import { Link } from 'react-router-dom';
import SEO from '../hooks/useSEO';

function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
            <SEO page="notFound" />
            <h1 className="text-6xl font-bold text-red-600 mb-4">404 - Not Found</h1>
            <p className="text-lg text-gray-600 mb-6">Trang bạn tìm không tồn tại. 😭</p>
            <Link
                to="/"
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition duration-200"
            >
                Quay về trang chủ
            </Link>
        </div>
    );
}

export default NotFound;
