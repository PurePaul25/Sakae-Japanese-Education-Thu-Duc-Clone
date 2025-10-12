import { useState } from 'react';
import logo from '../assets/logo_Sakae.webp';
import vietnamIcon from '../assets/vietnam.png';
import japanIcon from '../assets/japan.png';

function Navbar() {
    const languages = [
        { code: 'vi', label: 'Tiếng Việt', icon: vietnamIcon },
        { code: 'ja', label: '日本語', icon: japanIcon },
    ];

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedLang, setSelectedLang] = useState(languages[0]);

    const handleLangSelect = (lang) => {
        setSelectedLang(lang);
        setIsDropdownOpen(false);
        // Thêm logic thay đổi ngôn ngữ thực tế ở đây
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-4">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <img src={logo} alt="Sakae Logo" className="h-18" />
                </div>

                {/* Menu */}
                <nav className="hidden md:flex text-gray-700 font-medium h-18">
                    <a
                        href="/"
                        className="hover:bg-red-600 hover:text-white h-full w-30 flex items-center justify-center transition duration-250 ease-in-out"
                    >
                        Trang chủ
                    </a>
                    <a
                        href="/gioi-thieu"
                        className="hover:bg-red-600 hover:text-white h-full w-30 flex items-center justify-center transition duration-250 ease-in-out"
                    >
                        Giới thiệu
                    </a>
                    <a
                        href="/thong-tin-lop-hoc"
                        className="hover:bg-red-600 hover:text-white h-full w-38 flex items-center justify-center transition duration-250 ease-in-out"
                    >
                        Thông tin lớp học
                    </a>
                    <a
                        href="/tin-tuc"
                        className="hover:bg-red-600 hover:text-white h-full w-30 flex items-center justify-center transition duration-250 ease-in-out"
                    >
                        Tin tức
                    </a>
                    <a
                        href="/lien-he"
                        className="hover:bg-red-600 hover:text-white h-full w-30 flex items-center justify-center transition duration-250 ease-in-out"
                    >
                        Liên hệ
                    </a>
                </nav>

                <div className="flex items-center gap-2">
                    {/* Nút đăng ký */}
                    <button className="cursor-pointer bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition duration-250 ease-in-out">
                        Đăng ký học
                    </button>

                    {/* Language selection */}
                    <div className="relative text-sm">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 cursor-pointer rounded border border-gray-300 py-2 pl-3 pr-3 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <img src={selectedLang.icon} alt={selectedLang.label} className="w-5 h-5" />
                            <svg
                                className={`w-4 h-4 transition-transform duration-200 ${
                                    isDropdownOpen ? 'rotate-180' : ''
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                ></path>
                            </svg>
                        </button>

                        <div
                            className={`absolute right-0 mt-2 w-40 origin-top-right bg-white rounded-md shadow-lg border border-gray-200 transition-all duration-300 ease-in-out transform ${
                                isDropdownOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
                            }`}
                        >
                            <ul className="py-1">
                                {languages.map((lang) => (
                                    <li
                                        key={lang.code}
                                        onClick={() => handleLangSelect(lang)}
                                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    >
                                        <img src={lang.icon} alt={lang.label} className="w-5 h-5" />
                                        <span>{lang.label}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Navbar;
