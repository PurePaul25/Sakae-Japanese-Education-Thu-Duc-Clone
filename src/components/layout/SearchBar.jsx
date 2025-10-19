import { FaSearch } from 'react-icons/fa';

export default function SearchBar() {
    return (
        <div className="relative w-70 lg:w-64">
            <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full py-2 pl-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300"
            />
            <FaSearch className="absolute right-4 top-3 text-gray-500" />
        </div>
    );
}
