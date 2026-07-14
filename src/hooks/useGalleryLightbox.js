import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';

/**
 * Reusable hook that wires up all GalleryLightbox state & handlers.
 *
 * @param {object[]} galleryList  - the array of formatted gallery items in scope
 * @param {function} setGalleryList - state setter for that array (for optimistic updates)
 * @param {function} [onLikeError]  - optional callback when a like request fails
 */
export function useGalleryLightbox(galleryList, setGalleryList, onLikeError) {
    const { user } = useUser();
    const { addToast } = useToast();

    // ── lightbox open/close ───────────────────────────────────────────────────
    const [selectedImage, setSelectedImage] = useState(null);

    // ── zoom & pan ────────────────────────────────────────────────────────────
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const touchStartX = useRef(null);
    const touchEndX = useRef(null);

    // ── comments ──────────────────────────────────────────────────────────────
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);

    // reset zoom/pan on image change
    useEffect(() => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    }, [selectedImage]);

    // prevent body scroll when lightbox is open
    useEffect(() => {
        document.body.style.overflow = selectedImage ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedImage]);

    // fetch comments when image is selected
    useEffect(() => {
        if (!selectedImage) { setComments([]); return; }
        const fetch = async () => {
            try {
                setLoadingComments(true);
                const res = await api.get(`/gallery/${selectedImage.id}`);
                const data = res.data?.data || res.data || {};
                setComments(data.comments || []);
            } catch (err) {
                console.error('Lỗi khi lấy bình luận:', err);
            } finally {
                setLoadingComments(false);
            }
        };
        fetch();
    }, [selectedImage]);

    // keyboard navigation
    const handleNext = useCallback(() => {
        const idx = galleryList.findIndex((img) => img.id === selectedImage?.id);
        setSelectedImage(galleryList[idx < galleryList.length - 1 ? idx + 1 : 0]);
    }, [galleryList, selectedImage]);

    const handlePrev = useCallback(() => {
        const idx = galleryList.findIndex((img) => img.id === selectedImage?.id);
        setSelectedImage(galleryList[idx > 0 ? idx - 1 : galleryList.length - 1]);
    }, [galleryList, selectedImage]);

    useEffect(() => {
        if (!selectedImage) return;
        const onKey = (e) => {
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') setSelectedImage(null);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [selectedImage, handleNext, handlePrev]);

    // ── zoom handlers ─────────────────────────────────────────────────────────
    const handleZoomIn = (e) => { if (e) e.stopPropagation(); setZoom((p) => Math.min(p + 0.25, 4)); };
    const handleZoomOut = (e) => {
        if (e) e.stopPropagation();
        setZoom((p) => { const n = Math.max(p - 0.25, 1); if (n === 1) setPan({ x: 0, y: 0 }); return n; });
    };

    // ── mouse drag ────────────────────────────────────────────────────────────
    const onMouseDown = (e) => {
        if (zoom <= 1) return;
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    };
    const onMouseMove = (e) => {
        if (!isDragging || zoom <= 1) return;
        setPan({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y });
    };
    const onMouseUp = () => setIsDragging(false);
    const onMouseLeave = () => setIsDragging(false);

    // ── touch swipe & drag ────────────────────────────────────────────────────
    const onTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        if (zoom > 1) {
            setIsDragging(true);
            dragStartRef.current = { x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y };
        }
    };
    const onTouchMove = (e) => {
        touchEndX.current = e.touches[0].clientX;
        if (isDragging && zoom > 1)
            setPan({ x: e.touches[0].clientX - dragStartRef.current.x, y: e.touches[0].clientY - dragStartRef.current.y });
    };
    const onTouchEnd = () => {
        setIsDragging(false);
        if (!touchStartX.current || !touchEndX.current) return;
        const dist = touchStartX.current - touchEndX.current;
        if (zoom === 1) { if (dist > 50) handleNext(); if (dist < -50) handlePrev(); }
        touchStartX.current = null;
        touchEndX.current = null;
    };

    // ── download ──────────────────────────────────────────────────────────────
    const handleDownload = async (e) => {
        e.stopPropagation();
        if (!selectedImage) return;
        try {
            const res = await fetch(selectedImage.src);
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const ext = selectedImage.src.split('.').pop().split('?')[0] || 'jpg';
            a.download = `${selectedImage.title}.${ext}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch {
            window.open(selectedImage.src, '_blank');
        }
    };

    // ── optimistic like helper (shared between list + selectedImage) ──────────
    const applyOptimisticLike = (prev, postId, reactionType) => {
        const isRemoving = prev.isLiked && prev.userReaction === reactionType;
        const isChanging = prev.isLiked && prev.userReaction !== reactionType;
        const nextLiked = !isRemoving;
        const nextCount = isRemoving
            ? Math.max(0, prev.likesCount - 1)
            : !prev.isLiked ? prev.likesCount + 1 : prev.likesCount;

        let newTop = prev.topReactions ? [...prev.topReactions] : [];
        if (isRemoving) { if (nextCount === 0) newTop = []; }
        else if (isChanging) { newTop = nextCount <= 1 ? [reactionType] : [reactionType, ...newTop.filter((r) => r !== prev.userReaction)].slice(0, 2); }
        else if (nextLiked && !newTop.includes(reactionType)) { newTop = [reactionType, ...newTop].slice(0, 2); }

        return { ...prev, isLiked: nextLiked, userReaction: nextLiked ? reactionType : null, likesCount: nextCount, topReactions: newTop };
    };

    const handleLike = async (postId, e, reactionType = 'LIKE') => {
        if (e) e.stopPropagation();
        if (!user) { addToast('Vui lòng đăng nhập để thả tim!', 'warning'); return; }

        // Optimistic update on list
        setGalleryList((prev) => prev.map((p) => p.id === postId ? applyOptimisticLike(p, postId, reactionType) : p));

        // Optimistic update on lightbox
        if (selectedImage?.id === postId) {
            setSelectedImage((prev) => applyOptimisticLike(prev, postId, reactionType));
        }

        try {
            await api.post(`/gallery/${postId}/like`, { reaction: reactionType });
        } catch (err) {
            addToast(err.message || 'Lỗi khi thích bài viết', 'error');
            if (onLikeError) onLikeError();
        }
    };

    // ── comment handlers ──────────────────────────────────────────────────────
    const handleAddComment = async (e) => {
        if (e) e.preventDefault();
        if (!newComment.trim()) return;
        if (!user) { addToast('Vui lòng đăng nhập để bình luận!', 'warning'); return; }

        const text = newComment;
        setNewComment('');
        try {
            const res = await api.post(`/gallery/${selectedImage.id}/comments`, { content: text });
            const added = res.data?.data || res.data;
            setComments((prev) => [added, ...prev]);
            const bump = (p) => p.id === selectedImage.id ? { ...p, commentsCount: p.commentsCount + 1 } : p;
            setGalleryList((prev) => prev.map(bump));
            setSelectedImage((prev) => ({ ...prev, commentsCount: prev.commentsCount + 1 }));
            addToast('Đã gửi bình luận!', 'success');
        } catch (err) {
            addToast(err.message || 'Lỗi khi gửi bình luận', 'error');
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await api.delete(`/gallery/comments/${commentId}`);
            setComments((prev) => prev.filter((c) => c.id !== commentId));
            const bump = (p) => p.id === selectedImage?.id ? { ...p, commentsCount: Math.max(0, p.commentsCount - 1) } : p;
            setGalleryList((prev) => prev.map(bump));
            setSelectedImage((prev) => prev ? { ...prev, commentsCount: Math.max(0, prev.commentsCount - 1) } : prev);
            addToast('Đã xóa bình luận!', 'success');
        } catch (err) {
            addToast(err.message || 'Lỗi khi xóa bình luận', 'error');
        }
    };

    return {
        // lightbox
        selectedImage, setSelectedImage,
        // zoom/pan
        zoom, pan, isDragging,
        handleZoomIn, handleZoomOut,
        onMouseDown, onMouseMove, onMouseUp, onMouseLeave,
        onTouchStart, onTouchMove, onTouchEnd,
        // nav
        handleNext, handlePrev,
        // actions
        handleDownload, handleLike,
        // comments
        comments, setComments, newComment, setNewComment, loadingComments,
        handleAddComment, handleDeleteComment,
    };
}
