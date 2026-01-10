import { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo_Sakae.png';
import vietnamIcon from '../../assets/vietnam.png';
import japanIcon from '../../assets/japan.png';

import { FiMenu, FiX, FiChevronDown } from 'react-icons/fi';
import SearchBar from './SearchBar';

const menuItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Giới thiệu', href: '/gioi-thieu' },
    { label: 'Khóa học', href: '/khoa-hoc' },
    { label: 'Tin tức', href: '/tin-tuc' },
    {
        label: 'Khác',
        children: [
            { label: 'Tất cả sản phẩm', href: '/thu-vien-anh' },
            { label: 'Lịch khai giảng', href: '/lich-khai-giang' },
            { label: 'Liên hệ', href: '/lien-he' },
        ],
    },
];

function Navbar() {
    const languages = [
        { code: 'vi', label: 'Tiếng Việt', icon: vietnamIcon },
        { code: 'ja', label: '日本語', icon: japanIcon },
    ];

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedLang, setSelectedLang] = useState(languages[0]);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(false);

    // State và Ref cho hiệu ứng gạch chân di chuyển
    const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0, opacity: 0 });
    const navItemsRef = useRef([]);
    const location = useLocation();

    // Cập nhật gạch chân khi location thay đổi
    useEffect(() => {
        const index = menuItems.findIndex((item) => {
            if (item.href === location.pathname) return true;
            if (item.children) {
                return item.children.some((child) => child.href === location.pathname);
            }
            return false;
        });

        if (index !== -1 && navItemsRef.current[index]) {
            const activeItem = navItemsRef.current[index];
            setUnderlineStyle({
                left: activeItem.offsetLeft,
                width: activeItem.offsetWidth,
                opacity: 1,
            });
        } else {
            // Ẩn gạch chân nếu không có mục nào khớp (ví dụ: trang 404)
            setUnderlineStyle({ left: 0, width: 0, opacity: 0 });
        }
    }, [location.pathname]);

    // Hiệu ứng scroll
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Logic Chuyển đổi ngôn ngữ
    const handleLangSelect = (lang) => {
        setSelectedLang(lang);
        setIsDropdownOpen(false);
        // Thêm logic thay đổi ngôn ngữ thực tế ở đây
    };

    return (
        <header
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
                isScrolled ? 'bg-white shadow-md' : 'bg-white/70'
            }`}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between px-4">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Link to="/">
                        <img src={logo} alt="Sakae Logo" className="h-[70px]" />
                    </Link>
                </div>

                {/* Menu */}
                <nav className="hidden lg:flex relative text-gray-700 font-medium h-[70px]">
                    {menuItems.map((item, index) =>
                        item.children ? (
                            <div
                                key={item.label}
                                ref={(el) => (navItemsRef.current[index] = el)}
                                className="relative h-full flex items-center group cursor-pointer px-5"
                            >
                                <span
                                    className={`flex items-center gap-1 transition-colors duration-300 ease-in-out group-hover:text-red-600 ${
                                        item.children.some((child) => child.href === location.pathname)
                                            ? 'text-red-600'
                                            : ''
                                    }`}
                                >
                                    {item.label}
                                    <FiChevronDown className="transition-transform duration-300 group-hover:rotate-180" />
                                </span>
                                {/* Dropdown */}
                                <div className="absolute top-full left-0 w-48 bg-white shadow-lg rounded-md overflow-hidden transition-all duration-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transform origin-top scale-75 -translate-y-2 group-hover:translate-y-0 group-hover:scale-100 border-1 border-gray-200">
                                    {item.children.map((child) => (
                                        <Link
                                            key={child.label}
                                            to={child.href}
                                            className="block px-4 py-3 hover:bg-red-50 hover:text-red-700 hover:font-semibold transition-all text-gray-700 text-sm"
                                        >
                                            {child.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <Link
                                key={item.label}
                                to={item.href}
                                ref={(el) => (navItemsRef.current[index] = el)}
                                className={`h-full px-5 flex items-center justify-center transition-colors duration-300 ease-in-out ${
                                    location.pathname === item.href ? 'text-red-600' : 'hover:bg-gray-200'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ),
                    )}
                    {/* Gạch chân di chuyển */}
                    <span
                        className="absolute bottom-0 h-1 bg-red-600 rounded-full transition-all duration-300 ease-in-out"
                        style={{
                            ...underlineStyle,
                        }}
                    />
                </nav>

                {/* Tìm kiếm */}
                <div className="hidden sm:block">
                    <SearchBar />
                </div>

                {/* Nút đăng ký + ngôn ngữ + hamburger */}
                <div className="flex items-center gap-4">
                    {/* Nút đăng ký */}
                    <button className="hidden md:block cursor-pointer bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition duration-250 ease-in-out">
                        Đăng ký học
                    </button>

                    {/* Chọn ngôn ngữ */}
                    <div className="relative text-sm z-10">
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

                    {/* Icon menu mobile */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden text-gray-700 hover:text-red-600 transition duration-300 cursor-pointer"
                    >
                        {isMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
                    </button>
                </div>
            </div>

            {/* Menu Mobile */}
            <div
                className={`lg:hidden transition-all duration-500 overflow-hidden ${
                    isMenuOpen ? 'max-h-96' : 'max-h-0'
                }`}
            >
                <div className="flex flex-col items-center pb-4 bg-white shadow-md border-t-2 border-gray-800/20">
                    {menuItems.map((item) =>
                        item.children ? (
                            <div key={item.label} className="w-full flex flex-col items-center">
                                <button
                                    onClick={() => setMobileSubmenuOpen(!mobileSubmenuOpen)}
                                    className={`w-full py-3 flex items-center justify-center gap-2 transition-colors duration-200 ease-in-out ${
                                        item.children.some((c) => c.href === location.pathname)
                                            ? 'bg-red-50 text-red-700 font-semibold'
                                            : 'hover:bg-gray-100'
                                    }`}
                                >
                                    {item.label}
                                    <FiChevronDown
                                        className={`transition-transform duration-300 ${
                                            mobileSubmenuOpen ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>
                                <div
                                    className={`w-full bg-gray-50 overflow-hidden transition-all duration-300 ease-in-out ${
                                        mobileSubmenuOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                                >
                                    {item.children.map((child) => (
                                        <Link
                                            key={child.label}
                                            to={child.href}
                                            onClick={() => setIsMenuOpen(false)}
                                            className={`block w-full py-2 text-center text-sm text-gray-600 hover:text-red-600 ${
                                                location.pathname === child.href ? 'text-red-600 font-medium' : ''
                                            }`}
                                        >
                                            {child.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <Link
                                key={item.label}
                                to={item.href}
                                onClick={() => setIsMenuOpen(false)} // Đóng menu khi chọn
                                className={`h-full w-full py-3 flex items-center justify-center transition-colors duration-200 ease-in-out ${
                                    location.pathname === item.href
                                        ? 'bg-red-100 text-red-700 font-semibold'
                                        : 'hover:bg-gray-100'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ),
                    )}
                    <div className="flex flex-col items-center w-full pt-4 border-t-2 border-gray-800/20  md:hidden">
                        <div className="block sm:hidden mb-4">
                            <SearchBar />
                        </div>
                        <button className=" bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition duration-200 cursor-pointer">
                            Đăng ký học
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Navbar;
