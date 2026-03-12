import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        const isExamPage = pathname.includes('/thi-thu-JLPT/exam');
        window.scrollTo({
            top: 0,
            behavior: isExamPage ? 'auto' : 'smooth',
        });
    }, [pathname]);

    return null;
}

export default ScrollToTop;
