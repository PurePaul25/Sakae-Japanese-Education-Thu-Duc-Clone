import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Eye, Heart, MessageCircle, Copy, Edit3, Trash2, MoreHorizontal, Users, X, LoaderCircle } from 'lucide-react';
import ScrollToTopButton from '../components/layout/ScrollToTopButton';
import blogService from '../services/blogService';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';
import UserLink from '../components/ui/UserLink';

const recentPostFetches = {};

const NewsDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const { addToast } = useToast();

    const [post, setPost] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingContent, setEditingContent] = useState('');
    const [commentToDelete, setCommentToDelete] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [isDeletingComment, setIsDeletingComment] = useState(false);
    const [commentDeleteVisible, setCommentDeleteVisible] = useState(false);
    const commentDeleteDuration = 300; // ms
    const [likes, setLikes] = useState([]);
    const [loadingLikes, setLoadingLikes] = useState(false);
    const [likedLoading, setLikedLoading] = useState(false);
    const [openLikesModal, setOpenLikesModal] = useState(false);
    const [showLikesModal, setShowLikesModal] = useState(false);
    const modalTransitionDuration = 300; // ms
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [isEditingLoading, setIsEditingLoading] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [isTogglingLike, setIsTogglingLike] = useState(false);

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

                const relRes = await blogService.getRelated(slug);
                setRelated(relRes.data?.data ?? relRes.data ?? []);
            } catch {
                setError('Không thể tải bài viết. Có thể bài viết đã bị xóa hoặc không tồn tại.');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
        window.scrollTo(0, 0);
    }, [slug]);

    useEffect(() => {
        if (!post?.id) return;
        fetchComments();
        fetchLikes();
    }, [post?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (!event.target.closest('.comment-action-button') && !event.target.closest('.comment-action-menu')) {
                setActiveMenuId(null);
            }
        };

        document.addEventListener('click', handleOutsideClick, true);
        return () => document.removeEventListener('click', handleOutsideClick, true);
    }, []);

    const fetchComments = async () => {
        setCommentsLoading(true);
        try {
            const response = await blogService.getComments(post.id);
            const data = response.data?.data ?? response.data ?? [];
            setComments(data);
        } catch (error) {
            console.error(error);
            addToast('Không thể tải bình luận bài viết.', 'error');
        } finally {
            setCommentsLoading(false);
        }
    };

    const fetchLikes = async () => {
        setLoadingLikes(true);
        try {
            const response = await blogService.getLikes(post.id);
            const data = response.data?.data ?? response.data ?? [];
            setLikes(data);
            setPost((prev) => (prev ? { ...prev, _count: { ...prev._count, likes: data.length } } : prev));
            return data;
        } catch (error) {
            console.error(error);
            addToast('Không thể tải danh sách người thích.', 'error');
            return [];
        } finally {
            setLoadingLikes(false);
        }
    };

    const handleToggleLike = async () => {
        if (!user) {
            addToast('Vui lòng đăng nhập để thả tim bài viết.', 'warning');
            return;
        }
        if (!post?.id) return;

        const wasLiked = hasLiked;
        setLikedLoading(true);
        setIsTogglingLike(true);
        try {
            await blogService.toggleLike(post.id, { reaction: 'LOVE' });
            const likesData = await fetchLikes();

            addToast(wasLiked ? 'Đã bỏ thả tim bài viết!' : 'Đã thả tim bài viết!', 'success');

            if (likesData.length === 0 && wasLiked) {
                setPost((prev) => (prev ? { ...prev, _count: { ...prev._count, likes: 0 } } : prev));
            }
        } catch (error) {
            console.error(error);
            addToast(error.message || 'Lỗi khi thả tim bài viết.', 'error');
        } finally {
            setLikedLoading(false);
            setIsTogglingLike(false);
        }
    };

    const handleAddComment = async (event) => {
        event.preventDefault();
        if (!user) {
            addToast('Vui lòng đăng nhập để bình luận.', 'warning');
            return;
        }
        if (!newComment.trim()) return;

        setIsSubmittingComment(true);
        try {
            const response = await blogService.createComment(post.id, {
                content: newComment.trim(),
            });
            const addedComment = response.data?.data ?? response.data;
            setComments((prev) => [addedComment, ...(prev || [])]);
            setNewComment('');
            addToast('Đã gửi bình luận của bạn!', 'success');
        } catch (error) {
            console.error(error);
            addToast(error.message || 'Lỗi khi gửi bình luận.', 'error');
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleCopyComment = (content) => {
        navigator.clipboard.writeText(content);
        addToast('Đã sao chép bình luận vào bộ nhớ tạm!', 'success');
        setActiveMenuId(null);
    };

    const handleStartEdit = (comment) => {
        setEditingCommentId(comment.id);
        setEditingContent(comment.content);
        setActiveMenuId(null);
    };

    const handleEditSubmit = async (commentId, event) => {
        event.preventDefault();
        if (!editingContent.trim()) return;

        setIsEditingLoading(true);
        try {
            const response = await blogService.updateComment(commentId, {
                content: editingContent.trim(),
            });
            const updatedComment = response.data?.data ?? response.data;
            setComments((prev) =>
                prev.map((comment) =>
                    comment.id === commentId ? { ...comment, content: updatedComment.content } : comment,
                ),
            );
            setEditingCommentId(null);
            addToast('Đã cập nhật bình luận!', 'success');
        } catch (error) {
            console.error(error);
            addToast(error.message || 'Lỗi khi cập nhật bình luận.', 'error');
        } finally {
            setIsEditingLoading(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await blogService.deleteComment(commentId);
            setComments((prev) => prev.filter((comment) => comment.id !== commentId));
            addToast('Đã xóa bình luận!', 'success');
        } catch (error) {
            console.error(error);
            addToast(error.message || 'Lỗi khi xóa bình luận.', 'error');
        }
    };

    // (Removed unused handleConfirmDeleteComment) Deletion now handled directly from modal buttons

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
                        className="text-red-600 hover:text-red-500 font-extrabold hover:underline break-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    const normalizeBlogContent = (html) => {
        if (!html) return '';
        return html
            .replace(/<meta[^>]*>/gi, '')
            .replace(/<(\/?)(?:o:|mso|st1|w:|v:)[^>]*>/gi, '<$1>')
            .replace(/<span\b[^>]*style=["'][^"']*mso-spacerun:[^"']*["'][^>]*>/gi, ' ')
            .replace(/<font\b[^>]*>/gi, '<span>')
            .replace(/<\/font>/gi, '</span>')
            .replace(/&nbsp;/gi, ' ')
            .replace(/<a\b([^>]*)>/gi, (match, attrs) => {
                const hasClass = /class=/.test(attrs);
                const hasTarget = /target=/.test(attrs);
                const hasRel = /rel=/.test(attrs);
                const classAttr = hasClass ? '' : ' class="text-red-600 underline font-semibold break-all"';
                const targetAttr = hasTarget ? '' : ' target="_blank"';
                const relAttr = hasRel ? '' : ' rel="noopener noreferrer"';
                return `<a${attrs}${classAttr}${targetAttr}${relAttr}>`;
            })
            .replace(/<img\b([^>]*)>/gi, (match, attrs) => {
                const hasClass = /class=/.test(attrs);
                const hasStyle = /style=/.test(attrs);
                const classAttr = hasClass ? '' : ' class="mx-auto my-4 max-w-full h-auto rounded-xl block"';
                const styleAttr = hasStyle ? '' : ' style="max-width:100%; width:100%; height:auto; display:block; margin:10px 0; border-radius:10px; object-fit:cover;"';
                return `<img${attrs}${classAttr}${styleAttr}>`;
            })
            .replace(/\r\n|\r|\n/g, '<br>');
    };

    const formattedDate = post
        ? new Date(post.createdAt).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
          })
        : '';

    const userLike = likes.find((like) => like.user?.id === user?.id);
    const hasLiked = Boolean(userLike);
    const totalLikes = likes.length || post?._count?.likes || 0;

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
                <p className="text-red-500 text-xl font-bold mb-4">{error || 'Bài viết không tồn tại.'}</p>
                <button
                    onClick={() => navigate('/tin-tuc')}
                    className="px-6 py-2 bg-red-600 cursor-pointer text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                >
                    ← Quay lại tin tức
                </button>
            </div>
        );
    }

    return (
        <div className="pt-25 pb-12 bg-gray-100 text-gray-800">
            <div className="max-w-5xl mx-auto px-3 md:px-4">
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
                            <div className="relative group inline-block">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOpenLikesModal(true);
                                        // allow mount then show for transition
                                        setTimeout(() => setShowLikesModal(true), 10);
                                    }}
                                    className="flex items-center cursor-pointer gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
                                >
                                    <Heart size={14} /> {totalLikes}
                                </button>

                                <div
                                    className="
            absolute bottom-full left-1/2 -translate-x-1/2 mb-2
            opacity-0 invisible
            group-hover:opacity-100 group-hover:visible
            transition duration-200
            bg-gray-900 text-white text-xs
            px-3 py-1.5 rounded-md shadow-lg
            whitespace-nowrap z-50
        "
                                >
                                    Xem danh sách người thích
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                                {post.title}
                            </h1>
                            <div className="flex flex-row md:flex-col items-center gap-2.5 w-60% md:w-40">
                                <button
                                    type="button"
                                    disabled={likedLoading}
                                    onClick={handleToggleLike}
                                    className={`inline-flex items-center cursor-pointer gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all shadow-sm ${
                                        hasLiked
                                            ? 'bg-red-600 text-white hover:bg-red-500'
                                            : 'bg-white text-red-600 border border-red-200 hover:bg-red-50'
                                    } ${likedLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {likedLoading ? (
                                        <LoaderCircle size={16} className="animate-spin" />
                                    ) : (
                                        <Heart size={16} className={hasLiked ? 'text-white' : 'text-red-600'} />
                                    )}
                                    {likedLoading ? 'Đang thả tim...' : hasLiked ? 'Đã thả tim' : 'Thả tim'}
                                </button>
                                <span className="text-sm text-slate-500">{totalLikes} lượt thả tim</span>
                            </div>
                        </div>

                        {post.excerpt && (
                            <p className="text-lg text-gray-600 border-l-4 border-red-500 pl-3 mb-4 italic">
                                {post.excerpt}
                            </p>
                        )}

                        {post.author && (
                            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
                                <UserLink user={post.author} avatarSize="w-11 h-11" showName>
                                    {post.author.role === 'ADMIN' && (
                                        <span className="px-2 py-0.5 text-[11px] uppercase tracking-wider font-black text-white bg-red-600 rounded-full">
                                            Admin
                                        </span>
                                    )}
                                </UserLink>
                            </div>
                        )}

                        {/* Content — backend đã sanitize HTML */}
                        <div
                            className="prose prose-lg max-w-none break-words overflow-hidden prose-headings:text-gray-900 prose-a:text-red-600 prose-img:rounded-xl prose-p:whitespace-pre-wrap prose-p:leading-7 prose-li:whitespace-pre-wrap prose-li:leading-7 prose-a:break-all prose-a:font-semibold prose-a:underline [&_p]:whitespace-pre-wrap [&_p]:leading-7 [&_li]:whitespace-pre-wrap [&_li]:leading-7 [&_a]:break-all [&_a]:text-red-600 [&_a]:font-semibold [&_a]:underline"
                            style={{ overflowWrap: 'anywhere' }}
                            dangerouslySetInnerHTML={{ __html: normalizeBlogContent(post.content) }}
                        />
                    </div>
                </article>

                <section className="bg-white rounded-2xl shadow-md p-3 md:p-4 mb-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2 text-slate-700 font-bold">
                            <MessageCircle size={18} />
                            <span>{comments.length} bình luận</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            {user ? (
                                <span>
                                    Đăng nhập với <b>{user.fullName}</b> để tham gia bình luận
                                </span>
                            ) : (
                                <p>
                                    Vui lòng
                                    <button
                                        type="button"
                                        onClick={() => navigate('/dang-nhap')}
                                        className="text-red-600 cursor-pointer font-black hover:underline mx-1"
                                    >
                                        Đăng nhập
                                    </button>
                                    để bình luận bài viết này
                                </p>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleAddComment} className="space-y-4">
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                rows={4}
                                placeholder="Viết bình luận của bạn... Hãy chia sẻ ý kiến của bạn để mọi người cùng thảo luận."
                                className="w-full min-h-[140px] rounded-2xl border border-slate-200 bg-white p-3 text-[15px] text-slate-700 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 resize-none"
                            />
                            <div className="mt-1.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                                <button
                                    type="submit"
                                    disabled={!newComment.trim() || commentsLoading || isSubmittingComment}
                                    className="inline-flex items-center cursor-pointer justify-center gap-2 rounded-full bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isSubmittingComment ? 'Đang gửi...' : 'Gửi bình luận'}
                                </button>
                            </div>
                        </div>
                    </form>
                </section>

                <section className="space-y-4 mb-8">
                    {commentsLoading ? (
                        <div className="rounded-2xl bg-white shadow-lg p-6 text-center text-slate-500">
                            Đang tải bình luận...
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="rounded-2xl bg-white shadow-lg p-6 text-center text-slate-500">
                            Chưa có bình luận nào. Hãy là người đầu tiên để lại ý kiến.
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <div
                                key={comment.id}
                                className="relative rounded-2xl bg-white shadow-sm border border-slate-200 p-3 md:p-4"
                            >
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <UserLink user={comment.user} avatarSize="w-10 h-10" showName>
                                                {comment.user.role === 'ADMIN' && (
                                                    <span className="px-2 py-0.5 text-[11px] uppercase tracking-wider font-black text-white bg-red-600 rounded-full">
                                                        Admin
                                                    </span>
                                                )}
                                            </UserLink>
                                            <span className="text-slate-600 text-sm">
                                                {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveMenuId(activeMenuId === comment.id ? null : comment.id);
                                                }}
                                                className="comment-action-button inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                                                aria-label="Mở menu bình luận"
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>

                                            {activeMenuId === comment.id && (
                                                <div
                                                    className="comment-action-menu absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl z-50"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopyComment(comment.content)}
                                                        className="w-full cursor-pointer px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                                    >
                                                        <span className="inline-flex items-center gap-2">
                                                            <Copy size={14} /> Sao chép
                                                        </span>
                                                    </button>
                                                    {(comment.userId === user?.id || user?.role === 'ADMIN') && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleStartEdit(comment)}
                                                                className="w-full cursor-pointer px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                                            >
                                                                <span className="inline-flex items-center gap-2">
                                                                    <Edit3 size={14} /> Chỉnh sửa
                                                                </span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setCommentToDelete(comment);
                                                                    setActiveMenuId(null);
                                                                    setTimeout(() => setCommentDeleteVisible(true), 10);
                                                                }}
                                                                className="w-full cursor-pointer px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"
                                                            >
                                                                <span className="inline-flex items-center gap-2">
                                                                    <Trash2 size={14} /> Xóa
                                                                </span>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {editingCommentId === comment.id ? (
                                        <form onSubmit={(e) => handleEditSubmit(comment.id, e)} className="space-y-3">
                                            <textarea
                                                value={editingContent}
                                                onChange={(e) => setEditingContent(e.target.value)}
                                                rows={3}
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-[15px] text-slate-700 outline-none focus:border-red-500 focus:bg-white"
                                                autoFocus
                                                disabled={isEditingLoading}
                                            />
                                            <div className="flex flex-wrap items-center justify-end gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingCommentId(null)}
                                                    className="px-3 py-1.5 cursor-pointer rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={!editingContent.trim() || isEditingLoading}
                                                    className="px-3 py-1.5 cursor-pointer rounded-full bg-red-600 font-semibold text-white hover:bg-red-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    {isEditingLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <p className="text-slate-700 text-[15px] leading-relaxed whitespace-pre-wrap">
                                            {renderFormattedComment(comment.content)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </section>

                {commentToDelete && (
                    <div
                        className="fixed inset-0 z-[160] flex items-center justify-center p-4"
                        onClick={() => {
                            if (isDeletingComment) return;
                            setCommentDeleteVisible(false);
                            setTimeout(() => setCommentToDelete(null), commentDeleteDuration);
                        }}
                    >
                        <div
                            className={`absolute inset-0 bg-slate-950/70 transition-opacity duration-${commentDeleteDuration} ${
                                commentDeleteVisible ? 'opacity-100' : 'opacity-0'
                            }`}
                            onClick={() => {
                                if (isDeletingComment) return;
                                setCommentDeleteVisible(false);
                                setTimeout(() => setCommentToDelete(null), commentDeleteDuration);
                            }}
                        />
                        <div
                            className={`relative w-full max-w-3xl rounded-[1rem] bg-white p-5 shadow-2xl transform transition-all duration-${commentDeleteDuration} ${
                                commentDeleteVisible
                                    ? 'opacity-100 translate-y-0 scale-100'
                                    : 'opacity-0 translate-y-3 scale-95'
                            }`}
                        >
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">Xác nhận xóa bình luận</h3>
                            <p className="text-[15px] text-slate-600 mb-5">
                                Bạn có chắc chắn muốn xóa bình luận này? Hành động không thể hoàn tác.
                            </p>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 mb-5">
                                <p className="text-[15px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    {renderFormattedComment(commentToDelete.content)}
                                </p>
                            </div>
                            <div className="flex flex-row justify-end gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCommentDeleteVisible(false);
                                        setTimeout(() => setCommentToDelete(null), commentDeleteDuration);
                                    }}
                                    disabled={isDeletingComment}
                                    className="rounded-full cursor-pointer bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        // start delete immediately, but keep modal visible until animation end
                                        handleDeleteComment(commentToDelete.id);
                                        setCommentDeleteVisible(false);
                                        setTimeout(() => setCommentToDelete(null), commentDeleteDuration);
                                    }}
                                    disabled={isDeletingComment}
                                    className="rounded-full cursor-pointer bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isDeletingComment ? 'Đang xóa...' : 'Xóa bình luận'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                    >
                        ← Quay lại tin tức
                    </Link>
                </div>
            </div>

            <ScrollToTopButton />

            {openLikesModal && (
                <div
                    className={`fixed inset-0 z-[150] flex items-center justify-center p-4 transition-opacity duration-${modalTransitionDuration}`}
                >
                    <div
                        className={`absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-${modalTransitionDuration} ${
                            showLikesModal ? 'opacity-100' : 'opacity-0'
                        }`}
                        onClick={() => {
                            setShowLikesModal(false);
                            setTimeout(() => setOpenLikesModal(false), modalTransitionDuration);
                        }}
                    />

                    <div
                        className={`relative w-full max-w-3xl rounded-[1rem] bg-white shadow-2xl overflow-hidden transform transition-all duration-${modalTransitionDuration} ${
                            showLikesModal ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-95'
                        }`}
                    >
                        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-100 px-3 md:px-4 py-3">
                            <div className="flex items-center gap-3 text-slate-900 font-bold text-lg">
                                <Users size={18} />
                                <span>Danh sách người thả tim</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowLikesModal(false);
                                    setTimeout(() => setOpenLikesModal(false), modalTransitionDuration);
                                }}
                                className="inline-flex cursor-pointer items-center justify-center w-9 h-9 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="max-h-[65vh] overflow-y-auto p-3 md:p-4 space-y-3">
                            {loadingLikes ? (
                                <div className="text-center text-slate-500">Đang tải danh sách...</div>
                            ) : likes.length === 0 ? (
                                <div className="text-center text-slate-500">Chưa có ai thả tim bài viết này.</div>
                            ) : (
                                likes.map((like) => (
                                    <div
                                        key={like.id}
                                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5 md:p-4"
                                    >
                                        <UserLink user={like.user} avatarSize="w-10 h-10 md:w-11 md:h-11" showName>
                                            <span className="text-[13px] text-slate-500">
                                                {like.reaction === 'LOVE' ? '❤️' : like.reaction}
                                            </span>
                                        </UserLink>

                                        <span className="text-sm text-slate-600">
                                            {new Date(like.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsDetail;
