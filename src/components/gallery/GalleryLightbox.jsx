import React, { useState, useEffect, useRef } from 'react';
import {
    FaSearchPlus,
    FaTimes,
    FaChevronLeft,
    FaChevronRight,
    FaDownload,
    FaSearchMinus,
    FaEllipsisH,
} from 'react-icons/fa';
import LightboxBottomSheet from './LightboxBottomSheet';
import ReactionPicker from './ReactionPicker';
import { getReactionEmoji, getReactionLabel, REACTIONS } from './reactionUtils';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import UserLink from '../ui/UserLink';

const GalleryLightbox = ({
    selectedImage,
    setSelectedImage,
    handleDownload,
    handleZoomOut,
    handleZoomIn,
    handlePrev,
    handleNext,
    zoom,
    pan,
    isDragging,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    handleLike,
    comments,
    loadingComments,
    user,
    newComment,
    setNewComment,
    handleAddComment,
    handleDeleteComment,
    setComments,
}) => {
    const { addToast } = useToast();
    const commentInputRef = useRef(null);
    const [isMobileCommentOpen, setIsMobileCommentOpen] = useState(false);

    // Desktop comment action states
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingContent, setEditingContent] = useState('');
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
    const confirmModalDuration = 300; // ms

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditingLoading, setIsEditingLoading] = useState(false);

    // Description expand/collapse states
    const [isDescExpanded, setIsDescExpanded] = useState(false);

    const [openLikesModal, setOpenLikesModal] = useState(false);
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [likedUsers, setLikedUsers] = useState([]);
    const [loadingLikes, setLoadingLikes] = useState(false);
    const [activeLikeTab, setActiveLikeTab] = useState('ALL');
    const likesModalDuration = 300; // ms

    const [showDesktopPicker, setShowDesktopPicker] = useState(false);
    const [showMobilePicker, setShowMobilePicker] = useState(false);
    const pressTimer = useRef(null);

    useEffect(() => {
        const handleClickOutside = () => {
            setShowMobilePicker(false);
            setShowDesktopPicker(false);
        };
        if (showMobilePicker || showDesktopPicker) {
            document.addEventListener('click', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }
        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [showMobilePicker, showDesktopPicker]);

    const handlePressStart = () => {
        pressTimer.current = setTimeout(() => setShowMobilePicker(true), 800);
    };

    const handlePressEnd = () => {
        if (pressTimer.current) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
        }
    };

    const handleSelectReaction = (type) => {
        setShowDesktopPicker(false);
        setShowMobilePicker(false);
        handleLike(selectedImage.id, null, type);
    };

    const topReactionEmojis =
        selectedImage?.topReactions && selectedImage.topReactions.length > 0
            ? selectedImage.topReactions.slice(0, 2).map(getReactionEmoji)
            : ['🤍'];

    const handleOpenLikesModal = async (imageId) => {
        // Show modal immediately so users see feedback, then load list async
        setOpenLikesModal(true);
        setShowLikesModal(true);
        setLoadingLikes(true);
        try {
            const response = await api.get(`/gallery/${imageId}/likes`);
            const users = response.data?.data || response.data || [];
            setLikedUsers(users);
        } catch (error) {
            console.error('Error fetching liked users:', error);
            addToast('Không thể lấy danh sách người thích', 'error');
            setLikedUsers([]);
        } finally {
            setLoadingLikes(false);
        }
    };

    // Reset expand state on image change
    useEffect(() => {
        setIsDescExpanded(false);
    }, [selectedImage]);

    // Dynamic height auto-grow for desktop public comment input
    useEffect(() => {
        const textarea = commentInputRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [newComment]);

    // Link formatter and highlighter utility
    const renderFormattedComment = (text) => {
        if (!text) return '';
        const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
        const parts = text.split(urlRegex);

        return parts.map((part, index) => {
            if (urlRegex.test(part)) {
                const href = part.startsWith('http') ? part : `https://${part}`;
                return (
                    <a
                        key={index}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-500 font-extrabold hover:underline break-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    const handleFormSubmit = async (e) => {
        if (e) e.preventDefault();
        if (isSubmitting || !newComment.trim()) return;
        try {
            setIsSubmitting(true);
            await handleAddComment(e);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Close dropdowns on clicking outside
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (!e.target.closest('.ellipsis-trigger') && !e.target.closest('.ellipsis-menu')) {
                setActiveMenuId(null);
            }
        };
        document.addEventListener('click', handleOutsideClick, { capture: true });
        return () => document.removeEventListener('click', handleOutsideClick, { capture: true });
    }, []);

    useEffect(() => {
        if (confirmDeleteId) {
            const t = setTimeout(() => setConfirmDeleteVisible(true), 10);
            return () => clearTimeout(t);
        } else {
            setConfirmDeleteVisible(false);
        }
    }, [confirmDeleteId]);

    // Clipboard copy helper
    const handleCopyComment = (content) => {
        navigator.clipboard.writeText(content);
        addToast('Đã sao chép bình luận vào bộ nhớ tạm!', 'success');
        setActiveMenuId(null);
    };

    // Toggle inline comment editor
    const handleStartEdit = (comment) => {
        setEditingCommentId(comment.id);
        setEditingContent(comment.content);
        setActiveMenuId(null);
    };

    // API submission for inline edits
    const handleEditSubmit = async (commentId, e) => {
        if (e) e.preventDefault();
        if (!editingContent.trim() || isEditingLoading) return;

        try {
            setIsEditingLoading(true);
            const response = await api.patch(`/gallery/comments/${commentId}`, { content: editingContent });
            const updatedComment = response.data?.data || response.data;

            if (setComments) {
                setComments((prev) =>
                    prev.map((c) => (c.id === commentId ? { ...c, content: updatedComment.content } : c)),
                );
            }

            setEditingCommentId(null);
            addToast('Đã cập nhật bình luận!', 'success');
        } catch (error) {
            addToast(error.message || 'Lỗi khi cập nhật bình luận', 'error');
        } finally {
            setIsEditingLoading(false);
        }
    };

    if (!selectedImage) return null;

    const captionText =
        selectedImage.caption ||
        'Hình ảnh ghi lại khoảnh khắc hoạt động vô cùng thú vị của thầy cô và trò tại Nhật Ngữ Sakae.';
    const isLongDescription = captionText.length > 100;

    return (
        <div
            className="fixed inset-0 z-[200] bg-slate-950/98 backdrop-blur-md flex flex-col lg:flex-row animate-fadeIn overflow-hidden"
            onClick={() => setSelectedImage(null)}
        >
            {/* Left Column - Image Viewer */}
            <div
                className="relative flex-1 bg-black flex items-center justify-center select-none overflow-hidden h-full"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Top Header Controls overlay */}
                <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-[220] bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
                    {/* Zoom actions */}
                    <div
                        className="flex items-center gap-2 bg-slate-950/40 backdrop-blur-xl rounded-2xl p-1 border border-white/10 pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={handleZoomOut}
                            className="relative group w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                            title="Thu nhỏ"
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
                            title="Phóng to"
                        >
                            <FaSearchPlus size={16} />
                            <span className="absolute top-full mt-2 right-0 origin-top-right scale-0 group-hover:scale-100 transition-all duration-150 bg-slate-950/95 backdrop-blur-2xl text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/10 whitespace-nowrap shadow-2xl pointer-events-none z-[230]">
                                Phóng to
                            </span>
                        </button>
                    </div>

                    {/* Quick utilities */}
                    <div className="flex items-center gap-3 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={handleDownload}
                            className="relative group w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-950/40 text-white hover:bg-white/10 transition-all cursor-pointer border border-white/10"
                            title="Tải ảnh về"
                        >
                            <FaDownload size={18} />
                            <span className="absolute top-full mt-2 right-0 origin-top-right scale-0 group-hover:scale-100 transition-all duration-150 bg-slate-950/95 backdrop-blur-2xl text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/10 whitespace-nowrap shadow-2xl pointer-events-none z-[230]">
                                Tải ảnh về
                            </span>
                        </button>
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="relative group w-11 h-11 flex items-center justify-center rounded-2xl bg-red-600 text-white hover:bg-red-700 transition-all shadow-xl shadow-red-900/40 cursor-pointer border border-red-500/30"
                            title="Đóng (Esc)"
                        >
                            <FaTimes size={20} />
                            <span className="absolute top-full mt-2 right-0 origin-top-right scale-0 group-hover:scale-100 transition-all duration-150 bg-slate-950/95 backdrop-blur-2xl text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/10 whitespace-nowrap shadow-2xl pointer-events-none z-[230]">
                                Đóng (Esc)
                            </span>
                        </button>
                    </div>
                </div>

                {/* Left/Right Navigation Buttons */}
                <button
                    className="absolute left-4 md:left-8 top-[44%] md:top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-950/30 text-white hover:bg-red-600 hover:border-red-500 transition-all z-[220] border border-white/10 cursor-pointer group backdrop-blur-md"
                    onClick={(e) => {
                        e.stopPropagation();
                        handlePrev();
                    }}
                >
                    <FaChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <button
                    className="absolute right-4 md:right-8 top-[44%] md:top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-950/30 text-white hover:bg-red-600 hover:border-red-500 transition-all z-[220] border border-white/10 cursor-pointer group backdrop-blur-md"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                    }}
                >
                    <FaChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Central Image Container */}
                <div
                    className="w-full h-full flex items-center justify-center p-4 mb-30 md:mb-0 md:p-12 touch-none overflow-hidden"
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
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            key={selectedImage.id}
                            src={selectedImage.src}
                            alt={selectedImage.title}
                            className="max-w-[95vw] lg:max-w-[65vw] max-h-[80vh] object-contain shadow-2xl rounded-2xl pointer-events-none border border-white/5"
                        />
                    </div>
                </div>

                {/* Mobile Floating Detail Overlay */}
                <div
                    className={`absolute bottom-3 left-3 right-3 bg-slate-950/50 backdrop-blur-xl border border-white/10 rounded-2xl px-2.5 py-3 text-white z-[220] flex flex-col gap-2.5 lg:hidden transition-all duration-300 ${
                        isDescExpanded ? 'max-h-[60vh] h-auto' : 'max-h-[35vh]'
                    } animate-slideUp`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Scrollable Upper Area */}
                    <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-0.5 scrollbar-thin">
                        {/* Creator, Category & Date */}
                        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                                    <img
                                        src={
                                            selectedImage.createdBy?.avatar ||
                                            'https://res.cloudinary.com/sakae-academy/image/upload/v1715617260/sakae-academy/users/sakae-default-user-avatar.png'
                                        }
                                        alt={selectedImage.createdBy?.fullName || 'Trung tâm Sakae'}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-extrabold text-sm text-white leading-tight truncate">
                                        {selectedImage.createdBy?.fullName || 'Trung tâm Sakae'}
                                    </h4>
                                    <span className="text-[11px] font-black text-red-500 tracking-wider uppercase">
                                        Ban Quản Trị
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                <span className="px-2 py-0.5 bg-red-600/90 text-white text-[11px] font-black rounded-full uppercase tracking-wider">
                                    {selectedImage.category}
                                </span>
                                <span className="text-[11px] text-white/50 font-bold uppercase tracking-wider">
                                    {selectedImage.date}
                                </span>
                            </div>
                        </div>

                        {/* Title & Caption */}
                        <div className="space-y-1">
                            <h2 className="font-black text-white leading-snug">{selectedImage.title}</h2>
                            <div
                                style={{
                                    maxHeight: isDescExpanded ? '280px' : '48px',
                                    transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                }}
                                className="overflow-hidden relative text-sm text-white/80 whitespace-pre-line leading-snug"
                            >
                                {captionText}
                                {!isDescExpanded && isLongDescription && (
                                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pinned Action Footer */}
                    <div className="flex-shrink-0 flex flex-col gap-2.5 pt-1.5 border-t border-white/10">
                        {isLongDescription && (
                            <button
                                onClick={() => setIsDescExpanded(!isDescExpanded)}
                                className="text-xs font-black text-red-400 cursor-pointer focus:outline-none flex items-center gap-1 transition-colors self-start py-0.5"
                            >
                                {isDescExpanded ? 'Thu lại ⬆️' : 'Xem thêm ⬇️'}
                            </button>
                        )}
                        <div className="flex items-center gap-3">
                            {/* Mobile Split Like Button */}
                            <div className="inline-flex items-center rounded-2xl border border-white/15 bg-white/5 shadow-md">
                                {/* Left part: Like / Unlike */}
                                <div className="relative">
                                    <ReactionPicker
                                        isOpen={showMobilePicker}
                                        onSelect={handleSelectReaction}
                                        className="bottom-[120%] left-0 origin-bottom-left"
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleLike(selectedImage.id, e, selectedImage.userReaction || 'LIKE');
                                        }}
                                        onTouchStart={handlePressStart}
                                        onTouchEnd={handlePressEnd}
                                        onMouseDown={handlePressStart}
                                        onMouseUp={handlePressEnd}
                                        onMouseLeave={handlePressEnd}
                                        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-black transition-all cursor-pointer ${
                                            selectedImage.likesCount > 0
                                                ? 'border-r border-white/10 rounded-l-2xl'
                                                : 'rounded-2xl'
                                        } ${
                                            selectedImage.isLiked
                                                ? 'bg-red-500/20 text-red-400'
                                                : 'text-white hover:bg-white/10'
                                        }`}
                                    >
                                        <span>
                                            {selectedImage.isLiked
                                                ? `${getReactionEmoji(selectedImage.userReaction)} ${getReactionLabel(selectedImage.userReaction)}`
                                                : '🤍 Thích'}
                                        </span>
                                    </button>
                                </div>
                                {/* Right part: Count & Modal trigger */}
                                {selectedImage.likesCount > 0 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenLikesModal(selectedImage.id);
                                        }}
                                        className="flex items-center gap-1 px-3 py-2 text-xs font-extrabold text-white hover:bg-white/15 transition-all cursor-pointer rounded-r-2xl"
                                        title="Xem danh sách người đã thích"
                                    >
                                        <div className="flex items-center mr-0.5">
                                            {topReactionEmojis.map((emoji, idx) => (
                                                <span key={idx} className="text-sm relative z-10 drop-shadow-md">
                                                    {emoji}
                                                </span>
                                            ))}
                                        </div>
                                        <span>{selectedImage.likesCount}</span>
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={() => setIsMobileCommentOpen(true)}
                                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-extrabold bg-white text-slate-800 hover:bg-slate-100 transition-all shadow-md cursor-pointer"
                            >
                                <span>💬 Bình luận</span>
                                <span className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded-md text-[10px] font-black">
                                    {selectedImage.commentsCount}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column - Comments and Details Sidebar (ONLY Desktop) */}
            <div
                className="w-full lg:w-[400px] xl:w-[440px] bg-white h-full hidden lg:flex flex-col border-l border-slate-100 shadow-2xl relative z-[220] animate-slideLeft"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Post Creator / Header */}
                <div className="p-3 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                        <img
                            src={
                                selectedImage.createdBy?.avatar ||
                                'https://res.cloudinary.com/sakae-academy/image/upload/v1715617260/sakae-academy/users/sakae-default-user-avatar.png'
                            }
                            alt={selectedImage.createdBy?.fullName || 'Trung tâm Sakae'}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-slate-800 leading-tight truncate">
                            {selectedImage.createdBy?.fullName || 'Trung tâm Sakae'}
                        </h4>
                        <span className="text-xs font-black text-red-600 tracking-widest uppercase">Ban Quản Trị</span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-red-50 text-red-600 text-xs font-black rounded-full uppercase tracking-wider flex-shrink-0">
                        {selectedImage.category}
                    </span>
                </div>

                {/* Caption details */}
                <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="font-extrabold text-xl text-slate-800 leading-snug mb-1">{selectedImage.title}</h2>
                    <div
                        style={{
                            maxHeight: isDescExpanded ? '400px' : '56px',
                            transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        className="overflow-hidden relative text-base text-slate-600 whitespace-pre-line leading-snug"
                    >
                        {captionText}
                        {!isDescExpanded && isLongDescription && (
                            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
                        )}
                    </div>
                    {isLongDescription && (
                        <button
                            onClick={() => setIsDescExpanded(!isDescExpanded)}
                            className="text-sm text-red-600 hover:text-red-500 mt-1 cursor-pointer focus:outline-none flex items-center gap-1 transition-colors"
                        >
                            {isDescExpanded ? 'Thu lại ⬆️' : 'Xem thêm ⬇️'}
                        </button>
                    )}
                    <span className="text-xs text-slate-500 font-extrabold block mt-2 tracking-wider">
                        ĐĂNG NGÀY: {selectedImage.date}
                    </span>
                </div>

                {/* Comments feed block */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-white scrollbar-thin">
                    <h3 className="font-extrabold text-sm text-slate-700 uppercase tracking-widest">
                        Bình luận ({comments.length})
                    </h3>
                    {loadingComments ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <div className="w-10 h-10 border-2 border-slate-200 border-t-red-600 rounded-full animate-spin mb-2"></div>
                            <span className="text-sm text-slate-400 font-bold uppercase tracking-wider">
                                Đang tải...
                            </span>
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="text-2xl block mb-1">💬</span>
                            <span className="text-sm text-slate-400">
                                Chưa có bình luận nào. Hãy là người đầu tiên!
                            </span>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {comments.map((comment) => (
                                <div key={comment.id} className="flex gap-2.5 items-start">
                                    {/* Avatar outside on the left - clickable */}
                                    <div className="flex-shrink-0 mt-0.5">
                                        <UserLink user={comment.user} avatarSize="w-9 h-9" showName={false} />
                                    </div>

                                    {/* Bubble comment content and actions row (vertical container) */}
                                    <div className="flex-1 flex flex-col min-w-0">
                                        {/* Speech bubble */}
                                        <div className="bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100/50 shadow-sm text-xs w-full relative">
                                            {editingCommentId === comment.id ? (
                                                /* Inline Comment Editor Form */
                                                <form
                                                    onSubmit={(e) => handleEditSubmit(comment.id, e)}
                                                    className="flex flex-col gap-2"
                                                >
                                                    <textarea
                                                        value={editingContent}
                                                        onChange={(e) => setEditingContent(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                e.preventDefault();
                                                                handleEditSubmit(comment.id, e);
                                                            }
                                                        }}
                                                        disabled={isEditingLoading}
                                                        className={`w-full px-2 py-1 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 text-sm transition-all resize-none min-h-[34px] max-h-[100px] overflow-y-auto leading-relaxed ${isEditingLoading ? 'cursor-not-allowed opacity-60' : ''}`}
                                                        autoFocus
                                                    />
                                                    <div className="flex gap-1.5 justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingCommentId(null)}
                                                            disabled={isEditingLoading}
                                                            className="px-2.5 py-1.5 text-[13px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            Hủy
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            disabled={!editingContent.trim() || isEditingLoading}
                                                            className="px-2.5 py-1.5 text-[13px] font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-all cursor-pointer shadow-sm shadow-red-100 flex items-center gap-1.5 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
                                                        >
                                                            {isEditingLoading ? (
                                                                <>
                                                                    <div className="w-2.5 h-2.5 border border-white/30 border-t-white rounded-full animate-spin"></div>
                                                                    <span>Lưu...</span>
                                                                </>
                                                            ) : (
                                                                'Lưu'
                                                            )}
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                /* Display Normal Mode */
                                                <>
                                                    <div className="flex items-center justify-between gap-3 mb-0.5">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <UserLink
                                                                user={comment.user}
                                                                showName
                                                                avatarSize="w-0 h-0"
                                                                className="!gap-0"
                                                            >
                                                                {comment.user?.role === 'ADMIN' && (
                                                                    <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-black text-white bg-red-600 rounded-full ml-1.5">
                                                                        Admin
                                                                    </span>
                                                                )}
                                                            </UserLink>
                                                        </div>
                                                        <span className="text-xs text-slate-400 font-bold flex-shrink-0 uppercase tracking-wider">
                                                            {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                                                        </span>
                                                    </div>
                                                    <p className="text-[15px] text-slate-600 leading-snug break-words pr-1 whitespace-pre-wrap">
                                                        {renderFormattedComment(comment.content)}
                                                    </p>
                                                </>
                                            )}
                                        </div>

                                        {/* Actions Row immediately below comment speech bubble */}
                                        {editingCommentId !== comment.id && (
                                            <div className="flex items-center gap-3 mt-1.5 ml-2 text-xs font-bold text-slate-400">
                                                <button
                                                    onClick={() =>
                                                        addToast(
                                                            'Tính năng thích bình luận sẽ được phát hành trong thời gian tới!',
                                                            'info',
                                                        )
                                                    }
                                                    className="hover:text-red-500 transition-colors cursor-pointer focus:outline-none p-0.5"
                                                >
                                                    Thích
                                                </button>
                                                <span className="text-[8px] text-slate-300">•</span>
                                                <button
                                                    onClick={() =>
                                                        addToast(
                                                            'Tính năng phản hồi bình luận sẽ được phát hành trong thời gian tới!',
                                                            'info',
                                                        )
                                                    }
                                                    className="hover:text-slate-600 transition-colors cursor-pointer focus:outline-none p-0.5"
                                                >
                                                    Phản hồi
                                                </button>
                                                <span className="text-[8px] text-slate-300">•</span>

                                                {/* Action Dropdown Menu Trigger next to Phản hồi */}
                                                <div className="relative flex items-center">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveMenuId(
                                                                activeMenuId === comment.id ? null : comment.id,
                                                            );
                                                        }}
                                                        className="ellipsis-trigger hover:text-slate-600 transition-colors cursor-pointer flex items-center justify-center p-1 focus:outline-none"
                                                        title="Tùy chọn bình luận"
                                                    >
                                                        <FaEllipsisH size={10} />
                                                    </button>

                                                    {/* Dropdown Options popover visible above action bar */}
                                                    {activeMenuId === comment.id && (
                                                        <div
                                                            className="ellipsis-menu absolute left-0 top-full mt-1 bg-white border border-slate-200 shadow-2xl rounded-2xl py-1.5 min-w-[130px] z-[300] animate-fadeIn"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <button
                                                                onClick={() => handleCopyComment(comment.content)}
                                                                className="w-full text-left px-3.5 py-2 hover:bg-slate-100 text-slate-700 font-bold text-sm flex items-center gap-2 cursor-pointer transition-colors"
                                                            >
                                                                Sao chép
                                                            </button>

                                                            {(user?.id === comment.userId ||
                                                                user?.role === 'ADMIN') && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleStartEdit(comment)}
                                                                        className="w-full text-left px-3.5 py-2 hover:bg-slate-100 text-slate-700 font-bold text-sm flex items-center gap-2 cursor-pointer transition-colors"
                                                                    >
                                                                        Chỉnh sửa
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setConfirmDeleteId(comment.id);
                                                                            setActiveMenuId(null);
                                                                        }}
                                                                        className="w-full text-left px-3.5 py-2 hover:bg-red-100 text-red-600 font-bold text-sm flex items-center gap-2 cursor-pointer transition-colors"
                                                                    >
                                                                        Xóa
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Interactive panel */}
                <div className="px-3 py-1.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Segmented Split Button for Likes */}
                        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white shadow-sm hover:shadow transition-shadow">
                            {/* Left part: Like / Unlike */}
                            <div
                                className="relative"
                                onMouseEnter={() => setShowDesktopPicker(true)}
                                onMouseLeave={() => setShowDesktopPicker(false)}
                            >
                                <ReactionPicker
                                    isOpen={showDesktopPicker}
                                    onSelect={handleSelectReaction}
                                    className="bottom-[130%] -left-2 origin-bottom-left"
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleLike(selectedImage.id, e, selectedImage.userReaction || 'LIKE');
                                    }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold transition-all cursor-pointer ${
                                        selectedImage.likesCount > 0
                                            ? 'border-r border-slate-100 rounded-l-full'
                                            : 'rounded-full'
                                    } ${
                                        selectedImage.isLiked
                                            ? 'text-red-600 hover:text-red-500 bg-red-50/30'
                                            : 'text-slate-600 hover:text-red-650 hover:bg-slate-100'
                                    }`}
                                    title={selectedImage.isLiked ? 'Đổi biểu cảm hoặc Bỏ thích' : 'Thích ảnh này'}
                                >
                                    <span>
                                        {selectedImage.isLiked
                                            ? `${getReactionEmoji(selectedImage.userReaction)} ${getReactionLabel(selectedImage.userReaction)}`
                                            : '🤍 Thích'}
                                    </span>
                                </button>
                            </div>
                            {/* Right part: Like Count & Who Liked Modal Trigger */}
                            {selectedImage.likesCount > 0 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenLikesModal(selectedImage.id);
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-extrabold text-slate-500 hover:text-red-650 hover:bg-red-50/30 transition-all cursor-pointer border-none bg-transparent outline-none rounded-r-full"
                                    title="Xem danh sách người đã thích"
                                >
                                    <div className="flex -space-x-0.5 items-center">
                                        {topReactionEmojis.map((emoji, idx) => (
                                            <span key={idx} className="text-[15px] relative z-10 drop-shadow-sm">
                                                {emoji}
                                            </span>
                                        ))}
                                    </div>
                                    <span>{selectedImage.likesCount}</span>
                                </button>
                            )}
                        </div>
                        <span className="text-sm text-slate-500 font-bold">
                            💬 {selectedImage.commentsCount} bình luận
                        </span>
                    </div>
                </div>

                {/* Write Comment Box */}
                <div className="p-3 border-t border-slate-100 bg-white sticky bottom-0 z-50">
                    {user ? (
                        <form onSubmit={handleFormSubmit} className="flex gap-2 items-center justify-center">
                            <textarea
                                ref={commentInputRef}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleFormSubmit(e);
                                    }
                                }}
                                placeholder="Viết bình luận công khai..."
                                disabled={isSubmitting}
                                rows={1}
                                className={`flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 text-[15px] resize-none min-h-[38px] max-h-[106px] overflow-y-auto leading-relaxed ${isSubmitting ? 'cursor-not-allowed opacity-60' : ''}`}
                            />
                            <button
                                type="submit"
                                disabled={!newComment.trim() || isSubmitting}
                                className={`px-4 py-2 cursor-pointer font-bold text-sm rounded-xl text-white transition-all shadow-sm flex items-center justify-center gap-1.5 max-h-10 min-w-[64px] ${
                                    newComment.trim() && !isSubmitting
                                        ? 'bg-red-600 hover:bg-red-500 shadow-red-100'
                                        : 'bg-gray-300 cursor-not-allowed'
                                }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Gửi...</span>
                                    </>
                                ) : (
                                    'Gửi'
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-2 bg-slate-50 rounded-xl border border-slate-200/50">
                            <span className="text-sm text-slate-500">
                                Vui lòng{' '}
                                <button
                                    onClick={() => (window.location.href = '/dang-nhap')}
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

            {/* Mobile Comment Bottom Drawer Sheet */}
            <LightboxBottomSheet
                isOpen={isMobileCommentOpen}
                onClose={() => setIsMobileCommentOpen(false)}
                comments={comments}
                loadingComments={loadingComments}
                user={user}
                newComment={newComment}
                setNewComment={setNewComment}
                handleAddComment={handleAddComment}
                handleDeleteComment={handleDeleteComment}
                setComments={setComments}
            />
            {/* Premium Safe Delete Confirmation Modal (Desktop) */}
            {confirmDeleteId && (
                <div
                    className="fixed inset-0 z-[280] flex items-center justify-center p-4"
                    onClick={() => {
                        setConfirmDeleteVisible(false);
                        setTimeout(() => setConfirmDeleteId(null), confirmModalDuration);
                    }}
                >
                    {/* Modal backdrop */}
                    <div
                        className={`absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-${confirmModalDuration} ${
                            confirmDeleteVisible ? 'opacity-100' : 'opacity-0'
                        }`}
                    />

                    {/* Modal Card */}
                    <div
                        className={`relative bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl text-center z-[290] border transition-all duration-${confirmModalDuration} transform ${
                            confirmDeleteVisible
                                ? 'opacity-100 translate-y-0 scale-100'
                                : 'opacity-0 translate-y-3 scale-95'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-16 h-16 rounded-full bg-red-200 text-red-600 flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl mb-3">⚠️</span>
                        </div>
                        <h3 className="text-slate-900 font-extrabold text-3xl mb-2">Xác nhận xóa bình luận</h3>
                        <p className="text-slate-500 text-lg leading-relaxed mb-6">
                            Bạn có chắc chắn muốn xóa bình luận này không? Thao tác này không thể hoàn tác.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => {
                                    setConfirmDeleteVisible(false);
                                    setTimeout(() => setConfirmDeleteId(null), confirmModalDuration);
                                }}
                                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition-all cursor-pointer flex-1"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => {
                                    handleDeleteComment(confirmDeleteId);
                                    setConfirmDeleteVisible(false);
                                    setTimeout(() => setConfirmDeleteId(null), confirmModalDuration);
                                }}
                                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all cursor-pointer flex-1 shadow-md shadow-red-100"
                            >
                                Xác nhận xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal hiển thị danh sách người thích (Likes List Modal) */}
            {openLikesModal && (
                <div
                    className="fixed inset-0 z-[280] flex items-center justify-center p-4"
                    onClick={() => {
                        setShowLikesModal(false);
                        setTimeout(() => setOpenLikesModal(false), likesModalDuration);
                    }}
                >
                    {/* Backdrop */}
                    <div
                        className={`absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-${likesModalDuration} ${
                            showLikesModal ? 'opacity-100' : 'opacity-0'
                        }`}
                    />

                    {/* Modal Card */}
                    <div
                        className={`relative bg-white dark:bg-slate-900 rounded-2xl p-3 md:p-5 max-w-xl w-full shadow-2xl z-[290] border border-slate-100 dark:border-slate-800 flex flex-col max-h-[80vh] transform transition-all duration-${likesModalDuration} ${
                            showLikesModal ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-95'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-slate-800 dark:text-white font-black text-lg flex items-center gap-2">
                                <span>❤️</span> Danh sách người thích
                            </h3>
                            <button
                                onClick={() => {
                                    setShowLikesModal(false);
                                    setTimeout(() => setOpenLikesModal(false), likesModalDuration);
                                }}
                                className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-all cursor-pointer focus:outline-none border-none outline-none"
                            >
                                <FaTimes size={14} />
                            </button>
                        </div>

                        {/* Content list */}
                        <div className="flex-1 flex flex-col min-h-[350px]">
                            {/* Tabs Filter */}
                            {!loadingLikes && likedUsers.length > 0 && (
                                <div className="flex gap-2 overflow-x-auto py-2 px-1 scrollbar-none border-b border-slate-100 dark:border-slate-800 shrink-0">
                                    <button
                                        onClick={() => setActiveLikeTab('ALL')}
                                        className={`px-3 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                                            activeLikeTab === 'ALL'
                                                ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900'
                                                : 'bg-slate-100 cursor-pointer text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                                        }`}
                                    >
                                        Tất cả {likedUsers.length}
                                    </button>
                                    {REACTIONS.map((r) => {
                                        const count = likedUsers.filter((u) => u.reaction === r.type).length;
                                        if (count === 0) return null;
                                        return (
                                            <button
                                                key={r.type}
                                                onClick={() => setActiveLikeTab(r.type)}
                                                className={`px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                                                    activeLikeTab === r.type
                                                        ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900'
                                                        : 'bg-slate-100 cursor-pointer text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                                                }`}
                                            >
                                                <span>{r.emoji}</span>
                                                <span>{count}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto py-3 space-y-2 scrollbar-thin">
                                {loadingLikes ? (
                                    <div className="flex flex-col items-center justify-center py-28 h-full">
                                        <div className="w-10 h-10 border-2 border-slate-200 border-t-red-600 rounded-full animate-spin mb-3"></div>
                                        <span className="text-sm text-slate-500 font-bold uppercase tracking-wider">
                                            Đang tải...
                                        </span>
                                    </div>
                                ) : likedUsers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center h-full">
                                        <span className="text-3xl mb-2">🤍</span>
                                        <p className="text-sm text-slate-400 font-bold">Chưa có ai thích ảnh này.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {likedUsers
                                            .filter((u) => activeLikeTab === 'ALL' || u.reaction === activeLikeTab)
                                            .map((likedUser) => (
                                                <div
                                                    key={likedUser.id}
                                                    className="flex items-center justify-between py-1.5 px-1.5 md:px-2 hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-2xl transition-all"
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className="relative flex-shrink-0">
                                                            <UserLink
                                                                user={likedUser}
                                                                avatarSize="w-10 h-10"
                                                                showName={false}
                                                            />
                                                            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800 flex items-center justify-center text-[13px] w-5 h-5 shadow-sm pointer-events-none">
                                                                {getReactionEmoji(likedUser.reaction)}
                                                            </div>
                                                        </div>
                                                        <UserLink
                                                            user={likedUser}
                                                            avatarSize="w-0 h-0"
                                                            className="!gap-0 min-w-0"
                                                        >
                                                            {likedUser.role === 'ADMIN' && (
                                                                <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-black text-white bg-red-600 rounded-full ml-2">
                                                                    Admin
                                                                </span>
                                                            )}
                                                        </UserLink>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GalleryLightbox;
