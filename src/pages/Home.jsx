import React from 'react';
import HeroSection from '../components/home/HeroSection.jsx';
import AboutSection from '../components/home/AboutSection.jsx';
import ExtracurricularSection from '../components/home/ExtracurricularSection.jsx';
import CoursesSection from '../features/courses/CoursesSection.jsx';
import NewsSection from '../components/home/NewsSection.jsx';
import TestimonialsSection from '../components/home/TestimonialsSection.jsx';
import ScrollToTopButton from '../components/layout/ScrollToTopButton.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import SEO from '../hooks/useSEO.jsx';

function Home() {
    const { addToast } = useToast();


    return (
        <main>
            <SEO page="home" />
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
