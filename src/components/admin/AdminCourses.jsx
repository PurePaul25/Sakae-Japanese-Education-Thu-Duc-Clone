import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Plus,
    Pencil,
    Trash2,
    X,
    Upload,
    AlertTriangle,
    Search,
    Calendar,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    Loader2,
    Undo,
    Redo,
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    Quote,
    Link2,
    ImagePlus,
    Minus,
} from 'lucide-react';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import DropdownSelect from '../ui/DropdownSelect';

// ─── Constants ───────────────────────────────────────────────────────────────
const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1', 'Thiếu nhi', 'Kèm 1:1', 'Kaiwa & Luyện thi'];
const TYPES = ['Cấp tốc', 'Siêu tốc', 'Online'];
const SCHEDULE_STATUSES = ['Sắp khai giảng', 'Đang nhận học viên', 'Đã đầy', 'Đã kết thúc'];

const STATUS_COLORS = {
    'Sắp khai giảng': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'Đang nhận học viên': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    'Đã đầy': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    'Đã kết thúc': 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
};

// ─── Helper ───────────────────────────────────────────────────────────────────
const extractError = (err) => {
    const msg = err?.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string') return msg;
    return 'Có lỗi xảy ra. Vui lòng thử lại.';
};

const fmtCurrency = (n) =>
    n != null ? Number(n).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '—';

// ─── Loading Spinner ──────────────────────────────────────────────────────────
const LoadingSpinner = ({ label = 'Đang tải...' }) => (
    <div className="col-span-full flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 size={36} className="animate-spin text-red-500" />
        <p className="text-sm text-slate-400">{label}</p>
    </div>
);

const isAbortError = (err) =>
    err?.name === 'CanceledError' || err?.name === 'AbortError' || err?.code === 'ERR_CANCELED';

const useBodyScrollLock = (enabled = true) => {
    useEffect(() => {
        if (!enabled) return;

        const previousBodyOverflow = document.body.style.overflow;
        const previousBodyPaddingRight = document.body.style.paddingRight;
        const previousHtmlOverflow = document.documentElement.style.overflow;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth > 0 ? scrollbarWidth : 0}px`;
        document.documentElement.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousBodyOverflow;
            document.body.style.paddingRight = previousBodyPaddingRight;
            document.documentElement.style.overflow = previousHtmlOverflow;
        };
    }, [enabled]);
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteConfirmModal = ({ title, message, onConfirm, onCancel, loading, show, duration = 300 }) => {
    useBodyScrollLock(show);

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-5">
            <div
                className={`absolute inset-0 bg-black/70 transition-opacity duration-${duration} ${
                    show ? 'opacity-100' : 'opacity-0'
                }`}
            />
            <div
                className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl p-6 transform transition-all duration-${duration} ${
                    show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
                }`}
            >
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-18 h-18 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <AlertTriangle size={36} className="text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">{title}</h3>
                        <p className="text-slate-500 dark:text-slate-400">{message}</p>
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
                            {loading ? 'Đang xóa...' : 'Xóa'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── WYSIWYG Editor ──────────────────────────────────────────────────────────
const WysiwygEditor = ({ value, onChange }) => {
    const editorRef = useRef(null);
    const imageInputRef = useRef(null);
    const isInternalChange = useRef(false);

    // Normalize content: convert <strong>→<b>, <em>→<i> and preserve raw line breaks as <br>
    const normalizeContent = useCallback((html) => {
        if (!html) return '';
        return html
            .replace(/<meta[^>]*>/gi, '')
            .replace(/<(\/?)(?:o:|mso|st1|w:|v:)[^>]*>/gi, '<$1>')
            .replace(/<span\b[^>]*style=["'][^"']*mso-spacerun:[^"']*["'][^>]*>/gi, ' ')
            .replace(/<font\b[^>]*>/gi, '<span>')
            .replace(/<\/font>/gi, '</span>')
            .replace(/&nbsp;/gi, ' ')
            .replace(/<strong>/gi, '<b>')
            .replace(/<\/strong>/gi, '</b>')
            .replace(/<em>/gi, '<i>')
            .replace(/<\/em>/gi, '</i>')
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
                const styleAttr = hasStyle
                    ? ''
                    : ' style="max-width:100%; width:100%; height:auto; display:block; margin:10px 0; border-radius:10px; object-fit:cover;"';
                return `<img${attrs}${classAttr}${styleAttr}>`;
            })
            .replace(/\r\n|\r|\n/g, '<br>')
            .replace(/<div><br><\/div>/gi, '<div><br></div>')
            .replace(/<p><br><\/p>/gi, '<p><br></p>');
    }, []);

    // Sync value → DOM chỉ khi mount hoặc khi value thay đổi từ bên ngoài
    useEffect(() => {
        const el = editorRef.current;
        if (!el || isInternalChange.current) return;
        const normalized = normalizeContent(value);
        if (el.innerHTML !== normalized) {
            el.innerHTML = normalized;
        }
    }, [normalizeContent, value]);

    const normalizeWordContent = useCallback((html) => {
        if (!html) return '';
        return html
            .replace(/<meta[^>]*>/gi, '')
            .replace(/<(\/?)(?:o:|mso|st1|w:|v:)[^>]*>/gi, '<$1>')
            .replace(/<span\b[^>]*style=["'][^"']*mso-spacerun:[^"']*["'][^>]*>/gi, ' ')
            .replace(/<font\b[^>]*>/gi, '<span>')
            .replace(/<\/font>/gi, '</span>')
            .replace(/&nbsp;/gi, ' ')
            .replace(/\r\n|\r|\n/g, ' ');
    }, []);

    const insertImageHtml = useCallback((src, alt = 'Hình ảnh') => {
        const html = `<img src="${src}" alt="${alt}" class="mx-auto my-4 max-w-full h-auto rounded-xl block" style="max-width:100%; width:100%; height:auto; display:block; margin:10px 0; border-radius:10px; object-fit:cover;" />`;
        document.execCommand('insertHTML', false, html);
    }, []);

    const handleInput = useCallback(() => {
        isInternalChange.current = true;
        const content = normalizeContent(editorRef.current?.innerHTML ?? '');
        onChange(content);
        setTimeout(() => {
            isInternalChange.current = false;
        }, 0);
    }, [normalizeContent, onChange]);

    const handleImageSelect = useCallback(
        (e) => {
            const files = Array.from(e.target.files || []);
            if (!files.length) return;
            files.forEach((file) => {
                if (!file.type.startsWith('image/')) return;
                const reader = new FileReader();
                reader.onload = () => {
                    insertImageHtml(reader.result, file.name);
                    handleInput();
                };
                reader.readAsDataURL(file);
            });
            e.target.value = '';
        },
        [handleInput, insertImageHtml],
    );

    const handlePaste = useCallback(
        (e) => {
            const items = Array.from(e.clipboardData?.items || []);
            const imageItem = items.find((item) => item.type.startsWith('image/'));

            if (imageItem) {
                e.preventDefault();
                const file = imageItem.getAsFile();
                if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        insertImageHtml(reader.result, file.name);
                        handleInput();
                    };
                    reader.readAsDataURL(file);
                }
                return;
            }

            const pastedHtml = e.clipboardData?.getData('text/html');
            const pastedText = e.clipboardData?.getData('text/plain');

            if (pastedHtml) {
                e.preventDefault();
                const cleanedHtml = normalizeWordContent(pastedHtml);
                document.execCommand('insertHTML', false, cleanedHtml || pastedText || '');
                handleInput();
                return;
            }

            if (pastedText) {
                e.preventDefault();
                const trimmed = pastedText.trim();
                const looksLikeImageUrl = /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(trimmed);
                if (looksLikeImageUrl) {
                    insertImageHtml(trimmed, 'Hình ảnh');
                    handleInput();
                    return;
                }
                document.execCommand('insertText', false, pastedText);
                handleInput();
            }
        },
        [handleInput, insertImageHtml, normalizeWordContent],
    );

    const handleBlur = useCallback(() => {
        // Ensure content is saved when focus leaves editor
        isInternalChange.current = true;
        const content = normalizeContent(editorRef.current?.innerHTML ?? '');
        onChange(content);
        setTimeout(() => {
            isInternalChange.current = false;
        }, 0);
    }, [normalizeContent, onChange]);

    const exec = useCallback(
        (command, val = null) => {
            const el = editorRef.current;
            if (!el) return;
            el.focus();
            const selection = window.getSelection();
            const hasSelection = selection && selection.toString().trim().length > 0;

            if (command === 'foreColor' && val) {
                document.execCommand('styleWithCSS', false, true);
            }

            document.execCommand(command, false, val);

            if (!hasSelection) {
                const range = document.createRange();
                range.selectNodeContents(el);
                range.collapse(false);
                selection?.removeAllRanges();
                selection?.addRange(range);
            }

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
        {
            icon: <ImagePlus size={14} />,
            title: 'Chèn ảnh từ máy',
            action: () => imageInputRef.current?.click(),
        },
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

            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

            {/* Editable area */}
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                className="min-h-[200px] max-h-[400px] overflow-y-auto px-2.5 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-[15px] focus:outline-none whitespace-pre-wrap break-words leading-7
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
                    [&_a]:break-all"
                data-placeholder="Nhập nội dung chi tiết khóa học..."
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

// ─── Course Form Modal ────────────────────────────────────────────────────────
const CourseModal = ({ course, onClose, onSaved, show, duration = 300 }) => {
    useBodyScrollLock(show);

    const isEdit = !!course;
    const fileRef = useRef(null);
    const titleRef = useRef(null);
    const { addToast } = useToast();

    const [form, setForm] = useState({
        title: course?.title ?? '',
        description: course?.description ?? '',
        level: course?.level ?? '',
        type: course?.type ?? '',
        duration: course?.duration ?? '',
        tuition: course?.tuition ?? '',
        isPublished: course?.isPublished ?? false,
        content: course?.content ?? '',
    });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(course?.thumbnail ?? null);
    const [saving, setSaving] = useState(false);

    // Auto-focus title when modal opens
    useEffect(() => {
        if (show) {
            const t = setTimeout(() => titleRef.current?.focus(), 50);
            return () => clearTimeout(t);
        }
    }, [show]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
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
            addToast('Vui lòng nhập tiêu đề khóa học.', 'error');
            return;
        }
        if (!form.level) {
            addToast('Vui lòng chọn cấp độ.', 'error');
            return;
        }
        if (!form.type) {
            addToast('Vui lòng chọn loại khóa học.', 'error');
            return;
        }

        setSaving(true);
        try {
            const fd = new FormData();
            fd.append('title', form.title.trim());
            fd.append('description', form.description.trim());
            fd.append('level', form.level);
            fd.append('type', form.type);
            fd.append('duration', form.duration.trim());
            if (form.tuition !== '' && form.tuition != null) fd.append('tuition', Number(form.tuition));
            fd.append('isPublished', form.isPublished ? 'true' : 'false');
            fd.append('content', form.content);
            if (file) fd.append('thumbnail', file);

            if (isEdit) {
                await api.patch(`/courses/${course.id}`, fd);
                addToast('Đã cập nhật khóa học thành công!', 'success');
            } else {
                await api.post('/courses', fd);
                addToast('Đã tạo khóa học thành công!', 'success');
            }
            onSaved();
        } catch (err) {
            addToast(extractError(err), 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className={`absolute inset-0 bg-black/70 transition-opacity duration-${duration} ${
                    show ? 'opacity-100' : 'opacity-0'
                }`}
            />
            <div
                className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[94vh] overflow-y-auto transform transition-all duration-${duration} ${
                    show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                        {isEdit ? 'Sửa khóa học' : 'Tạo khóa học mới'}
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
                            className="border-2 border-dashed border-slate-200 min-h-[100px] dark:border-slate-700 rounded-xl p-1.5 cursor-pointer hover:border-red-400 transition-colors flex flex-col items-center justify-center gap-2"
                        >
                            {preview ? (
                                <div className="relative">
                                    <img
                                        src={preview}
                                        alt="preview"
                                        className="w-full h-auto max-h-[350px] object-contain rounded-lg"
                                    />
                                    {/* Nút xóa */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();

                                            setPreview(null);

                                            // Reset input để có thể chọn lại cùng 1 file
                                            if (fileRef.current) {
                                                fileRef.current.value = '';
                                            }
                                        }}
                                        className="absolute top-2 right-2 w-9 h-9 cursor-pointer rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition"
                                        title="Xóa ảnh thumbnail"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Upload size={24} className="text-slate-400" />
                                    <span className="text-sm text-slate-400">Click để chọn ảnh khóa học</span>
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
                            ref={titleRef}
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl transition duration-200 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                            placeholder="Tên khóa học..."
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-[15px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Mô tả
                        </label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl transition duration-200 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                            placeholder="Mô tả ngắn về khóa học..."
                        />
                    </div>

                    {/* Level + Type */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[15px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Cấp độ <span className="text-red-500">*</span>
                            </label>
                            <DropdownSelect
                                name="level"
                                value={form.level}
                                onChange={(value) => handleChange({ target: { name: 'level', value } })}
                                options={LEVELS.map((level) => ({ label: level, value: level }))}
                                placeholder="-- Chọn cấp độ --"
                                required
                                buttonClassName="text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[15px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Loại khóa học <span className="text-red-500">*</span>
                            </label>
                            <DropdownSelect
                                name="type"
                                value={form.type}
                                onChange={(value) => handleChange({ target: { name: 'type', value } })}
                                options={TYPES.map((type) => ({ label: type, value: type }))}
                                placeholder="-- Chọn loại --"
                                required
                                buttonClassName="text-sm"
                            />
                        </div>
                    </div>

                    {/* Duration + Tuition */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[15px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Thời lượng
                            </label>
                            <input
                                name="duration"
                                value={form.duration}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl transition duration-200 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                placeholder="VD: 3 tháng"
                            />
                        </div>
                        <div>
                            <label className="block text-[15px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Học phí (VNĐ)
                            </label>
                            <input
                                name="tuition"
                                type="number"
                                min="0"
                                value={form.tuition}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl transition duration-200 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                placeholder="VD: 3500000"
                            />
                        </div>
                    </div>

                    {/* Content (WysiwygEditor) */}
                    <div>
                        <label className="block text-[15px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Nội dung chi tiết khóa học
                        </label>
                        <WysiwygEditor
                            value={form.content}
                            onChange={(val) => setForm((f) => ({ ...f, content: val }))}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 cursor-pointer border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Huỷ
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-4 py-2.5 cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
                        >
                            {saving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo khóa học'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Schedule Form Modal ──────────────────────────────────────────────────────
const ScheduleModal = ({ courseId, schedule, onClose, onSaved, show, duration = 300 }) => {
    useBodyScrollLock(show);

    const isEdit = !!schedule;
    const fileRef = useRef(null);
    const { addToast } = useToast();

    const [form, setForm] = useState({
        title: schedule?.title ?? '',
        startDate: schedule?.startDate ? schedule.startDate.slice(0, 10) : '',
        endDate: schedule?.endDate ? schedule.endDate.slice(0, 10) : '',
        time: schedule?.time ?? '',
        studyDays: schedule?.studyDays ?? '',
        teacher: schedule?.teacher ?? '',
        maxStudents: schedule?.maxStudents ?? 15,
        tuitionOverride: schedule?.tuitionOverride ?? '',
        status: schedule?.status ?? 'Sắp khai giảng',
    });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(schedule?.thumbnail ?? null);
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.startDate) {
            addToast('Vui lòng chọn ngày khai giảng.', 'error');
            return;
        }
        if (!form.time.trim()) {
            addToast('Vui lòng nhập giờ học.', 'error');
            return;
        }
        if (!form.studyDays.trim()) {
            addToast('Vui lòng nhập ngày học trong tuần.', 'error');
            return;
        }

        setSaving(true);
        try {
            const fd = new FormData();
            if (form.title.trim()) fd.append('title', form.title.trim());
            // Convert date input (YYYY-MM-DD) to ISO string
            fd.append('startDate', new Date(form.startDate).toISOString());
            if (form.endDate) fd.append('endDate', new Date(form.endDate).toISOString());
            fd.append('time', form.time.trim());
            fd.append('studyDays', form.studyDays.trim());
            if (form.teacher.trim()) fd.append('teacher', form.teacher.trim());
            fd.append('maxStudents', Number(form.maxStudents));
            if (form.tuitionOverride !== '' && form.tuitionOverride != null) {
                fd.append('tuitionOverride', Number(form.tuitionOverride));
            }
            fd.append('status', form.status);
            if (file) fd.append('thumbnail', file);

            if (isEdit) {
                await api.patch(`/course-schedules/${schedule.id}`, fd);
                addToast('Đã cập nhật lịch khai giảng!', 'success');
            } else {
                await api.post(`/courses/${courseId}/schedules`, fd);
                addToast('Đã thêm lịch khai giảng!', 'success');
            }
            onSaved();
        } catch (err) {
            addToast(extractError(err), 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className={`absolute inset-0 bg-black/60 transition-opacity duration-${duration} ${
                    show ? 'opacity-100' : 'opacity-0'
                }`}
            />
            <div
                className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto transform transition-all duration-${duration} ${
                    show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
                }`}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                        {isEdit ? 'Sửa lịch khai giảng' : 'Thêm lịch khai giảng'}
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
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Ảnh lịch (tuỳ chọn)
                        </label>
                        <div
                            onClick={() => fileRef.current?.click()}
                            className="border-2 border-dashed min-h-[100px] border-slate-200 dark:border-slate-700 rounded-xl p-3 cursor-pointer hover:border-red-400 transition-colors flex flex-col items-center justify-center gap-2"
                        >
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="preview"
                                    className="w-full h-auto object-contain rounded-lg max-h-[360px]"
                                />
                            ) : (
                                <>
                                    <Upload size={20} className="text-slate-400" />
                                    <span className="text-sm text-slate-400">Click để chọn ảnh</span>
                                </>
                            )}
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Tên lịch (tuỳ chọn)
                        </label>
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border transition duration-200 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                            placeholder="VD: Khai giảng tháng 8"
                        />
                    </div>

                    {/* Start + End Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Ngày khai giảng <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={form.startDate}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border transition duration-200 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Ngày kết thúc
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                value={form.endDate}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border transition duration-200 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                            />
                        </div>
                    </div>

                    {/* Time + StudyDays */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Giờ học <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="time"
                                value={form.time}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border transition duration-200 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                placeholder="VD: 18:00-19:30"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Ngày học <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="studyDays"
                                value={form.studyDays}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border transition duration-200 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                placeholder="VD: Thứ 2-4-6"
                            />
                        </div>
                    </div>

                    {/* Teacher + MaxStudents */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Giáo viên
                            </label>
                            <input
                                name="teacher"
                                value={form.teacher}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border transition duration-200 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                placeholder="Tên giáo viên..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Sĩ số tối đa
                            </label>
                            <input
                                type="number"
                                min="1"
                                name="maxStudents"
                                value={form.maxStudents}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border transition duration-200 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                            />
                        </div>
                    </div>

                    {/* TuitionOverride + Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Học phí riêng (VNĐ)
                            </label>
                            <input
                                type="number"
                                min="0"
                                name="tuitionOverride"
                                value={form.tuitionOverride}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border transition duration-200 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                placeholder="Để trống = dùng học phí khóa"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Trạng thái
                            </label>
                            <DropdownSelect
                                name="status"
                                value={form.status}
                                onChange={(value) => handleChange({ target: { name: 'status', value } })}
                                options={SCHEDULE_STATUSES.map((status) => ({ label: status, value: status }))}
                                placeholder="Chọn trạng thái"
                                buttonClassName="text-sm"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 cursor-pointer border duration-200 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Huỷ
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-4 py-2.5 cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
                        >
                            {saving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm lịch'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Schedule Panel Modal ─────────────────────────────────────────────────────
const SchedulePanel = ({ course, onClose, show, duration = 300 }) => {
    useBodyScrollLock(show);

    const { addToast } = useToast();
    const addToastRef = useRef(addToast);
    useEffect(() => {
        addToastRef.current = addToast;
    }, [addToast]);

    const [schedules, setSchedules] = useState([]);
    const [loadingSchedules, setLoadingSchedules] = useState(true);
    const fetchSchedulesErrorShown = useRef(false);

    // Schedule form modal state
    const [scheduleModal, setScheduleModal] = useState(null); // null | 'create' | schedule obj
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const scheduleModalDuration = 300;

    // Schedule delete modal state
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const deleteModalDuration = 300;
    const [deleting, setDeleting] = useState(false);

    const fetchSchedules = useCallback(
        async (signal) => {
            if (!course) return;
            setLoadingSchedules(true);
            try {
                const res = await api.get(`/courses/${course.id}/schedules`, { signal });
                setSchedules(res.data?.data ?? res.data ?? []);
                fetchSchedulesErrorShown.current = false;
            } catch (err) {
                if (isAbortError(err)) return;
                if (!fetchSchedulesErrorShown.current) {
                    addToastRef.current('Không thể tải lịch khai giảng.', 'error');
                    fetchSchedulesErrorShown.current = true;
                }
            } finally {
                if (!signal?.aborted) setLoadingSchedules(false);
            }
        },
        [course],
    );

    useEffect(() => {
        if (!course) return undefined;
        const controller = new AbortController();
        fetchSchedules(controller.signal);
        return () => controller.abort();
    }, [course, fetchSchedules]);

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await api.delete(`/course-schedules/${deleteTarget.id}`);
            addToastRef.current('Đã xóa lịch khai giảng.', 'success');
            fetchSchedules();
        } catch (err) {
            addToastRef.current(extractError(err), 'error');
        } finally {
            setDeleting(false);
        }
    };

    if (!course) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className={`absolute inset-0 bg-black/50 transition-opacity duration-${duration} ${
                    show ? 'opacity-100' : 'opacity-0'
                }`}
            />
            <div
                className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto transform transition-all duration-${duration} ${
                    show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between py-4 px-5 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Calendar size={20} className="text-red-500" />
                            Lịch khai giảng
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{course.title}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                setScheduleModal('create');
                                setTimeout(() => setShowScheduleModal(true), 10);
                            }}
                            className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors"
                        >
                            <Plus size={15} /> Thêm lịch
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="p-5">
                    {loadingSchedules ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <Loader2 size={32} className="animate-spin text-red-500" />
                            <p className="text-sm text-slate-400">Đang tải lịch khai giảng...</p>
                        </div>
                    ) : schedules.length === 0 ? (
                        <div className="text-center py-16 text-slate-400">
                            <Calendar size={36} className="mx-auto mb-3 opacity-40" />
                            <p className="font-medium">Chưa có lịch khai giảng nào.</p>
                            <p className="text-sm mt-1">Nhấn "+ Thêm lịch" để thêm lịch mới.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
                                        {[
                                            'Tên / Ngày KG',
                                            'Giờ học',
                                            'Ngày học',
                                            'Giáo viên',
                                            'Sĩ số',
                                            'Học phí',
                                            'Trạng thái',
                                            '',
                                        ].map((h, i) => (
                                            <th
                                                key={i}
                                                className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {schedules.map((s) => (
                                        <tr
                                            key={s.id}
                                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                {s.title && (
                                                    <p className="font-semibold text-slate-700 dark:text-white">
                                                        {s.title}
                                                    </p>
                                                )}
                                                <p className="text-sm text-slate-500">
                                                    {s.startDate
                                                        ? new Date(s.startDate).toLocaleDateString('vi-VN')
                                                        : '—'}
                                                    {s.endDate
                                                        ? ` → ${new Date(s.endDate).toLocaleDateString('vi-VN')}`
                                                        : ''}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                                {s.time || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                                {s.studyDays || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                                {s.teacher || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                                {s.maxStudents ?? 30} HV
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                                {s.tuitionOverride != null ? (
                                                    fmtCurrency(s.tuitionOverride)
                                                ) : (
                                                    <span className="text-slate-400 text-sm">Theo khóa</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[13px] font-semibold whitespace-nowrap ${STATUS_COLORS[s.status] ?? 'bg-slate-100 text-slate-500'}`}
                                                >
                                                    {s.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1 justify-end">
                                                    <button
                                                        onClick={() => {
                                                            setScheduleModal(s);
                                                            setTimeout(() => setShowScheduleModal(true), 10);
                                                        }}
                                                        className="p-2 text-slate-400 cursor-pointer hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                        title="Sửa lịch"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setDeleteTarget(s);
                                                            setTimeout(() => setShowDeleteModal(true), 10);
                                                        }}
                                                        className="p-2 text-slate-400 cursor-pointer hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title="Xóa lịch"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Schedule form modal */}
            {scheduleModal && (
                <ScheduleModal
                    courseId={course.id}
                    schedule={scheduleModal === 'create' ? null : scheduleModal}
                    onClose={() => {
                        setShowScheduleModal(false);
                        setTimeout(() => setScheduleModal(null), scheduleModalDuration);
                    }}
                    onSaved={() => {
                        setShowScheduleModal(false);
                        setTimeout(() => {
                            setScheduleModal(null);
                            fetchSchedules();
                        }, scheduleModalDuration);
                    }}
                    show={showScheduleModal}
                    duration={scheduleModalDuration}
                />
            )}

            {/* Schedule delete confirm */}
            {deleteTarget && (
                <DeleteConfirmModal
                    title="Xóa lịch khai giảng?"
                    message={`Lịch "${deleteTarget.title || new Date(deleteTarget.startDate).toLocaleDateString('vi-VN')}" sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.`}
                    onConfirm={async () => {
                        await handleDeleteConfirm();
                        setShowDeleteModal(false);
                        setTimeout(() => setDeleteTarget(null), deleteModalDuration);
                    }}
                    onCancel={() => {
                        setShowDeleteModal(false);
                        setTimeout(() => setDeleteTarget(null), deleteModalDuration);
                    }}
                    loading={deleting}
                    show={showDeleteModal}
                    duration={deleteModalDuration}
                />
            )}
        </div>
    );
};

// ─── Course Card ──────────────────────────────────────────────────────────────
const CourseCard = ({ course, onEdit, onDelete, onSchedule }) => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
        {/* Thumbnail */}
        <div className="relative h-60 bg-slate-100 dark:bg-slate-800 overflow-hidden">
            {course.thumbnail ? (
                <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <BookOpen size={32} className="text-slate-300 dark:text-slate-600" />
                </div>
            )}
            {/* Published badge */}
            <div className="absolute top-2 right-2">
                <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow ${
                        course.isPublished ? 'bg-green-500 text-white' : 'bg-slate-600 text-white'
                    }`}
                >
                    {course.isPublished ? 'Đang hiển thị' : 'Nháp'}
                </span>
            </div>
        </div>

        {/* Body */}
        <div className="px-4 py-3">
            <h3 className="font-bold text-slate-800 dark:text-white line-clamp-2 leading-snug mb-2">{course.title}</h3>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mb-2">
                {course.level && (
                    <span className="px-2 py-0.5 rounded-full text-[13px] font-semibold bg-slate-100 text-slate-600">
                        {course.level}
                    </span>
                )}
                {course.type && (
                    <span className={'px-2 py-0.5 rounded-full text-[13px] font-semibold bg-slate-100 text-slate-600'}>
                        {course.type}
                    </span>
                )}
                {course.duration && (
                    <span className="px-2 py-0.5 rounded-full text-[13px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        {course.duration}
                    </span>
                )}
            </div>

            {/* Tuition */}
            <p className="font-bold text-red-600 dark:text-red-400 mb-3">
                {course.tuition != null ? fmtCurrency(course.tuition) : 'Liên hệ'}
            </p>

            {/* Actions */}
            <div className="flex gap-1.5">
                <button
                    onClick={() => onSchedule(course)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 cursor-pointer bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-semibold transition-colors"
                    title="Xem lịch khai giảng"
                >
                    <Calendar size={13} /> Lịch khai giảng
                </button>
                <button
                    onClick={() => onEdit(course)}
                    className="p-2 cursor-pointer text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Sửa khóa học"
                >
                    <Pencil size={15} />
                </button>
                <button
                    onClick={() => onDelete(course)}
                    className="p-2 cursor-pointer text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Xóa khóa học"
                >
                    <Trash2 size={15} />
                </button>
            </div>
        </div>
    </div>
);

// ─── Main AdminCourses ────────────────────────────────────────────────────────
const AdminCourses = () => {
    const { addToast } = useToast();
    const addToastRef = useRef(addToast);
    useEffect(() => {
        addToastRef.current = addToast;
    }, [addToast]);

    const [courses, setCourses] = useState([]);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const fetchCoursesErrorShown = useRef(false);

    // Filters
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [levelFilter, setLevelFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [sort, setSort] = useState('newest');

    // Course modal
    const [courseModal, setCourseModal] = useState(null); // null | 'create' | course obj
    const [showCourseModal, setShowCourseModal] = useState(false);
    const courseModalDuration = 300;

    // Delete confirm modal
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const deleteModalDuration = 300;
    const [deleting, setDeleting] = useState(false);

    // Schedule panel modal
    const [scheduleTarget, setScheduleTarget] = useState(null);
    const [showSchedulePanel, setShowSchedulePanel] = useState(false);
    const schedulePanelDuration = 300;

    // Debounce search input 400ms
    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 400);
        return () => clearTimeout(t);
    }, [search]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [levelFilter, typeFilter, sort]);

    const fetchCourses = useCallback(
        async (p = 1, signal) => {
            setLoading(true);
            try {
                const params = { page: p, limit: 12 };
                if (debouncedSearch) params.q = debouncedSearch;
                if (levelFilter) params.level = levelFilter;
                if (typeFilter) params.type = typeFilter;
                if (sort === 'oldest') params.sort = 'oldest';
                const res = await api.get('/courses', { params, signal });
                const payload = res.data?.data ?? res.data;
                setCourses(payload.items ?? payload.data ?? []);
                setMeta(payload.meta ?? null);
                fetchCoursesErrorShown.current = false;
            } catch (err) {
                if (isAbortError(err)) return;
                if (!fetchCoursesErrorShown.current) {
                    addToastRef.current('Không thể tải danh sách khóa học.', 'error');
                    fetchCoursesErrorShown.current = true;
                }
            } finally {
                if (!signal?.aborted) setLoading(false);
            }
        },
        [debouncedSearch, levelFilter, typeFilter, sort],
    );

    useEffect(() => {
        const controller = new AbortController();
        fetchCourses(page, controller.signal);
        return () => controller.abort();
    }, [page, fetchCourses]);

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await api.delete(`/courses/${deleteTarget.id}`);
            addToastRef.current(`Đã xóa khóa học "${deleteTarget.title}".`, 'success');
            fetchCourses(page);
        } catch (err) {
            addToastRef.current(extractError(err), 'error');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div>
            {/* Page header */}
            <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Quản lý khóa học</h2>
                    <p className="text-slate-500 mt-1">Tất cả các khóa học tiếng Nhật.</p>
                </div>
                <button
                    onClick={() => {
                        setCourseModal('create');
                        setTimeout(() => setShowCourseModal(true), 10);
                    }}
                    className="flex items-center gap-2 cursor-pointer px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-red-200 dark:shadow-none whitespace-nowrap"
                >
                    <Plus size={16} /> Tạo khóa học
                </button>
            </div>

            {/* Filters bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-5 space-y-3">
                {/* Search + Sort */}
                <div className="flex gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl transition duration-200 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                            placeholder="Tìm kiếm khóa học..."
                        />
                    </div>
                    <DropdownSelect
                        value={sort}
                        onChange={(value) => setSort(value)}
                        options={[
                            { label: 'Mới nhất', value: 'newest' },
                            { label: 'Cũ nhất', value: 'oldest' },
                        ]}
                        placeholder="Sắp xếp"
                        buttonClassName="text-sm"
                    />
                </div>

                {/* Level filter */}
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mr-1">Cấp độ:</span>
                    <button
                        onClick={() => setLevelFilter('')}
                        className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors uppercase ${
                            levelFilter === ''
                                ? 'bg-red-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        Tất cả
                    </button>
                    {LEVELS.map((l) => (
                        <button
                            key={l}
                            onClick={() => setLevelFilter(levelFilter === l ? '' : l)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors uppercase ${
                                levelFilter === l
                                    ? 'bg-red-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            {l}
                        </button>
                    ))}
                </div>

                {/* Type filter */}
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mr-1">Loại:</span>
                    <button
                        onClick={() => setTypeFilter('')}
                        className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors uppercase ${
                            typeFilter === ''
                                ? 'bg-red-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        Tất cả
                    </button>
                    {TYPES.map((t) => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(typeFilter === t ? '' : t)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors uppercase ${
                                typeFilter === t
                                    ? 'bg-red-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Course grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {loading ? (
                    <LoadingSpinner label="Đang tải danh sách khóa học..." />
                ) : courses.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-slate-400">
                        <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
                        <p className="font-medium text-lg">Không tìm thấy khóa học nào.</p>
                        <p className="text-sm mt-1">Thử thay đổi bộ lọc hoặc tạo khóa học mới.</p>
                    </div>
                ) : (
                    courses.map((course) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            onEdit={(c) => {
                                setCourseModal(c);
                                setTimeout(() => setShowCourseModal(true), 10);
                            }}
                            onDelete={(c) => {
                                setDeleteTarget(c);
                                setTimeout(() => setShowDeleteModal(true), 10);
                            }}
                            onSchedule={(c) => {
                                setScheduleTarget(c);
                                setTimeout(() => setShowSchedulePanel(true), 10);
                            }}
                        />
                    ))
                )}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3">
                    <p className="text-sm text-slate-500">
                        Trang <span className="font-semibold">{page}</span> /{' '}
                        <span className="font-semibold">{meta.totalPages}</span> · Tổng{' '}
                        <span className="font-semibold">{meta.total}</span> khóa học
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        {/* Page number pills */}
                        {Array.from({ length: Math.min(meta.totalPages, 5) }).map((_, i) => {
                            const startPage = Math.max(1, Math.min(page - 2, meta.totalPages - 4));
                            const p = startPage + i;
                            if (p > meta.totalPages) return null;
                            return (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${
                                        p === page
                                            ? 'bg-red-600 text-white'
                                            : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {p}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                            disabled={page === meta.totalPages}
                            className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Course form modal */}
            {courseModal && (
                <CourseModal
                    course={courseModal === 'create' ? null : courseModal}
                    onClose={() => {
                        setShowCourseModal(false);
                        setTimeout(() => setCourseModal(null), courseModalDuration);
                    }}
                    onSaved={() => {
                        setShowCourseModal(false);
                        setTimeout(() => {
                            setCourseModal(null);
                            fetchCourses(page);
                        }, courseModalDuration);
                    }}
                    show={showCourseModal}
                    duration={courseModalDuration}
                />
            )}

            {/* Delete confirm modal */}
            {deleteTarget && (
                <DeleteConfirmModal
                    title="Xóa khóa học?"
                    message={`Bạn có chắc muốn xóa khóa học "${deleteTarget.title}"? Hành động này không thể hoàn tác.`}
                    onConfirm={async () => {
                        await handleDeleteConfirm();
                        setShowDeleteModal(false);
                        setTimeout(() => setDeleteTarget(null), deleteModalDuration);
                    }}
                    onCancel={() => {
                        setShowDeleteModal(false);
                        setTimeout(() => setDeleteTarget(null), deleteModalDuration);
                    }}
                    loading={deleting}
                    show={showDeleteModal}
                    duration={deleteModalDuration}
                />
            )}

            {/* Schedule panel modal */}
            {scheduleTarget && (
                <SchedulePanel
                    course={scheduleTarget}
                    onClose={() => {
                        setShowSchedulePanel(false);
                        setTimeout(() => setScheduleTarget(null), schedulePanelDuration);
                    }}
                    show={showSchedulePanel}
                    duration={schedulePanelDuration}
                />
            )}
        </div>
    );
};

export default AdminCourses;
