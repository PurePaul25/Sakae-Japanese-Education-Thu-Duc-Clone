import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Plus,
    Pencil,
    AlertTriangle,
    Search,
    Loader2,
    ClipboardCheck,
    ChevronLeft,
    ChevronRight,
    X,
    EyeOff,
    RefreshCw,
    Trash2,
    CheckSquare,
    ChevronRight as ArrowRight,
} from 'lucide-react';
import {
    adminGetSets,
    adminCreateSet,
    adminUpdateSet,
    adminDisableSet,
    adminDeleteSet,
    adminBulkDeleteSets,
} from '../../services/jlptPracticeService';
import { useToast } from '../../contexts/ToastContext';
import DropdownSelect from '../ui/DropdownSelect';
import AdminJlptSetDetail from './AdminJlptSetDetail';
import { useNavigate } from 'react-router-dom';

// ─── Constants ────────────────────────────────────────────────────────────────

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
const CATEGORIES = ['VOCABULARY', 'KANJI', 'GRAMMAR', 'READING'];

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract the most useful error message from an AxiosError. */
const extractError = (err) => {
    const data = err?.response?.data;
    const msg = data?.message;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string') return msg;
    return 'Có lỗi xảy ra. Vui lòng thử lại.';
};

/** Lock body scroll while a modal is open. */
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

// ─── EMPTY FORM ───────────────────────────────────────────────────────────────

const EMPTY_FORM = { level: '', category: '', title: '', setNumber: '', description: '', isActive: true };

// ─── Confirm Disable Modal ────────────────────────────────────────────────────

const DisableConfirmModal = ({ set, onConfirm, onCancel, loading, show }) => {
    useBodyScrollLock(show);
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-5">
            <div
                className={`absolute inset-0 bg-black/70 transition-opacity duration-${MODAL_DURATION} ${show ? 'opacity-100' : 'opacity-0'}`}
            />
            <div
                className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl p-6 transform transition-all duration-${MODAL_DURATION} ${show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
            >
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <AlertTriangle size={32} className="text-amber-600" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">Vô hiệu hóa bộ đề?</h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                            Bộ đề{' '}
                            <span className="font-semibold text-slate-700 dark:text-slate-200">"{set?.title}"</span> sẽ
                            bị ẩn khỏi học viên.
                        </p>
                        <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                            Lưu ý: Chỉ vô hiệu hóa bộ đề, các câu hỏi bên trong vẫn giữ nguyên trạng thái.
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

// ─── Confirm Delete Single Modal ──────────────────────────────────────────────

const DeleteConfirmModal = ({ set, onConfirm, onCancel, loading, show }) => {
    useBodyScrollLock(show);
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-5">
            <div
                className={`absolute inset-0 bg-black/70 transition-opacity duration-${MODAL_DURATION} ${show ? 'opacity-100' : 'opacity-0'}`}
            />
            <div
                className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl p-6 transform transition-all duration-${MODAL_DURATION} ${show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
            >
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <Trash2 size={32} className="text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">Xóa vĩnh viễn bộ đề?</h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                            Bộ đề{' '}
                            <span className="font-semibold text-slate-700 dark:text-slate-200">"{set?.title}"</span> sẽ
                            bị xóa hoàn toàn khỏi hệ thống.
                        </p>
                        <div className="mt-3 p-3 text-sm rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/30 text-left">
                            <p className=" text-red-700 dark:text-red-300 font-semibold mb-1">
                                Cảnh báo an toàn dữ liệu:
                            </p>
                            <p className="text-red-600 dark:text-red-400 leading-normal">
                                Hành động này không thể hoàn tác. Nếu bộ đề còn câu hỏi đang hoạt động liên kết, hệ
                                thống sẽ từ chối xóa để bảo toàn dữ liệu.
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

// ─── Confirm Bulk Delete Modal ───────────────────────────────────────────────

const BulkDeleteConfirmModal = ({ count, onConfirm, onCancel, loading, show }) => {
    useBodyScrollLock(show);
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-5">
            <div
                className={`absolute inset-0 bg-black/70 transition-opacity duration-${MODAL_DURATION} ${show ? 'opacity-100' : 'opacity-0'}`}
            />
            <div
                className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl p-6 transform transition-all duration-${MODAL_DURATION} ${show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
            >
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <Trash2 size={32} className="text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">
                            Xóa {count} bộ đề đã chọn?
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                            Bạn đang chuẩn bị xóa vĩnh viễn <strong className="text-red-600">{count}</strong> bộ đề khỏi
                            hệ thống.
                        </p>
                        <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/30 text-left">
                            <p className="text-xs text-red-700 dark:text-red-300 font-semibold mb-1">
                                Quy tắc an toàn:
                            </p>
                            <p className="text-xs text-red-600 dark:text-red-400 leading-normal">
                                Hệ thống chỉ xóa những bộ đề không có câu hỏi đang hoạt động. Các bộ đề còn câu hỏi
                                active sẽ được giữ nguyên và báo cáo lại chi tiết.
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

// ─── Set Form Modal ───────────────────────────────────────────────────────────

const SetFormModal = ({ editSet, onClose, onSaved, show }) => {
    useBodyScrollLock(show);

    const isEdit = !!editSet;
    const { addToast } = useToast();
    const titleRef = useRef(null);

    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    // Populate form when modal opens
    useEffect(() => {
        if (show) {
            if (editSet) {
                setForm({
                    level: editSet.level ?? '',
                    category: editSet.category ?? '',
                    title: editSet.title ?? '',
                    setNumber: String(editSet.setNumber ?? ''),
                    description: editSet.description ?? '',
                    isActive: editSet.isActive ?? true,
                });
            } else {
                setForm(EMPTY_FORM);
            }
            setErrors({});
            // Auto-focus title after transition
            const t = setTimeout(() => titleRef.current?.focus(), 60);
            return () => clearTimeout(t);
        }
    }, [show, editSet]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const next = {};
        if (!form.level) next.level = 'Vui lòng chọn cấp độ JLPT.';
        if (!form.category) next.category = 'Vui lòng chọn loại bộ đề.';
        if (!form.title.trim()) next.title = 'Vui lòng nhập tiêu đề bộ đề.';
        const num = parseInt(form.setNumber, 10);
        if (!form.setNumber.trim() || isNaN(num) || num < 1) next.setNumber = 'Số thứ tự phải là số nguyên ≥ 1.';
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
                title: form.title.trim(),
                setNumber: parseInt(form.setNumber, 10),
                description: form.description.trim(),
                isActive: form.isActive,
            };

            if (isEdit) {
                // For edit: only send changed fields (PATCH semantics)
                // level and category are immutable — omit them
                await adminUpdateSet(editSet.id, {
                    title: payload.title,
                    setNumber: payload.setNumber,
                    description: payload.description,
                    isActive: payload.isActive,
                });
                addToast('Đã cập nhật bộ đề thành công!', 'success');
            } else {
                await adminCreateSet(payload);
                addToast('Đã tạo bộ đề mới thành công!', 'success');
            }
            onSaved();
        } catch (err) {
            const status = err?.response?.status;
            if (status === 409) {
                // Unique constraint: level + category + setNumber
                setErrors((prev) => ({
                    ...prev,
                    setNumber: `Bộ đề ${form.level} ${CATEGORY_LABELS[form.category] || form.category} số ${form.setNumber} đã tồn tại.`,
                }));
            } else {
                addToast(extractError(err), 'error');
            }
        } finally {
            setSaving(false);
        }
    };

    // Base input class
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
                className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto transform transition-all duration-${MODAL_DURATION} ${show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <ClipboardCheck size={18} className="text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                            {isEdit ? 'Chỉnh sửa bộ đề' : 'Tạo bộ đề mới'}
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
                    {/* Level + Category (immutable when editing) */}
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
                                            setForm((f) => ({ ...f, level: v }));
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
                                Loại bộ đề <span className="text-red-500">*</span>
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
                                            setForm((f) => ({ ...f, category: v }));
                                            if (errors.category) setErrors((p) => ({ ...p, category: '' }));
                                        }}
                                        options={CATEGORIES.map((c) => ({
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

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Tiêu đề <span className="text-red-500">*</span>
                        </label>
                        <input
                            ref={titleRef}
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            className={inputCls('title')}
                            placeholder="VD: N5 Từ vựng - Đề số 1"
                            maxLength={200}
                        />
                        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                    </div>

                    {/* Set Number */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Số thứ tự (setNumber) <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="setNumber"
                            type="number"
                            min={1}
                            value={form.setNumber}
                            onChange={handleChange}
                            className={inputCls('setNumber')}
                            placeholder="1"
                        />
                        {errors.setNumber ? (
                            <p className="text-xs text-red-500 mt-1">{errors.setNumber}</p>
                        ) : (
                            <p className="text-xs text-slate-400 mt-1">
                                Số thứ tự phải duy nhất trong cùng cấp độ + loại bộ đề.
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Mô tả <span className="text-xs font-normal text-slate-400">(không bắt buộc)</span>
                        </label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400 resize-none transition duration-200"
                            placeholder="Mô tả ngắn về bộ đề (tùy chọn)..."
                            maxLength={500}
                        />
                    </div>

                    {/* isActive toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-all duration-200">
                        <div>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Kích hoạt bộ đề</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Bộ đề chỉ hiển thị với học viên khi được kích hoạt.
                            </p>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={form.isActive}
                            onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                                form.isActive ? 'bg-emerald-500 dark:bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'
                            }`}
                            aria-label={form.isActive ? 'Đang kích hoạt' : 'Đang vô hiệu hóa'}
                        >
                            <span
                                className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ease-in-out ${
                                    form.isActive ? 'translate-x-5' : 'translate-x-0.5'
                                }`}
                            />
                        </button>
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
                                'Tạo bộ đề'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
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
        {[1, 2, 3, 4, 5, 6].map((i) => (
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

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminJlptSets = ({ setId }) => {
    const { addToast } = useToast();
    const addToastRef = useRef(addToast);
    useEffect(() => {
        addToastRef.current = addToast;
    }, [addToast]);
    const navigate = useNavigate();

    // List state
    const [sets, setSets] = useState([]);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    // Filters
    const [levelFilter, setLevelFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Modal state: form (create/edit)
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
    }, [levelFilter, categoryFilter, statusFilter]);
    useEffect(() => {
        setSelectedIds([]);
    }, [page, debouncedSearch]);

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const fetchSets = useCallback(
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
                };
                const data = await adminGetSets(params);
                // Backend returns { items, meta }
                setSets(data?.items ?? []);
                setMeta(data?.meta ?? null);
            } catch (err) {
                const msg = extractError(err);
                setFetchError(msg);
                addToastRef.current(msg, 'error');
            } finally {
                setLoading(false);
            }
        },
        [levelFilter, categoryFilter, statusFilter, debouncedSearch],
    );

    useEffect(() => {
        fetchSets(page);
    }, [page, fetchSets]);

    // ── Modal helpers ─────────────────────────────────────────────────────────

    const openForm = (set = null) => {
        setEditTarget(set);
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
        fetchSets(editTarget ? page : 1);
        if (!editTarget) setPage(1);
    };

    const openDisable = (set) => {
        setDisableTarget(set);
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
            await adminDisableSet(disableTarget.id);
            addToastRef.current(`Đã vô hiệu hóa bộ đề "${disableTarget.title}".`, 'success');
            closeDisable();
            fetchSets(page);
        } catch (err) {
            addToastRef.current(extractError(err), 'error');
        } finally {
            setDisabling(false);
        }
    };

    // ── Single delete handlers ────────────────────────────────────────────────
    const openDelete = (set) => {
        setDeleteTarget(set);
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
            await adminDeleteSet(deleteTarget.id);
            addToastRef.current(`Đã xóa vĩnh viễn bộ đề "${deleteTarget.title}".`, 'success');
            closeDelete();
            setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget.id));
            fetchSets(page);
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
        if (selectedIds.length === sets.length && sets.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(sets.map((s) => s.id));
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
            const res = await adminBulkDeleteSets(selectedIds);
            if (res.deleted > 0) {
                addToastRef.current(`Đã xóa thành công ${res.deleted} bộ đề.`, 'success');
            }
            if (res.failed > 0) {
                const failReasons = res.failures?.map((f) => `${f.title || f.id}: ${f.reason}`).join('; ');
                addToastRef.current(`${res.failed} bộ đề không thể xóa: ${failReasons}`, 'warning');
            }
            closeBulkDelete();
            setSelectedIds([]);
            fetchSets(page);
        } catch (err) {
            addToastRef.current(extractError(err), 'error');
        } finally {
            setBulkDeleting(false);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    const total = meta?.total ?? sets.length;

    // If setId is present, render the detail page (after all hooks)
    if (setId) {
        return <AdminJlptSetDetail setId={setId} onBack={() => navigate('/admin/dashboard/bo-de')} />;
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Quản lý Bộ đề Luyện tập</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Tạo, chỉnh sửa và quản lý các bộ đề JLPT theo cấp độ và thể loại.
                    </p>
                </div>
                <button
                    onClick={() => openForm()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-red-200 dark:shadow-none transition-colors cursor-pointer whitespace-nowrap"
                >
                    <Plus size={16} />
                    Tạo bộ đề
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
                        placeholder="Tìm theo tiêu đề..."
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

                {/* Category filter */}
                <DropdownSelect
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    options={[
                        { label: 'Tất cả loại', value: '' },
                        ...CATEGORIES.map((c) => ({ label: CATEGORY_LABELS[c], value: c })),
                    ]}
                    placeholder="Loại"
                    containerClassName="min-w-[140px]"
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
                    onClick={() => fetchSets(page)}
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
                            {sets.length} bộ đề trên trang này
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
                                        checked={sets.length > 0 && selectedIds.length === sets.length}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                        aria-label="Chọn tất cả bộ đề trên trang này"
                                    />
                                </th>
                                {['#', 'Tiêu đề', 'Cấp độ', 'Loại', 'Câu hỏi', 'Trạng thái'].map((h) => (
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
                                                onClick={() => fetchSets(page)}
                                                className="text-sm text-red-600 underline cursor-pointer hover:no-underline"
                                            >
                                                Thử lại
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : sets.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <ClipboardCheck
                                                    size={28}
                                                    className="text-slate-300 dark:text-slate-600"
                                                />
                                            </div>
                                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                                Chưa có bộ đề nào.
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                Thử thay đổi bộ lọc hoặc{' '}
                                                <button
                                                    onClick={() => openForm()}
                                                    className="text-red-600 underline cursor-pointer hover:no-underline"
                                                >
                                                    tạo bộ đề mới
                                                </button>
                                                .
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                sets.map((set) => (
                                    <tr
                                        key={set.id}
                                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer ${selectedIds.includes(set.id) ? 'bg-red-50/40 dark:bg-red-950/20' : ''}`}
                                        onClick={() => navigate(`/admin/dashboard/bo-de/${set.id}`)}
                                    >
                                        {/* Selection Checkbox */}
                                        <td className="px-4 py-3.5 w-10" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(set.id)}
                                                onChange={() => handleToggleSelect(set.id)}
                                                className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                                aria-label={`Chọn bộ đề ${set.title}`}
                                            />
                                        </td>

                                        {/* Set number */}
                                        <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 font-mono text-xs">
                                            #{set.setNumber}
                                        </td>

                                        {/* Title + description */}
                                        <td className="px-4 py-3.5 max-w-[260px]">
                                            <p className="font-semibold text-slate-800 dark:text-white truncate">
                                                {set.title}
                                            </p>
                                            {set.description && (
                                                <p className="text-xs text-slate-400 truncate mt-0.5">
                                                    {set.description}
                                                </p>
                                            )}
                                        </td>

                                        {/* Level */}
                                        <td className="px-4 py-3.5">
                                            <span
                                                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${LEVEL_COLORS[set.level] ?? 'bg-slate-100 text-slate-500'}`}
                                            >
                                                {set.level}
                                            </span>
                                        </td>

                                        {/* Category */}
                                        <td className="px-4 py-3.5">
                                            <span
                                                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${CATEGORY_COLORS[set.category] ?? 'bg-slate-100 text-slate-500'}`}
                                            >
                                                {CATEGORY_LABELS[set.category] ?? set.category}
                                            </span>
                                        </td>

                                        {/* Question count */}
                                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 tabular-nums">
                                            {set.questionCount ?? 0}
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3.5">
                                            <StatusBadge isActive={set.isActive} />
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openForm(set);
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                {set.isActive && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openDisable(set);
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors cursor-pointer"
                                                        title="Vô hiệu hóa"
                                                    >
                                                        <EyeOff size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openDelete(set);
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                                                    title="Xóa vĩnh viễn"
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

                {/* Footer: count + pagination */}
                {!loading && !fetchError && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3.5 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Hiển thị{' '}
                            <span className="font-semibold text-slate-700 dark:text-white">
                                {sets.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
                            </span>
                            {' – '}
                            <span className="font-semibold text-slate-700 dark:text-white">
                                {(page - 1) * PAGE_SIZE + sets.length}
                            </span>
                            {' trong '}
                            <span className="font-semibold text-slate-700 dark:text-white">{total}</span>
                            {' bộ đề'}
                        </p>
                        <Pagination page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />
                    </div>
                )}
            </div>

            {/* Set Form Modal */}
            {formOpen && (
                <SetFormModal editSet={editTarget} onClose={closeForm} onSaved={handleFormSaved} show={formVisible} />
            )}

            {/* Disable Confirm Modal */}
            {disableOpen && (
                <DisableConfirmModal
                    set={disableTarget}
                    onConfirm={handleDisableConfirm}
                    onCancel={closeDisable}
                    loading={disabling}
                    show={disableVisible}
                />
            )}

            {/* Single Delete Confirm Modal */}
            {deleteOpen && (
                <DeleteConfirmModal
                    set={deleteTarget}
                    onConfirm={handleDeleteConfirm}
                    onCancel={closeDelete}
                    loading={deleting}
                    show={deleteVisible}
                />
            )}

            {/* Bulk Delete Confirm Modal */}
            {bulkDeleteOpen && (
                <BulkDeleteConfirmModal
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

export default AdminJlptSets;
