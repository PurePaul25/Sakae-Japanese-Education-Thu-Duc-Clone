import { useState, useEffect, useRef } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import '../../assets/style/ScrollToTopButton.css';

function ScrollToTopButton() {
    const [isVisible, setIsVisible] = useState(false);
    const buttonRef = useRef(null);

    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        <div
            className={`fixed sm:bottom-10 sm:right-8 bottom-8 right-6 z-50 transition-all duration-300 ease-in-out transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
            }`}
        >
            <div className="group relative inline-block">
                <button
                    ref={buttonRef}
                    onClick={scrollToTop}
                    className="p-3 cursor-pointer rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 transition-all duration-300 ease-in-out"
                    type="button"
                >
                    <FaArrowUp size={20} />
                </button>

                {/* Custom Tooltip Content */}
                <div
                    className="
                        pointer-events-none
                        absolute right-full top-1/2 mr-3
                        hidden -translate-y-1/2
                        whitespace-nowrap
                        rounded-lg bg-red-500
                        px-3 py-2
                        text-sm font-bold text-white
                        opacity-0 shadow-lg
                        transition-all duration-300
                        sm:block
                        group-hover:opacity-100
                    "
                >
                    Cuộn lên đầu trang
                    {/* Tooltip Arrow */}
                    <span
                        className="
                            pointer-events-none
                            absolute left-full top-1/2 ml-2
                            hidden h-2 w-2
                            -translate-y-1/2
                            rotate-45
                            bg-red-700
                            opacity-0
                            transition-opacity duration-300
                            sm:block
                            group-hover:opacity-100
                        "
                    />
                </div>
            </div>
        </div>
    );
}

export default ScrollToTopButton;
