import { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';

function ScrollToTopButton() {
    const [isVisible, setIsVisible] = useState(false);

    // Hiển thị nút khi người dùng cuộn xuống 300px
    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    // Cuộn lên đầu trang một cách mượt mà
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);

        // Dọn dẹp event listener khi component bị unmount
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-10 right-8 z-50 p-3 cursor-pointer rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 transition-all duration-300 ease-in-out transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
            }`}
            aria-label="Cuộn lên đầu trang"
            title="Cuộn lên đầu trang"
        >
            <FaArrowUp size={20} />
        </button>
    );
}

export default ScrollToTopButton;
