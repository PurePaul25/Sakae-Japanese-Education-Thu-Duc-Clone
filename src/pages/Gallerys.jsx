import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ScrollToTopButton from '../components/layout/ScrollToTopButton';
import { FaSearchPlus, FaTimes, FaChevronLeft, FaChevronRight, FaDownload, FaSearchMinus } from 'react-icons/fa';
import SEO from '../hooks/useSEO';
import api from '../utils/api';

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
                src: item.imageUrl,
                date: new Date(item.createdAt).toLocaleDateString('vi-VN'),
                rawDate: new Date(item.createdAt),
                likesCount: item.likesCount || 0,
                commentsCount: item.commentsCount || 0,
                isLiked: item.isLiked || false,
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
    }, []);

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

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4">
                                        <h3 className="text-white font-bold text-lg leading-tight transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            {image.title}
                                        </h3>
                                        <div className="flex items-center justify-between transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                                            <span className="text-white/80 text-xs font-medium">{image.date}</span>
                                            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg">
                                                <FaSearchPlus size={18} />
                                            </div>
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
                    className="fixed inset-0 z-[200] bg-black/98 flex items-center justify-center animate-fadeIn select-none"
                    onClick={() => setSelectedImage(null)}
                >
                    {/* Header Controls */}
                    <div
                        className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-[220]"
                        onClick={(e) => e.stopPropagation()}
                    >
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
                                className="relative group w-11 h-11 flex items-center justify-center rounded-2xl bg-red-600 text-white hover:bg-red-700 transition-all shadow-xl shadow-red-900/40 cursor-pointer"
                            >
                                <FaTimes size={20} />
                                <span className="absolute top-full mt-2 right-0 origin-top-right scale-0 group-hover:scale-100 transition-all duration-150 bg-slate-950/95 backdrop-blur-2xl text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/10 whitespace-nowrap shadow-2xl pointer-events-none z-[230]">
                                    Đóng (Esc)
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <button
                        className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 w-13 h-13 flex items-center justify-center rounded-3xl bg-white/5 text-white hover:bg-red-600 transition-all z-[220] border border-white/10 cursor-pointer group backdrop-blur-md"
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePrev();
                        }}
                    >
                        <FaChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <button
                        className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 w-13 h-13 flex items-center justify-center rounded-3xl bg-white/5 text-white hover:bg-red-600 transition-all z-[220] border border-white/10 cursor-pointer group backdrop-blur-md"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleNext();
                        }}
                    >
                        <FaChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Image Area */}
                    <div
                        className="absolute inset-0 flex items-center justify-center p-4 md:p-16 touch-none overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
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
                                className="max-w-[85vw] max-h-[80vh] object-contain shadow-[0_0_80px_rgba(0,0,0,0.8)] rounded-lg pointer-events-none border border-white/5"
                            />
                        </div>
                    </div>

                    {/* Bottom Info Bar - Redesigned to be more balanced */}
                    <div
                        className="absolute bottom-0 left-0 right-0 p-8 md:px-8 md:py-6 flex flex-col items-center z-[220] bg-gradient-to-t from-black via-black/80 to-transparent"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center max-w-4xl animate-slideUp">
                            <h2 className="text-white w-full font-black text-xl md:text-3xl lg:text-4xl tracking-tight mb-2 drop-shadow-2xl max-w-5xl mx-auto leading-tight">
                                {selectedImage.title}
                            </h2>
                            <div className="flex items-center justify-center gap-3">
                                <span className="px-3 py-1 bg-red-600 text-white text-[11px] font-bold rounded-full uppercase tracking-[0.2em] shadow-lg shadow-red-900/40">
                                    {selectedImage.category}
                                </span>
                                <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                                <span className="text-white/50 text-xs font-bold uppercase tracking-[0.2em]">
                                    {selectedImage.date}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ScrollToTopButton />
        </div>
    );
};

export default Gallerys;
