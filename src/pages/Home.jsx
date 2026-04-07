import React, { useEffect } from 'react';
import HeroSection from '../components/home/HeroSection.jsx';
import AboutSection from '../components/home/AboutSection.jsx';
import ExtracurricularSection from '../components/home/ExtracurricularSection.jsx';
import CoursesSection from '../features/courses/CoursesSection.jsx';
import NewsSection from '../components/home/NewsSection.jsx';
import TestimonialsSection from '../components/home/TestimonialsSection.jsx';
import ScrollToTopButton from '../components/layout/ScrollToTopButton.jsx';
import { useToast } from '../contexts/ToastContext.jsx';

function Home() {
    const { addToast } = useToast();

    // Check if login was successful and show toast
    useEffect(() => {
        const showLoginToast = sessionStorage.getItem('showLoginSuccessToast');
        if (showLoginToast) {
            addToast('Đăng nhập thành công! Chào mừng bạn quay lại Sakae!', 'success');
            sessionStorage.removeItem('showLoginSuccessToast');
        }
    }, [addToast]);

    return (
        <main>
            <HeroSection />
            <AboutSection />
            <ExtracurricularSection />
            <CoursesSection />
            <NewsSection />
            <TestimonialsSection />
            <ScrollToTopButton />
        </main>
    );
}

export default Home;
