import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ScrollToTopButton from '../components/layout/ScrollToTopButton';
import { FaSearchPlus, FaTimes, FaChevronLeft, FaChevronRight, FaDownload, FaSearchMinus } from 'react-icons/fa';
import SEO from '../hooks/useSEO';
import api from '../utils/api';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';

const categories = ['Tất cả', 'Lễ hội', 'Lớp học', 'Giao lưu', 'Thiếu nhi', 'Sự kiện', 'Du học'];

const UserCustomSelect = ({ value, onChange, options, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => opt.value === value) || { label: placeholder, value };

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer text-slate-700 outline-none"
            >
                <span>{selectedOption.label}</span>
                <svg
                    className={`w-3.5 h-3.5 fill-current text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                >
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full mt-1.5 left-0 bg-white border border-slate-100 rounded-xl shadow-xl z-9999 max-h-56 overflow-y-auto py-1 min-w-[130px] animate-fadeIn">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                                onChange(opt.value);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs transition-all flex items-center justify-between
                                ${
                                    opt.value === value
                                        ? 'bg-red-50 text-red-600 font-bold'
                                        : 'text-slate-600 cursor-pointer hover:bg-slate-100'
                                }`}
                        >
                            <span>{opt.label}</span>
                            {opt.value === value && <div className="w-1 h-1 bg-red-600 rounded-full"></div>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const Gallerys = () => {
    const { user } = useUser();
    const { addToast } = useToast();
    const [activeCategory, setActiveCategory] = useState('Tất cả');
    const [sortOrder, setSortOrder] = useState('newest');
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMonth, setSelectedMonth] = useState('Tất cả');
    const [selectedYear, setSelectedYear] = useState('Tất cả');
    const itemsPerPage = 8;
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

    // Fetch comments when selectedImage is opened
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

    const handleLike = async (postId, e) => {
        if (e) e.stopPropagation();
        if (!user) {
            addToast('Vui lòng đăng nhập để thả tim bài viết!', 'warning');
            return;
        }

        try {
            // Optimistic UI update
            setGalleryData(prev => prev.map(post => {
                if (post.id === postId) {
                    const nextLiked = !post.isLiked;
                    return {
                        ...post,
                        isLiked: nextLiked,
                        likesCount: nextLiked ? post.likesCount + 1 : Math.max(0, post.likesCount - 1)
                    };
                }
                return post;
            }));

            // If selectedImage is currently open, update its state too
            if (selectedImage && selectedImage.id === postId) {
                setSelectedImage(prev => {
                    const nextLiked = !prev.isLiked;
                    return {
                        ...prev,
                        isLiked: nextLiked,
                        likesCount: nextLiked ? prev.likesCount + 1 : Math.max(0, prev.likesCount - 1)
                    };
                });
            }

            await api.post(`/gallery/${postId}/like`);
        } catch (error) {
            addToast(error.message || 'Lỗi khi thích bài viết', 'error');
            fetchGallery(); // Revert
        }
    };

    const handleAddComment = async (e) => {
        if (e) e.preventDefault();
        if (!newComment.trim()) return;

        if (!user) {
            addToast('Vui lòng đăng nhập để bình luận!', 'warning');
            return;
        }

        try {
            const tempComment = newComment;
            setNewComment(''); // Clear input immediately

            const response = await api.post(`/gallery/${selectedImage.id}/comments`, { content: tempComment });
            const addedComment = response.data?.data || response.data;
            
            // Add comment to list
            setComments(prev => [addedComment, ...prev]);

            // Update comments count in list
            setGalleryData(prev => prev.map(post => {
                if (post.id === selectedImage.id) {
                    return { ...post, commentsCount: post.commentsCount + 1 };
                }
                return post;
            }));
            
            if (selectedImage) {
                setSelectedImage(prev => ({
                    ...prev,
                    commentsCount: prev.commentsCount + 1
                }));
            }

            addToast('Đã gửi bình luận của bạn!', 'success');
        } catch (error) {
            addToast(error.message || 'Lỗi khi gửi bình luận', 'error');
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await api.delete(`/gallery/comments/${commentId}`);
            
            // Remove comment from state
            setComments(prev => prev.filter(c => c.id !== commentId));

            // Decrement comments count in lists
            setGalleryData(prev => prev.map(post => {
                if (post.id === selectedImage.id) {
                    return { ...post, commentsCount: Math.max(0, post.commentsCount - 1) };
                }
                return post;
            }));

            if (selectedImage) {
                setSelectedImage(prev => ({
                    ...prev,
                    commentsCount: Math.max(0, prev.commentsCount - 1)
                }));
            }

            addToast('Đã xóa bình luận!', 'success');
        } catch (error) {
            addToast(error.message || 'Lỗi khi xóa bình luận', 'error');
        }
    };

    const filteredImages = useMemo(() => {
        let images = [...galleryData];

        // 1. Filter by category
        if (activeCategory !== 'Tất cả') {
            images = images.filter((item) => item.category === activeCategory);
        }

        // 2. Filter by month
        if (selectedMonth !== 'Tất cả') {
            images = images.filter((item) => {
                const imgMonth = new Date(item.rawDate).getMonth() + 1;
                return String(imgMonth) === selectedMonth;
            });
        }

        // 3. Filter by year
        if (selectedYear !== 'Tất cả') {
            images = images.filter((item) => {
                const imgYear = new Date(item.rawDate).getFullYear();
                return String(imgYear) === selectedYear;
            });
        }

        // 4. Sort
        return images.sort((a, b) => {
            return sortOrder === 'newest' ? b.rawDate - a.rawDate : a.rawDate - b.rawDate;
        });
    }, [galleryData, activeCategory, selectedMonth, selectedYear, sortOrder]);

    const paginatedImages = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredImages.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredImages, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredImages.length / itemsPerPage);

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

    useEffect(() => {
        if (selectedImage) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [selectedImage]);

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
        } catch (error) {
            window.open(selectedImage.src, '_blank');
        }
    };

    return (
        <div className="pt-28 pb-16 bg-gray-50 min-h-screen">
            <SEO page="gallery" />
            <div className="container mx-auto px-4">
                <div className="text-center mb-4">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">
                        BỘ SƯU TẬP <span className="text-red-600">HÌNH ẢNH</span>
                    </h1>
                    <p className="text-slate-600 mt-4 max-w-3xl mx-auto md:text-lg">
                        Ghi lại những khoảnh khắc đáng nhớ của các học viên và các hoạt động tại Sakae Academy.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 w-full">
                    <div className="w-full md:w-auto overflow-hidden">
                        <style
                            dangerouslySetInnerHTML={{
                                __html: `
                            .categories-scrollbar::-webkit-scrollbar {
                                height: 6px;
                            }
                            .categories-scrollbar::-webkit-scrollbar-track {
                                background: #f1f5f9;
                                border-radius: 9999px;
                            }
                            .categories-scrollbar::-webkit-scrollbar-thumb {
                                background: #ef4444; 
                                border-radius: 9999px;
                            }
                            .categories-scrollbar::-webkit-scrollbar-thumb:hover {
                                background: #dc2626; 
                            }
                        `,
                            }}
                        />
                        <div className="categories-scrollbar flex overflow-x-auto md:flex-wrap gap-2 pb-3 pt-2 md:pb-0 w-full md:w-auto justify-start md:justify-center whitespace-nowrap scroll-smooth">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => {
                                        setActiveCategory(category);
                                        setCurrentPage(1);
                                    }}
                                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex-shrink-0 cursor-pointer ${
                                        activeCategory === category
                                            ? 'bg-red-600 text-white shadow-md shadow-red-200 -translate-y-1'
                                            : 'bg-white text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                        <UserCustomSelect
                            value={selectedMonth}
                            onChange={(val) => {
                                setSelectedMonth(val);
                                setCurrentPage(1);
                            }}
                            options={monthOptions}
                            placeholder="Tháng (Tất cả)"
                        />

                        <UserCustomSelect
                            value={selectedYear}
                            onChange={(val) => {
                                setSelectedYear(val);
                                setCurrentPage(1);
                            }}
                            options={yearOptions}
                            placeholder="Năm (Tất cả)"
                        />

                        <div className="w-px h-5 bg-slate-200 hidden sm:block"></div>

                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setSortOrder('newest')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                    sortOrder === 'newest'
                                        ? 'bg-slate-800 text-white'
                                        : 'text-slate-500 cursor-pointer hover:bg-slate-50'
                                }`}
                            >
                                MỚI NHẤT
                            </button>
                            <button
                                onClick={() => setSortOrder('oldest')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                    sortOrder === 'oldest'
                                        ? 'bg-slate-800 text-white'
                                        : 'text-slate-500 cursor-pointer hover:bg-slate-50'
                                }`}
                            >
                                CŨ NHẤT
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="w-12 h-12 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-500 font-medium">Đang tải những khoảnh khắc...</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {paginatedImages.map((image) => (
                                <div
                                    key={image.id}
                                    className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer border border-slate-100"
                                    onClick={() => setSelectedImage(image)}
                                >
                                    <div className="aspect-[4/4.5] overflow-hidden">
                                        <img
                                            src={image.src}
                                            alt={image.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>

                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[10px] font-black text-slate-800 rounded-full uppercase tracking-widest shadow-sm">
                                            {image.category}
                                        </span>
                                    </div>

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-5">
                                        <span className="px-2.5 py-0.5 bg-red-600 text-white text-[9px] font-black rounded-full uppercase tracking-wider self-start mb-2">
                                            {image.category}
                                        </span>
                                        <h3 className="text-white font-bold text-base leading-tight transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 mb-3">
                                            {image.title}
                                        </h3>
                                        <div className="flex items-center justify-between border-t border-white/10 pt-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={(e) => handleLike(image.id, e)}
                                                    className="flex items-center gap-1 text-white hover:text-red-500 transition-colors focus:outline-none"
                                                >
                                                    <span className={`text-base ${image.isLiked ? 'text-red-500' : ''}`}>❤️</span>
                                                    <span className="text-xs font-black">{image.likesCount}</span>
                                                </button>
                                                <div className="flex items-center gap-1 text-white">
                                                    <span className="text-base">💬</span>
                                                    <span className="text-xs font-black">{image.commentsCount}</span>
                                                </div>
                                            </div>
                                            <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider">{image.date}</span>
                                        </div>
                                    </div>
                                </div>
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
                            <div className="mt-16 flex justify-center items-center gap-4">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"
                                >
                                    <FaChevronLeft />
                                </button>
                                <div className="flex gap-2">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-12 h-12 rounded-2xl text-sm font-bold transition-all ${
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
                                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"
                                >
                                    <FaChevronRight />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {selectedImage && (
                <div
                    className="fixed inset-0 z-[200] bg-slate-950/98 backdrop-blur-md flex flex-col lg:flex-row animate-fadeIn"
                    onClick={() => setSelectedImage(null)}
                >
                    {/* Left Column - Image Viewer */}
                    <div 
                        className="relative flex-1 bg-black flex items-center justify-center min-h-[50vh] lg:min-h-0 select-none overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Controls */}
                        <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-[220]">
                            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-2xl rounded-2xl p-1 border border-white/10">
                                <button
                                    onClick={handleZoomOut}
                                    className="relative group w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                                >
                                    <FaSearchMinus size={16} />
                                    <span className="absolute top-full mt-2 left-0 origin-top-left scale-0 group-hover:scale-100 transition-all duration-150 bg-slate-950/95 backdrop-blur-2xl text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/10 whitespace-nowrap shadow-2xl pointer-events-none z-[230]">
                                        Thu nhỏ
                                    </span>
                                </button>
                                <div className="px-2 min-w-[60px] text-center border-x border-white/10">
                                    <span className="text-white text-sm font-black tracking-widest">
                                        {Math.round(zoom * 100)}%
                                    </span>
                                </div>
                                <button
                                    onClick={handleZoomIn}
                                    className="relative group w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                                >
                                    <FaSearchPlus size={16} />
                                    <span className="absolute top-full mt-2 right-0 origin-top-right scale-0 group-hover:scale-100 transition-all duration-150 bg-slate-950/95 backdrop-blur-2xl text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/10 whitespace-nowrap shadow-2xl pointer-events-none z-[230]">
                                        Phóng to
                                    </span>
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleDownload}
                                    className="relative group w-11 h-11 flex items-center justify-center rounded-2xl bg-white/5 text-white hover:bg-white/10 transition-all cursor-pointer border border-white/10"
                                >
                                    <FaDownload size={18} />
                                    <span className="absolute top-full mt-2 right-0 origin-top-right scale-0 group-hover:scale-100 transition-all duration-150 bg-slate-950/95 backdrop-blur-2xl text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/10 whitespace-nowrap shadow-2xl pointer-events-none z-[230]">
                                        Tải ảnh về
                                    </span>
                                </button>
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="relative group w-11 h-11 flex items-center justify-center rounded-2xl bg-red-600 text-white hover:bg-red-700 transition-all shadow-xl shadow-red-900/40 cursor-pointer lg:hidden"
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <button
                            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-2xl bg-white/5 text-white hover:bg-red-600 transition-all z-[220] border border-white/10 cursor-pointer group backdrop-blur-md"
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePrev();
                            }}
                        >
                            <FaChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <button
                            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-2xl bg-white/5 text-white hover:bg-red-600 transition-all z-[220] border border-white/10 cursor-pointer group backdrop-blur-md"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleNext();
                            }}
                        >
                            <FaChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>

                        {/* Image Container */}
                        <div
                            className="absolute inset-0 flex items-center justify-center p-4 md:p-12 touch-none overflow-hidden"
                            onMouseDown={onMouseDown}
                            onMouseMove={onMouseMove}
                            onMouseUp={onMouseUp}
                            onMouseLeave={onMouseLeave}
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                        >
                            <div
                                style={{
                                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                                    transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                                    cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                                }}
                                className="flex items-center justify-center"
                            >
                                <img
                                    key={selectedImage.id}
                                    src={selectedImage.src}
                                    alt={selectedImage.title}
                                    className="max-w-[90vw] lg:max-w-[60vw] max-h-[75vh] object-contain shadow-2xl rounded-lg pointer-events-none border border-white/5"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Comments and Details Sidebar */}
                    <div 
                        className="w-full lg:w-[400px] xl:w-[440px] bg-white h-[50vh] lg:h-full flex flex-col border-t lg:border-t-0 lg:border-l border-slate-100 shadow-2xl relative z-[220] animate-slideLeft"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button for desktop layout */}
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-slate-100 hover:bg-red-500 hover:text-white text-slate-500 flex items-center justify-center transition-all cursor-pointer hidden lg:flex shadow-sm"
                            title="Đóng (Esc)"
                        >
                            <FaTimes size={14} />
                        </button>

                        {/* Post Creator / Header */}
                        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                                <img 
                                    src={selectedImage.createdBy?.avatar || "https://res.cloudinary.com/sakae-academy/image/upload/v1715617260/sakae-academy/users/sakae-default-user-avatar.png"} 
                                    alt={selectedImage.createdBy?.fullName || "Trung tâm Sakae"} 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="font-extrabold text-sm text-slate-800 leading-tight truncate">
                                    {selectedImage.createdBy?.fullName || "Trung tâm Sakae"}
                                </h4>
                                <span className="text-[10px] font-black text-red-600 tracking-widest uppercase">
                                    Ban Quản Trị
                                </span>
                            </div>
                            <span className="px-2.5 py-0.5 bg-red-50 text-red-600 text-[9px] font-black rounded-full uppercase tracking-wider flex-shrink-0 mr-8 lg:mr-0">
                                {selectedImage.category}
                            </span>
                        </div>

                        {/* Caption details */}
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50 max-h-[140px] overflow-y-auto">
                            <h2 className="font-extrabold text-sm text-slate-800 leading-snug mb-1">
                                {selectedImage.title}
                            </h2>
                            <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                                {selectedImage.caption || "Hình ảnh ghi lại khoảnh khắc hoạt động vô cùng thú vị của thầy và trò tại Nhật Ngữ Sakae."}
                            </p>
                            <span className="text-[9px] text-slate-400 font-extrabold block mt-2 tracking-wider">
                                ĐĂNG NGÀY: {selectedImage.date}
                            </span>
                        </div>

                        {/* Comments feed block */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white scrollbar-thin">
                            <h3 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest">
                                Bình luận ({comments.length})
                            </h3>
                            {loadingComments ? (
                                <div className="flex flex-col items-center justify-center py-10">
                                    <div className="w-6 h-6 border-2 border-slate-200 border-t-red-600 rounded-full animate-spin mb-2"></div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Đang tải...</span>
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-center py-12">
                                    <span className="text-2xl block mb-1">💬</span>
                                    <span className="text-xs text-slate-400">Chưa có bình luận nào. Hãy là người đầu tiên!</span>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-2.5 items-start group/comment bg-slate-50 p-2.5 rounded-2xl border border-slate-100/50 hover:border-slate-200 transition-all duration-300">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                                                <img 
                                                    src={comment.user?.avatar || "https://res.cloudinary.com/sakae-academy/image/upload/v1715617260/sakae-academy/users/sakae-default-user-avatar.png"} 
                                                    alt={comment.user?.fullName} 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-bold text-xs text-slate-700 truncate">
                                                        {comment.user?.fullName}
                                                    </span>
                                                    <span className="text-[9px] text-slate-400 flex-shrink-0">
                                                        {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed break-words pr-2">
                                                    {comment.content}
                                                </p>
                                            </div>
                                            {(user?.id === comment.userId || user?.role === 'ADMIN') && (
                                                <button 
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    className="opacity-0 group-hover/comment:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1 cursor-pointer"
                                                    title="Xóa bình luận"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Interactive panel */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={(e) => handleLike(selectedImage.id, e)}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer ${
                                        selectedImage.isLiked 
                                            ? 'bg-red-50 text-red-600 border border-red-200' 
                                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    <span>{selectedImage.isLiked ? '❤️ Đã thích' : '🤍 Thích'}</span>
                                    <span className="font-extrabold">{selectedImage.likesCount}</span>
                                </button>
                                <span className="text-xs text-slate-500 font-bold">
                                    💬 {selectedImage.commentsCount} bình luận
                                </span>
                            </div>
                        </div>

                        {/* Write Comment Box */}
                        <div className="p-3 border-t border-slate-100 bg-white sticky bottom-0 z-50">
                            {user ? (
                                <form onSubmit={handleAddComment} className="flex gap-2">
                                    <input 
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Viết bình luận công khai..."
                                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 text-xs transition-all"
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!newComment.trim()}
                                        className={`px-4 py-2 cursor-pointer font-bold text-xs rounded-xl text-white transition-all shadow-sm ${
                                            newComment.trim() 
                                                ? 'bg-red-600 hover:bg-red-500 shadow-red-100' 
                                                : 'bg-gray-300 cursor-not-allowed'
                                        }`}
                                    >
                                        Gửi
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center py-2 bg-slate-50 rounded-xl border border-slate-200/50">
                                    <span className="text-xs text-slate-500">
                                        Vui lòng{' '}
                                        <button 
                                            onClick={() => window.location.href = '/dang-nhap'}
                                            className="text-red-600 font-bold hover:underline cursor-pointer bg-transparent border-none outline-none"
                                        >
                                            đăng nhập
                                        </button>{' '}
                                        để thích & bình luận!
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <ScrollToTopButton />
        </div>
    );
};

export default Gallerys;
