import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Plus,
    Pencil,
    AlertTriangle,
    Search,
    Loader2,
    HelpCircle,
    ChevronLeft,
    ChevronRight,
    X,
    ToggleLeft,
    ToggleRight,
    RefreshCw,
    Trash2,
    CheckSquare,
    Check,
    Circle,
} from 'lucide-react';
import {
    adminGetQuestions,
    adminCreateQuestion,
    adminUpdateQuestion,
    adminDisableQuestion,
    adminDeleteQuestion,
    adminBulkDeleteQuestions,
    adminGetSets,
} from '../../services/jlptPracticeService';
import { useToast } from '../../contexts/ToastContext';
import DropdownSelect from '../ui/DropdownSelect';
import JlptRichTextEditor from '../jlpt/JlptRichTextEditor';
import JlptContentRenderer from '../jlpt/JlptContentRenderer';
import { normalizeJlptWhitespace } from '../../utils/jlptContentUtil';

// ─── Constants ────────────────────────────────────────────────────────────────

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
// Only non-READING categories for this view
const Q_CATEGORIES = ['VOCABULARY', 'KANJI', 'GRAMMAR'];

const CATEGORY_LABELS = {
    VOCABULARY: 'Từ vựng',
    KANJI: 'Hán tự',
    GRAMMAR: 'Ngữ pháp',
    READING: 'Đọc hiểu',
};

const LEVEL_COLORS = {
    N5: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    N4: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    N3: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    N2: 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
    N1: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
};

const CATEGORY_COLORS = {
    VOCABULARY:
        'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
    KANJI: 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    GRAMMAR:
        'bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
    READING: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
};

const PAGE_SIZE = 15;
const MODAL_DURATION = 300;

// ─── Helpers (shared with AdminJlptSets) ──────────────────────────────────────

const extractError = (err) => {
    const data = err?.response?.data;
    const msg = data?.message;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string') return msg;
    return 'Có lỗi xảy ra. Vui lòng thử lại.';
};

const useBodyScrollLock = (enabled) => {
    useEffect(() => {
        if (!enabled) return;
        const prevOverflow = document.body.style.overflow;
        const prevPad = document.body.style.paddingRight;
        const prevHtml = document.documentElement.style.overflow;
        const sbw = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${sbw > 0 ? sbw : 0}px`;
        document.documentElement.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prevOverflow;
            document.body.style.paddingRight = prevPad;
            document.documentElement.style.overflow = prevHtml;
        };
    }, [enabled]);
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ isActive }) =>
    isActive ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Hoạt động
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
            Vô hiệu
        </span>
    );

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

const SkeletonRow = () => (
    <tr className="border-b border-slate-100 dark:border-slate-800">
        {[1, 2, 3, 4, 5].map((i) => (
            <td key={i} className="px-4 py-3.5">
                <div
                    className="h-4 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse"
                    style={{ width: `${40 + ((i * 17) % 40)}%` }}
                />
            </td>
        ))}
        <td className="px-4 py-3.5">
            <div className="h-4 w-16 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse ml-auto" />
        </td>
    </tr>
);

// ─── Pagination ───────────────────────────────────────────────────────────────

const Pagination = ({ page, total, pageSize, onChange }) => {
    const totalPages = Math.ceil(total / pageSize);
    if (totalPages <= 1) return null;

    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
    const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i);

    return (
        <div className="flex items-center gap-1.5">
            <button
                onClick={() => onChange(page - 1)}
                disabled={page === 1}
                className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
            >
                <ChevronLeft size={16} />
            </button>
            {pages.map((p) => (
                <button
                    key={p}
                    onClick={() => onChange(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        p === page
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                    {p}
                </button>
            ))}
            <button
                onClick={() => onChange(page + 1)}
                disabled={page === totalPages}
                className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
            >
                <ChevronRight size={16} />
            </button>
        </div>
    );
};

// ─── Delete Single Question Modal ─────────────────────────────────────────────

const DeleteQuestionModal = ({ question, onConfirm, onCancel, loading, show }) => {
    useBodyScrollLock(show);
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-5">
            <div
                className={`absolute inset-0 bg-black/70 transition-opacity duration-${MODAL_DURATION} ${show ? 'opacity-100' : 'opacity-0'}`}
            />
            <div
                className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 transform transition-all duration-${MODAL_DURATION} ${show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
            >
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <Trash2 size={32} className="text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
                            Xóa vĩnh viễn câu hỏi?
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-3">
                            "{question?.content}"
                        </p>
                        <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/30 text-left">
                            <p className="text-xs text-red-700 dark:text-red-300 font-semibold mb-1">Cảnh báo:</p>
                            <p className="text-xs text-red-600 dark:text-red-400 leading-normal">
                                Hành động này sẽ xóa vĩnh viễn câu hỏi cùng 4 lựa chọn đáp án khỏi cơ sở dữ liệu và
                                không thể hoàn tác.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onCancel}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 cursor-pointer border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            Huỷ
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-60"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 size={14} className="animate-spin" /> Đang xóa...
                                </span>
                            ) : (
                                'Xóa vĩnh viễn'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Bulk Delete Questions Modal ──────────────────────────────────────────────

const BulkDeleteQuestionModal = ({ count, onConfirm, onCancel, loading, show }) => {
    useBodyScrollLock(show);
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-5">
            <div
                className={`absolute inset-0 bg-black/70 transition-opacity duration-${MODAL_DURATION} ${show ? 'opacity-100' : 'opacity-0'}`}
            />
            <div
                className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 transform transition-all duration-${MODAL_DURATION} ${show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
            >
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <Trash2 size={32} className="text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
                            Xóa {count} câu hỏi đã chọn?
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            Bạn đang chuẩn bị xóa vĩnh viễn <strong className="text-red-600">{count}</strong> câu hỏi
                            cùng toàn bộ đáp án liên quan.
                        </p>
                        <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/30 text-left">
                            <p className="text-xs text-red-700 dark:text-red-300 font-semibold mb-1">Cảnh báo:</p>
                            <p className="text-xs text-red-600 dark:text-red-400 leading-normal">
                                Dữ liệu bị xóa sẽ không thể khôi phục. Vui lòng xác nhận trước khi tiếp tục.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onCancel}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 cursor-pointer border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            Huỷ
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-60"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 size={14} className="animate-spin" /> Đang xử lý...
                                </span>
                            ) : (
                                `Xác nhận xóa (${count})`
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Disable Confirm Modal ────────────────────────────────────────────────────

const DisableConfirmModal = ({ onConfirm, onCancel, loading, show }) => {
    useBodyScrollLock(show);
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-5">
            <div
                className={`absolute inset-0 bg-black/70 transition-opacity duration-${MODAL_DURATION} ${show ? 'opacity-100' : 'opacity-0'}`}
            />
            <div
                className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 transform transition-all duration-${MODAL_DURATION} ${show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
            >
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <AlertTriangle size={32} className="text-amber-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Vô hiệu hóa câu hỏi?</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            Câu hỏi này sẽ bị ẩn khỏi học viên. Dữ liệu vẫn được lưu trong hệ thống.
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                            Lưu ý: Vô hiệu hóa không xóa câu hỏi khỏi bộ đề, chỉ ẩn với học viên.
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
                            className="flex-1 px-4 py-2.5 cursor-pointer bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-60"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 size={14} className="animate-spin" /> Đang xử lý...
                                </span>
                            ) : (
                                'Vô hiệu hóa'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Option Editor Row ─────────────────────────────────────────────────────────

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const OptionRow = ({ index, option, onChange, onCorrect, error }) => {
    const isCorrect = option.isCorrect;
    return (
        <div className="flex items-start gap-2">
            {/* Correct answer toggle */}
            <button
                type="button"
                onClick={() => onCorrect(index)}
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition-colors cursor-pointer ${
                    isCorrect
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-300 hover:border-green-300'
                }`}
                title={isCorrect ? 'Đáp án đúng' : 'Đánh dấu là đáp án đúng'}
                aria-label={`Đáp án ${OPTION_LABELS[index]} ${isCorrect ? '(đang là đáp án đúng)' : ''}`}
            >
                {isCorrect ? <Check size={14} /> : <Circle size={10} className="opacity-30" />}
            </button>

            {/* Option letter */}
            <span className="mt-1.5 w-5 shrink-0 text-sm font-bold text-slate-400">{OPTION_LABELS[index]}</span>

            {/* Content input */}
            <input
                type="text"
                value={option.content}
                onChange={(e) => onChange(index, e.target.value)}
                maxLength={500}
                className={`flex-1 px-3 py-2 text-sm border rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 transition duration-200 ${
                    error
                        ? 'border-red-400 focus:ring-red-400'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-red-400'
                }`}
                placeholder={`Nội dung lựa chọn ${OPTION_LABELS[index]}`}
            />
        </div>
    );
};

// ─── Question Form Modal ──────────────────────────────────────────────────────

const EMPTY_QUESTION = {
    level: '',
    category: '',
    content: '',
    explanation: '',
    practiceSetId: '',
    isActive: true,
    order: 0,
    options: [
        { content: '', isCorrect: false, order: 1 },
        { content: '', isCorrect: false, order: 2 },
        { content: '', isCorrect: false, order: 3 },
        { content: '', isCorrect: false, order: 4 },
    ],
};

const QuestionFormModal = ({ editQuestion, practiceSets, onClose, onSaved, show }) => {
    useBodyScrollLock(show);

    const isEdit = !!editQuestion;
    const { addToast } = useToast();
    const contentRef = useRef(null);

    const [form, setForm] = useState(EMPTY_QUESTION);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    // Populate form when modal opens
    useEffect(() => {
        if (show) {
            if (editQuestion) {
                // Map question + options from API response
                const opts = (editQuestion.options ?? []).slice(0, 4);
                // Pad to exactly 4 if fewer (shouldn't happen but safe)
                while (opts.length < 4) {
                    opts.push({ content: '', isCorrect: false, order: opts.length + 1 });
                }
                setForm({
                    level: editQuestion.level ?? '',
                    category: editQuestion.category ?? '',
                    content: editQuestion.content ?? '',
                    explanation: editQuestion.explanation ?? '',
                    practiceSetId: editQuestion.practiceSetId ?? '',
                    isActive: editQuestion.isActive ?? true,
                    order: editQuestion.order ?? 0,
                    options: opts.map((o, i) => ({
                        content: o.content ?? '',
                        isCorrect: o.isCorrect ?? false,
                        order: o.order ?? i + 1,
                    })),
                });
            } else {
                setForm(EMPTY_QUESTION);
            }
            setErrors({});
            const t = setTimeout(() => contentRef.current?.focus(), 60);
            return () => clearTimeout(t);
        }
    }, [show, editQuestion]);

    // Filter practice sets by current level + category
    const filteredSets = (practiceSets ?? []).filter((s) => s.level === form.level && s.category === form.category);

    const updateOption = (index, content) => {
        setForm((f) => ({
            ...f,
            options: f.options.map((o, i) => (i === index ? { ...o, content } : o)),
        }));
        if (errors[`option${index}`]) setErrors((p) => ({ ...p, [`option${index}`]: '' }));
    };

    const setCorrect = (index) => {
        setForm((f) => ({
            ...f,
            options: f.options.map((o, i) => ({ ...o, isCorrect: i === index })),
        }));
    };

    const validate = () => {
        const next = {};
        if (!form.level) next.level = 'Vui lòng chọn cấp độ JLPT.';
        if (!form.category) next.category = 'Vui lòng chọn loại câu hỏi.';
        if (!normalizeJlptWhitespace(form.content)) {
            next.content = 'Vui lòng nhập nội dung câu hỏi.';
        }

        // Options: all 4 must have content
        form.options.forEach((o, i) => {
            if (!o.content.trim()) next[`option${i}`] = `Vui lòng nhập nội dung lựa chọn ${OPTION_LABELS[i]}.`;
        });

        // Exactly one correct
        const correctCount = form.options.filter((o) => o.isCorrect).length;
        if (correctCount === 0) next.correct = 'Phải chọn đúng 1 đáp án đúng.';
        if (correctCount > 1) next.correct = 'Chỉ được chọn 1 đáp án đúng.';

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSaving(true);
        try {
            const payload = {
                level: form.level,
                category: form.category,
                content: normalizeJlptWhitespace(form.content),
                explanation: normalizeJlptWhitespace(form.explanation),
                isActive: form.isActive,
                order: parseInt(form.order, 10) || 0,
                options: form.options.map((o) => ({
                    content: o.content.trim(),
                    isCorrect: o.isCorrect,
                    order: o.order,
                })),
                // practiceSetId: empty string → omit (undefined), null → detach
                ...(form.practiceSetId === 'null'
                    ? { practiceSetId: null }
                    : form.practiceSetId
                      ? { practiceSetId: form.practiceSetId }
                      : {}),
            };

            if (isEdit) {
                // For edit: level + category immutable, include practiceSetId if changed
                const updatePayload = {
                    content: payload.content,
                    explanation: payload.explanation,
                    isActive: payload.isActive,
                    order: payload.order,
                    options: payload.options,
                };
                // Only send practiceSetId if it actually changed.
                // Normalize: null and empty string both mean "no set".
                const origSetId = editQuestion.practiceSetId ?? null;
                const newSetId = form.practiceSetId === 'null' ? null : form.practiceSetId || null;
                if (newSetId !== origSetId) {
                    updatePayload.practiceSetId = newSetId;
                }
                await adminUpdateQuestion(editQuestion.id, updatePayload);
                addToast('Đã cập nhật câu hỏi thành công!', 'success');
            } else {
                await adminCreateQuestion(payload);
                addToast('Đã tạo câu hỏi mới thành công!', 'success');
            }
            onSaved();
        } catch (err) {
            const status = err?.response?.status;
            if (status === 400) {
                // Could be: level/category mismatch with set, or invalid options
                const msg = extractError(err);
                addToast(msg, 'error');
            } else if (status === 404) {
                addToast('Practice Set không tồn tại. Vui lòng tải lại danh sách.', 'error');
            } else {
                addToast(extractError(err), 'error');
            }
        } finally {
            setSaving(false);
        }
    };

    // eslint-disable-next-line no-unused-vars
    const inputCls = (field) =>
        `w-full px-3 py-2 text-sm border rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white
         transition duration-200 focus:outline-none focus:ring-2 ${
             errors[field]
                 ? 'border-red-400 focus:ring-red-400'
                 : 'border-slate-200 dark:border-slate-700 focus:ring-red-400'
         }`;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className={`absolute inset-0 bg-black/70 transition-opacity duration-${MODAL_DURATION} ${show ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />
            <div
                className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto transform transition-all duration-${MODAL_DURATION} ${show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <HelpCircle size={18} className="text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                            {isEdit ? 'Chỉnh sửa câu hỏi' : 'Tạo câu hỏi mới'}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} noValidate className="p-5 space-y-4">
                    {/* Level + Category */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Cấp độ JLPT <span className="text-red-500">*</span>
                            </label>
                            {isEdit ? (
                                <div className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 select-none">
                                    {form.level}
                                    <span className="ml-1 text-xs text-slate-400">(không thể thay đổi)</span>
                                </div>
                            ) : (
                                <>
                                    <DropdownSelect
                                        value={form.level}
                                        onChange={(v) => {
                                            setForm((f) => ({ ...f, level: v, practiceSetId: '' }));
                                            if (errors.level) setErrors((p) => ({ ...p, level: '' }));
                                        }}
                                        options={LEVELS.map((l) => ({ label: l, value: l }))}
                                        placeholder="Chọn cấp độ"
                                        buttonClassName={errors.level ? 'border-red-400 ring-1 ring-red-400' : ''}
                                    />
                                    {errors.level && <p className="text-xs text-red-500 mt-1">{errors.level}</p>}
                                </>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Loại câu hỏi <span className="text-red-500">*</span>
                            </label>
                            {isEdit ? (
                                <div className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 select-none">
                                    {CATEGORY_LABELS[form.category] || form.category}
                                    <span className="ml-1 text-xs text-slate-400">(không thể thay đổi)</span>
                                </div>
                            ) : (
                                <>
                                    <DropdownSelect
                                        value={form.category}
                                        onChange={(v) => {
                                            setForm((f) => ({ ...f, category: v, practiceSetId: '' }));
                                            if (errors.category) setErrors((p) => ({ ...p, category: '' }));
                                        }}
                                        options={Q_CATEGORIES.map((c) => ({
                                            label: CATEGORY_LABELS[c],
                                            value: c,
                                        }))}
                                        placeholder="Chọn loại"
                                        buttonClassName={errors.category ? 'border-red-400 ring-1 ring-red-400' : ''}
                                    />
                                    {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Practice Set (filtered by level + category) */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Bộ đề <span className="text-xs font-normal text-slate-400">(không bắt buộc)</span>
                        </label>
                        {!form.level || !form.category ? (
                            <p className="text-xs text-slate-400 py-2">
                                Chọn cấp độ và loại trước để hiển thị danh sách bộ đề.
                            </p>
                        ) : filteredSets.length === 0 ? (
                            <p className="text-xs text-slate-400 py-2">
                                Chưa có bộ đề nào cho {form.level} {CATEGORY_LABELS[form.category] || form.category}.
                            </p>
                        ) : (
                            <DropdownSelect
                                value={form.practiceSetId}
                                onChange={(v) => setForm((f) => ({ ...f, practiceSetId: v }))}
                                options={[
                                    { label: '— Không thuộc bộ đề —', value: '' },
                                    { label: '— Bỏ gán khỏi bộ đề —', value: 'null' },
                                    ...filteredSets.map((s) => ({
                                        label: `#${s.setNumber} ${s.title}`,
                                        value: s.id,
                                    })),
                                ]}
                                placeholder="Chọn bộ đề"
                            />
                        )}
                        <p className="text-xs text-slate-400 mt-1">Bộ đề phải cùng cấp độ và loại với câu hỏi.</p>
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Nội dung câu hỏi <span className="text-red-500">*</span>
                        </label>
                        <JlptRichTextEditor
                            value={form.content}
                            onChange={(html) => {
                                setForm((f) => ({ ...f, content: html }));
                                if (errors.content) setErrors((p) => ({ ...p, content: '' }));
                            }}
                            placeholder="VD: 「学校」の読み方はどれですか？"
                            minHeight="120px"
                        />
                        {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content}</p>}
                    </div>

                    {/* Explanation */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Giải thích <span className="text-xs font-normal text-slate-400">(không bắt buộc)</span>
                        </label>
                        <JlptRichTextEditor
                            value={form.explanation}
                            onChange={(html) => setForm((f) => ({ ...f, explanation: html }))}
                            placeholder="Giải thích đáp án (hiển thị sau khi nộp bài)"
                            minHeight="90px"
                            maxLength={1000}
                        />
                    </div>

                    {/* Options */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Lựa chọn đáp án <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-slate-400 mb-3">Nhập 4 lựa chọn và đánh dấu 1 đáp án đúng (✓).</p>
                        <div className="space-y-2.5">
                            {form.options.map((opt, i) => (
                                <OptionRow
                                    key={i}
                                    index={i}
                                    option={opt}
                                    onChange={updateOption}
                                    onCorrect={setCorrect}
                                    error={errors[`option${i}`]}
                                />
                            ))}
                        </div>
                        {errors.correct && (
                            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                                <AlertTriangle size={12} />
                                {errors.correct}
                            </p>
                        )}
                    </div>

                    {/* Order + isActive */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Thứ tự hiển thị
                            </label>
                            <input
                                name="order"
                                type="number"
                                min={0}
                                value={form.order}
                                onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
                                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-200"
                                placeholder="0"
                            />
                            <p className="text-xs text-slate-400 mt-1">Số nhỏ hiện trước.</p>
                        </div>
                        <div className="flex items-end pb-1">
                            <div className="flex items-center justify-between w-full p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Kích hoạt</p>
                                <button
                                    type="button"
                                    onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                                    className="cursor-pointer focus:outline-none"
                                    aria-label={form.isActive ? 'Đang kích hoạt' : 'Đang vô hiệu hóa'}
                                >
                                    {form.isActive ? (
                                        <ToggleRight size={32} className="text-green-500" />
                                    ) : (
                                        <ToggleLeft size={32} className="text-slate-400" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 cursor-pointer border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-4 py-2.5 cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-60"
                        >
                            {saving ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 size={14} className="animate-spin" />
                                    {isEdit ? 'Đang lưu...' : 'Đang tạo...'}
                                </span>
                            ) : isEdit ? (
                                'Lưu thay đổi'
                            ) : (
                                'Tạo câu hỏi'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminJlptQuestions = () => {
    const { addToast } = useToast();
    const addToastRef = useRef(addToast);
    useEffect(() => {
        addToastRef.current = addToast;
    }, [addToast]);

    // List state
    const [questions, setQuestions] = useState([]);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    // Filters
    const [levelFilter, setLevelFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [setFilter, setSetFilter] = useState('');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Practice Sets for the set filter dropdown (fetched once)
    const [practiceSets, setPracticeSets] = useState([]);
    const [setsLoading, setSetsLoading] = useState(false);

    // Modal state: form
    const [formOpen, setFormOpen] = useState(false);
    const [formVisible, setFormVisible] = useState(false);
    const [editTarget, setEditTarget] = useState(null);

    // Modal state: disable confirm
    const [disableTarget, setDisableTarget] = useState(null);
    const [disableOpen, setDisableOpen] = useState(false);
    const [disableVisible, setDisableVisible] = useState(false);
    const [disabling, setDisabling] = useState(false);

    // Selected rows state for bulk delete
    const [selectedIds, setSelectedIds] = useState([]);

    // Modal state: single delete confirm
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Modal state: bulk delete confirm
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [bulkDeleteVisible, setBulkDeleteVisible] = useState(false);
    const [bulkDeleting, setBulkDeleting] = useState(false);

    // ── Debounce search ────────────────────────────────────────────────────────
    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 400);
        return () => clearTimeout(t);
    }, [search]);

    // Reset page on filter change
    useEffect(() => {
        setPage(1);
        setSelectedIds([]);
    }, [levelFilter, categoryFilter, statusFilter, setFilter]);
    useEffect(() => {
        setSelectedIds([]);
    }, [page, debouncedSearch]);

    // ── Fetch practice sets for filter dropdown ────────────────────────────────
    useEffect(() => {
        setSetsLoading(true);
        adminGetSets({ limit: 200 })
            .then((data) => setPracticeSets(data?.items ?? []))
            .catch(() => setPracticeSets([]))
            .finally(() => setSetsLoading(false));
    }, []);

    // ── Fetch questions ─────────────────────────────────────────────────────────
    const fetchQuestions = useCallback(
        async (p = 1) => {
            setLoading(true);
            setFetchError(null);
            try {
                const params = {
                    page: p,
                    limit: PAGE_SIZE,
                    ...(levelFilter && { level: levelFilter }),
                    ...(categoryFilter && { category: categoryFilter }),
                    ...(statusFilter === 'active' && { isActive: true }),
                    ...(statusFilter === 'inactive' && { isActive: false }),
                    ...(debouncedSearch && { search: debouncedSearch }),
                    ...(setFilter && { practiceSetId: setFilter }),
                };
                const data = await adminGetQuestions(params);
                setQuestions(data?.items ?? []);
                setMeta(data?.meta ?? null);
            } catch (err) {
                const msg = extractError(err);
                setFetchError(msg);
                addToastRef.current(msg, 'error');
            } finally {
                setLoading(false);
            }
        },
        [levelFilter, categoryFilter, statusFilter, setFilter, debouncedSearch],
    );

    useEffect(() => {
        fetchQuestions(page);
    }, [page, fetchQuestions]);

    // ── Modal helpers ─────────────────────────────────────────────────────────

    const openForm = (question = null) => {
        setEditTarget(question);
        setFormOpen(true);
        setTimeout(() => setFormVisible(true), 10);
    };

    const closeForm = () => {
        setFormVisible(false);
        setTimeout(() => {
            setFormOpen(false);
            setEditTarget(null);
        }, MODAL_DURATION);
    };

    const handleFormSaved = () => {
        closeForm();
        fetchQuestions(editTarget ? page : 1);
        if (!editTarget) setPage(1);
    };

    const openDisable = (question) => {
        setDisableTarget(question);
        setDisableOpen(true);
        setTimeout(() => setDisableVisible(true), 10);
    };

    const closeDisable = () => {
        setDisableVisible(false);
        setTimeout(() => {
            setDisableOpen(false);
            setDisableTarget(null);
        }, MODAL_DURATION);
    };

    const handleDisableConfirm = async () => {
        if (!disableTarget) return;
        setDisabling(true);
        try {
            await adminDisableQuestion(disableTarget.id);
            addToastRef.current('Đã vô hiệu hóa câu hỏi thành công.', 'success');
            closeDisable();
            fetchQuestions(page);
        } catch (err) {
            addToastRef.current(extractError(err), 'error');
        } finally {
            setDisabling(false);
        }
    };

    // ── Single delete handlers ────────────────────────────────────────────────
    const openDelete = (question) => {
        setDeleteTarget(question);
        setDeleteOpen(true);
        setTimeout(() => setDeleteVisible(true), 10);
    };

    const closeDelete = () => {
        setDeleteVisible(false);
        setTimeout(() => {
            setDeleteOpen(false);
            setDeleteTarget(null);
        }, MODAL_DURATION);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await adminDeleteQuestion(deleteTarget.id);
            addToastRef.current('Đã xóa vĩnh viễn câu hỏi thành công.', 'success');
            closeDelete();
            setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget.id));
            fetchQuestions(page);
        } catch (err) {
            addToastRef.current(extractError(err), 'error');
        } finally {
            setDeleting(false);
        }
    };

    // ── Bulk delete handlers ──────────────────────────────────────────────────
    const handleToggleSelect = (id) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    };

    const handleSelectAll = () => {
        if (selectedIds.length === questions.length && questions.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(questions.map((q) => q.id));
        }
    };

    const openBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setBulkDeleteOpen(true);
        setTimeout(() => setBulkDeleteVisible(true), 10);
    };

    const closeBulkDelete = () => {
        setBulkDeleteVisible(false);
        setTimeout(() => {
            setBulkDeleteOpen(false);
        }, MODAL_DURATION);
    };

    const handleBulkDeleteConfirm = async () => {
        if (selectedIds.length === 0) return;
        setBulkDeleting(true);
        try {
            const res = await adminBulkDeleteQuestions(selectedIds);
            addToastRef.current(`Đã xóa thành công ${res.deleted || selectedIds.length} câu hỏi.`, 'success');
            closeBulkDelete();
            setSelectedIds([]);
            fetchQuestions(page);
        } catch (err) {
            addToastRef.current(extractError(err), 'error');
        } finally {
            setBulkDeleting(false);
        }
    };

    // ── Filtered sets for the set dropdown (by level + category) ──────────────
    const setFilterOptions = (practiceSets ?? []).filter((s) => {
        if (levelFilter && s.level !== levelFilter) return false;
        if (categoryFilter && s.category !== categoryFilter) return false;
        // Only show non-READING sets since this view is for Vocab/Kanji/Grammar
        return s.category !== 'READING';
    });

    // ── Render ─────────────────────────────────────────────────────────────────

    const total = meta?.total ?? questions.length;

    return (
        <div>
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Quản lý Câu hỏi Luyện tập</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Tạo và quản lý câu hỏi Từ vựng, Hán tự, Ngữ pháp kèm 4 lựa chọn đáp án.
                    </p>
                </div>
                <button
                    onClick={() => openForm()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-red-200 dark:shadow-none transition-colors cursor-pointer whitespace-nowrap"
                >
                    <Plus size={16} />
                    Tạo câu hỏi
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
                {/* Search */}
                <div className="relative flex-1 min-w-[180px]">
                    <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                        type="text"
                        placeholder="Tìm theo nội dung câu hỏi..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-200"
                    />
                </div>

                {/* Level filter */}
                <DropdownSelect
                    value={levelFilter}
                    onChange={setLevelFilter}
                    options={[{ label: 'Tất cả cấp độ', value: '' }, ...LEVELS.map((l) => ({ label: l, value: l }))]}
                    placeholder="Cấp độ"
                    containerClassName="min-w-[130px]"
                />

                {/* Category filter (Vocab/Kanji/Grammar only) */}
                <DropdownSelect
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    options={[
                        { label: 'Tất cả loại', value: '' },
                        ...Q_CATEGORIES.map((c) => ({ label: CATEGORY_LABELS[c], value: c })),
                    ]}
                    placeholder="Loại"
                    containerClassName="min-w-[140px]"
                />

                {/* Set filter */}
                <DropdownSelect
                    value={setFilter}
                    onChange={setSetFilter}
                    options={[
                        { label: 'Tất cả bộ đề', value: '' },
                        ...setFilterOptions.map((s) => ({
                            label: `#${s.setNumber} ${s.title}`,
                            value: s.id,
                        })),
                    ]}
                    placeholder={setsLoading ? 'Đang tải...' : 'Bộ đề'}
                    disabled={setsLoading}
                    containerClassName="min-w-[160px]"
                />

                {/* Status filter */}
                <DropdownSelect
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                        { label: 'Tất cả trạng thái', value: '' },
                        { label: 'Hoạt động', value: 'active' },
                        { label: 'Vô hiệu', value: 'inactive' },
                    ]}
                    placeholder="Trạng thái"
                    containerClassName="min-w-[150px]"
                />

                {/* Refresh */}
                <button
                    onClick={() => fetchQuestions(page)}
                    disabled={loading}
                    className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                    title="Làm mới"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Table */}
            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="mb-3 p-3 px-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center justify-between gap-3 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 text-sm font-semibold text-red-800 dark:text-red-300">
                        <CheckSquare size={16} className="text-red-600 shrink-0" />
                        <span>
                            Đã chọn{' '}
                            <strong className="font-bold text-red-700 dark:text-red-200">{selectedIds.length}</strong> /{' '}
                            {questions.length} câu hỏi trên trang này
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSelectedIds([])}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                            Bỏ chọn
                        </button>
                        <button
                            onClick={openBulkDelete}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-95"
                        >
                            <Trash2 size={13} />
                            <span>Xóa {selectedIds.length} mục đã chọn</span>
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-4 py-3.5 w-10">
                                    <input
                                        type="checkbox"
                                        checked={questions.length > 0 && selectedIds.length === questions.length}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                        aria-label="Chọn tất cả câu hỏi trên trang này"
                                    />
                                </th>
                                {['Câu hỏi', 'Cấp độ', 'Loại', 'Bộ đề', 'Đáp án', 'Trạng thái'].map((h) => (
                                    <th
                                        key={h}
                                        className="px-4 py-3.5 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap"
                                    >
                                        {h}
                                    </th>
                                ))}
                                <th className="px-4 py-3.5 text-right text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                            ) : fetchError ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <AlertTriangle size={36} className="text-red-400" />
                                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                                Không thể tải dữ liệu
                                            </p>
                                            <button
                                                onClick={() => fetchQuestions(page)}
                                                className="text-sm text-red-600 underline cursor-pointer hover:no-underline"
                                            >
                                                Thử lại
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : questions.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <HelpCircle size={28} className="text-slate-300 dark:text-slate-600" />
                                            </div>
                                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                                Chưa có câu hỏi nào.
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                Thử thay đổi bộ lọc hoặc{' '}
                                                <button
                                                    onClick={() => openForm()}
                                                    className="text-red-600 underline cursor-pointer hover:no-underline"
                                                >
                                                    tạo câu hỏi mới
                                                </button>
                                                .
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                questions.map((q) => {
                                    const correctOpt = (q.options ?? []).find((o) => o.isCorrect);
                                    const setName = practiceSets.find((s) => s.id === q.practiceSetId)?.title;
                                    return (
                                        <tr
                                            key={q.id}
                                            className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${selectedIds.includes(q.id) ? 'bg-red-50/40 dark:bg-red-950/20' : ''}`}
                                        >
                                            {/* Selection Checkbox */}
                                            <td className="px-4 py-3.5 w-10">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(q.id)}
                                                    onChange={() => handleToggleSelect(q.id)}
                                                    className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                                    aria-label={`Chọn câu hỏi ${q.content}`}
                                                />
                                            </td>

                                            {/* Content */}
                                            <td className="px-4 py-3.5 max-w-[280px]">
                                                <div className="font-semibold text-slate-800 dark:text-white truncate">
                                                    <JlptContentRenderer content={q.content} />
                                                </div>
                                                {q.explanation && (
                                                    <JlptContentRenderer
                                                        content={q.explanation}
                                                        className="text-xs text-slate-400 line-clamp-1 mt-0.5"
                                                    />
                                                )}
                                            </td>

                                            {/* Level */}
                                            <td className="px-4 py-3.5">
                                                <span
                                                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${LEVEL_COLORS[q.level] ?? 'bg-slate-100 text-slate-500'}`}
                                                >
                                                    {q.level}
                                                </span>
                                            </td>

                                            {/* Category */}
                                            <td className="px-4 py-3.5">
                                                <span
                                                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${CATEGORY_COLORS[q.category] ?? 'bg-slate-100 text-slate-500'}`}
                                                >
                                                    {CATEGORY_LABELS[q.category] ?? q.category}
                                                </span>
                                            </td>

                                            {/* Practice Set */}
                                            <td className="px-4 py-3.5 max-w-[160px]">
                                                {setName ? (
                                                    <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                                                        {setName}
                                                    </p>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">—</span>
                                                )}
                                            </td>

                                            {/* Correct answer */}
                                            <td className="px-4 py-3.5">
                                                {correctOpt ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 dark:text-green-400">
                                                        <Check size={12} />
                                                        {OPTION_LABELS[correctOpt.order - 1] ?? ''}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400">—</span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3.5">
                                                <StatusBadge isActive={q.isActive} />
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openForm(q);
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    {q.isActive && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openDisable(q);
                                                            }}
                                                            className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors cursor-pointer"
                                                            title="Vô hiệu hóa"
                                                        >
                                                            <ToggleRight size={15} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openDelete(q);
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                                                        title="Xóa vĩnh viễn"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer: count + pagination */}
                {!loading && !fetchError && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3.5 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Hiển thị{' '}
                            <span className="font-semibold text-slate-700 dark:text-white">
                                {questions.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
                            </span>
                            {' – '}
                            <span className="font-semibold text-slate-700 dark:text-white">
                                {(page - 1) * PAGE_SIZE + questions.length}
                            </span>
                            {' trong '}
                            <span className="font-semibold text-slate-700 dark:text-white">{total}</span>
                            {' câu hỏi'}
                        </p>
                        <Pagination page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />
                    </div>
                )}
            </div>

            {/* Question Form Modal */}
            {formOpen && (
                <QuestionFormModal
                    editQuestion={editTarget}
                    practiceSets={practiceSets}
                    onClose={closeForm}
                    onSaved={handleFormSaved}
                    show={formVisible}
                />
            )}

            {/* Disable Confirm Modal */}
            {disableOpen && (
                <DisableConfirmModal
                    onConfirm={handleDisableConfirm}
                    onCancel={closeDisable}
                    loading={disabling}
                    show={disableVisible}
                />
            )}

            {/* Single Delete Confirm Modal */}
            {deleteOpen && (
                <DeleteQuestionModal
                    question={deleteTarget}
                    onConfirm={handleDeleteConfirm}
                    onCancel={closeDelete}
                    loading={deleting}
                    show={deleteVisible}
                />
            )}

            {/* Bulk Delete Confirm Modal */}
            {bulkDeleteOpen && (
                <BulkDeleteQuestionModal
                    count={selectedIds.length}
                    onConfirm={handleBulkDeleteConfirm}
                    onCancel={closeBulkDelete}
                    loading={bulkDeleting}
                    show={bulkDeleteVisible}
                />
            )}
        </div>
    );
};

export default AdminJlptQuestions;
