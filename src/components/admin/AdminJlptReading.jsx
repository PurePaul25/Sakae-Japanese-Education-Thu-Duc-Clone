import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Plus,
    Pencil,
    Trash2,
    AlertTriangle,
    Search,
    Loader2,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    X,
    ToggleLeft,
    ToggleRight,
    RefreshCw,
    CheckSquare,
    Check,
    Circle,
    Image as ImageIcon,
} from 'lucide-react';
import {
    adminGetPassages,
    adminCreatePassage,
    adminUpdatePassage,
    adminDeletePassage,
    adminGetQuestions,
    adminCreateQuestion,
    adminUpdateQuestion,
    adminDisableQuestion,
    adminDeleteQuestion,
    adminBulkDeleteQuestions,
    adminBulkDeletePassages,
    adminGetSets,
} from '../../services/jlptPracticeService';
import { useToast } from '../../contexts/ToastContext';
import DropdownSelect from '../ui/DropdownSelect';
import AdminJlptPassageDetail from './AdminJlptPassageDetail';
import { useNavigate } from 'react-router-dom';
import JlptRichTextEditor from '../jlpt/JlptRichTextEditor';
import JlptContentRenderer from '../jlpt/JlptContentRenderer';
import ReadingImage from '../jlpt/ReadingImage';
import ReadingImageField from './ReadingImageField';
import { normalizeJlptWhitespace } from '../../utils/jlptContentUtil';

// ─── Constants ────────────────────────────────────────────────────────────────

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

const LEVEL_COLORS = {
    N5: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    N4: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    N3: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    N2: 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
    N1: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const MODAL_DURATION = 300;
const Q_PAGE_SIZE = 15;

// ─── Helpers (shared across admin JLPT components) ────────────────────────────

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

// ─── Option Row ───────────────────────────────────────────────────────────────

const OptionRow = ({ index, option, onChange, onCorrect, error }) => {
    const isCorrect = option.isCorrect;
    return (
        <div className="flex items-start gap-2">
            <button
                type="button"
                onClick={() => onCorrect(index)}
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition-colors cursor-pointer ${
                    isCorrect
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-300 hover:border-green-300'
                }`}
                title={isCorrect ? 'Đáp án đúng' : 'Đánh dấu là đáp án đúng'}
                aria-label={`Đáp án ${OPTION_LABELS[index]}`}
            >
                {isCorrect ? <Check size={14} /> : <Circle size={10} className="opacity-30" />}
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
                placeholder={`Nội dung lựa chọn ${OPTION_LABELS[index]}`}
            />
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// PASSAGE FORM MODAL
// ══════════════════════════════════════════════════════════════════════════════

const EMPTY_PASSAGE = {
    level: '',
    title: '',
    passage: '',
    passageTranslation: '',
    imageUrl: '',
    order: 0,
    // For create: must include at least 1 question
    questionContent: '',
    questionExplanation: '',
    questionPracticeSetId: '',
    questionOptions: [
        { content: '', isCorrect: false, order: 1 },
        { content: '', isCorrect: false, order: 2 },
        { content: '', isCorrect: false, order: 3 },
        { content: '', isCorrect: false, order: 4 },
    ],
};

const PassageFormModal = ({ editPassage, practiceSets, onClose, onSaved, show }) => {
    useBodyScrollLock(show);

    const isEdit = !!editPassage;
    const { addToast } = useToast();
    const passageRef = useRef(null);

    const [form, setForm] = useState(EMPTY_PASSAGE);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (show) {
            if (editPassage) {
                const linkedSetIds = [...new Set((editPassage.questions ?? []).map((question) => question.practiceSetId).filter(Boolean))];
                setForm({
                    level: editPassage.level ?? '',
                    title: editPassage.title ?? '',
                    passage: editPassage.passage ?? '',
                    passageTranslation: editPassage.passageTranslation ?? '',
                    imageUrl: editPassage.imageUrl ?? '',
                    order: editPassage.order ?? 0,
                    questionPracticeSetId: linkedSetIds.length === 1 ? linkedSetIds[0] : '',
                    // Not used in edit mode
                    questionContent: '',
                    questionExplanation: '',
                    questionOptions: [
                        { content: '', isCorrect: false, order: 1 },
                        { content: '', isCorrect: false, order: 2 },
                        { content: '', isCorrect: false, order: 3 },
                        { content: '', isCorrect: false, order: 4 },
                    ],
                });
            } else {
                setForm(EMPTY_PASSAGE);
            }
            setErrors({});
            const t = setTimeout(() => passageRef.current?.focus(), 60);
            return () => clearTimeout(t);
        }
    }, [show, editPassage]);

    const updateQuestionOption = (index, content) => {
        setForm((f) => ({
            ...f,
            questionOptions: f.questionOptions.map((o, i) => (i === index ? { ...o, content } : o)),
        }));
        if (errors[`qOption${index}`]) setErrors((p) => ({ ...p, [`qOption${index}`]: '' }));
    };

    const setQuestionCorrect = (index) => {
        setForm((f) => ({
            ...f,
            questionOptions: f.questionOptions.map((o, i) => ({ ...o, isCorrect: i === index })),
        }));
    };

    const validate = () => {
        const next = {};
        if (!form.level) next.level = 'Vui lòng chọn cấp độ JLPT.';
        if (!form.passage.trim()) next.passage = 'Vui lòng nhập nội dung bài đọc.';

        // For create: validate the embedded question
        if (!isEdit) {
            if (!normalizeJlptWhitespace(form.questionContent)) {
                next.questionContent = 'Vui lòng nhập nội dung câu hỏi đầu tiên.';
            }
            form.questionOptions.forEach((o, i) => {
                if (!o.content.trim()) next[`qOption${i}`] = `Vui lòng nhập nội dung lựa chọn ${OPTION_LABELS[i]}.`;
            });
            const correctCount = form.questionOptions.filter((o) => o.isCorrect).length;
            if (correctCount === 0) next.qCorrect = 'Phải chọn đúng 1 đáp án đúng.';
            if (correctCount > 1) next.qCorrect = 'Chỉ được chọn 1 đáp án đúng.';
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSaving(true);
        try {
            if (isEdit) {
                const payload = {
                    title: form.title.trim() || undefined,
                    passage: form.passage.trim(),
                    passageTranslation: form.passageTranslation.trim() || undefined,
                    imageUrl: form.imageUrl.trim() || form.imageUrl === '' ? form.imageUrl.trim() || null : undefined,
                    order: parseInt(form.order, 10) || 0,
                };
                // Only send imageUrl if it changed
                const origImage = editPassage.imageUrl ?? '';
                if (form.imageUrl.trim() === origImage) {
                    delete payload.imageUrl;
                } else if (form.imageUrl.trim() && form.questionPracticeSetId) {
                    payload.practiceSetId = form.questionPracticeSetId;
                }
                await adminUpdatePassage(editPassage.id, payload);
                addToast('Đã cập nhật bài đọc thành công!', 'success');
            } else {
                const payload = {
                    level: form.level,
                    title: form.title.trim() || undefined,
                    passage: form.passage.trim(),
                    passageTranslation: form.passageTranslation.trim() || undefined,
                    imageUrl: form.imageUrl.trim() || undefined,
                    order: parseInt(form.order, 10) || 0,
                    questions: [
                        {
                            content: normalizeJlptWhitespace(form.questionContent),
                            explanation: normalizeJlptWhitespace(form.questionExplanation),
                            isActive: true,
                            order: 0,
                            ...(form.questionPracticeSetId ? { practiceSetId: form.questionPracticeSetId } : {}),
                            options: form.questionOptions.map((o) => ({
                                content: o.content.trim(),
                                isCorrect: o.isCorrect,
                                order: o.order,
                            })),
                        },
                    ],
                };
                await adminCreatePassage(payload);
                addToast('Đã tạo bài đọc thành công!', 'success');
            }
            onSaved();
        } catch (err) {
            addToast(extractError(err), 'error');
        } finally {
            setSaving(false);
        }
    };

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
                <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                            <BookOpen size={18} className="text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                            {isEdit ? 'Chỉnh sửa bài đọc' : 'Tạo bài đọc mới'}
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
                    {/* Level */}
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
                                        setForm((f) => ({ ...f, level: v, questionPracticeSetId: '' }));
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

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Tiêu đề <span className="text-xs font-normal text-slate-400">(không bắt buộc)</span>
                        </label>
                        <input
                            name="title"
                            value={form.title}
                            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-200"
                            placeholder="VD: 日本の文化と伝統"
                            maxLength={200}
                        />
                    </div>

                    {/* Passage */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Nội dung bài đọc <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            ref={passageRef}
                            name="passage"
                            value={form.passage}
                            onChange={(e) => {
                                setForm((f) => ({ ...f, passage: e.target.value }));
                                if (errors.passage) setErrors((p) => ({ ...p, passage: '' }));
                            }}
                            rows={6}
                            className={`${inputCls('passage')} resize-none font-mono text-sm leading-6`}
                            placeholder="わたしは毎朝7時に起きます。..."
                            maxLength={5000}
                        />
                        {errors.passage && <p className="text-xs text-red-500 mt-1">{errors.passage}</p>}
                    </div>

                    {/* Translation */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Bản dịch tiếng Việt{' '}
                            <span className="text-xs font-normal text-slate-400">(không bắt buộc)</span>
                        </label>
                        <textarea
                            name="passageTranslation"
                            value={form.passageTranslation}
                            onChange={(e) => setForm((f) => ({ ...f, passageTranslation: e.target.value }))}
                            rows={4}
                            className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400 resize-none transition duration-200"
                            placeholder="Tôi thức dậy lúc 7 giờ sáng mỗi ngày..."
                            maxLength={5000}
                        />
                    </div>

                    {/* Reading image */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Ảnh minh họa{' '}
                            <span className="text-xs font-normal text-slate-400">(không bắt buộc)</span>
                        </label>
                        <ReadingImageField
                            key={editPassage?.id ?? 'new-reading'}
                            level={form.level}
                            practiceSetId={form.questionPracticeSetId}
                            practiceSets={practiceSets}
                            imageUrl={form.imageUrl}
                            initialPreviewUrl={editPassage?.imageUrl}
                            onPracticeSetChange={(value) => setForm((current) => ({ ...current, questionPracticeSetId: value }))}
                            onImageUrlChange={(value) => setForm((current) => ({ ...current, imageUrl: value }))}
                        />
                    </div>

                    {/* Order */}
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
                    </div>

                    {/* Embedded question (CREATE only) */}
                    {!isEdit && (
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-2 py-0.5 rounded-lg bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 text-xs font-bold">
                                    Câu hỏi đầu tiên
                                </span>
                                <p className="text-xs text-slate-400">
                                    Bắt buộc khi tạo bài đọc. Thêm câu hỏi khác sau.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Nội dung câu hỏi <span className="text-red-500">*</span>
                                    </label>
                                    <JlptRichTextEditor
                                        value={form.questionContent}
                                        onChange={(html) => {
                                            setForm((f) => ({ ...f, questionContent: html }));
                                            if (errors.questionContent)
                                                setErrors((p) => ({ ...p, questionContent: '' }));
                                        }}
                                        placeholder="この人は何時に起きますか？"
                                        minHeight="90px"
                                        maxLength={1000}
                                    />
                                    {errors.questionContent && (
                                        <p className="text-xs text-red-500 mt-1">{errors.questionContent}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Giải thích{' '}
                                        <span className="text-xs font-normal text-slate-400">(không bắt buộc)</span>
                                    </label>
                                    <JlptRichTextEditor
                                        value={form.questionExplanation}
                                        onChange={(html) =>
                                            setForm((f) => ({ ...f, questionExplanation: html }))
                                        }
                                        placeholder="Giải thích đáp án"
                                        minHeight="90px"
                                        maxLength={1000}
                                    />
                                </div>

                                {/* Practice Set for embedded question */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Bộ đề Reading{' '}
                                        <span className="text-xs font-normal text-slate-400">(không bắt buộc)</span>
                                    </label>
                                    {!form.level ? (
                                        <p className="text-xs text-slate-400 py-2">Chọn cấp độ trước.</p>
                                    ) : (practiceSets ?? []).filter(
                                          (s) => s.level === form.level && s.category === 'READING',
                                      ).length === 0 ? (
                                        <p className="text-xs text-slate-400 py-2">
                                            Chưa có bộ đề Reading cho {form.level}.
                                        </p>
                                    ) : (
                                        <DropdownSelect
                                            value={form.questionPracticeSetId}
                                            onChange={(v) => setForm((f) => ({ ...f, questionPracticeSetId: v }))}
                                            options={[
                                                { label: '— Không thuộc bộ đề —', value: '' },
                                                ...(practiceSets ?? [])
                                                    .filter((s) => s.level === form.level && s.category === 'READING')
                                                    .map((s) => ({ label: `#${s.setNumber} ${s.title}`, value: s.id })),
                                            ]}
                                            placeholder="Chọn bộ đề Reading"
                                        />
                                    )}
                                    <p className="text-xs text-slate-400 mt-1">
                                        Gán câu hỏi này vào bộ đề Reading cùng cấp độ.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Lựa chọn đáp án <span className="text-red-500">*</span>
                                    </label>
                                    <div className="space-y-2.5">
                                        {form.questionOptions.map((opt, i) => (
                                            <OptionRow
                                                key={i}
                                                index={i}
                                                option={opt}
                                                onChange={updateQuestionOption}
                                                onCorrect={setQuestionCorrect}
                                                error={errors[`qOption${i}`]}
                                            />
                                        ))}
                                    </div>
                                    {errors.qCorrect && (
                                        <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                                            <AlertTriangle size={12} /> {errors.qCorrect}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

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
                                'Tạo bài đọc'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// DELETE PASSAGE CONFIRM
// ══════════════════════════════════════════════════════════════════════════════

const DeletePassageModal = ({ onConfirm, onCancel, loading, show }) => {
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
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Xóa bài đọc?</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            Bài đọc này sẽ bị xóa vĩnh viễn.
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                            Không thể xóa nếu còn câu hỏi đang hoạt động liên kết. Vô hiệu hóa câu hỏi trước.
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
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 size={14} className="animate-spin" /> Đang xóa...
                                </span>
                            ) : (
                                'Xóa bài đọc'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// READING QUESTION FORM MODAL
// ══════════════════════════════════════════════════════════════════════════════

const EMPTY_RQ = {
    level: '',
    content: '',
    explanation: '',
    practiceSetId: '',
    readingPassageId: '',
    isActive: true,
    order: 0,
    options: [
        { content: '', isCorrect: false, order: 1 },
        { content: '', isCorrect: false, order: 2 },
        { content: '', isCorrect: false, order: 3 },
        { content: '', isCorrect: false, order: 4 },
    ],
};

const ReadingQuestionFormModal = ({ editQuestion, practiceSets, passages, onClose, onSaved, show }) => {
    useBodyScrollLock(show);

    const isEdit = !!editQuestion;
    const { addToast } = useToast();
    const contentRef = useRef(null);

    const [form, setForm] = useState(EMPTY_RQ);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (show) {
            if (editQuestion) {
                const opts = (editQuestion.options ?? []).slice(0, 4);
                while (opts.length < 4) opts.push({ content: '', isCorrect: false, order: opts.length + 1 });
                setForm({
                    level: editQuestion.level ?? '',
                    content: editQuestion.content ?? '',
                    explanation: editQuestion.explanation ?? '',
                    practiceSetId: editQuestion.practiceSetId ?? '',
                    readingPassageId: editQuestion.readingPassageId ?? '',
                    isActive: editQuestion.isActive ?? true,
                    order: editQuestion.order ?? 0,
                    options: opts.map((o, i) => ({
                        content: o.content ?? '',
                        isCorrect: o.isCorrect ?? false,
                        order: o.order ?? i + 1,
                    })),
                });
            } else {
                setForm(EMPTY_RQ);
            }
            setErrors({});
            const t = setTimeout(() => contentRef.current?.focus(), 60);
            return () => clearTimeout(t);
        }
    }, [show, editQuestion]);

    // Filter sets and passages by level
    const filteredSets = (practiceSets ?? []).filter((s) => s.level === form.level && s.category === 'READING');
    const filteredPassages = (passages ?? []).filter((p) => p.level === form.level);

    const updateOption = (index, content) => {
        setForm((f) => ({ ...f, options: f.options.map((o, i) => (i === index ? { ...o, content } : o)) }));
        if (errors[`option${index}`]) setErrors((p) => ({ ...p, [`option${index}`]: '' }));
    };

    const setCorrect = (index) => {
        setForm((f) => ({ ...f, options: f.options.map((o, i) => ({ ...o, isCorrect: i === index })) }));
    };

    const validate = () => {
        const next = {};
        if (!form.level) next.level = 'Vui lòng chọn cấp độ JLPT.';
        if (!normalizeJlptWhitespace(form.content)) {
            next.content = 'Vui lòng nhập nội dung câu hỏi.';
        }
        form.options.forEach((o, i) => {
            if (!o.content.trim()) next[`option${i}`] = `Vui lòng nhập nội dung lựa chọn ${OPTION_LABELS[i]}.`;
        });
        const correctCount = form.options.filter((o) => o.isCorrect).length;
        if (correctCount === 0) next.correct = 'Phải chọn đúng 1 đáp án đúng.';
        if (correctCount > 1) next.correct = 'Chỉ được chọn 1 đáp án đúng.';
        // Validate passage level match if selected
        if (form.readingPassageId) {
            const passage = (passages ?? []).find((p) => p.id === form.readingPassageId);
            if (passage && passage.level !== form.level) {
                next.readingPassageId = `Bài đọc cấp ${passage.level} không khớp với câu hỏi cấp ${form.level}.`;
            }
        }
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
                category: 'READING',
                content: normalizeJlptWhitespace(form.content),
                explanation: normalizeJlptWhitespace(form.explanation),
                isActive: form.isActive,
                order: parseInt(form.order, 10) || 0,
                options: form.options.map((o) => ({
                    content: o.content.trim(),
                    isCorrect: o.isCorrect,
                    order: o.order,
                })),
                ...(form.practiceSetId ? { practiceSetId: form.practiceSetId } : {}),
                ...(form.readingPassageId ? { readingPassageId: form.readingPassageId } : {}),
            };

            if (isEdit) {
                const updatePayload = {
                    content: payload.content,
                    explanation: payload.explanation,
                    isActive: payload.isActive,
                    order: payload.order,
                    options: payload.options,
                };
                // practiceSetId change detection
                const origSetId = editQuestion.practiceSetId ?? '';
                const newSetId = form.practiceSetId || null;
                if (newSetId !== origSetId) updatePayload.practiceSetId = newSetId;
                // readingPassageId change detection
                const origPassageId = editQuestion.readingPassageId ?? '';
                const newPassageId = form.readingPassageId || null;
                if (newPassageId !== origPassageId) updatePayload.readingPassageId = newPassageId;

                await adminUpdateQuestion(editQuestion.id, updatePayload);
                addToast('Đã cập nhật câu hỏi Reading thành công!', 'success');
            } else {
                await adminCreateQuestion(payload);
                addToast('Đã tạo câu hỏi Reading thành công!', 'success');
            }
            onSaved();
        } catch (err) {
            addToast(extractError(err), 'error');
        } finally {
            setSaving(false);
        }
    };

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
                <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                            <BookOpen size={18} className="text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                            {isEdit ? 'Chỉnh sửa câu hỏi Reading' : 'Tạo câu hỏi Reading'}
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
                    {/* Level */}
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
                                        setForm((f) => ({ ...f, level: v, practiceSetId: '', readingPassageId: '' }));
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

                    {/* Passage + Set */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Bài đọc liên kết
                            </label>
                            {!form.level ? (
                                <p className="text-xs text-slate-400 py-2">Chọn cấp độ trước.</p>
                            ) : filteredPassages.length === 0 ? (
                                <p className="text-xs text-slate-400 py-2">Chưa có bài đọc nào cho {form.level}.</p>
                            ) : (
                                <DropdownSelect
                                    value={form.readingPassageId}
                                    onChange={(v) => {
                                        setForm((f) => ({ ...f, readingPassageId: v }));
                                        if (errors.readingPassageId) setErrors((p) => ({ ...p, readingPassageId: '' }));
                                    }}
                                    options={[
                                        { label: '— Không liên kết —', value: '' },
                                        ...filteredPassages.map((p) => ({
                                            label: p.title || `Passage #${p.order}`,
                                            value: p.id,
                                        })),
                                    ]}
                                    placeholder="Chọn bài đọc"
                                />
                            )}
                            {errors.readingPassageId && (
                                <p className="text-xs text-red-500 mt-1">{errors.readingPassageId}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Bộ đề (Reading)
                            </label>
                            {!form.level ? (
                                <p className="text-xs text-slate-400 py-2">Chọn cấp độ trước.</p>
                            ) : filteredSets.length === 0 ? (
                                <p className="text-xs text-slate-400 py-2">Chưa có bộ đề Reading cho {form.level}.</p>
                            ) : (
                                <DropdownSelect
                                    value={form.practiceSetId}
                                    onChange={(v) => setForm((f) => ({ ...f, practiceSetId: v }))}
                                    options={[
                                        { label: '— Không thuộc bộ đề —', value: '' },
                                        ...filteredSets.map((s) => ({
                                            label: `#${s.setNumber} ${s.title}`,
                                            value: s.id,
                                        })),
                                    ]}
                                    placeholder="Chọn bộ đề"
                                />
                            )}
                        </div>
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
                            placeholder="この人は何時に起きますか？"
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
                            placeholder="Giải thích đáp án"
                            minHeight="90px"
                            maxLength={1000}
                        />
                    </div>

                    {/* Options */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Lựa chọn đáp án <span className="text-red-500">*</span>
                        </label>
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
                                <AlertTriangle size={12} /> {errors.correct}
                            </p>
                        )}
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
                                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-200"
                                placeholder="0"
                            />
                        </div>
                        <div className="flex items-end pb-1">
                            <div className="flex items-center justify-between w-full p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Kích hoạt</p>
                                <button
                                    type="button"
                                    onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                                    className="cursor-pointer focus:outline-none"
                                    aria-label="Toggle"
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

// ══════════════════════════════════════════════════════════════════════════════
// BULK DELETE PASSAGES CONFIRM
// ══════════════════════════════════════════════════════════════════════════════

const BulkDeletePassageModal = ({ count, onConfirm, onCancel, loading, show }) => {
    useBodyScrollLock(show);
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-5">
            <div className={`absolute inset-0 bg-black/70 transition-opacity duration-${MODAL_DURATION} ${show ? 'opacity-100' : 'opacity-0'}`} />
            <div className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 transform transition-all duration-${MODAL_DURATION} ${show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}>
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <Trash2 size={32} className="text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
                            Xóa {count} bài đọc đã chọn?
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            Bạn đang chuẩn bị xóa vĩnh viễn <strong className="text-red-600">{count}</strong> bài đọc khỏi hệ thống.
                        </p>
                        <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/30 text-left">
                            <p className="text-xs text-red-700 dark:text-red-300 font-semibold mb-1">
                                Quy tắc an toàn:
                            </p>
                            <p className="text-xs text-red-600 dark:text-red-400 leading-normal">
                                Hệ thống chỉ xóa những bài đọc không có câu hỏi đang hoạt động. Các bài đọc còn câu hỏi active sẽ được giữ nguyên và báo cáo lại chi tiết.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full">
                        <button onClick={onCancel} disabled={loading} className="flex-1 px-4 py-2.5 cursor-pointer border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Huỷ</button>
                        <button onClick={onConfirm} disabled={loading} className="flex-1 px-4 py-2.5 cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-60">
                            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" />Đang xử lý...</span> : `Xác nhận xóa (${count})`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// DELETE SINGLE QUESTION MODAL
// ══════════════════════════════════════════════════════════════════════════════

const DeleteQuestionModal = ({ question, onConfirm, onCancel, loading, show }) => {
    useBodyScrollLock(show);
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-5">
            <div className={`absolute inset-0 bg-black/70 transition-opacity duration-${MODAL_DURATION} ${show ? 'opacity-100' : 'opacity-0'}`} />
            <div className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 transform transition-all duration-${MODAL_DURATION} ${show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}>
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <Trash2 size={32} className="text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Xóa vĩnh viễn câu hỏi?</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-3">"{question?.content}"</p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-2">Hành động này sẽ xóa câu hỏi cùng toàn bộ đáp án liên quan và không thể hoàn tác.</p>
                    </div>
                    <div className="flex gap-3 w-full">
                        <button onClick={onCancel} disabled={loading} className="flex-1 px-4 py-2.5 cursor-pointer border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Huỷ</button>
                        <button onClick={onConfirm} disabled={loading} className="flex-1 px-4 py-2.5 cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-60">
                            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" />Đang xóa...</span> : 'Xóa vĩnh viễn'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// BULK DELETE QUESTIONS MODAL
// ══════════════════════════════════════════════════════════════════════════════

const BulkDeleteQuestionModal = ({ count, onConfirm, onCancel, loading, show }) => {
    useBodyScrollLock(show);
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-5">
            <div className={`absolute inset-0 bg-black/70 transition-opacity duration-${MODAL_DURATION} ${show ? 'opacity-100' : 'opacity-0'}`} />
            <div className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 transform transition-all duration-${MODAL_DURATION} ${show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}>
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <Trash2 size={32} className="text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Xóa {count} câu hỏi đã chọn?</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Bạn đang chuẩn bị xóa vĩnh viễn <strong className="text-red-600">{count}</strong> câu hỏi cùng toàn bộ đáp án liên quan.</p>
                    </div>
                    <div className="flex gap-3 w-full">
                        <button onClick={onCancel} disabled={loading} className="flex-1 px-4 py-2.5 cursor-pointer border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Huỷ</button>
                        <button onClick={onConfirm} disabled={loading} className="flex-1 px-4 py-2.5 cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-60">
                            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" />Đang xử lý...</span> : `Xác nhận xóa (${count})`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// DISABLE QUESTION CONFIRM
// ══════════════════════════════════════════════════════════════════════════════

const DisableQuestionModal = ({ onConfirm, onCancel, loading, show }) => {
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
                            Câu hỏi sẽ bị ẩn khỏi học viên. Dữ liệu vẫn được lưu trong hệ thống.
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

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

const AdminJlptReading = ({ passageId }) => {
    const { addToast } = useToast();
    const addToastRef = useRef(addToast);
    useEffect(() => {
        addToastRef.current = addToast;
    }, [addToast]);
    const navigate = useNavigate();

    // Inner sub-tab: 'passages' | 'questions'
    const [subView, setSubView] = useState('passages');

    // ── Passage state ──────────────────────────────────────────────────────────
    const [passages, setPassages] = useState([]);
    const [passagesLoading, setPassagesLoading] = useState(true);
    const [passagesError, setPassagesError] = useState(null);
    const [passageLevelFilter, setPassageLevelFilter] = useState('');

    // Passage modals
    const [passageFormOpen, setPassageFormOpen] = useState(false);
    const [passageFormVisible, setPassageFormVisible] = useState(false);
    const [passageEditTarget, setPassageEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // ── Question state ─────────────────────────────────────────────────────────
    const [questions, setQuestions] = useState([]);
    const [qMeta, setQMeta] = useState(null);
    const [qPage, setQPage] = useState(1);
    const [qLoading, setQLoading] = useState(true);
    const [qError, setQError] = useState(null);

    // Question filters
    const [qLevelFilter, setQLevelFilter] = useState('');
    const [qSetFilter, setQSetFilter] = useState('');
    const [qPassageFilter, setQPassageFilter] = useState('');
    const [qStatusFilter, setQStatusFilter] = useState('');
    const [qSearch, setQSearch] = useState('');
    const [qDebouncedSearch, setQDebouncedSearch] = useState('');

    // Practice sets (for question form + filter)
    const [practiceSets, setPracticeSets] = useState([]);
    const [setsLoading, setSetsLoading] = useState(false);

    // Question modals
    const [qFormOpen, setQFormOpen] = useState(false);
    const [qFormVisible, setQFormVisible] = useState(false);
    const [qEditTarget, setQEditTarget] = useState(null);
    const [disableTarget, setDisableTarget] = useState(null);
    const [disableOpen, setDisableOpen] = useState(false);
    const [disableVisible, setDisableVisible] = useState(false);
    const [disabling, setDisabling] = useState(false);
    // Bulk delete passages state
    const [selectedPassageIds, setSelectedPassageIds] = useState([]);
    const [bulkPassageDeleteOpen, setBulkPassageDeleteOpen] = useState(false);
    const [bulkPassageDeleteVisible, setBulkPassageDeleteVisible] = useState(false);
    const [bulkPassageDeleting, setBulkPassageDeleting] = useState(false);

    // Question selection & delete state
    const [selectedQIds, setSelectedQIds] = useState([]);
    const [deleteQTarget, setDeleteQTarget] = useState(null);
    const [deleteQOpen, setDeleteQOpen] = useState(false);
    const [deleteQVisible, setDeleteQVisible] = useState(false);
    const [deletingQ, setDeletingQ] = useState(false);
    const [bulkQDeleteOpen, setBulkQDeleteOpen] = useState(false);
    const [bulkQDeleteVisible, setBulkQDeleteVisible] = useState(false);
    const [bulkQDeleting, setBulkQDeleting] = useState(false);

    // ── Fetch passages (no pagination) ────────────────────────────────────────
    const fetchPassages = useCallback(async () => {
        // Skip if we're in detail view — passageId guard will render PassageDetail instead
        if (passageId) return;
        setPassagesLoading(true);
        setPassagesError(null);
        try {
            const data = await adminGetPassages(passageLevelFilter || undefined);
            setPassages(Array.isArray(data) ? data : []);
        } catch (err) {
            const msg = extractError(err);
            setPassagesError(msg);
            addToastRef.current(msg, 'error');
        } finally {
            setPassagesLoading(false);
        }
    }, [passageLevelFilter, passageId]);

    useEffect(() => { setSelectedPassageIds([]); fetchPassages(); }, [fetchPassages]);

    // ── Fetch practice sets ────────────────────────────────────────────────────
    useEffect(() => {
        if (passageId) return; // skip when in detail view
        setSetsLoading(true);
        adminGetSets({ limit: 200 })
            .then((data) => setPracticeSets(data?.items ?? []))
            .catch(() => setPracticeSets([]))
            .finally(() => setSetsLoading(false));
    }, [passageId]);

    // ── Debounce question search ────────────────────────────────────────────────
    useEffect(() => {
        const t = setTimeout(() => {
            setQDebouncedSearch(qSearch);
            setQPage(1);
        }, 400);
        return () => clearTimeout(t);
    }, [qSearch]);

    useEffect(() => {
        setQPage(1);
    }, [qLevelFilter, qSetFilter, qPassageFilter, qStatusFilter]);

    // ── Fetch reading questions ─────────────────────────────────────────────────
    const fetchQuestions = useCallback(
        async (p = 1) => {
            // Skip if we're in detail view
            if (passageId) return;
            setQLoading(true);
            setQError(null);
            try {
                const params = {
                    page: p,
                    limit: Q_PAGE_SIZE,
                    category: 'READING',
                    ...(qLevelFilter && { level: qLevelFilter }),
                    ...(qStatusFilter === 'active' && { isActive: true }),
                    ...(qStatusFilter === 'inactive' && { isActive: false }),
                    ...(qDebouncedSearch && { search: qDebouncedSearch }),
                    ...(qPassageFilter && { readingPassageId: qPassageFilter }),
                    ...(qSetFilter && { practiceSetId: qSetFilter }),
                };
                const data = await adminGetQuestions(params);
                setQuestions(data?.items ?? []);
                setQMeta(data?.meta ?? null);
            } catch (err) {
                const msg = extractError(err);
                setQError(msg);
                addToastRef.current(msg, 'error');
            } finally {
                setQLoading(false);
            }
        },
        [qLevelFilter, qStatusFilter, qDebouncedSearch, qPassageFilter, qSetFilter, passageId],
    );

    useEffect(() => {
        fetchQuestions(qPage);
    }, [qPage, fetchQuestions]);

    // ── Passage modal helpers ──────────────────────────────────────────────────
    const openPassageForm = (passage = null) => {
        setPassageEditTarget(passage);
        setPassageFormOpen(true);
        setTimeout(() => setPassageFormVisible(true), 10);
    };
    const closePassageForm = () => {
        setPassageFormVisible(false);
        setTimeout(() => {
            setPassageFormOpen(false);
            setPassageEditTarget(null);
        }, MODAL_DURATION);
    };
    const handlePassageSaved = () => {
        closePassageForm();
        fetchPassages();
    };

    const openDelete = (passage) => {
        setDeleteTarget(passage);
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
            await adminDeletePassage(deleteTarget.id);
            addToastRef.current('Đã xóa bài đọc thành công.', 'success');
            closeDelete();
            fetchPassages();
        } catch (err) {
            addToastRef.current(extractError(err), 'error');
        } finally {
            setDeleting(false);
        }
    };

    // ── Question modal helpers ──────────────────────────────────────────────────
    const openQForm = (question = null) => {
        setQEditTarget(question);
        setQFormOpen(true);
        setTimeout(() => setQFormVisible(true), 10);
    };
    const closeQForm = () => {
        setQFormVisible(false);
        setTimeout(() => {
            setQFormOpen(false);
            setQEditTarget(null);
        }, MODAL_DURATION);
    };
    const handleQSaved = () => {
        closeQForm();
        fetchQuestions(qEditTarget ? qPage : 1);
        if (!qEditTarget) setQPage(1);
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
            fetchQuestions(qPage);
        } catch (err) {
            addToastRef.current(extractError(err), 'error');
        } finally {
            setDisabling(false);
        }
    };

    // ── Bulk delete passages handlers ──────────────────────────────────────────
    const handleToggleSelectPassage = (id) => {
        setSelectedPassageIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
    };
    const handleSelectAllPassages = () => {
        if (selectedPassageIds.length === passages.length && passages.length > 0) {
            setSelectedPassageIds([]);
        } else {
            setSelectedPassageIds(passages.map((p) => p.id));
        }
    };
    const openBulkDeletePassages = () => {
        if (selectedPassageIds.length === 0) return;
        setBulkPassageDeleteOpen(true);
        setTimeout(() => setBulkPassageDeleteVisible(true), 10);
    };
    const closeBulkDeletePassages = () => {
        setBulkPassageDeleteVisible(false);
        setTimeout(() => { setBulkPassageDeleteOpen(false); }, MODAL_DURATION);
    };
    const handleBulkDeletePassagesConfirm = async () => {
        if (selectedPassageIds.length === 0) return;
        setBulkPassageDeleting(true);
        try {
            const res = await adminBulkDeletePassages(selectedPassageIds);
            if (res.deleted > 0) {
                addToastRef.current(`Đã xóa thành công ${res.deleted} bài đọc.`, 'success');
            }
            if (res.failed > 0) {
                const failReasons = res.failures?.map((f) => `${f.title || f.id}: ${f.reason}`).join('; ');
                addToastRef.current(`${res.failed} bài đọc không thể xóa: ${failReasons}`, 'warning');
            }
            closeBulkDeletePassages();
            setSelectedPassageIds([]);
            fetchPassages();
        } catch (err) {
            addToastRef.current(extractError(err), 'error');
        } finally {
            setBulkPassageDeleting(false);
        }
    };

    // ── Single Question delete handlers ───────────────────────────────────────
    const openDeleteQuestion = (q) => { setDeleteQTarget(q); setDeleteQOpen(true); setTimeout(() => setDeleteQVisible(true), 10); };
    const closeDeleteQuestion = () => { setDeleteQVisible(false); setTimeout(() => { setDeleteQOpen(false); setDeleteQTarget(null); }, MODAL_DURATION); };
    const handleDeleteQuestionConfirm = async () => {
        if (!deleteQTarget) return;
        setDeletingQ(true);
        try {
            await adminDeleteQuestion(deleteQTarget.id);
            addToastRef.current('Đã xóa vĩnh viễn câu hỏi thành công.', 'success');
            closeDeleteQuestion();
            setSelectedQIds((prev) => prev.filter((id) => id !== deleteQTarget.id));
            fetchQuestions(qPage);
        } catch (err) {
            addToastRef.current(extractError(err), 'error');
        } finally {
            setDeletingQ(false);
        }
    };

    // ── Bulk delete questions handlers ────────────────────────────────────────
    const handleToggleSelectQ = (id) => {
        setSelectedQIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
    };
    const handleSelectAllQ = () => {
        if (selectedQIds.length === questions.length && questions.length > 0) {
            setSelectedQIds([]);
        } else {
            setSelectedQIds(questions.map((q) => q.id));
        }
    };
    const openBulkDeleteQ = () => {
        if (selectedQIds.length === 0) return;
        setBulkQDeleteOpen(true);
        setTimeout(() => setBulkQDeleteVisible(true), 10);
    };
    const closeBulkDeleteQ = () => { setBulkQDeleteVisible(false); setTimeout(() => { setBulkQDeleteOpen(false); }, MODAL_DURATION); };
    const handleBulkDeleteQConfirm = async () => {
        if (selectedQIds.length === 0) return;
        setBulkQDeleting(true);
        try {
            const res = await adminBulkDeleteQuestions(selectedQIds);
            addToastRef.current(`Đã xóa thành công ${res.deleted || selectedQIds.length} câu hỏi.`, 'success');
            closeBulkDeleteQ();
            setSelectedQIds([]);
            fetchQuestions(qPage);
        } catch (err) {
            addToastRef.current(extractError(err), 'error');
        } finally {
            setBulkQDeleting(false);
        }
    };

    // ── Filtered sets/passages for question filter dropdowns ───────────────────
    const qSetOptions = (practiceSets ?? []).filter((s) => {
        if (s.category !== 'READING') return false;
        if (qLevelFilter && s.level !== qLevelFilter) return false;
        return true;
    });
    const qPassageOptions = (passages ?? []).filter((p) => {
        if (qLevelFilter && p.level !== qLevelFilter) return false;
        return true;
    });

    // ══ RENDER ══════════════════════════════════════════════════════════════════

    // If passageId is present, render the detail page (after all hooks)
    if (passageId) {
        return <AdminJlptPassageDetail passageId={passageId} onBack={() => navigate('/admin/dashboard/doc-hieu')} />;
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-5">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Quản lý Đọc hiểu (Reading)</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Quản lý bài đọc và câu hỏi Reading theo cấp độ JLPT.
                </p>
            </div>

            {/* Inner sub-tabs: Passages | Questions */}
            <div className="mb-5 flex gap-2 border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setSubView('passages')}
                    className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                        subView === 'passages'
                            ? 'border-red-600 text-red-600 dark:text-red-400'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                    Bài đọc
                </button>
                <button
                    onClick={() => setSubView('questions')}
                    className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                        subView === 'questions'
                            ? 'border-red-600 text-red-600 dark:text-red-400'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                    Câu hỏi Reading
                </button>
            </div>

            {/* ═══ PASSAGES VIEW ════════════════════════════════════════════════════ */}
            {subView === 'passages' && (
                <div>
                    {/* Toolbar */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <DropdownSelect
                            value={passageLevelFilter}
                            onChange={(v) => {
                                setPassageLevelFilter(v);
                            }}
                            options={[
                                { label: 'Tất cả cấp độ', value: '' },
                                ...LEVELS.map((l) => ({ label: l, value: l })),
                            ]}
                            placeholder="Cấp độ"
                            containerClassName="min-w-[130px]"
                        />
                        <button
                            onClick={fetchPassages}
                            disabled={passagesLoading}
                            className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                            title="Làm mới"
                        >
                            <RefreshCw size={16} className={passagesLoading ? 'animate-spin' : ''} />
                        </button>
                        <div className="flex-1" />
                        <button
                            onClick={() => openPassageForm()}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                        >
                            <Plus size={16} /> Tạo bài đọc
                        </button>
                    </div>

                    {/* Passage list */}
                    {passagesLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 size={36} className="animate-spin text-red-600" />
                            <p className="text-sm text-slate-400">Đang tải danh sách bài đọc...</p>
                        </div>
                    ) : passagesError ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                            <AlertTriangle size={36} className="text-red-400" />
                            <p className="text-slate-500 font-medium">Không thể tải dữ liệu</p>
                            <button
                                onClick={fetchPassages}
                                className="text-sm text-red-600 underline cursor-pointer hover:no-underline"
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : passages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <BookOpen size={28} className="text-slate-300 dark:text-slate-600" />
                            </div>
                            <p className="text-slate-500 font-medium">Chưa có bài đọc nào.</p>
                            <button
                                onClick={() => openPassageForm()}
                                className="text-sm text-red-600 underline cursor-pointer hover:no-underline"
                            >
                                Tạo bài đọc mới
                            </button>
                        </div>
                    ) : (
                        <div>
                            {/* Bulk Action Bar Passages */}
                            {selectedPassageIds.length > 0 && (
                                <div className="mb-3 p-3 px-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center justify-between gap-3 animate-in fade-in duration-150">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-red-800 dark:text-red-300">
                                        <CheckSquare size={16} className="text-red-600 shrink-0" />
                                        <span>
                                            Đã chọn <strong className="font-bold text-red-700 dark:text-red-200">{selectedPassageIds.length}</strong> / {passages.length} bài đọc
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setSelectedPassageIds([])}
                                            className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                        >
                                            Bỏ chọn
                                        </button>
                                        <button
                                            onClick={openBulkDeletePassages}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-95"
                                        >
                                            <Trash2 size={13} />
                                            <span>Xóa {selectedPassageIds.length} bài đọc</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {passages.length > 0 && (
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedPassageIds.length === passages.length && passages.length > 0}
                                            onChange={handleSelectAllPassages}
                                            className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                        />
                                        <span>Chọn tất cả bài đọc</span>
                                    </label>
                                </div>
                            )}

                            <div className="space-y-3">
                                {passages.map((p) => {
                                    const activeQuestions = (p.questions ?? []).filter((q) => q.isActive).length;
                                    return (
                                        <div
                                            key={p.id}
                                            className={`bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                                                selectedPassageIds.includes(p.id)
                                                    ? 'border-red-500 bg-red-50/20 dark:bg-red-950/20'
                                                    : 'border-slate-200 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-900/40'
                                            }`}
                                            onClick={() => navigate(`/admin/dashboard/doc-hieu/${p.id}`)}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                                    <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedPassageIds.includes(p.id)}
                                                            onChange={() => handleToggleSelectPassage(p.id)}
                                                            className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                                            aria-label={`Chọn bài đọc ${p.title}`}
                                                        />
                                                    </div>
                                                    {/* Level badge */}
                                                    <span
                                                        className={`shrink-0 px-2 py-0.5 rounded-lg text-[11px] font-bold ${LEVEL_COLORS[p.level] ?? 'bg-slate-100 text-slate-500'}`}
                                                    >
                                                        {p.level}
                                                    </span>
                                                    {/* Content */}
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-semibold text-slate-800 dark:text-white text-sm">
                                                            {p.title || '(Không tiêu đề)'}
                                                    </p>
                                                    {p.imageUrl && (
                                                        <ReadingImage
                                                            src={p.imageUrl}
                                                            alt={`Ảnh minh họa ${p.title || 'bài đọc'}`}
                                                            className="mt-2 max-h-24 rounded-lg"
                                                        />
                                                    )}
                                                    <JlptContentRenderer
                                                        content={p.passage}
                                                        className="mt-1 line-clamp-2 text-xs font-mono leading-5 text-slate-500 dark:text-slate-400"
                                                    />
                                                    {p.passageTranslation && (
                                                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 italic">
                                                            {p.passageTranslation}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <span className="text-xs text-slate-400">
                                                            {activeQuestions} câu hỏi active
                                                        </span>
                                                        {p.imageUrl && (
                                                            <span className="text-xs text-red-600 flex items-center gap-1">
                                                                <ImageIcon size={11} /> có ảnh
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-slate-400">
                                                            Thứ tự: {p.order}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Actions */}
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openPassageForm(p);
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openDelete(p);
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ═══ QUESTIONS VIEW ═══════════════════════════════════════════════════ */}
            {subView === 'questions' && (
                <div>
                    {/* Toolbar */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <div className="relative flex-1 min-w-[180px]">
                            <Search
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                            />
                            <input
                                type="text"
                                placeholder="Tìm theo nội dung câu hỏi..."
                                value={qSearch}
                                onChange={(e) => setQSearch(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-200"
                            />
                        </div>
                        <DropdownSelect
                            value={qLevelFilter}
                            onChange={setQLevelFilter}
                            options={[
                                { label: 'Tất cả cấp độ', value: '' },
                                ...LEVELS.map((l) => ({ label: l, value: l })),
                            ]}
                            placeholder="Cấp độ"
                            containerClassName="min-w-[130px]"
                        />
                        <DropdownSelect
                            value={qPassageFilter}
                            onChange={setQPassageFilter}
                            options={[
                                { label: 'Tất cả bài đọc', value: '' },
                                ...qPassageOptions.map((p) => ({
                                    label: p.title || `Passage #${p.order}`,
                                    value: p.id,
                                })),
                            ]}
                            placeholder="Bài đọc"
                            containerClassName="min-w-[160px]"
                        />
                        <DropdownSelect
                            value={qSetFilter}
                            onChange={setQSetFilter}
                            options={[
                                { label: 'Tất cả bộ đề', value: '' },
                                ...qSetOptions.map((s) => ({ label: `#${s.setNumber} ${s.title}`, value: s.id })),
                            ]}
                            placeholder={setsLoading ? 'Đang tải...' : 'Bộ đề'}
                            disabled={setsLoading}
                            containerClassName="min-w-[160px]"
                        />
                        <DropdownSelect
                            value={qStatusFilter}
                            onChange={setQStatusFilter}
                            options={[
                                { label: 'Tất cả trạng thái', value: '' },
                                { label: 'Hoạt động', value: 'active' },
                                { label: 'Vô hiệu', value: 'inactive' },
                            ]}
                            placeholder="Trạng thái"
                            containerClassName="min-w-[150px]"
                        />
                        <button
                            onClick={() => fetchQuestions(qPage)}
                            disabled={qLoading}
                            className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                            title="Làm mới"
                        >
                            <RefreshCw size={16} className={qLoading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={() => openQForm()}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                        >
                            <Plus size={16} /> Tạo câu hỏi
                        </button>
                    </div>

                    {/* Questions table */}
                    {/* Bulk Action Bar Questions */}
            {selectedQIds.length > 0 && (
                <div className="mb-3 p-3 px-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center justify-between gap-3 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 text-sm font-semibold text-red-800 dark:text-red-300">
                        <CheckSquare size={16} className="text-red-600 shrink-0" />
                        <span>
                            Đã chọn <strong className="font-bold text-red-700 dark:text-red-200">{selectedQIds.length}</strong> / {questions.length} câu hỏi Reading trên trang này
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSelectedQIds([])}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                            Bỏ chọn
                        </button>
                        <button
                            onClick={openBulkDeleteQ}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-95"
                        >
                            <Trash2 size={13} />
                            <span>Xóa {selectedQIds.length} câu hỏi</span>
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
                                        checked={questions.length > 0 && selectedQIds.length === questions.length}
                                        onChange={handleSelectAllQ}
                                        className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                        aria-label="Chọn tất cả câu hỏi trên trang này"
                                    />
                                </th>
                                {['Câu hỏi', 'Cấp độ', 'Bài đọc', 'Bộ đề', 'Đáp án', 'Trạng thái'].map((h) => (
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
                                    {qLoading ? (
                                        Array.from({ length: 6 }).map((_, i) => (
                                            <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                                                {[1, 2, 3, 4, 5].map((c) => (
                                                    <td key={c} className="px-4 py-3.5">
                                                        <div
                                                            className="h-4 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse"
                                                            style={{ width: `${40 + ((c * 17) % 40)}%` }}
                                                        />
                                                    </td>
                                                ))}
                                                <td className="px-4 py-3.5">
                                                    <div className="h-4 w-16 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse ml-auto" />
                                                </td>
                                            </tr>
                                        ))
                                    ) : qError ? (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-16 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <AlertTriangle size={36} className="text-red-400" />
                                                    <p className="text-slate-500 font-medium">Không thể tải dữ liệu</p>
                                                    <button
                                                        onClick={() => fetchQuestions(qPage)}
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
                                                        <BookOpen
                                                            size={28}
                                                            className="text-slate-300 dark:text-slate-600"
                                                        />
                                                    </div>
                                                    <p className="text-slate-500 font-medium">
                                                        Chưa có câu hỏi Reading nào.
                                                    </p>
                                                    <button
                                                        onClick={() => openQForm()}
                                                        className="text-sm text-red-600 underline cursor-pointer hover:no-underline"
                                                    >
                                                        Tạo câu hỏi mới
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        questions.map((q) => {
                                            const correctOpt = (q.options ?? []).find((o) => o.isCorrect);
                                            const passage = passages.find((p) => p.id === q.readingPassageId);
                                            const setName = practiceSets.find((s) => s.id === q.practiceSetId)?.title;
                                            return (
                                                <tr
                                                    key={q.id}
                                                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                                                        selectedQIds.includes(q.id) ? 'bg-red-50/40 dark:bg-red-950/20' : ''
                                                    }`}
                                                >
                                                    <td className="px-4 py-3.5 w-10">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedQIds.includes(q.id)}
                                                            onChange={() => handleToggleSelectQ(q.id)}
                                                            className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                                            aria-label={`Chọn câu hỏi ${q.content}`}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3.5 max-w-[240px]">
                                                        <div className="font-semibold text-slate-800 dark:text-white truncate">
                                                            <JlptContentRenderer content={q.content} />
                                                        </div>
                                                        {q.explanation && (
                                                            <JlptContentRenderer content={q.explanation} className="text-xs text-slate-400 truncate mt-0.5" />
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <span
                                                            className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${LEVEL_COLORS[q.level] ?? 'bg-slate-100 text-slate-500'}`}
                                                        >
                                                            {q.level}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 max-w-[140px]">
                                                        {passage ? (
                                                            <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                                                                {passage.title || `#${passage.order}`}
                                                            </p>
                                                        ) : (
                                                            <span className="text-xs text-slate-400 italic">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3.5 max-w-[140px]">
                                                        {setName ? (
                                                            <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                                                                {setName}
                                                            </p>
                                                        ) : (
                                                            <span className="text-xs text-slate-400 italic">—</span>
                                                        )}
                                                    </td>
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
                                                    <td className="px-4 py-3.5">
                                                        <StatusBadge isActive={q.isActive} />
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openQForm(q);
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
                                                            openDeleteQuestion(q);
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
                        {/* Pagination */}
                        {!qLoading && !qError && (
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3.5 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Hiển thị{' '}
                                    <span className="font-semibold text-slate-700 dark:text-white">
                                        {questions.length === 0 ? 0 : (qPage - 1) * Q_PAGE_SIZE + 1}
                                    </span>{' '}
                                    –{' '}
                                    <span className="font-semibold text-slate-700 dark:text-white">
                                        {(qPage - 1) * Q_PAGE_SIZE + questions.length}
                                    </span>{' '}
                                    trong{' '}
                                    <span className="font-semibold text-slate-700 dark:text-white">
                                        {qMeta?.total ?? questions.length}
                                    </span>{' '}
                                    câu hỏi
                                </p>
                                <Pagination
                                    page={qPage}
                                    total={qMeta?.total ?? questions.length}
                                    pageSize={Q_PAGE_SIZE}
                                    onChange={setQPage}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modals */}
            {passageFormOpen && (
                <PassageFormModal
                    editPassage={passageEditTarget}
                    practiceSets={practiceSets}
                    onClose={closePassageForm}
                    onSaved={handlePassageSaved}
                    show={passageFormVisible}
                />
            )}
            {deleteOpen && (
                <DeletePassageModal
                    onConfirm={handleDeleteConfirm}
                    onCancel={closeDelete}
                    loading={deleting}
                    show={deleteVisible}
                />
            )}
            {qFormOpen && (
                <ReadingQuestionFormModal
                    editQuestion={qEditTarget}
                    practiceSets={practiceSets}
                    passages={passages}
                    onClose={closeQForm}
                    onSaved={handleQSaved}
                    show={qFormVisible}
                />
            )}
            {disableOpen && (
                <DisableQuestionModal
                    onConfirm={handleDisableConfirm}
                    onCancel={closeDisable}
                    loading={disabling}
                    show={disableVisible}
                />
            )}
            {bulkPassageDeleteOpen && (
                <BulkDeletePassageModal
                    count={selectedPassageIds.length}
                    onConfirm={handleBulkDeletePassagesConfirm}
                    onCancel={closeBulkDeletePassages}
                    loading={bulkPassageDeleting}
                    show={bulkPassageDeleteVisible}
                />
            )}
            {deleteQOpen && (
                <DeleteQuestionModal
                    question={deleteQTarget}
                    onConfirm={handleDeleteQuestionConfirm}
                    onCancel={closeDeleteQuestion}
                    loading={deletingQ}
                    show={deleteQVisible}
                />
            )}
            {bulkQDeleteOpen && (
                <BulkDeleteQuestionModal
                    count={selectedQIds.length}
                    onConfirm={handleBulkDeleteQConfirm}
                    onCancel={closeBulkDeleteQ}
                    loading={bulkQDeleting}
                    show={bulkQDeleteVisible}
                />
            )}
        </div>
    );
};

export default AdminJlptReading;
