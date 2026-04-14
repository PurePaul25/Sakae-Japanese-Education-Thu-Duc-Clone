import React, { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchContent } from '../utils/searchUtils';
import { FaNewspaper, FaBook, FaCalendar, FaTag, FaArrowRight } from 'react-icons/fa';
import ScrollToTopButton from '../components/layout/ScrollToTopButton';
import SEO from '../hooks/useSEO';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'news', 'courses'

    const results = useMemo(() => searchContent(query), [query]);

    const filteredResults = useMemo(() => {
        if (activeTab === 'all') {
            return results;
        } else if (activeTab === 'news') {
            return { ...results, courses: [] };
        } else {
            return { ...results, news: [] };
        }
    }, [results, activeTab]);

    const totalResults = filteredResults.news.length + filteredResults.courses.length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 mt-17.5">
            <SEO page="searchResults" />
            <ScrollToTopButton />

            {/* Search Header Section */}
            <div className="bg-gradient-to-r from-red-500 via-red-400 to-red-600 text-white p-8 shadow-lg">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">Kết quả tìm kiếm</h1>
                    <p className="text-red-100 mb-0.5">
                        Tìm kiếm cho: <span className="font-semibold text-white text-lg">"{query}"</span>
                    </p>
                    {results.hasResults && (
                        <p className="text-red-100">
                            Tìm thấy <span className="font-bold text-white text-lg">{totalResults}</span> kết quả
                        </p>
                    )}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 pt-6 pb-10">
                {/* No Results */}
                {!results.hasResults ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-6 opacity-30">🔍</div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Không tìm thấy kết quả</h2>
                        <p className="text-gray-600 text-lg mb-8">
                            Không tìm thấy bất kỳ tin tức hoặc khóa học nào khớp với từ khóa "
                            <span className="font-bold">{query}</span>"
                        </p>
                        <Link
                            to="/"
                            className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition duration-300 shadow-md"
                        >
                            Quay lại trang chủ
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Tab Navigation */}
                        <div className="mb-6">
                            <div className="flex py-0.5 items-center gap-2 overflow-x-auto no-scrollbar">
                                {/* Label */}
                                <span className="text-gray-700 font-medium shrink-0">Lọc theo:</span>

                                {[
                                    {
                                        key: 'all',
                                        label: `Tất cả (${results.news.length + results.courses.length})`,
                                    },
                                    {
                                        key: 'news',
                                        label: `Tin tức (${results.news.length})`,
                                    },
                                    {
                                        key: 'courses',
                                        label: `Khóa học (${results.courses.length})`,
                                    },
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`px-4 py-2 rounded-full text-sm font-semibold 
                                                transition-all duration-300 ease-in-out whitespace-nowrap shrink-0 active:scale-95
                                                ${
                                                    activeTab === tab.key
                                                        ? 'bg-red-600 text-white shadow-md scale-105'
                                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 cursor-pointer'
                                                }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Results Grid */}
                        <div className="space-y-6">
                            {/* NEWS RESULTS */}
                            {filteredResults.news.length > 0 && (
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                        <FaNewspaper className="text-red-600" /> Tin tức
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredResults.news.map((item) => (
                                            <div
                                                key={item.id}
                                                className="bg-white rounded-lg shadow-md hover:shadow-xl overflow-hidden transition duration-300 transform hover:-translate-y-1"
                                            >
                                                {/* Image */}
                                                <div className="relative h-48 overflow-hidden bg-gray-200">
                                                    <img
                                                        src={item.image}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover hover:scale-110 transition duration-500"
                                                        onError={(e) => {
                                                            e.target.src =
                                                                'https://via.placeholder.com/400x300?text=Image+Not+Found';
                                                        }}
                                                    />
                                                    {/* Category Badge */}
                                                    <span className="absolute top-4 left-4 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2 shadow-md">
                                                        <FaTag size={12} /> {item.category}
                                                    </span>
                                                </div>

                                                {/* Content */}
                                                <div className="p-5">
                                                    <p className="text-sm text-gray-500 flex items-center gap-2 mb-3">
                                                        <FaCalendar size={14} /> {item.date}
                                                    </p>
                                                    <h4 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 hover:text-red-600 transition">
                                                        {item.title}
                                                    </h4>
                                                    <p className="text-gray-600 text-sm line-clamp-3">{item.desc}</p>
                                                    <button className="mt-4 inline-flex items-center gap-2 text-red-600 font-semibold hover:text-red-700 transition duration-300">
                                                        Đọc thêm
                                                        <FaArrowRight size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* COURSES RESULTS */}
                            {filteredResults.courses.length > 0 && (
                                <div className={filteredResults.news.length > 0 ? 'mt-12' : ''}>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                        <FaBook className="text-red-600" /> Khóa học
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredResults.courses.map((course) => (
                                            <Link
                                                key={course.id}
                                                to={`/chi-tiet-khoa-hoc/${course.id}`}
                                                className="group bg-white rounded-lg shadow-md hover:shadow-xl overflow-hidden transition duration-300 transform hover:-translate-y-1 cursor-pointer"
                                            >
                                                {/* Image */}
                                                <div className="relative h-48 overflow-hidden bg-gray-200">
                                                    <img
                                                        src={course.image}
                                                        alt={course.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                                        onError={(e) => {
                                                            e.target.src =
                                                                'https://via.placeholder.com/400x300?text=Image+Not+Found';
                                                        }}
                                                    />
                                                    {/* Level Badge */}
                                                    <span className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md">
                                                        {course.level}
                                                    </span>
                                                    {/* Type Badge */}
                                                    <span className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                                                        {course.type}
                                                    </span>
                                                </div>

                                                {/* Content */}
                                                <div className="p-5">
                                                    <h4 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-red-600 transition">
                                                        {course.name}
                                                    </h4>
                                                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                                        {course.desc}
                                                    </p>
                                                    <p className="text-sm text-gray-500 flex items-center gap-2 mb-4">
                                                        <FaCalendar size={14} />
                                                        <span className="truncate">{course.schedule}</span>
                                                    </p>
                                                    <div className="inline-flex items-center gap-2 text-red-600 font-semibold group-hover:text-red-700 transition duration-300">
                                                        Xem chi tiết
                                                        <FaArrowRight size={12} />
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SearchResults;
