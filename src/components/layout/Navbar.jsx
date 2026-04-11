import { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import logo from '../../assets/img/logo_Sakae.png';
import vietnamIcon from '../../assets/img/vietnam.png';
import japanIcon from '../../assets/img/japan.png';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../../contexts/ToastContext';

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
            { label: 'Thư viện ảnh', href: '/bo-suu-tap' },
            { label: 'Lịch khai giảng', href: '/lich-khai-giang' },
            { label: 'Thi thử JLPT', href: '/thi-thu-JLPT' },
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
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [selectedLang, setSelectedLang] = useState(languages[0]);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(false);

    // State và Ref cho hiệu ứng gạch chân di chuyển
    const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0, opacity: 0 });
    const navItemsRef = useRef([]);
    const dropdownRef = useRef(null);
    const userDropdownRef = useRef(null);

    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useUser();
    const { addToast } = useToast();

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

    // Logic Bắt sự kiện click toàn document của chuyển đổi ngôn ngữ
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setIsUserDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        setIsUserDropdownOpen(false);
        addToast('Bạn đã đăng xuất thành công!', 'success');
        setTimeout(() => {
            navigate('/');
        }, 500);
    };

    return (
        <header
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b-1 border-gray-200 ${
                isScrolled ? 'bg-white shadow-md' : 'bg-white/70'
            }`}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between px-3">
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
                                    location.pathname === item.href ? 'text-red-600' : 'hover:bg-gray-100'
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

                {/* Nút đăng ký + ngôn ngữ + user + hamburger */}
                <div className="flex items-center gap-3 md:gap-4">
                    {/* Nút đăng ký học (luôn hiển thị) */}
                    <Link
                        to="/khoa-hoc"
                        className="hidden md:flex items-center gap-1 cursor-pointer bg-red-600 text-white py-2 px-3 rounded-md hover:bg-red-700 transition duration-200 ease-out"
                    >
                        Đăng ký học
                    </Link>

                    {/* Nút đăng nhập (desktop) */}
                    {!user && (
                        <Link
                            to="/dang-nhap"
                            className="hidden md:block cursor-pointer text-gray-700 hover:text-red-600 transition duration-200 ease-out"
                        >
                            Đăng nhập
                        </Link>
                    )}

                    {/* Nút đăng nhập (mobile) */}
                    {!user && (
                        <Link
                            to="/dang-nhap"
                            className="md:hidden cursor-pointer text-gray-700 hover:text-red-600 transition duration-200 ease-out text-sm"
                        >
                            Đăng nhập
                        </Link>
                    )}

                    {/* Chọn ngôn ngữ */}
                    <div ref={dropdownRef} className="relative text-sm z-10">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 cursor-pointer rounded border border-gray-300 py-2 pl-3 pr-3 bg-white focus:outline-none focus:ring-1 focus:ring-red-500 transition duration-200 ease-out"
                        >
                            <img src={selectedLang.icon} alt={selectedLang.label} className="w-5 h-5" />
                            <svg
                                className={`w-4 h-4 transition-transform duration-200 ease-out ${
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

                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={isDropdownOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className={`absolute right-0 mt-2 w-40 origin-top-right bg-white rounded-md shadow-lg border border-gray-200 ${
                                isDropdownOpen ? 'visible' : 'invisible'
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
                        </motion.div>
                    </div>

                    {/* User Dropdown (khi đã login) */}
                    {user && (
                        <div ref={userDropdownRef} className="relative text-sm z-20">
                            {/* Desktop version - avatar + arrow only */}
                            <button
                                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                className="hidden md:flex items-center gap-2 cursor-pointer rounded-full border border-gray-300 py-1 pl-1 pr-2 bg-white hover:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition duration-200 ease-out"
                            >
                                <img
                                    src={user.avatar}
                                    alt={user.fullName}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <svg
                                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ease-out ${
                                        isUserDropdownOpen ? 'rotate-180' : ''
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </button>

                            {/* Mobile version - icon only button */}
                            <button
                                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                className="md:hidden flex items-center gap-1 cursor-pointer rounded-full border border-gray-300 py-1 px-1.5 bg-white hover:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition duration-200 ease-out"
                            >
                                <img
                                    src={user.avatar}
                                    alt={user.fullName}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <svg
                                    className={`w-3 h-3 text-gray-500 transition-transform duration-200 ease-out ${
                                        isUserDropdownOpen ? 'rotate-180' : ''
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </button>

                            {/* User Dropdown Menu */}
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={isUserDropdownOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
                                transition={{ duration: 0.15, ease: 'easeOut' }}
                                className={`absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-lg shadow-xl border border-gray-200 ${
                                    isUserDropdownOpen ? 'visible' : 'invisible'
                                }`}
                            >
                                {/* User Info Header */}
                                <div className="p-3 border-b border-gray-100">
                                    <p className="font-semibold text-gray-800">{user.fullName}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>

                                {/* Menu Items */}
                                <ul className="pb-2">
                                    <li>
                                        <Link
                                            to="/"
                                            onClick={() => setIsUserDropdownOpen(false)}
                                            className="block px-3 py-2.5 text-gray-700 hover:bg-red-50 hover:text-red-600 transition duration-200"
                                        >
                                            👤 Hồ sơ cá nhân
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/"
                                            onClick={() => setIsUserDropdownOpen(false)}
                                            className="block px-3 py-2.5 text-gray-700 hover:bg-red-50 hover:text-red-600 transition duration-200"
                                        >
                                            🎓 Khóa học của tôi
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/"
                                            onClick={() => setIsUserDropdownOpen(false)}
                                            className="block px-3 py-2.5 text-gray-700 hover:bg-red-50 hover:text-red-600 transition duration-200"
                                        >
                                            ⚙️ Cài đặt
                                        </Link>
                                    </li>
                                    <li className="border-t border-gray-100">
                                        <button
                                            onClick={handleLogout}
                                            className="block cursor-pointer w-full text-left px-3 py-2.5 text-gray-700 hover:bg-red-50 hover:text-red-600 transition duration-200"
                                        >
                                            🚪 Đăng xuất
                                        </button>
                                    </li>
                                </ul>
                            </motion.div>
                        </div>
                    )}

                    {/* Icon menu mobile */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden text-gray-700 transition duration-300 cursor-pointer ease-in-out focus:outline-none"
                    >
                        <div
                            className={`transition-all duration-300 transform ${isMenuOpen ? 'rotate-90' : 'rotate-0'}`}
                        >
                            {isMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
                        </div>
                    </button>
                </div>
            </div>

            {/* Menu Mobile */}
            <div
                className={`lg:hidden transition-all duration-500 overflow-hidden ${
                    isMenuOpen ? 'max-h-[100vh]' : 'max-h-0'
                }`}
            >
                <div className="flex flex-col items-center pb-4 bg-white shadow-md border-t-2 border-b-1 border-gray-800/20">
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
                                            className={`block w-full py-3 text-center text-sm text-gray-600 hover:text-red-600 ${
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
                            <SearchBar setIsMenuOpen={setIsMenuOpen} />
                        </div>
                        <div className="my-1">
                            <Link
                                to="/khoa-hoc"
                                className=" bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition duration-200 cursor-pointer"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Đăng ký học
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Navbar;
