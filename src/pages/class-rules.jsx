import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiFilter, FiZoomIn, FiZoomOut, FiX, FiAward, FiBookOpen } from 'react-icons/fi';
import ScrollToTopButton from '../components/layout/ScrollToTopButton';
import SEO from '../hooks/useSEO';
import { ASSETS } from '../constants/assets';

const TABS = [
    {
        id: 'noi-quy',
        label: 'Nội quy',
        shortLabel: 'Nội quy',
        icon: FiBookOpen,
        image: ASSETS.CLASS_RULES.SAKAE_CLASS_RULES,
        title: 'Nội quy lớp học',
    },
    {
        id: 'khen-thuong',
        label: 'Khen thưởng',
        shortLabel: 'Khen thưởng',
        icon: FiAward,
        image: ASSETS.CLASS_RULES.SAKAE_AWARDS,
        title: 'Chính sách khen thưởng',
    },
];

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.25;
const TRANSITION_MS = 300;

const clampZoom = (value) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

const ImageLightbox = ({ isOpen, src, alt, onClose }) => {
    const [render, setRender] = useState(false);
    const [visible, setVisible] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (isOpen) {
            setRender(true);
            setZoom(1);
            setPan({ x: 0, y: 0 });
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setVisible(true));
            });
        } else {
            setVisible(false);
            const timer = setTimeout(() => setRender(false), TRANSITION_MS);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    }, [src]);

    useEffect(() => {
        if (!render) return undefined;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [render]);

    useEffect(() => {
        if (!render) return undefined;
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [render, onClose]);

    const handleZoomIn = useCallback((e) => {
        e?.stopPropagation();
        setZoom((prev) => clampZoom(prev + ZOOM_STEP));
    }, []);

    const handleZoomOut = useCallback((e) => {
        e?.stopPropagation();
        setZoom((prev) => {
            const next = clampZoom(prev - ZOOM_STEP);
            if (next === 1) setPan({ x: 0, y: 0 });
            return next;
        });
    }, []);

    const canPan = zoom !== 1;

    const onMouseDown = (e) => {
        if (!canPan || e.button !== 0) return;
        e.preventDefault();
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    };

    const onMouseMove = (e) => {
        if (!isDragging || !canPan) return;
        setPan({
            x: e.clientX - dragStartRef.current.x,
            y: e.clientY - dragStartRef.current.y,
        });
    };

    const onMouseUp = () => setIsDragging(false);

    const onTouchStart = (e) => {
        if (!canPan) return;
        setIsDragging(true);
        dragStartRef.current = {
            x: e.touches[0].clientX - pan.x,
            y: e.touches[0].clientY - pan.y,
        };
    };

    const onTouchMove = (e) => {
        if (!isDragging || !canPan) return;
        e.preventDefault();
        setPan({
            x: e.touches[0].clientX - dragStartRef.current.x,
            y: e.touches[0].clientY - dragStartRef.current.y,
        });
    };

    const onTouchEnd = () => setIsDragging(false);

    if (!render) return null;

    const zoomPercent = Math.round(zoom * 100);

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center sm:p-6 transition-opacity duration-300 ease-out ${
                visible ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={onClose}
        >
            <div
                className={`absolute inset-0 bg-black transition-opacity duration-300 ease-out ${
                    visible ? 'opacity-90' : 'opacity-0'
                }`}
            />

            {/* Top bar */}
            <div
                className={`absolute top-0 inset-x-0 z-20 flex items-center justify-between gap-3 px-3 sm:px-6 py-3 sm:py-4 transition-all duration-300 ease-out ${
                    visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                <p className="text-white/90 text-sm sm:text-base font-semibold truncate">{alt}</p>
                <button
                    onClick={onClose}
                    className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    aria-label="Đóng"
                >
                    <FiX size={22} />
                </button>
            </div>

            {/* Zoom controls */}
            <div
                className={`absolute bottom-4 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 transition-all duration-300 ease-out ${
                    visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={handleZoomOut}
                    disabled={zoom <= MIN_ZOOM}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    aria-label="Thu nhỏ"
                >
                    <FiZoomOut size={18} />
                </button>
                <span className="min-w-[52px] text-center text-xs sm:text-sm font-bold text-white tabular-nums">
                    {zoomPercent}%
                </span>
                <button
                    onClick={handleZoomIn}
                    disabled={zoom >= MAX_ZOOM}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    aria-label="Phóng to"
                >
                    <FiZoomIn size={18} />
                </button>
            </div>

            {/* Image stage */}
            <div
                className={`relative w-full max-w-8xl max-h-[90vh] sm:max-h-[80vh] flex items-center justify-center overflow-hidden transition-all duration-300 ease-out ${
                    visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                style={{ touchAction: canPan ? 'none' : 'auto' }}
            >
                <img
                    src={src}
                    alt={alt}
                    draggable={false}
                    className={`max-w-full max-h-[90vh] sm:max-h-[80vh] w-auto h-auto object-contain rounded-lg shadow-2xl select-none transition-transform duration-150 ease-out ${
                        canPan ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
                    }`}
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    }}
                />
            </div>

            {canPan && (
                <p
                    className={`absolute bottom-20 left-1/2 -translate-x-1/2 text-[13px] sm:text-sm text-white py-1 px-2 rounded-lg bg-gray-900 pointer-events-none transition-opacity duration-300 ${
                        visible ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    Kéo để di chuyển ảnh
                </p>
            )}
        </div>
    );
};

const ClassRule = () => {
    const [activeTab, setActiveTab] = useState('noi-quy');
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [imageError, setImageError] = useState(false);

    const current = TABS.find((t) => t.id === activeTab) ?? TABS[0];
    const TabIcon = current.icon;

    useEffect(() => {
        setImageError(false);
    }, [activeTab]);

    return (
        <div className="pt-25 pb-16 bg-gray-50 min-h-screen">
            <SEO page="classRules" />

            <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-4xl sm:text-4xl md:text-5xl font-black text-gray-800 tracking-tight mb-3">
                        NỘI QUY - <span className="text-red-600">KHEN THƯỞNG</span>
                    </h1>
                    <p className="text-gray-500 max-w-5xl md:text-lg mx-auto leading-relaxed px-2">
                        Tra cứu nội quy lớp học và chính sách khen thưởng dành cho học viên tại Trung tâm Nhật Ngữ Sakae
                        Thủ Đức.
                    </p>
                </div>

                {/* Filter */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-3 px-1">
                        <FiFilter size={14} />
                        Chọn nội dung xem
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center justify-center gap-2 px-3 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer ${
                                        isActive
                                            ? 'bg-red-600 text-white shadow-md shadow-red-100'
                                            : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                                    }`}
                                >
                                    <Icon size={18} className="flex-shrink-0" />
                                    <span>{tab.shortLabel}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Image viewer */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/80">
                        <p className="font-bold text-gray-700">{current.title}</p>
                    </div>

                    <div className="p-3 sm:p-5">
                        {imageError || !current.image ? (
                            <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center px-4">
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                    <TabIcon size={28} className="text-gray-300" />
                                </div>
                                <h3 className="text-base sm:text-2xl font-bold text-red-600 mb-1">
                                    Lỗi hiển thị hình ảnh
                                </h3>
                                <p className="text-gray-400 max-w-sm">
                                    Có thể ảnh bị lỗi hoặc không tồn tại trên hệ thống
                                </p>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setLightboxOpen(true)}
                                className="group relative w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-xl overflow-hidden"
                                aria-label={`Xem ảnh ${current.title}`}
                            >
                                <img
                                    src={current.image}
                                    alt={current.title}
                                    onError={() => setImageError(true)}
                                    className="w-full h-auto object-contain rounded-xl bg-gray-50 border border-gray-100 transition-transform duration-300 group-hover:scale-[1.01]"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 group-active:bg-black/10 transition-colors rounded-xl flex items-center justify-center">
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 text-gray-700 text-xs font-bold rounded-full shadow-sm">
                                        <FiZoomIn size={14} />
                                        Nhấn để phóng to
                                    </span>
                                </div>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {!imageError && current.image && (
                <ImageLightbox
                    isOpen={lightboxOpen}
                    src={current.image}
                    alt={current.title}
                    onClose={() => setLightboxOpen(false)}
                />
            )}

            <ScrollToTopButton />
        </div>
    );
};

export default ClassRule;
