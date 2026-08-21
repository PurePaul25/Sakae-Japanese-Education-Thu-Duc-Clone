import React, { useState, useEffect, useMemo } from 'react';
import ScrollToTopButton from '../components/layout/ScrollToTopButton';
import { FaSearchPlus } from 'react-icons/fa';
import SEO from '../hooks/useSEO';
import api from '../utils/api';
import { useUser } from '../contexts/UserContext';
import { useGalleryLightbox } from '../hooks/useGalleryLightbox';

// Import modular components
import GalleryFilter from '../components/gallery/GalleryFilter';
import GalleryCard from '../components/gallery/GalleryCard';
import GalleryLightbox from '../components/gallery/GalleryLightbox';

const Gallerys = () => {
    const { user } = useUser();

    // Core gallery list states
    const [activeCategory, setActiveCategory] = useState('Tất cả');
    const [sortOrder, setSortOrder] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMonth, setSelectedMonth] = useState('Tất cả');
    const [selectedYear, setSelectedYear] = useState('Tất cả');
    const itemsPerPage = 12;

    const [loading, setLoading] = useState(true);
    const [galleryData, setGalleryData] = useState([]);

    // ── fetch ─────────────────────────────────────────────────────────────────
    function fetchGallery() {
        setLoading(true);
        api.get('/gallery')
            .then((response) => {
                const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
                setGalleryData(
                    data.map((item) => ({
                        id: item.id,
                        category: item.category || 'Chung',
                        title: item.title || 'Ảnh hoạt động',
                        caption: item.caption,
                        src: item.imageUrl,
                        date: new Date(item.createdAt).toLocaleDateString('vi-VN'),
                        rawDate: new Date(item.createdAt),
                        likesCount: item.likesCount || 0,
                        commentsCount: item.commentsCount || 0,
                        isLiked: item.isLiked || false,
                        userReaction: item.userReaction || null,
                        topReactions: item.topReactions || [],
                        createdBy: item.createdBy,
                    })),
                );
            })
            .catch((err) => console.error('Lỗi khi lấy dữ liệu bộ sưu tập:', err))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        fetchGallery();
    }, [user]);

    // ── lightbox (all zoom/pan/comments/like logic lives here) ───────────────
    const {
        selectedImage,
        setSelectedImage,
        zoom,
        pan,
        isDragging,
        handleZoomIn,
        handleZoomOut,
        onMouseDown,
        onMouseMove,
        onMouseUp,
        onMouseLeave,
        onTouchStart,
        onTouchMove,
        onTouchEnd,
        handleNext,
        handlePrev,
        handleDownload,
        handleLike,
        comments,
        setComments,
        newComment,
        setNewComment,
        loadingComments,
        handleAddComment,
        handleDeleteComment,
    } = useGalleryLightbox(galleryData, setGalleryData, fetchGallery);

    // ── filters & pagination ──────────────────────────────────────────────────
    const years = useMemo(
        () => [...new Set((galleryData || []).map((img) => new Date(img.rawDate).getFullYear()))].sort((a, b) => b - a),
        [galleryData],
    );

    const monthOptions = useMemo(
        () => [
            { label: 'Tháng (Tất cả)', value: 'Tất cả' },
            ...Array.from({ length: 12 }, (_, i) => ({ label: `Tháng ${i + 1}`, value: String(i + 1) })),
        ],
        [],
    );

    const yearOptions = useMemo(
        () => [
            { label: 'Năm (Tất cả)', value: 'Tất cả' },
            ...years.map((y) => ({ label: `Năm ${y}`, value: String(y) })),
        ],
        [years],
    );

    const filteredImages = useMemo(() => {
        let images = [...galleryData];
        if (activeCategory !== 'Tất cả') images = images.filter((i) => i.category === activeCategory);
        if (selectedMonth !== 'Tất cả')
            images = images.filter((i) => String(new Date(i.rawDate).getMonth() + 1) === selectedMonth);
        if (selectedYear !== 'Tất cả')
            images = images.filter((i) => String(new Date(i.rawDate).getFullYear()) === selectedYear);
        return images.sort((a, b) => (sortOrder === 'newest' ? b.rawDate - a.rawDate : a.rawDate - b.rawDate));
    }, [galleryData, activeCategory, selectedMonth, selectedYear, sortOrder]);

    const paginatedImages = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredImages.slice(start, start + itemsPerPage);
    }, [filteredImages, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredImages.length / itemsPerPage);

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <div className="pt-28 pb-16 bg-gray-50 min-h-screen">
            <SEO
                title="Bộ Sưu Tập Hoạt Động - Nhật Ngữ Sakae Thủ Đức"
                description="Hình ảnh ghi lại các hoạt động lớp học, lễ hội văn hóa, dã ngoại và khoảnh khắc đáng nhớ của học viên tại Trung tâm Nhật Ngữ Sakae Thủ Đức."
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section title */}
                <div className="text-center mb-4 md:mb-8">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">
                        BỘ SƯU TẬP <span className="text-red-600">HÌNH ẢNH</span>
                    </h1>
                    <p className="text-slate-600 mt-4 max-w-4xl mx-auto md:text-lg">
                        Ghi lại những khoảnh khắc đáng nhớ của các học viên và các hoạt động tại Trung tâm Nhật Ngữ
                        Sakae Thủ Đức.
                    </p>
                </div>

                {/* Filters */}
                <GalleryFilter
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                    selectedMonth={selectedMonth}
                    setSelectedMonth={setSelectedMonth}
                    selectedYear={selectedYear}
                    setSelectedYear={setSelectedYear}
                    monthOptions={monthOptions}
                    yearOptions={yearOptions}
                    setCurrentPage={setCurrentPage}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                />

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="w-12 h-12 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-500 font-medium">Đang tải những khoảnh khắc...</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                            {paginatedImages.map((image) => (
                                <GalleryCard
                                    key={image.id}
                                    image={image}
                                    handleLike={handleLike}
                                    setSelectedImage={setSelectedImage}
                                />
                            ))}
                        </div>

                        {filteredImages.length === 0 && (
                            <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-slate-100">
                                <div className="text-slate-300 mb-4">
                                    <FaSearchPlus size={48} className="mx-auto opacity-20" />
                                </div>
                                <h3 className="text-slate-800 font-bold text-xl">Không tìm thấy ảnh</h3>
                                <p className="text-slate-500 mt-2">Vui lòng thử chọn danh mục khác nhé!</p>
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center items-center gap-4">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
                                >
                                    ‹
                                </button>
                                <div className="flex gap-2">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-12 h-12 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                                                currentPage === i + 1
                                                    ? 'bg-red-600 text-white shadow-lg shadow-red-100'
                                                    : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
                                >
                                    ›
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Lightbox */}
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

            <ScrollToTopButton />
        </div>
    );
};

export default Gallerys;
