import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import blogService from '../../services/blogService';

export default function NewsSection() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let ignore = false;

        const fetchFeaturedNews = async () => {
            try {
                const res = await blogService.getAll({ page: 1, limit: 3, sortBy: 'createdAt', sortOrder: 'desc' });
                const payload = res.data?.data ?? res.data;
                const items = Array.isArray(payload?.data) ? payload.data : [];
                const sorted = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                if (!ignore) {
                    setPosts(sorted.slice(0, 3));
                }
            } catch {
                if (!ignore) {
                    setPosts([]);
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        fetchFeaturedNews();
        return () => {
            ignore = true;
        };
    }, []);

    return (
        <section className="py-16 bg-gray-100">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
                <h2 className="text-4xl font-extrabold text-gray-800 mb-12 border-b-4 border-red-500 inline-block pb-1">
                    Tin tức & Sự kiện Nổi bật
                </h2>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="h-14 w-14 rounded-full border-4 border-red-600 border-t-transparent animate-spin mb-4" />
                        <p className="text-lg font-semibold text-gray-900">Đang tải bài viết...</p>
                        <p className="text-sm text-gray-500 mt-1">Vui lòng chờ trong giây lát.</p>
                    </div>
                ) : posts.length > 0 ? (
                    <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-8">
                        {posts.map((post) => (
                            <Link
                                key={post.id}
                                to={`/tin-tuc/${post.slug}`}
                                className="flex flex-col bg-white p-5 rounded-2xl shadow-lg border border-gray-100/50 hover:shadow-2xl hover:scale-[1.02] transition duration-300 ease-in-out"
                            >
                                <img
                                    src={post.thumbnail || 'https://placehold.co/600x400?text=Sakae+News'}
                                    alt={post.title}
                                    className="rounded-xl mb-5 aspect-video object-contain w-full bg-slate-50 p-2"
                                    onError={(e) => {
                                        e.target.src = 'https://placehold.co/600x400?text=Image+Not+Found';
                                    }}
                                />

                                <div className="flex-grow text-left">
                                    <h3 className="font-bold text-xl text-gray-900 mb-2 leading-snug line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-red-600 font-medium text-sm mb-4">
                                        <time dateTime={post.createdAt}>
                                            {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                                        </time>
                                    </p>
                                    <p className="text-gray-600 mb-4 text-base line-clamp-3">
                                        {post.excerpt || 'Đọc thêm bài viết này để cập nhật thông tin mới nhất từ Sakae.'}
                                    </p>
                                </div>

                                <span className="mt-auto inline-flex items-center justify-start text-red-600 font-semibold hover:text-red-700 transition duration-150 group">
                                    Xem chi tiết
                                    <span className="ml-1 text-lg transform group-hover:translate-x-1 transition duration-150">
                                        →
                                    </span>
                                </span>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-gray-200 bg-white p-8 text-gray-600">
                        Chưa có tin tức nào được đăng tải cho mục này.
                    </div>
                )}

                <div className="mt-12">
                    <Link
                        to="/tin-tuc"
                        className="bg-red-600 text-white font-bold py-3 px-8 rounded-full hover:bg-red-700 shadow-xl transition duration-300 transform hover:-translate-y-0.5"
                    >
                        Xem tất cả Tin tức
                    </Link>
                </div>
            </div>
        </section>
    );
}
