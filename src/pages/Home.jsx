import React from 'react';
import HeroSection from '../components/home/HeroSection.jsx';
import AboutSection from '../components/home/AboutSection.jsx';
import CoursesSection from '../components/home/CoursesSection.jsx';
import NewsSection from '../components/home/NewsSection.jsx';
import TestimonialsSection from '../components/home/TestimonialsSection.jsx';
import ScrollToTopButton from '../components/layout/ScrollToTopButton.jsx';

function Home() {
    return (
        <main>
            <HeroSection />
            <AboutSection />
            <CoursesSection />
            <NewsSection />
            <TestimonialsSection />
            <ScrollToTopButton />
        </main>
    );
}

export default Home;
