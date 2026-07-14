import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ScrollToTopButton from '../components/layout/ScrollToTopButton';
import SEO from '../hooks/useSEO';
import blogService from '../services/blogService';

const FilterButton = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-full text-sm font-semibold uppercase transition-all duration-300 whitespace-nowrap ${
            active
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-red-100 hover:text-red-700 cursor-pointer'
        }`}
    >
        {label}
    </button>
);

import { Eye } from 'lucide-react';

const NewsCard = ({ item }) => {
    const formattedDate = new Date(item.createdAt).toLocaleDateString('vi-VN');

    return (
        <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-1">
            <div className="flex flex-col md:flex-row">
                {/* Ảnh — wrap bằng Link để click vào ảnh cũng vào bài */}
                <Link
                    to={`/tin-tuc/${item.slug}`}
                    className="relative md:w-1/3 overflow-hidden border-r border-gray-200 block"
                >
                    <img
                        src={item.thumbnail || 'https://placehold.co/600x400?text=Sakae+News'}
                        alt={item.title}
                        className="w-full h-20 object-cover transition-transform duration-500 group-hover:scale-105 min-h-[200px] md:min-h-[220px]"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                        <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-red-600 px-4 py-2 rounded-full">
                            Xem thêm →
                        </span>
                    </div>
                    {item.category && (
                        <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-semibold py-1 px-3 rounded-full">
                            {item.category}
                        </span>
                    )}
                </Link>

                {/* Nội dung */}
                <div className="md:w-2/3 p-3.5 md:p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm text-gray-500">{formattedDate}</span>
                            <span className="flex items-center gap-1 text-sm text-gray-400">
                                <Eye size={14} className="text-gray-400" />
                                {item.views ?? 0} Lượt xem
                            </span>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 hover:text-red-600 transition-colors duration-300">
                            <Link to={`/tin-tuc/${item.slug}`}>{item.title}</Link>
                        </h3>
                        {item.excerpt && (
                            <p className="text-[15px] md:text-base text-gray-600 mb-4 leading-relaxed line-clamp-3">
                                {item.excerpt}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                        <Link
                            to={`/tin-tuc/${item.slug}`}
                            className="self-start text-red-600 font-semibold text-sm hover:text-red-800 transition-colors duration-300 group"
                        >
                            Xem chi tiết{' '}
                            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                                →
                            </span>
                        </Link>
                        {item.author && <span className="text-sm text-gray-400">{item.author.fullName}</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const News = () => {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState(['Tất cả']);
    const [activeCategory, setActiveCategory] = useState('Tất cả');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const LIMIT = 6;

    // Fetch posts khi filter/page thay đổi
    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = { page, limit: LIMIT };
                if (activeCategory !== 'Tất cả') params.category = activeCategory;
                if (search) params.search = search;

                const res = await blogService.getAll(params);
                const payload = res.data?.data ?? res.data;
                setPosts(payload.data ?? []);
                setMeta(payload.meta ?? null);
            } catch {
                setError('Không thể tải tin tức. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [page, activeCategory, search]);

    // Fetch categories một lần để build filter buttons
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await blogService.getAll({ limit: 100 });
                const payload = res.data?.data ?? res.data;
                const allPosts = payload.data ?? [];
                const unique = ['Tất cả', ...new Set(allPosts.map((p) => p.category).filter(Boolean))];
                setCategories(unique);
            } catch {
                // giữ default
            }
        };
        fetchCategories();
    }, []);

    const handleCategoryChange = (cat) => {
        setActiveCategory(cat);
        setPage(1);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    return (
        <div className="pt-24 pb-12 bg-gray-100 text-gray-800">
            <SEO page="news" />

            {/* Tiêu đề */}
            <section className="text-center mb-5 px-4">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-2">
                    Tin tức & <span className="text-red-600">Sự kiện</span>
                </h1>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    Cập nhật các hoạt động, sự kiện và tin tức mới nhất từ trung tâm tiếng Nhật Sakae.
                </p>
            </section>

            {/* Search */}
            <section className="max-w-2xl mx-auto mb-6 px-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Tìm kiếm bài viết..."
                        className="flex-1 px-2.5 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
                    />
                    <button
                        type="submit"
                        className="px-4 py-1.5 cursor-pointer bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
                    >
                        Tìm
                    </button>
                    {search && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch('');
                                setSearchInput('');
                                setPage(1);
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-300 transition-colors"
                        >
                            Xóa
                        </button>
                    )}
                </form>
            </section>

            {/* Bộ lọc */}
            <section className="max-w-4xl mx-auto mb-8 px-4">
                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="hidden md:flex items-center gap-4 flex-wrap justify-start ml-2">
                        <p className="font-bold text-gray-700">Lọc theo danh mục:</p>
                        {categories.map((cat) => (
                            <FilterButton
                                key={cat}
                                label={cat}
                                active={activeCategory === cat}
                                onClick={() => handleCategoryChange(cat)}
                            />
                        ))}
                    </div>
                    <div className="md:hidden">
                        <label className="block text-sm font-bold text-gray-700 mb-2 text-center">
                            Lọc theo danh mục
                        </label>
                        <select
                            value={activeCategory}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            {/* Danh sách */}
            <section className="max-w-7xl mx-auto px-4">
                {error ? (
                    <p className="text-center text-red-500 py-10">{error}</p>
                ) : (
                    <div className="flex flex-col gap-5 md:gap-6">
                        {loading ? (
                            <>
                                <div className="text-center py-10">
                                    <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
                                    <p className="text-lg font-semibold text-gray-900">Đang tải bài viết...</p>
                                    <p className="text-sm text-gray-500">Vui lòng chờ trong giây lát.</p>
                                </div>
                            </>
                        ) : posts.length > 0 ? (
                            posts.map((item) => <NewsCard key={item.id} item={item} />)
                        ) : (
                            <p className="text-center text-gray-500 py-10">Không có tin tức nào.</p>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-10">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
                        >
                            ← Trước
                        </button>
                        {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                                    p === page
                                        ? 'bg-red-600 text-white shadow-sm'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                            disabled={page === meta.totalPages}
                            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
                        >
                            Sau →
                        </button>
                    </div>
                )}
            </section>

            <ScrollToTopButton />
        </div>
    );
};

export default News;
