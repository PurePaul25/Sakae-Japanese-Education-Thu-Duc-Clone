/**
 * AdminJlptSetDetail — Trang chi tiết một Practice Set.
 * Hiển thị thông tin set và danh sách câu hỏi thuộc set đó.
 * Props:
 *   setId  — UUID của bộ đề (từ URL param :subId)
 *   onBack — callback quay lại trang danh sách
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    ChevronLeft,
    Pencil,
    Plus,
    AlertTriangle,
    Loader2,
    Check,
    Circle,
    X,
    ToggleLeft,
    ToggleRight,
    RefreshCw,
    Trash2,
    CheckSquare,
    FileText,
} from 'lucide-react';
import {
    adminGetSetById,
    adminCreateQuestion,
    adminUpdateQuestion,
    adminDisableQuestion,
    adminDeleteQuestion,
    adminBulkDeleteQuestions,
    adminDeleteSet,
} from '../../services/jlptPracticeService';
import { useToast } from '../../contexts/ToastContext';
import DropdownSelect from '../ui/DropdownSelect';
import JlptRichTextEditor from '../jlpt/JlptRichTextEditor';
import JlptContentRenderer from '../jlpt/JlptContentRenderer';
import { normalizeJlptWhitespace } from '../../utils/jlptContentUtil';

// ─── Constants ────────────────────────────────────────────────────────────────
const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const MODAL_DURATION = 300;

const LEVEL_COLORS = {
    N5: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    N4: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    N3: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    N2: 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
    N1: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
};
const CATEGORY_LABELS = {
    VOCABULARY: 'Từ vựng',
    KANJI: 'Hán tự',
    GRAMMAR: 'Ngữ pháp',
    READING: 'Đọc hiểu',
};
const CATEGORY_COLORS = {
    VOCABULARY:
        'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
    KANJI: 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    GRAMMAR:
        'bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
    READING: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
};

// ─── Shared helpers ───────────────────────────────────────────────────────────
const extractError = (err) => {
    const msg = err?.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string') return msg;
    return 'Có lỗi xảy ra. Vui lòng thử lại.';
};

const useBodyScrollLock = (enabled) => {
    useEffect(() => {
        if (!enabled) return;
        const po = document.body.style.overflow;
        const pp = document.body.style.paddingRight;
        const ph = document.documentElement.style.overflow;
        const sbw = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${sbw > 0 ? sbw : 0}px`;
        document.documentElement.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = po;
            document.body.style.paddingRight = pp;
            document.documentElement.style.overflow = ph;
        };
    }, [enabled]);
};

// ─── Option Row ───────────────────────────────────────────────────────────────
const OptionRow = ({ index, option, onChange, onCorrect, error }) => (
    <div className="flex items-start gap-2">
        <button
            type="button"
            onClick={() => onCorrect(index)}
            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition-colors cursor-pointer ${
                option.isCorrect
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-green-300'
            }`}
            aria-label={`Đáp án ${OPTION_LABELS[index]}`}
        >
            {option.isCorrect ? <Check size={14} /> : <Circle size={10} className="opacity-30" />}
        </button>
        <span className="mt-1.5 w-5 shrink-0 text-sm font-bold text-slate-400">{OPTION_LABELS[index]}</span>
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
            placeholder={`Lựa chọn ${OPTION_LABELS[index]}`}
        />
    </div>
);

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

// ─── Question Form Modal ──────────────────────────────────────────────────────
const EMPTY_OPTIONS = [
    { content: '', isCorrect: false, order: 1 },
    { content: '', isCorrect: false, order: 2 },
    { content: '', isCorrect: false, order: 3 },
    { content: '', isCorrect: false, order: 4 },
];

const QuestionFormModal = ({ editQuestion, set, onClose, onSaved, show }) => {
    useBodyScrollLock(show);
    const isEdit = !!editQuestion;
    const { addToast } = useToast();
    const contentRef = useRef(null);

    const [form, setForm] = useState({
        content: '',
        explanation: '',
        isActive: true,
        order: 0,
        options: EMPTY_OPTIONS,
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (show) {
            if (editQuestion) {
                const opts = (editQuestion.options ?? []).slice(0, 4);
                while (opts.length < 4) opts.push({ content: '', isCorrect: false, order: opts.length + 1 });
                setForm({
                    content: editQuestion.content ?? '',
                    explanation: editQuestion.explanation ?? '',
                    isActive: editQuestion.isActive ?? true,
                    order: editQuestion.order ?? 0,
                    options: opts.map((o, i) => ({
                        content: o.content ?? '',
                        isCorrect: o.isCorrect ?? false,
                        order: o.order ?? i + 1,
                    })),
                });
            } else {
                setForm({
                    content: '',
                    explanation: '',
                    isActive: true,
                    order: 0,
                    options: [...EMPTY_OPTIONS.map((o) => ({ ...o }))],
                });
            }
            setErrors({});
            setTimeout(() => contentRef.current?.focus(), 60);
        }
    }, [show, editQuestion]);

    const updateOption = (i, content) => {
        setForm((f) => ({ ...f, options: f.options.map((o, idx) => (idx === i ? { ...o, content } : o)) }));
        if (errors[`opt${i}`]) setErrors((p) => ({ ...p, [`opt${i}`]: '' }));
    };
    const setCorrect = (i) =>
        setForm((f) => ({ ...f, options: f.options.map((o, idx) => ({ ...o, isCorrect: idx === i })) }));

    const validate = () => {
        const next = {};
        if (!normalizeJlptWhitespace(form.content)) {
            next.content = 'Vui lòng nhập nội dung câu hỏi.';
        }
        form.options.forEach((o, i) => {
            if (!o.content.trim()) next[`opt${i}`] = `Nhập nội dung lựa chọn ${OPTION_LABELS[i]}.`;
        });
        const cc = form.options.filter((o) => o.isCorrect).length;
        if (cc === 0) next.correct = 'Phải chọn đúng 1 đáp án đúng.';
        if (cc > 1) next.correct = 'Chỉ được chọn 1 đáp án đúng.';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSaving(true);
        try {
            const payload = {
                content: normalizeJlptWhitespace(form.content),
                explanation: normalizeJlptWhitespace(form.explanation),
                isActive: form.isActive,
                order: parseInt(form.order, 10) || 0,
                options: form.options.map((o) => ({
                    content: o.content.trim(),
                    isCorrect: o.isCorrect,
                    order: o.order,
                })),
            };
            if (isEdit) {
                await adminUpdateQuestion(editQuestion.id, payload);
                addToast('Đã cập nhật câu hỏi thành công!', 'success');
            } else {
                await adminCreateQuestion({
                    ...payload,
                    level: set.level,
                    category: set.category,
                    practiceSetId: set.id,
                });
                addToast('Đã tạo câu hỏi thành công!', 'success');
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
                className={`absolute inset-0 bg-black/70 transition-opacity duration-${MODAL_DURATION} ${show ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />
            <div
                className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto transform transition-all duration-${MODAL_DURATION} ${show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                            {isEdit ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi vào bộ đề'}
                        </h2>
                        {set && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {set.title} · {set.level} · {CATEGORY_LABELS[set.category] ?? set.category}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
                    >
                        <X size={18} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} noValidate className="p-5 space-y-3">
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
                            placeholder="Nhập nội dung câu hỏi..."
                            minHeight="120px"
                        />
                        {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content}</p>}
                    </div>

                    {/* Options */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Lựa chọn đáp án <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-slate-400 mb-2.5">Đánh dấu (✓) đúng 1 đáp án đúng.</p>
                        <div className="space-y-2.5">
                            {form.options.map((opt, i) => (
                                <OptionRow
                                    key={i}
                                    index={i}
                                    option={opt}
                                    onChange={updateOption}
                                    onCorrect={setCorrect}
                                    error={errors[`opt${i}`]}
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

                    {/* Explanation */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Giải thích <span className="text-xs font-normal text-slate-400">(không bắt buộc)</span>
                        </label>
                        <JlptRichTextEditor
                            value={form.explanation}
                            onChange={(html) => setForm((f) => ({ ...f, explanation: html }))}
                            placeholder="Giải thích đáp án sau khi nộp bài"
                            minHeight="90px"
                            maxLength={1000}
                        />
                    </div>
                    {/* Order + isActive */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Thứ tự
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={form.order}
                                onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
                                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                                placeholder="0"
                            />
                        </div>
                        <div className="flex items-end pb-1">
                            <div className="flex items-center justify-between w-full p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Kích hoạt</p>
                                <button
                                    type="button"
                                    onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                                    className="cursor-pointer"
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
                                'Thêm câu hỏi'
                            )}
                        </button>
                    </div>
                </form>
            </div>
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
                className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all duration-${MODAL_DURATION} ${show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
            >
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <Trash2 size={28} className="text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                            Xóa vĩnh viễn câu hỏi?
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3">"{question?.content}"</p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">
                            Hành động này sẽ xóa câu hỏi cùng 4 đáp án và không thể hoàn tác.
                        </p>
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
                                    <Loader2 size={14} className="animate-spin" />
                                    Đang xóa...
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
                className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all duration-${MODAL_DURATION} ${show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
            >
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <Trash2 size={28} className="text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                            Xóa {count} câu hỏi đã chọn?
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Các câu hỏi được chọn cùng toàn bộ đáp án liên quan sẽ bị xóa vĩnh viễn.
                        </p>
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
                                    <Loader2 size={14} className="animate-spin" />
                                    Đang xử lý...
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

// ─── Delete Set Modal ─────────────────────────────────────────────────────────
const DeleteSetModal = ({ set, onConfirm, onCancel, loading, show }) => {
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
                            Xóa vĩnh viễn bộ đề này?
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Bộ đề <strong className="text-slate-700 dark:text-slate-200">"{set?.title}"</strong> sẽ bị
                            xóa khỏi hệ thống.
                        </p>
                        <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/30 text-left">
                            <p className="text-xs text-red-700 dark:text-red-300 font-semibold mb-1">
                                Cảnh báo an toàn dữ liệu:
                            </p>
                            <p className="text-xs text-red-600 dark:text-red-400 leading-normal">
                                Nếu bộ đề vẫn còn câu hỏi đang hoạt động liên kết, hệ thống sẽ từ chối xóa để đảm bảo
                                toàn vẹn dữ liệu.
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
                                    <Loader2 size={14} className="animate-spin" />
                                    Đang xóa...
                                </span>
                            ) : (
                                'Xóa bộ đề'
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
                className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all duration-${MODAL_DURATION} ${show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
            >
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <AlertTriangle size={28} className="text-amber-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Vô hiệu hóa câu hỏi?</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Câu hỏi sẽ bị ẩn khỏi học viên nhưng dữ liệu vẫn được lưu.
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
                                    <Loader2 size={14} className="animate-spin" />
                                    Đang xử lý...
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

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
const SkeletonRow = () => (
    <tr className="border-b border-slate-100 dark:border-slate-800">
        {[60, 30, 45, 20].map((w, i) => (
            <td key={i} className="px-4 py-3.5">
                <div
                    className={`h-4 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse`}
                    style={{ width: `${w}%` }}
                />
            </td>
        ))}
        <td className="px-4 py-3.5">
            <div className="h-4 w-12 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse ml-auto" />
        </td>
    </tr>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminJlptSetDetail = ({ setId, onBack }) => {
    const { addToast } = useToast();
    const addToastRef = useRef(addToast);
    useEffect(() => {
        addToastRef.current = addToast;
    }, [addToast]);

    const [set, setSet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form modal
    const [formOpen, setFormOpen] = useState(false);
    const [formVisible, setFormVisible] = useState(false);
    const [editTarget, setEditTarget] = useState(null);

    // Disable confirm
    const [disableTarget, setDisableTarget] = useState(null);
    const [disableOpen, setDisableOpen] = useState(false);
    const [disableVisible, setDisableVisible] = useState(false);
    const [disabling, setDisabling] = useState(false);

    // Selected questions for bulk delete
    const [selectedIds, setSelectedIds] = useState([]);

    // Single question delete modal
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Bulk delete questions modal
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [bulkDeleteVisible, setBulkDeleteVisible] = useState(false);
    const [bulkDeleting, setBulkDeleting] = useState(false);

    // Delete Set modal
    const [deleteSetOpen, setDeleteSetOpen] = useState(false);
    const [deleteSetVisible, setDeleteSetVisible] = useState(false);
    const [deletingSet, setDeletingSet] = useState(false);

    const fetchSet = useCallback(async () => {
        if (!setId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await adminGetSetById(setId);
            setSet(data);
        } catch (err) {
            setError(extractError(err));
            addToastRef.current(extractError(err), 'error');
        } finally {
            setLoading(false);
        }
    }, [setId]);

    useEffect(() => {
        fetchSet();
    }, [fetchSet]);

    // Modals
    const openForm = (q = null) => {
        setEditTarget(q);
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
        fetchSet();
    };

    const openDisable = (q) => {
        setDisableTarget(q);
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
            fetchSet();
        } catch (err) {
            addToastRef.current(extractError(err), 'error');
        } finally {
            setDisabling(false);
        }
    };

    // ── Single question delete handlers ───────────────────────────────────────
    const openDelete = (q) => {
        setDeleteTarget(q);
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
            fetchSet();
        } catch (err) {
            addToastRef.current(extractError(err), 'error');
        } finally {
            setDeleting(false);
        }
    };

    // ── Bulk delete questions handlers ────────────────────────────────────────
    const handleToggleSelect = (id) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    };

    const handleSelectAll = () => {
        const qList = set?.questions ?? [];
        if (selectedIds.length === qList.length && qList.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(qList.map((q) => q.id));
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
            fetchSet();
        } catch (err) {
            addToastRef.current(extractError(err), 'error');
        } finally {
            setBulkDeleting(false);
        }
    };

    // ── Set delete handlers ───────────────────────────────────────────────────
    const openDeleteSet = () => {
        setDeleteSetOpen(true);
        setTimeout(() => setDeleteSetVisible(true), 10);
    };
    const closeDeleteSet = () => {
        setDeleteSetVisible(false);
        setTimeout(() => {
            setDeleteSetOpen(false);
        }, MODAL_DURATION);
    };
    const handleDeleteSetConfirm = async () => {
        if (!set) return;
        setDeletingSet(true);
        try {
            await adminDeleteSet(set.id);
            addToastRef.current(`Đã xóa bộ đề "${set.title}" thành công.`, 'success');
            closeDeleteSet();
            if (onBack) onBack();
        } catch (err) {
            addToastRef.current(extractError(err), 'error');
        } finally {
            setDeletingSet(false);
        }
    };

    // ── Loading / Error ────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 size={36} className="animate-spin text-red-500" />
                <p className="text-slate-500">Đang tải bộ đề...</p>
            </div>
        );
    }
    if (error || !set) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <AlertTriangle size={36} className="text-red-400" />
                <p className="text-slate-500 font-medium">{error ?? 'Không tìm thấy bộ đề'}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onBack}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                        ← Quay lại
                    </button>
                    <button
                        onClick={fetchSet}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold cursor-pointer transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    const questions = set.questions ?? [];

    return (
        <div>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm mb-5">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-red-600 cursor-pointer transition-colors font-medium"
                >
                    <ChevronLeft size={16} />
                    Bộ đề
                </button>
                <span className="text-slate-300 dark:text-slate-600">/</span>
                <span className="text-slate-800 dark:text-white font-semibold truncate max-w-[260px]">{set.title}</span>
            </nav>

            {/* Set info card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                            <FileText size={20} className="text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">
                                {set.title}
                            </h2>
                            {set.description && <p className="text-sm text-slate-500 mt-1">{set.description}</p>}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span
                                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${LEVEL_COLORS[set.level] ?? 'bg-slate-100 text-slate-500'}`}
                                >
                                    {set.level}
                                </span>
                                <span
                                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${CATEGORY_COLORS[set.category] ?? 'bg-slate-100 text-slate-500'}`}
                                >
                                    {CATEGORY_LABELS[set.category] ?? set.category}
                                </span>
                                <span className="text-xs text-slate-400">Đề số #{set.setNumber}</span>
                                <span className="text-xs text-slate-400">·</span>
                                <span className="text-xs text-slate-400">{questions.length} câu hỏi</span>
                                <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${set.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}
                                >
                                    <span
                                        className={`w-1.5 h-1.5 rounded-full inline-block ${set.isActive ? 'bg-green-500' : 'bg-slate-400'}`}
                                    />
                                    {set.isActive ? 'Hoạt động' : 'Vô hiệu'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={fetchSet}
                            disabled={loading}
                            className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Làm mới"
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={openDeleteSet}
                            className="p-2 border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-800 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors cursor-pointer"
                            title="Xóa vĩnh viễn bộ đề"
                        >
                            <Trash2 size={16} />
                        </button>
                        <button
                            onClick={() => openForm()}
                            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-red-200 dark:shadow-none transition-colors cursor-pointer whitespace-nowrap"
                        >
                            <Plus size={16} /> Thêm câu hỏi
                        </button>
                    </div>
                </div>
            </div>

            {/* Questions table */}
            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="mb-3 p-3 px-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center justify-between gap-3 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 text-sm font-semibold text-red-800 dark:text-red-300">
                        <CheckSquare size={16} className="text-red-600 shrink-0" />
                        <span>
                            Đã chọn{' '}
                            <strong className="font-bold text-red-700 dark:text-red-200">{selectedIds.length}</strong> /{' '}
                            {questions.length} câu hỏi
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
                            <span>Xóa {selectedIds.length} câu hỏi đã chọn</span>
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Danh sách câu hỏi ({questions.length})
                    </h3>
                </div>
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
                                        aria-label="Chọn tất cả câu hỏi"
                                    />
                                </th>
                                {['#', 'Nội dung câu hỏi', 'Đáp án đúng', 'Trạng thái'].map((h) => (
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
                            {questions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <FileText size={28} className="text-slate-300 dark:text-slate-600" />
                                            </div>
                                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                                Bộ đề chưa có câu hỏi nào.
                                            </p>
                                            <button
                                                onClick={() => openForm()}
                                                className="text-sm text-red-600 underline cursor-pointer hover:no-underline"
                                            >
                                                Thêm câu hỏi đầu tiên
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                questions.map((q, idx) => {
                                    const correctOpt = (q.options ?? []).find((o) => o.isCorrect);
                                    return (
                                        <tr
                                            key={q.id}
                                            className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${selectedIds.includes(q.id) ? 'bg-red-50/40 dark:bg-red-950/20' : ''}`}
                                        >
                                            <td className="px-4 py-3.5 w-10" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(q.id)}
                                                    onChange={() => handleToggleSelect(q.id)}
                                                    className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                                    aria-label={`Chọn câu hỏi ${q.content}`}
                                                />
                                            </td>
                                            <td className="px-4 py-3.5 text-xs text-slate-400 font-mono">{idx + 1}</td>
                                            <td className="px-4 py-3.5 max-w-[320px]">
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
                                            <td className="px-4 py-3.5">
                                                {correctOpt ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 dark:text-green-400">
                                                        <Check size={12} />
                                                        {OPTION_LABELS[correctOpt.order - 1] ?? '?'}:{' '}
                                                        <span className="font-normal truncate max-w-[120px]">
                                                            {correctOpt.content}
                                                        </span>
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <StatusBadge isActive={q.isActive} />
                                            </td>
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
            </div>

            {/* Modals */}
            {formOpen && (
                <QuestionFormModal
                    editQuestion={editTarget}
                    set={set}
                    onClose={closeForm}
                    onSaved={handleFormSaved}
                    show={formVisible}
                />
            )}
            {disableOpen && (
                <DisableConfirmModal
                    onConfirm={handleDisableConfirm}
                    onCancel={closeDisable}
                    loading={disabling}
                    show={disableVisible}
                />
            )}
            {deleteOpen && (
                <DeleteQuestionModal
                    question={deleteTarget}
                    onConfirm={handleDeleteConfirm}
                    onCancel={closeDelete}
                    loading={deleting}
                    show={deleteVisible}
                />
            )}
            {bulkDeleteOpen && (
                <BulkDeleteQuestionModal
                    count={selectedIds.length}
                    onConfirm={handleBulkDeleteConfirm}
                    onCancel={closeBulkDelete}
                    loading={bulkDeleting}
                    show={bulkDeleteVisible}
                />
            )}
            {deleteSetOpen && (
                <DeleteSetModal
                    set={set}
                    onConfirm={handleDeleteSetConfirm}
                    onCancel={closeDeleteSet}
                    loading={deletingSet}
                    show={deleteSetVisible}
                />
            )}
        </div>
    );
};

export default AdminJlptSetDetail;
