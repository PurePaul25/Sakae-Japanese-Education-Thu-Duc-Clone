import { useState, useEffect, useRef } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import Tippy from '@tippyjs/react';
import 'tippy.js/themes/light.css';
import '../../assets/style/ScrollToTopButton.css';

function ScrollToTopButton() {
    const [isVisible, setIsVisible] = useState(false);
    const buttonRef = useRef(null);

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
        <Tippy
            content="Cuộn lên đầu trang"
            theme="light"
            placement="top"
            animation="shift-away"
            arrow={true}
            touch={false}
            className="tippy-scroll-top"
        >
            <button
                ref={buttonRef}
                onClick={scrollToTop}
                className={`fixed bottom-10 right-8 z-50 p-3 cursor-pointer rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 transition-all duration-300 ease-in-out transform ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
                }`}
                type="button"
            >
                <FaArrowUp size={20} />
            </button>
        </Tippy>
    );
}

export default ScrollToTopButton;
