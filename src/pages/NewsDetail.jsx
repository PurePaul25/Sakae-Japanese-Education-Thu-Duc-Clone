import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ScrollToTopButton from '../components/layout/ScrollToTopButton';
import blogService from '../services/blogService';
import { Eye, Heart } from 'lucide-react';

const recentPostFetches = {};

const NewsDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!slug) return;
        const now = Date.now();
        if (recentPostFetches[slug] && now - recentPostFetches[slug] < 1000) return;
        recentPostFetches[slug] = now;

        const fetchPost = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await blogService.getBySlug(slug);
                const data = res.data?.data ?? res.data;
                if (!data) {
                    setError('Bài viết không tồn tại.');
                    return;
                }
                setPost(data);

                // Fetch related
                const relRes = await blogService.getRelated(slug);
                setRelated(relRes.data?.data ?? relRes.data ?? []);
            } catch {
                setError('Không thể tải bài viết. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
        window.scrollTo(0, 0);
    }, [slug]);

    if (loading) {
        return (
            <div className="pt-28 pb-12 bg-gray-100 min-h-screen flex items-center justify-center">
                <div className="text-center px-4 py-8 rounded-2xl">
                    <div className="mx-auto mb-4 h-14 w-14 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
                    <p className="text-xl font-semibold text-gray-900 mb-2">Đang tải nội dung...</p>
                    <p className="text-base text-gray-500">Vui lòng chờ trong giây lát.</p>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="pt-28 pb-12 bg-gray-100 min-h-screen flex flex-col items-center justify-center">
                <p className="text-red-500 text-lg mb-4">{error || 'Bài viết không tồn tại.'}</p>
                <button
                    onClick={() => navigate('/tin-tuc')}
                    className="px-6 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                >
                    ← Quay lại tin tức
                </button>
            </div>
        );
    }

    const formattedDate = new Date(post.createdAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    return (
        <div className="pt-25 pb-12 bg-gray-100 text-gray-800">
            <div className="max-w-5xl mx-auto px-4">
                {/* Header */}
                <article className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                    {post.thumbnail && (
                        <img src={post.thumbnail} alt={post.title} className="w-full h-60 md:h-72 object-cover" />
                    )}
                    <div className="p-3.5 md:p-6">
                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                            {post.category && (
                                <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
                                    {post.category}
                                </span>
                            )}
                            <span className="text-sm text-gray-500">{formattedDate}</span>
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                                <Eye size={14} /> {post.views ?? 0} lượt xem
                            </span>
                            {post._count && (
                                <span className="flex items-center gap-1 text-sm text-gray-500">
                                    <Heart size={14} /> {post._count.likes ?? 0}
                                </span>
                            )}
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 leading-tight">
                            {post.title}
                        </h1>

                        {post.excerpt && (
                            <p className="text-lg text-gray-600 border-l-4 border-red-500 pl-3 mb-4 italic">
                                {post.excerpt}
                            </p>
                        )}

                        {post.author && (
                            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
                                {post.author.avatar ? (
                                    <img
                                        src={post.author.avatar}
                                        alt={post.author.fullName}
                                        className="w-11 h-11 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm">
                                        {post.author.fullName?.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-gray-800 flex items-center gap-2">
                                        {post.author.fullName}
                                        {post.author.role === 'ADMIN' && (
                                            <span className="px-2 py-0.5 text-[11px] uppercase tracking-wider font-black text-white bg-red-600 rounded-full">
                                                Admin
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-sm text-gray-400">Tác giả</p>
                                </div>
                            </div>
                        )}

                        {/* Content — backend đã sanitize HTML */}
                        <div
                            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-red-600 prose-img:rounded-xl"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    </div>
                </article>

                {/* Related posts */}
                {related.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Bài viết <span className="text-red-600">liên quan</span>
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {related.map((item) => (
                                <Link
                                    key={item.id}
                                    to={`/tin-tuc/${item.slug}`}
                                    className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 overflow-hidden group"
                                >
                                    <img
                                        src={item.thumbnail || 'https://placehold.co/400x250?text=Sakae'}
                                        alt={item.title}
                                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="p-3.5 md:p-4">
                                        <p className="text-sm text-gray-400 mb-1">
                                            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                        </p>
                                        <h3 className="font-bold text-gray-800 text-base line-clamp-2 group-hover:text-red-600 transition-colors">
                                            {item.title}
                                        </h3>
                                        {item.excerpt && (
                                            <p className="text-base text-gray-500 mt-2 line-clamp-2">{item.excerpt}</p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Back button */}
                <div className="mt-10 text-center">
                    <Link
                        to="/tin-tuc"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                    >
                        ← Quay lại tin tức
                    </Link>
                </div>
            </div>

            <ScrollToTopButton />
        </div>
    );
};

export default NewsDetail;
