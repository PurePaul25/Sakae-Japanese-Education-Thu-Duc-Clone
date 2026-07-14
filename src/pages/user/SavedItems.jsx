import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { FiBookmark, FiImage, FiFileText, FiHeart, FiMessageCircle, FiEye, FiCalendar } from 'react-icons/fi';
import SEO from '../../hooks/useSEO';
import api from '../../utils/api';
import { useUser } from '../../contexts/UserContext';
import { useGalleryLightbox } from '../../hooks/useGalleryLightbox';
import GalleryLightbox from '../../components/gallery/GalleryLightbox';
import { getReactionEmoji, getReactionLabel } from '../../components/gallery/reactionUtils';

// ─── Loading spinner ──────────────────────────────────────────────────────────
const LoadingSpinner = ({ label }) => (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-gray-400 animate-pulse tracking-wider uppercase">{label}</p>
    </div>
);

// ─── Blog card ────────────────────────────────────────────────────────────────
const BlogCard = ({ post }) => {
    const navigate = useNavigate();
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            onClick={() => navigate(`/tin-tuc/${post.slug}`)}
            className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-red-100 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
        >
            {/* Thumbnail */}
            <div className="relative h-44 overflow-hidden bg-gray-100 flex-shrink-0">
                {post.thumbnail ? (
                    <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
                        <FiFileText size={40} className="text-red-200" />
                    </div>
                )}
                {post.category && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-red-600 text-white text-[10px] font-black rounded-full uppercase tracking-wider shadow">
                        {post.category}
                    </span>
                )}
                <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-sm px-2 py-0.5 rounded-full shadow font-bold border border-white/60">
                    {getReactionEmoji(post.userReaction)} {getReactionLabel(post.userReaction)}
                </span>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1 gap-2">
                <h3 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
                    {post.title}
                </h3>
                {post.excerpt && (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{post.excerpt}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-400 font-semibold mt-auto pt-2 border-t border-gray-50">
                    <span className="flex items-center gap-1">
                        <FiHeart size={11} className="text-red-400" />
                        {post.likesCount ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                        <FiMessageCircle size={11} />
                        {post.commentsCount ?? 0}
                    </span>
                    {post.views !== undefined && (
                        <span className="flex items-center gap-1">
                            <FiEye size={11} />
                            {post.views}
                        </span>
                    )}
                    <span className="ml-auto flex items-center gap-1">
                        <FiCalendar size={11} />
                        {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

// ─── Gallery card ─────────────────────────────────────────────────────────────
const GalleryCard = ({ post, onOpen }) => {
    const topReactions =
        post.topReactions?.length > 0 ? post.topReactions.slice(0, 2).map(getReactionEmoji) : ['🤍'];
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            onClick={() => onOpen(post)}
            className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-red-100 transition-all duration-300 overflow-hidden cursor-pointer"
        >
            <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                    src={post.src}
                    alt={post.title || 'Ảnh hoạt động'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />
                {post.category && (
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 bg-white/90 backdrop-blur-sm text-[10px] font-black text-slate-700 rounded-full uppercase tracking-widest shadow-sm">
                        {post.category}
                    </span>
                )}
                <div className="absolute bottom-2.5 right-2.5 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1 shadow text-xs font-bold">
                    {topReactions.map((emoji, i) => <span key={i}>{emoji}</span>)}
                    {post.likesCount > 0 && <span className="text-gray-600">{post.likesCount}</span>}
                </div>
            </div>
            <div className="p-3">
                <p className="font-bold text-gray-800 text-sm line-clamp-1 group-hover:text-red-600 transition-colors">
                    {post.title || 'Ảnh hoạt động'}
                </p>
                <div className="flex items-center justify-between mt-1 text-xs text-gray-400 font-semibold">
                    <span className="flex items-center gap-1">
                        <FiMessageCircle size={11} />
                        {post.commentsCount ?? 0}
                    </span>
                    <span>{post.date || new Date(post.rawDate).toLocaleDateString('vi-VN')}</span>
                </div>
            </div>
        </motion.div>
    );
};

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ tab }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
    >
        <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mb-4 shadow-inner">
            {tab === 'blogs' ? <FiFileText size={32} className="text-red-300" /> : <FiImage size={32} className="text-red-300" />}
        </div>
        <h3 className="text-lg font-black text-gray-700 mb-1">
            {tab === 'blogs' ? 'Chưa có bài viết đã lưu' : 'Chưa có ảnh đã thả tim'}
        </h3>
        <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
            {tab === 'blogs'
                ? 'Những bài viết bạn thả tim sẽ xuất hiện tại đây.'
                : 'Những bức ảnh bạn thả reaction sẽ xuất hiện tại đây.'}
        </p>
    </motion.div>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const SavedItems = () => {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState('blogs');

    // ── blog state ────────────────────────────────────────────────────────────
    const [blogs, setBlogs] = useState([]);
    const [loadingBlogs, setLoadingBlogs] = useState(false);
    const [fetchedBlogs, setFetchedBlogs] = useState(false);

    // ── gallery state — must be formatted for GalleryLightbox ─────────────────
    const [gallery, setGallery] = useState([]);
    const [loadingGallery, setLoadingGallery] = useState(false);
    const [fetchedGallery, setFetchedGallery] = useState(false);

    // ── lightbox (zoom/pan/comments/like — all wired up) ─────────────────────
    const {
        selectedImage, setSelectedImage,
        zoom, pan, isDragging,
        handleZoomIn, handleZoomOut,
        onMouseDown, onMouseMove, onMouseUp, onMouseLeave,
        onTouchStart, onTouchMove, onTouchEnd,
        handleNext, handlePrev,
        handleDownload, handleLike,
        comments, setComments, newComment, setNewComment, loadingComments,
        handleAddComment, handleDeleteComment,
    } = useGalleryLightbox(gallery, setGallery);

    // ── fetchers ──────────────────────────────────────────────────────────────
    const fetchBlogs = useCallback(async () => {
        if (fetchedBlogs) return;
        try {
            setLoadingBlogs(true);
            const res = await api.get('/users/saved/blogs');
            setBlogs(res.data?.data ?? res.data ?? []);
            setFetchedBlogs(true);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingBlogs(false);
        }
    }, [fetchedBlogs]);

    const fetchGallery = useCallback(async () => {
        if (fetchedGallery) return;
        try {
            setLoadingGallery(true);
            const res = await api.get('/users/saved/gallery');
            const raw = res.data?.data ?? res.data ?? [];
            // Normalize to the same shape GalleryLightbox expects
            setGallery(
                raw.map((item) => ({
                    id: item.id,
                    category: item.category || 'Chung',
                    title: item.title || 'Ảnh hoạt động',
                    caption: item.caption,
                    src: item.imageUrl,           // GalleryLightbox reads .src
                    date: new Date(item.createdAt).toLocaleDateString('vi-VN'),
                    rawDate: new Date(item.createdAt),
                    likesCount: item.likesCount || 0,
                    commentsCount: item.commentsCount || 0,
                    isLiked: item.isLiked ?? true,
                    userReaction: item.userReaction || null,
                    topReactions: item.topReactions || [],
                    createdBy: item.createdBy,
                })),
            );
            setFetchedGallery(true);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingGallery(false);
        }
    }, [fetchedGallery]);

    // Fetch on tab switch (lazy, one-shot per tab)
    useEffect(() => {
        if (activeTab === 'blogs') fetchBlogs();
        else fetchGallery();
    }, [activeTab, fetchBlogs, fetchGallery]);

    // ── derived ───────────────────────────────────────────────────────────────
    const isLoading = activeTab === 'blogs' ? loadingBlogs : loadingGallery;

    const tabs = [
        { id: 'blogs', label: 'Bài viết', icon: <FiFileText size={15} />, count: fetchedBlogs ? blogs.length : null },
        { id: 'gallery', label: 'Bộ sưu tập', icon: <FiImage size={15} />, count: fetchedGallery ? gallery.length : null },
    ];

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            <SEO page="savedItems" />

            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-200 flex-shrink-0">
                    <FiBookmark size={18} className="text-white" />
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight leading-tight">Đã lưu</h1>
                    <p className="text-sm text-gray-400 mt-0.5">Bài viết và ảnh bạn đã thích</p>
                </div>
            </div>

            {/* Tab bar */}
            <div className="flex gap-2 bg-gray-100/70 p-1 rounded-2xl w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                            activeTab === tab.id ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                        {tab.count !== null && (
                            <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-500'}`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="min-h-[300px]">
                {isLoading ? (
                    <LoadingSpinner label={activeTab === 'blogs' ? 'Đang tải bài viết...' : 'Đang tải ảnh...'} />
                ) : (
                    <AnimatePresence mode="wait">
                        {activeTab === 'blogs' ? (
                            blogs.length === 0 ? (
                                <EmptyState key="empty-blogs" tab="blogs" />
                            ) : (
                                <motion.div
                                    key="blogs"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                                >
                                    {blogs.map((post) => <BlogCard key={post.id} post={post} />)}
                                </motion.div>
                            )
                        ) : (
                            gallery.length === 0 ? (
                                <EmptyState key="empty-gallery" tab="gallery" />
                            ) : (
                                <motion.div
                                    key="gallery"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4"
                                >
                                    {gallery.map((post) => (
                                        <GalleryCard
                                            key={post.id}
                                            post={post}
                                            onOpen={setSelectedImage}
                                        />
                                    ))}
                                </motion.div>
                            )
                        )}
                    </AnimatePresence>
                )}
            </div>

            {/* GalleryLightbox — full-featured, same as the main gallery page */}
            <GalleryLightbox
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
                handleDownload={handleDownload}
                handleZoomOut={handleZoomOut}
                handleZoomIn={handleZoomIn}
                handlePrev={handlePrev}
                handleNext={handleNext}
                zoom={zoom}
                pan={pan}
                isDragging={isDragging}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseLeave}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                handleLike={handleLike}
                comments={comments}
                loadingComments={loadingComments}
                user={user}
                newComment={newComment}
                setNewComment={setNewComment}
                handleAddComment={handleAddComment}
                handleDeleteComment={handleDeleteComment}
                setComments={setComments}
            />
        </div>
    );
};

export default SavedItems;
