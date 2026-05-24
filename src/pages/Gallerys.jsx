import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ScrollToTopButton from '../components/layout/ScrollToTopButton';
import { FaSearchPlus } from 'react-icons/fa';
import SEO from '../hooks/useSEO';
import api from '../utils/api';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';

// Import modular components
import GalleryFilter from '../components/gallery/GalleryFilter';
import GalleryCard from '../components/gallery/GalleryCard';
import GalleryLightbox from '../components/gallery/GalleryLightbox';

const Gallerys = () => {
    const { user } = useUser();
    const { addToast } = useToast();

    // Core gallery list states
    const [activeCategory, setActiveCategory] = useState('Tất cả');
    const [sortOrder, setSortOrder] = useState('newest');
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMonth, setSelectedMonth] = useState('Tất cả');
    const [selectedYear, setSelectedYear] = useState('Tất cả');
    const itemsPerPage = 12;

    // Zoom and pan states for lightbox
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const [loading, setLoading] = useState(true);
    const [galleryData, setGalleryData] = useState([]);
    const touchStartX = useRef(null);
    const touchEndX = useRef(null);

    // Comments states
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);

    // Month & year computation
    const years = useMemo(() => {
        return [...new Set((galleryData || []).map((img) => new Date(img.rawDate).getFullYear()))].sort(
            (a, b) => b - a,
        );
    }, [galleryData]);

    const monthOptions = useMemo(
        () => [
            { label: 'Tháng (Tất cả)', value: 'Tất cả' },
            ...Array.from({ length: 12 }, (_, i) => ({
                label: `Tháng ${i + 1}`,
                value: String(i + 1),
            })),
        ],
        [],
    );

    const yearOptions = useMemo(
        () => [
            { label: 'Năm (Tất cả)', value: 'Tất cả' },
            ...years.map((y) => ({
                label: `Năm ${y}`,
                value: String(y),
            })),
        ],
        [years],
    );

    // Fetch API handler
    const fetchGallery = async () => {
        try {
            setLoading(true);
            const response = await api.get('/gallery');
            const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
            const formattedData = data.map((item) => ({
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
            }));
            setGalleryData(formattedData);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu bộ sưu tập:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGallery();
    }, [user]);

    // Fetch post details / comments when selectedImage is opened
    useEffect(() => {
        if (!selectedImage) {
            setComments([]);
            return;
        }

        const fetchPostDetails = async () => {
            try {
                setLoadingComments(true);
                const response = await api.get(`/gallery/${selectedImage.id}`);
                const data = response.data?.data || response.data || {};
                setComments(data.comments || []);
            } catch (error) {
                console.error('Lỗi khi lấy bình luận:', error);
            } finally {
                setLoadingComments(false);
            }
        };

        fetchPostDetails();
    }, [selectedImage]);

    // Likes trigger API with Optimistic UI updates
    const handleLike = async (postId, e, reactionType = 'LIKE') => {
        if (e) e.stopPropagation();
        if (!user) {
            addToast('Vui lòng đăng nhập để thả tim bài viết!', 'warning');
            return;
        }

        try {
            // Optimistic UI updates
            setGalleryData((prev) =>
                prev.map((post) => {
                    if (post.id === postId) {
                        const isRemoving = post.isLiked && post.userReaction === reactionType;
                        const isChanging = post.isLiked && post.userReaction !== reactionType;
                        const nextLiked = !isRemoving;
                        const nextLikesCount = isRemoving
                            ? Math.max(0, post.likesCount - 1)
                            : !post.isLiked
                              ? post.likesCount + 1
                              : post.likesCount;

                        let newTopReactions = post.topReactions ? [...post.topReactions] : [];

                        if (isRemoving) {
                            if (nextLikesCount === 0) newTopReactions = [];
                        } else if (isChanging) {
                            if (nextLikesCount <= 1) {
                                newTopReactions = [reactionType];
                            } else {
                                newTopReactions = [
                                    reactionType,
                                    ...newTopReactions.filter((r) => r !== post.userReaction),
                                ].slice(0, 2);
                            }
                        } else if (nextLiked) {
                            if (!newTopReactions.includes(reactionType)) {
                                newTopReactions = [reactionType, ...newTopReactions].slice(0, 2);
                            }
                        }

                        return {
                            ...post,
                            isLiked: nextLiked,
                            userReaction: nextLiked ? reactionType : null,
                            likesCount: nextLikesCount,
                            topReactions: newTopReactions,
                        };
                    }
                    return post;
                }),
            );

            if (selectedImage && selectedImage.id === postId) {
                setSelectedImage((prev) => {
                    const isRemoving = prev.isLiked && prev.userReaction === reactionType;
                    const isChanging = prev.isLiked && prev.userReaction !== reactionType;
                    const nextLiked = !isRemoving;
                    const nextLikesCount = isRemoving
                        ? Math.max(0, prev.likesCount - 1)
                        : !prev.isLiked
                          ? prev.likesCount + 1
                          : prev.likesCount;

                    let newTopReactions = prev.topReactions ? [...prev.topReactions] : [];

                    if (isRemoving) {
                        if (nextLikesCount === 0) newTopReactions = [];
                    } else if (isChanging) {
                        if (nextLikesCount <= 1) {
                            newTopReactions = [reactionType];
                        } else {
                            newTopReactions = [
                                reactionType,
                                ...newTopReactions.filter((r) => r !== prev.userReaction),
                            ].slice(0, 2);
                        }
                    } else if (nextLiked) {
                        if (!newTopReactions.includes(reactionType)) {
                            newTopReactions = [reactionType, ...newTopReactions].slice(0, 2);
                        }
                    }

                    return {
                        ...prev,
                        isLiked: nextLiked,
                        userReaction: nextLiked ? reactionType : null,
                        likesCount: nextLikesCount,
                        topReactions: newTopReactions,
                    };
                });
            }

            await api.post(`/gallery/${postId}/like`, { reaction: reactionType });
        } catch (error) {
            addToast(error.message || 'Lỗi khi thích bài viết', 'error');
            fetchGallery(); // Revert on failure
        }
    };

    // Add comment handler
    const handleAddComment = async (e) => {
        if (e) e.preventDefault();
        if (!newComment.trim()) return;

        if (!user) {
            addToast('Vui lòng đăng nhập để bình luận!', 'warning');
            return;
        }

        try {
            const tempComment = newComment;
            setNewComment(''); // Clear input instantly

            const response = await api.post(`/gallery/${selectedImage.id}/comments`, { content: tempComment });
            const addedComment = response.data?.data || response.data;

            setComments((prev) => [addedComment, ...prev]);

            // Sync comments count in main list
            setGalleryData((prev) =>
                prev.map((post) => {
                    if (post.id === selectedImage.id) {
                        return { ...post, commentsCount: post.commentsCount + 1 };
                    }
                    return post;
                }),
            );

            if (selectedImage) {
                setSelectedImage((prev) => ({
                    ...prev,
                    commentsCount: prev.commentsCount + 1,
                }));
            }

            addToast('Đã gửi bình luận của bạn!', 'success');
        } catch (error) {
            addToast(error.message || 'Lỗi khi gửi bình luận', 'error');
        }
    };

    // Delete comment handler
    const handleDeleteComment = async (commentId) => {
        try {
            await api.delete(`/gallery/comments/${commentId}`);

            setComments((prev) => prev.filter((c) => c.id !== commentId));

            // Sync comments count in list
            setGalleryData((prev) =>
                prev.map((post) => {
                    if (post.id === selectedImage.id) {
                        return { ...post, commentsCount: Math.max(0, post.commentsCount - 1) };
                    }
                    return post;
                }),
            );

            if (selectedImage) {
                setSelectedImage((prev) => ({
                    ...prev,
                    commentsCount: Math.max(0, prev.commentsCount - 1),
                }));
            }

            addToast('Đã xóa bình luận!', 'success');
        } catch (error) {
            addToast(error.message || 'Lỗi khi xóa bình luận', 'error');
        }
    };

    // Filters and sorting computations
    const filteredImages = useMemo(() => {
        let images = [...galleryData];

        if (activeCategory !== 'Tất cả') {
            images = images.filter((item) => item.category === activeCategory);
        }

        if (selectedMonth !== 'Tất cả') {
            images = images.filter((item) => {
                const imgMonth = new Date(item.rawDate).getMonth() + 1;
                return String(imgMonth) === selectedMonth;
            });
        }

        if (selectedYear !== 'Tất cả') {
            images = images.filter((item) => {
                const imgYear = new Date(item.rawDate).getFullYear();
                return String(imgYear) === selectedYear;
            });
        }

        return images.sort((a, b) => {
            return sortOrder === 'newest' ? b.rawDate - a.rawDate : a.rawDate - b.rawDate;
        });
    }, [galleryData, activeCategory, selectedMonth, selectedYear, sortOrder]);

    const paginatedImages = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredImages.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredImages, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredImages.length / itemsPerPage);

    // Slide navigation actions
    const handleNext = useCallback(() => {
        const currentIndex = galleryData.findIndex((img) => img.id === selectedImage?.id);
        if (currentIndex < galleryData.length - 1) {
            setSelectedImage(galleryData[currentIndex + 1]);
        } else {
            setSelectedImage(galleryData[0]);
        }
    }, [galleryData, selectedImage]);

    const handlePrev = useCallback(() => {
        const currentIndex = galleryData.findIndex((img) => img.id === selectedImage?.id);
        if (currentIndex > 0) {
            setSelectedImage(galleryData[currentIndex - 1]);
        } else {
            setSelectedImage(galleryData[galleryData.length - 1]);
        }
    }, [galleryData, selectedImage]);

    // Lightbox Hotkeys
    useEffect(() => {
        if (!selectedImage) return;
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') setSelectedImage(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedImage, handleNext, handlePrev]);

    useEffect(() => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    }, [selectedImage]);

    // Prevent body scrolling when overlay is active
    useEffect(() => {
        if (selectedImage) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedImage]);

    // Zoom handlers
    const handleZoomIn = (e) => {
        if (e) e.stopPropagation();
        setZoom((prev) => Math.min(prev + 0.25, 4));
    };

    const handleZoomOut = (e) => {
        if (e) e.stopPropagation();
        setZoom((prev) => {
            const newZoom = Math.max(prev - 0.25, 1);
            if (newZoom === 1) setPan({ x: 0, y: 0 });
            return newZoom;
        });
    };

    // Drag-to-pan handlers
    const onMouseDown = (e) => {
        if (zoom <= 1) return;
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    };

    const onMouseMove = (e) => {
        if (!isDragging || zoom <= 1) return;
        setPan({
            x: e.clientX - dragStartRef.current.x,
            y: e.clientY - dragStartRef.current.y,
        });
    };

    const onMouseUp = () => setIsDragging(false);
    const onMouseLeave = () => setIsDragging(false);

    // Touch swipe navigation and dragging
    const onTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        if (zoom > 1) {
            setIsDragging(true);
            dragStartRef.current = { x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y };
        }
    };

    const onTouchMove = (e) => {
        touchEndX.current = e.touches[0].clientX;
        if (isDragging && zoom > 1) {
            setPan({
                x: e.touches[0].clientX - dragStartRef.current.x,
                y: e.touches[0].clientY - dragStartRef.current.y,
            });
        }
    };

    const onTouchEnd = () => {
        setIsDragging(false);
        if (!touchStartX.current || !touchEndX.current) return;
        const distance = touchStartX.current - touchEndX.current;
        if (zoom === 1) {
            if (distance > 50) handleNext();
            if (distance < -50) handlePrev();
        }
        touchStartX.current = null;
        touchEndX.current = null;
    };

    // Image Downloader trigger
    const handleDownload = async (e) => {
        e.stopPropagation();
        if (!selectedImage) return;
        try {
            const response = await fetch(selectedImage.src);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const extension = selectedImage.src.split('.').pop().split('?')[0] || 'jpg';
            link.download = `${selectedImage.title}.${extension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch {
            window.open(selectedImage.src, '_blank');
        }
    };

    return (
        <div className="pt-28 pb-16 bg-gray-50 min-h-screen">
            <SEO
                title="Bộ Sưu Tập Hoạt Động - Nhật Ngữ Sakae Thủ Đức"
                description="Hình ảnh ghi lại các hoạt động lớp học, lễ hội văn hóa, dã ngoại và khoảnh khắc đáng nhớ của học viên tại Trung tâm Nhật Ngữ Sakae Thủ Đức."
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section title header */}
                <div className="text-center mb-4 md:mb-8">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">
                        BỘ SƯU TẬP <span className="text-red-600">HÌNH ẢNH</span>
                    </h1>
                    <p className="text-slate-600 mt-4 max-w-4xl mx-auto md:text-lg">
                        Ghi lại những khoảnh khắc đáng nhớ của các học viên và các hoạt động tại Trung tâm Nhật Ngữ
                        Sakae Thủ Đức.
                    </p>
                </div>

                {/* Filter Sub-container */}
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
                        {/* Gallery Grid items mapping */}
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

                        {/* Blank search state */}
                        {filteredImages.length === 0 && (
                            <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-slate-100">
                                <div className="text-slate-300 mb-4">
                                    <FaSearchPlus size={48} className="mx-auto opacity-20" />
                                </div>
                                <h3 className="text-slate-800 font-bold text-xl">Không tìm thấy ảnh</h3>
                                <p className="text-slate-500 mt-2">Vui lòng thử chọn danh mục khác nhé!</p>
                            </div>
                        )}

                        {/* Pagination Sub-controls */}
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

            {/* Modular Lightbox Overlay Component */}
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
