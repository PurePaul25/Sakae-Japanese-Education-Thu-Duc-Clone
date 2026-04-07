import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

export default function SearchBar({ setIsMenuOpen }) {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        if (e.type === 'click' || (e.key === 'Enter' && searchQuery.trim())) {
            if (searchQuery.trim()) {
                navigate(`/tim-kiem?q=${encodeURIComponent(searchQuery)}`);

                setSearchQuery('');

                // 👇 đóng menu mobile
                if (setIsMenuOpen) {
                    setIsMenuOpen(false);
                }
            }
        }
    };

    return (
        <div className="relative w-70 lg:w-60">
            <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full py-2 pl-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300"
            />
            <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-600 transition duration-300 cursor-pointer p-2"
                aria-label="Tìm kiếm"
            >
                <FaSearch />
            </button>
        </div>
    );
}
