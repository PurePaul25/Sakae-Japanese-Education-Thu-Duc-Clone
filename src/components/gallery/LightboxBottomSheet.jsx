import React, { useState, useRef, useEffect } from 'react';
import { FaTimes, FaEllipsisH } from 'react-icons/fa';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';

const LightboxBottomSheet = ({
    isOpen,
    onClose,
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
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const startY = useRef(0);
    const sheetRef = useRef(null);

    // Track active transition state for slide-out/fade-out on close
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [active, setActive] = useState(false);

    // Interactive Comment Actions setup
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingContent, setEditingContent] = useState('');
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            const timer = setTimeout(() => {
                setActive(true);
            }, 10);
            return () => clearTimeout(timer);
        } else {
            setActive(false);
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditingLoading, setIsEditingLoading] = useState(false);

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

    // Close on ESC key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

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

    const handleTouchStart = (e) => {
        startY.current = e.touches[0].clientY;
        setIsDragging(true);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const currentY = e.touches[0].clientY;
        const deltaY = currentY - startY.current;
        if (deltaY > 0) {
            setDragOffset(deltaY);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        if (dragOffset > 120) {
            onClose();
        }
        setDragOffset(0);
    };

    // Copy action handler
    const handleCopyComment = (content) => {
        navigator.clipboard.writeText(content);
        addToast('Đã sao chép bình luận vào bộ nhớ tạm!', 'success');
        setActiveMenuId(null);
    };

    // Edit start mode trigger
    const handleStartEdit = (comment) => {
        setEditingCommentId(comment.id);
        setEditingContent(comment.content);
        setActiveMenuId(null);
    };

    // Inline edit form submission
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

    if (!shouldRender) return null;

    return (
        <div
            className="fixed inset-0 z-[250] flex items-end justify-center"
            onClick={(e) => {
                e.stopPropagation();
                onClose();
            }}
        >
            {/* Backdrop overlay */}
            <div
                style={{
                    opacity: active ? 1 : 0,
                    transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
            ></div>

            {/* Bottom Sheet Drawer */}
            <div
                ref={sheetRef}
                style={{
                    transform: active ? `translateY(${dragOffset}px)` : 'translateY(100%)',
                    transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className="relative w-full max-w-2xl bg-white rounded-t-[2rem] shadow-2xl flex flex-col max-h-[90vh] min-h-[80vh] overflow-hidden z-[260]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Drag Handle Top Bar */}
                <div
                    className="w-full py-1 bg-slate-50 border-b border-slate-100 flex-shrink-0 cursor-grab active:cursor-grabbing"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div className="w-14 h-1.5 bg-slate-300 rounded-full mx-auto my-1.5 shadow-sm"></div>
                </div>

                {/* Bottom Sheet Header */}
                <div className="px-3 py-2 border-b border-slate-100 flex justify-between items-center bg-white flex-shrink-0">
                    <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <span>💬 Bình luận</span>
                        <span className="bg-red-50 text-red-600 text-[13px] px-2.5 py-0.5 rounded-full font-black">
                            {comments.length}
                        </span>
                    </h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
                        title="Đóng bình luận"
                    >
                        <FaTimes size={12} />
                    </button>
                </div>

                {/* Comments Scrollable Feed Container */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/30 scrollbar-thin">
                    {loadingComments ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="w-8 h-8 border-3 border-slate-200 border-t-red-600 rounded-full animate-spin mb-3"></div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                Đang tải bình luận...
                            </span>
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="text-center py-16">
                            <span className="text-3xl block mb-2">💬</span>
                            <span className="text-xs text-slate-400 font-medium">
                                Chưa có bình luận nào. Hãy là người đầu tiên!
                            </span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <div key={comment.id} className="flex gap-2.5 items-start relative group/comment">
                                    {/* Avatar outside on the left */}
                                    <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0 mt-0.5 shadow-sm">
                                        <img
                                            src={
                                                comment.user?.avatar ||
                                                'https://res.cloudinary.com/sakae-academy/image/upload/v1715617260/sakae-academy/users/sakae-default-user-avatar.png'
                                            }
                                            alt={comment.user?.fullName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Bubble comment content and actions row (vertical container) */}
                                    <div className="flex-1 flex flex-col min-w-0">
                                        {/* Speech bubble */}
                                        <div className="bg-white px-2.5 py-2  rounded-xl border border-slate-100 shadow-sm text-xs w-full relative">
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
                                                        className={`w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 text-xs transition-all resize-none min-h-[34px] max-h-[100px] overflow-y-auto leading-relaxed ${isEditingLoading ? 'cursor-not-allowed opacity-60' : ''}`}
                                                        autoFocus
                                                    />
                                                    <div className="flex gap-1.5 justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingCommentId(null)}
                                                            disabled={isEditingLoading}
                                                            className="px-2.5 py-1.5 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            Hủy
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            disabled={!editingContent.trim() || isEditingLoading}
                                                            className="px-2.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-all cursor-pointer shadow-sm shadow-red-100 flex items-center gap-1.5 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
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
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="font-extrabold text-sm text-slate-800 truncate">
                                                            {comment.user?.fullName}
                                                        </span>
                                                        <span className="text-xs text-slate-400 font-bold flex-shrink-0 uppercase tracking-wider">
                                                            {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-600 leading-relaxed break-words whitespace-pre-wrap text-sm">
                                                        {renderFormattedComment(comment.content)}
                                                    </p>
                                                </>
                                            )}
                                        </div>

                                        {/* Actions Row immediately below comment speech bubble */}
                                        {editingCommentId !== comment.id && (
                                            <div className="flex items-center gap-3 mt-1.5 ml-2.5 text-[13px] font-bold text-slate-400">
                                                <button className="hover:text-red-500 transition-colors cursor-pointer focus:outline-none">
                                                    Thích
                                                </button>
                                                <span className="text-[8px] text-slate-300">•</span>
                                                <button className="hover:text-slate-600 transition-colors cursor-pointer focus:outline-none">
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
                                                        className="ellipsis-trigger hover:text-slate-600 transition-colors cursor-pointer flex items-center justify-center p-0.5 focus:outline-none"
                                                        title="Tùy chọn bình luận"
                                                    >
                                                        <FaEllipsisH size={10} />
                                                    </button>

                                                    {/* Dropdown Options popover visible below action bar */}
                                                    {activeMenuId === comment.id && (
                                                        <div
                                                            className="ellipsis-menu absolute left-0 top-full mt-1 bg-white border border-slate-200 shadow-2xl rounded-2xl py-1.5 min-w-[130px] z-[300] animate-fadeIn"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <button
                                                                onClick={() => handleCopyComment(comment.content)}
                                                                className="w-full text-left px-3.5 py-2 hover:bg-slate-100 text-slate-700 font-bold text-[13px] flex items-center gap-2 cursor-pointer transition-colors"
                                                            >
                                                                Sao chép
                                                            </button>

                                                            {(user?.id === comment.userId ||
                                                                user?.role === 'ADMIN') && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleStartEdit(comment)}
                                                                        className="w-full text-left px-3.5 py-2 hover:bg-slate-100 text-slate-700 font-bold text-[13px] flex items-center gap-2 cursor-pointer transition-colors"
                                                                    >
                                                                        Chỉnh sửa
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setConfirmDeleteId(comment.id);
                                                                            setActiveMenuId(null);
                                                                        }}
                                                                        className="w-full text-left px-3.5 py-2 hover:bg-red-100 text-red-600 font-bold text-[13px] flex items-center gap-2 cursor-pointer transition-colors"
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

                <div className="p-4 border-t border-slate-100 bg-white sticky bottom-0 z-50 shadow-lg flex-shrink-0">
                    {user ? (
                        <form onSubmit={handleFormSubmit} className="flex gap-2.5">
                            <textarea
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
                                className={`flex-1 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white text-sm transition-all shadow-inner resize-none min-h-[42px] max-h-[100px] overflow-y-auto leading-relaxed ${isSubmitting ? 'cursor-not-allowed opacity-60' : ''}`}
                            />
                            <button
                                type="submit"
                                disabled={!newComment.trim() || isSubmitting}
                                className={`px-3 py-2.5 cursor-pointer font-bold text-sm rounded-2xl text-white transition-all shadow-sm flex items-center justify-center gap-1.5 min-w-[70px] ${
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
                        <div className="text-center py-3 bg-slate-50 rounded-2xl border border-slate-200/50">
                            <span className="text-xs text-slate-500 font-semibold">
                                Vui lòng{' '}
                                <button
                                    onClick={() => (window.location.href = '/dang-nhap')}
                                    className="text-red-600 font-black hover:underline cursor-pointer bg-transparent border-none outline-none"
                                >
                                    đăng nhập
                                </button>{' '}
                                để thích & bình luận!
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Premium Safe Delete Confirmation Modal */}
            {confirmDeleteId && (
                <div
                    className="fixed inset-0 z-[280] flex items-center justify-center p-4"
                    onClick={() => setConfirmDeleteId(null)}
                >
                    {/* Modal backdrop */}
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-fadeIn"></div>

                    {/* Modal Card */}
                    <div
                        className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center z-[290] border border-slate-100 animate-scaleIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 text-xl">
                            ⚠️
                        </div>
                        <h3 className="text-slate-900 font-extrabold text-xl mb-2">Xác nhận xóa bình luận</h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                            Bạn có chắc chắn muốn xóa bình luận này không? Thao tác này không thể hoàn tác.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold transition-all cursor-pointer flex-1"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => {
                                    handleDeleteComment(confirmDeleteId);
                                    setConfirmDeleteId(null);
                                }}
                                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-all cursor-pointer flex-1 shadow-md shadow-red-100"
                            >
                                Xác nhận xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LightboxBottomSheet;
