import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchCourses } from '../utils/searchUtils';
import { FaNewspaper, FaBook, FaCalendar, FaTag, FaArrowRight } from 'react-icons/fa';
import ScrollToTopButton from '../components/layout/ScrollToTopButton';
import SEO from '../hooks/useSEO';
import blogService from '../services/blogService';

const normalizeText = (text = '') =>
    text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

const filterNewsByQuery = (items, query) => {
    const normalizedQuery = normalizeText(query);

    return items.filter((item) => {
        const haystacks = [
            item.title,
            item.excerpt,
            item.content,
            item.category,
            item.slug,
            item.author?.fullName,
        ].filter(Boolean);

        return haystacks.some((value) => normalizeText(value).includes(normalizedQuery));
    });
};

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [activeTab, setActiveTab] = useState('all');
    const [newsResults, setNewsResults] = useState([]);
    const [newsLoading, setNewsLoading] = useState(false);
    const [newsError, setNewsError] = useState(null);

    const courseResults = useMemo(() => searchCourses(query), [query]);

    useEffect(() => {
        if (!query.trim()) {
            setNewsResults([]);
            setNewsLoading(false);
            setNewsError(null);
            return;
        }

        let ignore = false;

        const fetchNews = async () => {
            setNewsLoading(true);
            setNewsError(null);
            try {
                const [primaryResult, fallbackResult] = await Promise.allSettled([
                    blogService.getAll({ search: query.trim(), limit: 100 }),
                    blogService.getAll({ page: 1, limit: 100 }),
                ]);

                let items = [];

                if (primaryResult.status === 'fulfilled') {
                    const payload = primaryResult.value.data?.data ?? primaryResult.value.data;
                    items = Array.isArray(payload?.data) ? payload.data : [];
                }

                if (!items.length && fallbackResult.status === 'fulfilled') {
                    const payload = fallbackResult.value.data?.data ?? fallbackResult.value.data;
                    items = Array.isArray(payload?.data) ? payload.data : [];
                }

                const filtered = filterNewsByQuery(items, query.trim());
                const sorted = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                if (!ignore) {
                    setNewsResults(sorted);
                }
            } catch {
                if (!ignore) {
                    setNewsResults([]);
                    setNewsError('Không thể tải tin tức từ API lúc này.');
                }
            } finally {
                if (!ignore) {
                    setNewsLoading(false);
                }
            }
        };

        fetchNews();
        return () => {
            ignore = true;
        };
    }, [query]);

    const results = useMemo(
        () => ({
            news: newsResults,
            courses: courseResults,
            hasResults: newsResults.length > 0 || courseResults.length > 0,
        }),
        [newsResults, courseResults],
    );

    const filteredResults = useMemo(() => {
        if (activeTab === 'all') {
            return results;
        }
        if (activeTab === 'news') {
            return { ...results, courses: [] };
        }
        return { ...results, news: [] };
    }, [results, activeTab]);

    const totalResults = filteredResults.news.length + filteredResults.courses.length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 mt-17.5">
            <SEO page="searchResults" />
            <ScrollToTopButton />

            <div className="bg-gradient-to-r from-red-500 via-red-400 to-red-600 text-white p-3.5 shadow-lg">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 drop-shadow-lg">Kết quả tìm kiếm</h1>
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
                {newsLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="h-14 w-14 rounded-full border-4 border-red-600 border-t-transparent animate-spin mb-4" />
                        <p className="text-lg font-semibold text-gray-900">Đang tìm kiếm bài viết...</p>
                        <p className="text-sm text-gray-500 mt-1">Vui lòng chờ trong giây lát.</p>
                    </div>
                ) : !results.hasResults ? (
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
                        <div className="mb-6">
                            <div className="flex py-0.5 items-center gap-2 overflow-x-auto no-scrollbar">
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
                                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out whitespace-nowrap shrink-0 active:scale-95 ${
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

                        <div className="space-y-6">
                            {filteredResults.news.length > 0 && (
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                        <FaNewspaper className="text-red-600" /> Tin tức
                                    </h3>
                                    {newsLoading ? (
                                        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-gray-500">
                                            Đang tải tin tức từ API...
                                        </div>
                                    ) : newsError ? (
                                        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
                                            {newsError}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {filteredResults.news.map((item) => (
                                                <Link
                                                    key={item.id}
                                                    to={`/tin-tuc/${item.slug}`}
                                                    className="group h-full flex flex-col bg-white rounded-lg shadow-md hover:shadow-xl overflow-hidden transition duration-300 transform hover:-translate-y-1"
                                                >
                                                    <div className="relative h-48 overflow-hidden bg-gray-200 shrink-0">
                                                        <img
                                                            src={item.thumbnail || 'https://placehold.co/400x300?text=Sakae+News'}
                                                            alt={item.title}
                                                            className="w-full h-full object-cover hover:scale-110 transition duration-500"
                                                            onError={(e) => {
                                                                e.target.src = 'https://placehold.co/400x300?text=Image+Not+Found';
                                                            }}
                                                        />
                                                        {item.category && (
                                                            <span className="absolute top-4 left-4 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2 shadow-md">
                                                                <FaTag size={12} /> {item.category}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="p-5 flex flex-1 flex-col">
                                                        <p className="text-sm text-gray-500 flex items-center gap-2 mb-3">
                                                            <FaCalendar size={14} />
                                                            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                                        </p>
                                                        <h4 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-red-600 transition">
                                                            {item.title}
                                                        </h4>
                                                        <p className="text-gray-600 text-sm line-clamp-3 flex-1">
                                                            {item.excerpt || 'Đọc thêm bài viết này từ hệ thống tin tức Sakae.'}
                                                        </p>
                                                        <div className="mt-4 inline-flex items-center gap-2 text-red-600 font-semibold hover:text-red-700 transition duration-300">
                                                            Đọc thêm
                                                            <FaArrowRight size={12} />
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

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
                                                className="group h-full flex flex-col bg-white rounded-lg shadow-md hover:shadow-xl overflow-hidden transition duration-300 transform hover:-translate-y-1 cursor-pointer"
                                            >
                                                <div className="relative h-48 overflow-hidden bg-gray-200 shrink-0">
                                                    <img
                                                        src={course.image}
                                                        alt={course.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                                        onError={(e) => {
                                                            e.target.src = 'https://placehold.co/400x300?text=Image+Not+Found';
                                                        }}
                                                    />
                                                    <span className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md">
                                                        {course.level}
                                                    </span>
                                                    <span className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                                                        {course.type}
                                                    </span>
                                                </div>

                                                <div className="p-5 flex flex-1 flex-col">
                                                    <h4 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-red-600 transition">
                                                        {course.name}
                                                    </h4>
                                                    <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">{course.desc}</p>
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
