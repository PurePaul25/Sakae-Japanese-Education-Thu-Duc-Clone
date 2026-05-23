import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Plus,
    Pencil,
    Trash2,
    X,
    Upload,
    Bold,
    Italic,
    Underline,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Link2,
    Minus,
    AlertTriangle,
    Undo,
    Redo,
} from 'lucide-react';
import blogService from '../../services/blogService';
import { useToast } from '../../contexts/ToastContext';

const CATEGORIES = [
    'Học tiếng Nhật',
    'Du học & Việc làm',
    'Sự kiện',
    'Thông báo',
    'Kiến thức',
    'Văn hóa Nhật Bản',
    'JLPT',
    'Khóa học',
];

// ─── Delete Confirm Modal ────────────────────────────────────────────────────
const DeleteConfirmModal = ({ post, onConfirm, onCancel, loading }) => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl p-6">
            <div className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertTriangle size={28} className="text-red-600" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Xóa bài viết?</h3>
                    <p className="text-base text-slate-500 dark:text-slate-400">
                        Bài <span className="font-semibold text-slate-700 dark:text-slate-200">"{post.title}"</span> sẽ
                        bị xóa vĩnh viễn kèm ảnh thumbnail.
                    </p>
                </div>
                <div className="flex gap-3 w-full">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 cursor-pointer border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        Huỷ
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-60"
                    >
                        {loading ? 'Đang xóa...' : 'Xóa bài viết'}
                    </button>
                </div>
            </div>
        </div>
    </div>
);

// ─── WYSIWYG Editor ──────────────────────────────────────────────────────────
const WysiwygEditor = ({ value, onChange }) => {
    const editorRef = useRef(null);
    const isInternalChange = useRef(false);

    // Normalize content: convert <strong>→<b>, <em>→<i> and preserve raw line breaks as <br>
    const normalizeContent = (html) => {
        if (!html) return '';
        return html
            .replace(/<strong>/gi, '<b>')
            .replace(/<\/strong>/gi, '</b>')
            .replace(/<em>/gi, '<i>')
            .replace(/<\/em>/gi, '</i>')
            .replace(/\r\n|\r|\n/g, '<br>');
    };

    // Sync value → DOM chỉ khi mount hoặc khi value thay đổi từ bên ngoài
    useEffect(() => {
        const el = editorRef.current;
        if (!el || isInternalChange.current) return;
        const normalized = normalizeContent(value);
        if (el.innerHTML !== normalized) {
            el.innerHTML = normalized;
        }
    }, [value]);

    const handleInput = useCallback(() => {
        isInternalChange.current = true;
        const content = normalizeContent(editorRef.current?.innerHTML ?? '');
        onChange(content);
        // Reset flag sau tick
        setTimeout(() => {
            isInternalChange.current = false;
        }, 0);
    }, [onChange]);

    const handleBlur = useCallback(() => {
        // Ensure content is saved when focus leaves editor
        isInternalChange.current = true;
        const content = normalizeContent(editorRef.current?.innerHTML ?? '');
        onChange(content);
        setTimeout(() => {
            isInternalChange.current = false;
        }, 0);
    }, [onChange]);

    const exec = useCallback(
        (command, val = null) => {
            editorRef.current?.focus();
            document.execCommand(command, false, val);
            handleInput();
        },
        [handleInput],
    );

    const handleKeyDown = (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'b':
                    e.preventDefault();
                    exec('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    exec('italic');
                    break;
                case 'u':
                    e.preventDefault();
                    exec('underline');
                    break;
                case 'z':
                    e.preventDefault();
                    exec(e.shiftKey ? 'redo' : 'undo');
                    break;
                case 'k': {
                    e.preventDefault();
                    const url = prompt('Nhập đường link:');
                    if (url) exec('createLink', url);
                    break;
                }
                default:
                    break;
            }
        }
        // Tab → indent
        if (e.key === 'Tab') {
            e.preventDefault();
            exec('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;');
        }
    };

    const insertLink = () => {
        const url = prompt('Nhập đường link:');
        if (url) exec('createLink', url);
    };

    const tools = [
        { icon: <Undo size={14} />, title: 'Hoàn tác (Ctrl+Z)', cmd: 'undo' },
        { icon: <Redo size={14} />, title: 'Làm lại (Ctrl+Shift+Z)', cmd: 'redo' },
        null, // separator
        { icon: <Bold size={14} />, title: 'In đậm (Ctrl+B)', cmd: 'bold' },
        { icon: <Italic size={14} />, title: 'In nghiêng (Ctrl+I)', cmd: 'italic' },
        { icon: <Underline size={14} />, title: 'Gạch chân (Ctrl+U)', cmd: 'underline' },
        null,
        {
            icon: <span className="text-[13px] font-black leading-none">H2</span>,
            title: 'Tiêu đề lớn',
            cmd: 'formatBlock',
            val: 'h2',
        },
        {
            icon: <span className="text-[13px] font-black leading-none">H3</span>,
            title: 'Tiêu đề nhỏ',
            cmd: 'formatBlock',
            val: 'h3',
        },
        {
            icon: <span className="text-[13px] font-black leading-none">P</span>,
            title: 'Đoạn văn',
            cmd: 'formatBlock',
            val: 'p',
        },
        null,
        { icon: <List size={14} />, title: 'Danh sách chấm', cmd: 'insertUnorderedList' },
        { icon: <ListOrdered size={14} />, title: 'Danh sách số', cmd: 'insertOrderedList' },
        { icon: <Quote size={14} />, title: 'Trích dẫn', cmd: 'formatBlock', val: 'blockquote' },
        null,
        { icon: <Link2 size={14} />, title: 'Chèn link (Ctrl+K)', action: insertLink },
        { icon: <Minus size={14} />, title: 'Đường kẻ ngang', cmd: 'insertHorizontalRule' },
    ];

    // Màu chữ thường dùng
    const TEXT_COLORS = [
        { label: 'Đen', value: '#1e293b' },
        { label: 'Xám', value: '#64748b' },
        { label: 'Đỏ', value: '#dc2626' },
        { label: 'Cam', value: '#ea580c' },
        { label: 'Vàng', value: '#ca8a04' },
        { label: 'Xanh lá', value: '#16a34a' },
        { label: 'Xanh dương', value: '#2563eb' },
        { label: 'Tím', value: '#9333ea' },
        { label: 'Hồng', value: '#db2777' },
        { label: 'Trắng', value: '#ffffff' },
    ];

    const [showColorPicker, setShowColorPicker] = useState(false);
    const colorPickerRef = useRef(null);

    // Đóng color picker khi click ra ngoài
    useEffect(() => {
        const handler = (e) => {
            if (colorPickerRef.current && !colorPickerRef.current.contains(e.target)) {
                setShowColorPicker(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 p-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                {tools.map((t, i) =>
                    t === null ? (
                        <div key={i} className="w-px h-5 bg-slate-200 dark:bg-slate-600 mx-1" />
                    ) : (
                        <button
                            key={i}
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                t.action ? t.action() : exec(t.cmd, t.val ?? null);
                            }}
                            title={t.title}
                            className="p-1.5 rounded-lg cursor-pointer transition-colors text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white"
                        >
                            {t.icon}
                        </button>
                    ),
                )}

                {/* Color picker */}
                <div className="relative" ref={colorPickerRef}>
                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            setShowColorPicker((v) => !v);
                        }}
                        title="Màu chữ"
                        className="p-1.5 rounded-lg cursor-pointer transition-colors text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white flex items-center gap-1"
                    >
                        <span className="text-[13px] font-bold leading-none">A</span>
                        <span className="w-3 h-1 rounded-sm bg-red-500 block" />
                    </button>
                    {showColorPicker && (
                        <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 w-52">
                            <p className="text-xs font-semibold text-slate-500 mb-2">Chọn màu chữ</p>
                            <div className="grid grid-cols-5 gap-2 mb-3">
                                {TEXT_COLORS.map((c) => (
                                    <button
                                        key={c.value}
                                        type="button"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            exec('foreColor', c.value);
                                            setShowColorPicker(false);
                                        }}
                                        title={c.label}
                                        className="w-8 h-8 cursor-pointer rounded-lg border-2 border-slate-200 dark:border-slate-600 hover:scale-110 transition-transform"
                                        style={{ backgroundColor: c.value }}
                                    />
                                ))}
                            </div>
                            {/* Custom color input */}
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-slate-500 whitespace-nowrap">Màu khác:</label>
                                <input
                                    type="color"
                                    defaultValue="#000000"
                                    onInput={(e) => exec('foreColor', e.target.value)}
                                    className="w-8 h-7 rounded cursor-pointer border border-slate-200 p-0.5"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <span className="ml-auto text-sm text-slate-500 pr-1 hidden lg:block">Soạn thảo văn bản</span>
            </div>

            {/* Editable area */}
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="min-h-[220px] max-h-[400px] overflow-y-auto px-2.5 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-[15px] focus:outline-none
                    prose prose-sm max-w-none
                    prose-headings:font-bold prose-headings:text-slate-800 dark:prose-headings:text-white
                    prose-h2:text-xl prose-h3:text-lg
                    prose-p:my-1 prose-li:my-0.5
                    prose-blockquote:border-l-4 prose-blockquote:border-red-400 prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:text-slate-500
                    prose-a:text-red-600 prose-a:underline
                    [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1
                    [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-2 [&_h3]:mb-1
                    [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5
                    [&_blockquote]:border-l-4 [&_blockquote]:border-red-400 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-slate-500
                    [&_a]:text-red-600 [&_a]:underline
                    [&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic [&_u]:underline"
                data-placeholder="Bắt đầu nhập nội dung bài viết..."
            />

            <style>{`
                [contenteditable]:empty:before {
                    content: attr(data-placeholder);
                    color: #94a3b8;
                    pointer-events: none;
                }
            `}</style>
        </div>
    );
};

// ─── Blog Modal ──────────────────────────────────────────────────────────────
const BlogModal = ({ post, onClose, onSaved }) => {
    const isEdit = !!post;
    const fileRef = useRef(null);
    const { addToast } = useToast();

    const [form, setForm] = useState({
        title: post?.title ?? '',
        slug: post?.slug ?? '',
        excerpt: post?.excerpt ?? '',
        content: post?.content ?? '',
        category: CATEGORIES.includes(post?.category) ? (post?.category ?? '') : post?.category ? '__custom__' : '',
        customCategory: CATEGORIES.includes(post?.category) ? '' : (post?.category ?? ''),
        isPublished: post?.isPublished ?? true,
        metaTitle: post?.metaTitle ?? '',
        metaDescription: post?.metaDescription ?? '',
    });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(post?.thumbnail ?? null);
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        // Chỉ auto-gen slug khi tạo mới
        if (!isEdit) {
            const slug = title
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd')
                .replace(/[^a-z0-9\s-]/g, '')
                .trim()
                .replace(/\s+/g, '-');
            setForm((f) => ({ ...f, title, slug }));
        } else {
            setForm((f) => ({ ...f, title }));
        }
    };

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) {
            addToast('Vui lòng nhập tiêu đề bài viết.', 'error');
            return;
        }
        if (!form.slug.trim()) {
            addToast('Vui lòng nhập slug.', 'error');
            return;
        }
        if (!form.content.trim() || form.content === '<br>') {
            addToast('Vui lòng nhập nội dung bài viết.', 'error');
            return;
        }

        setSaving(true);
        try {
            const finalCategory = form.category === '__custom__' ? form.customCategory : form.category;
            const fd = new FormData();
            fd.append('title', form.title.trim());
            fd.append('slug', form.slug.trim());
            fd.append('excerpt', form.excerpt.trim());
            fd.append('content', form.content);
            fd.append('category', finalCategory);
            // isPublished phải là string 'true'/'false' cho FormData
            fd.append('isPublished', form.isPublished ? 'true' : 'false');
            fd.append('metaTitle', form.metaTitle.trim());
            fd.append('metaDescription', form.metaDescription.trim());
            if (file) fd.append('thumbnail', file);

            if (isEdit) {
                await blogService.update(post.id, fd);
                addToast('Đã cập nhật bài viết thành công!', 'success');
            } else {
                await blogService.create(fd);
                addToast('Đã tạo bài viết thành công!', 'success');
            }
            onSaved();
        } catch (err) {
            const res = err.response?.data;
            let detail = 'Có lỗi xảy ra. Vui lòng thử lại.';

            if (res?.errors && Array.isArray(res.errors)) {
                // NestJS validation errors: [{field, constraints: {isString: '...', isBoolean: '...'}}]
                const fieldMessages = res.errors.map((e) => {
                    const fieldName =
                        {
                            title: 'Tiêu đề',
                            slug: 'Slug',
                            content: 'Nội dung',
                            excerpt: 'Mô tả ngắn',
                            category: 'Danh mục',
                            isPublished: 'Trạng thái',
                            metaTitle: 'Meta title',
                            metaDescription: 'Meta description',
                        }[e.field] || e.field;
                    const msgs = Object.values(e.constraints || {}).join(', ');
                    return `${fieldName}: ${msgs}`;
                });
                detail = fieldMessages.join('\n');
            } else if (typeof res?.message === 'string' && res.message !== 'Validation failed') {
                detail = res.message;
            } else if (Array.isArray(res?.message)) {
                detail = res.message.join(', ');
            }

            addToast(detail, 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                        {isEdit ? 'Sửa bài viết' : 'Tạo bài viết mới'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Thumbnail */}
                    <div>
                        <label className="block text-[15px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Ảnh thumbnail
                        </label>
                        <div
                            onClick={() => fileRef.current?.click()}
                            className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 cursor-pointer hover:border-red-400 transition-colors flex flex-col items-center gap-2"
                        >
                            {preview ? (
                                <img src={preview} alt="preview" className="w-full h-70 object-cover rounded-lg" />
                            ) : (
                                <>
                                    <Upload size={24} className="text-slate-400" />
                                    <span className="text-sm text-slate-400">
                                        Click để chọn ảnh (1200×630 khuyến nghị)
                                    </span>
                                </>
                            )}
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-[15px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Tiêu đề <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleTitleChange}
                            required
                            className="w-full px-2.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                            placeholder="Tiêu đề bài viết..."
                        />
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="block text-[15px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Slug
                        </label>
                        <input
                            name="slug"
                            value={form.slug}
                            onChange={handleChange}
                            required
                            className="w-full px-2.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400 font-mono"
                            placeholder="slug-bai-viet"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-[15px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Danh mục
                        </label>
                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            className="w-full px-2.5 cursor-pointer py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                        >
                            <option value="">-- Chọn danh mục --</option>
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                            <option value="__custom__">✏️ Nhập danh mục khác...</option>
                        </select>
                        {form.category === '__custom__' && (
                            <input
                                name="customCategory"
                                value={form.customCategory}
                                onChange={handleChange}
                                autoFocus
                                className="mt-2 w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                placeholder="Nhập tên danh mục..."
                            />
                        )}
                    </div>

                    {/* Excerpt */}
                    <div>
                        <label className="block text-[15px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Mô tả ngắn (không bắt buộc)
                        </label>
                        <textarea
                            name="excerpt"
                            value={form.excerpt}
                            onChange={handleChange}
                            rows={2}
                            className="w-full px-2.5 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                            placeholder="Mô tả ngắn hiển thị ở trang danh sách..."
                        />
                    </div>

                    {/* Content — WYSIWYG */}
                    <div>
                        <label className="block text-[15px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Nội dung <span className="text-red-500">*</span>
                        </label>
                        <WysiwygEditor
                            value={form.content}
                            onChange={(val) => setForm((f) => ({ ...f, content: val }))}
                        />
                    </div>

                    {/* SEO */}
                    <details className="border border-slate-100 dark:border-slate-800 rounded-xl">
                        <summary className="px-4 py-3 text-[15px] font-semibold text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-800 dark:hover:text-white select-none">
                            🔍 SEO (tuỳ chọn)
                        </summary>
                        <div className="px-4 pb-4 space-y-3 pt-2">
                            <input
                                name="metaTitle"
                                value={form.metaTitle}
                                onChange={handleChange}
                                className="w-full px-2.5 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                placeholder="Meta title (để trống = dùng tiêu đề bài)"
                            />
                            <textarea
                                name="metaDescription"
                                value={form.metaDescription}
                                onChange={handleChange}
                                rows={2}
                                className="w-full px-2.5 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                                placeholder="Meta description..."
                            />
                        </div>
                    </details>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-2.5 py-2 cursor-pointer border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Huỷ
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-2.5 py-2 cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
                        >
                            {saving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo bài viết'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Main AdminBlog ──────────────────────────────────────────────────────────
const AdminBlog = () => {
    const { addToast } = useToast();
    // Dùng ref để các callback không stale và tránh double-fire StrictMode
    const addToastRef = useRef(addToast);
    useEffect(() => {
        addToastRef.current = addToast;
    }, [addToast]);

    const [posts, setPosts] = useState([]);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchPosts = useCallback(async (p = 1) => {
        setLoading(true);
        try {
            const res = await blogService.getAll({ page: p, limit: 10 });
            const payload = res.data?.data ?? res.data;
            setPosts(payload.data ?? []);
            setMeta(payload.meta ?? null);
        } catch {
            // Dùng ref để tránh toast hiện 2 lần do StrictMode
            addToastRef.current('Không thể tải danh sách bài viết.', 'error');
        } finally {
            setLoading(false);
        }
    }, []); // không có addToast trong deps

    useEffect(() => {
        fetchPosts(page);
    }, [page, fetchPosts]);

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await blogService.remove(deleteTarget.id);
            addToastRef.current(`Đã xóa bài "${deleteTarget.title}".`, 'success');
            setDeleteTarget(null);
            fetchPosts(page);
        } catch {
            addToastRef.current('Xóa bài viết thất bại.', 'error');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Quản lý tin tức</h2>
                    <p className="text-slate-500 mt-1">Tất cả bài viết, thông báo và tin tức sự kiện.</p>
                </div>
                <button
                    onClick={() => setModal('create')}
                    className="flex items-center cursor-pointer gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-red-200 dark:shadow-none"
                >
                    <Plus size={16} /> Tạo bài viết
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                {['Bài viết', 'Danh mục', 'Trạng thái', 'Lượt xem', 'Ngày tạo', ''].map((h, i) => (
                                    <th
                                        key={i}
                                        className="px-5 py-3 text-[13px] font-bold text-slate-600 uppercase tracking-wider"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {[5, 3, 2, 2, 3, 1].map((w, j) => (
                                            <td key={j} className="px-5 py-3">
                                                <div
                                                    className={`h-4 bg-slate-100 dark:bg-slate-800 rounded w-${w * 10}`}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : posts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        Chưa có bài viết nào. Nhấn "Tạo bài viết" để bắt đầu!
                                    </td>
                                </tr>
                            ) : (
                                posts.map((post) => (
                                    <tr
                                        key={post.id}
                                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                                    >
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                {post.thumbnail && (
                                                    <img
                                                        src={post.thumbnail}
                                                        alt={post.title}
                                                        className="w-14 h-12 object-cover rounded-lg flex-shrink-0"
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-semibold text-slate-700 dark:text-white text-sm line-clamp-1 max-w-xs">
                                                        {post.title}
                                                    </p>
                                                    <p className="text-xs text-slate-400 font-mono">{post.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            {post.category ? (
                                                <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                                    {post.category}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-300">—</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3">
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${post.isPublished ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}
                                            >
                                                {post.isPublished ? 'Đã đăng' : 'Nháp'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-sm text-slate-500 font-mono">
                                            {(post.views ?? 0).toLocaleString()}
                                        </td>
                                        <td className="px-5 py-3 text-sm text-slate-500">
                                            {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-1 justify-end">
                                                <button
                                                    onClick={() => setModal(post)}
                                                    className="p-1.5 text-slate-400 cursor-pointer hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Chỉnh sửa bài viết"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(post)}
                                                    title="Xóa bài viết"
                                                    className="p-1.5 text-slate-400 cursor-pointer hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {meta && meta.totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                            Trang <span className="font-semibold">{page}</span> /{' '}
                            <span className="font-semibold">{meta.totalPages}</span> · Tổng{' '}
                            <span className="font-semibold">{meta.total}</span> bài
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                ←
                            </button>
                            <button
                                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                                disabled={page === meta.totalPages}
                                className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {modal && (
                <BlogModal
                    post={modal === 'create' ? null : modal}
                    onClose={() => setModal(null)}
                    onSaved={() => {
                        setModal(null);
                        fetchPosts(page);
                    }}
                />
            )}

            {deleteTarget && (
                <DeleteConfirmModal
                    post={deleteTarget}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteTarget(null)}
                    loading={deleting}
                />
            )}
        </div>
    );
};

export default AdminBlog;
