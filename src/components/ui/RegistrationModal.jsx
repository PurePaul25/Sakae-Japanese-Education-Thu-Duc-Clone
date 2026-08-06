import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';
import { IoIosCall } from "react-icons/io";
import api from '../../utils/api';
import DropdownSelect from './DropdownSelect';

// ─── helpers ──────────────────────────────────────────────────────────────────
const PHONE_RE = /^[0-9]{10,11}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form) {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Vui lòng nhập họ tên';
    if (!form.email.trim()) e.email = 'Vui lòng nhập email';
    else if (!EMAIL_RE.test(form.email)) e.email = 'Email không đúng định dạng';
    if (!form.phone.trim()) e.phone = 'Vui lòng nhập số điện thoại';
    else if (!PHONE_RE.test(form.phone.replace(/\s+/g, ''))) e.phone = 'Số điện thoại phải có 10–11 chữ số';
    return e;
}

const EMPTY = { fullName: '', email: '', phone: '', zalo: '', note: '' };

// ─── RegistrationModal ────────────────────────────────────────────────────────
const RegistrationModal = ({
    isOpen,
    onClose,
    courseName = '',
    courseId = '',
    preSelectedScheduleId = '',
}) => {
    const [form, setForm]           = useState(EMPTY);
    const [errors, setErrors]       = useState({});
    const [scheduleId, setScheduleId] = useState('');
    const [schedules, setSchedules] = useState([]);
    const [loadingSchedules, setLoadingSchedules] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [apiError, setApiError]   = useState('');
    const [show, setShow]           = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    // Fetch schedules when courseId is available
    useEffect(() => {
        if (!courseId || !isOpen) return;
        setLoadingSchedules(true);
        api.get(`/courses/${courseId}/schedules`)
            .then((res) => {
                const data = res.data?.data ?? res.data ?? [];
                // Only show upcoming / open schedules
                const open = data.filter(
                    (s) => s.status !== 'Đã kết thúc' && s.status !== 'Đã đầy',
                );
                setSchedules(open);
                // Pre-select schedule if provided via prop
                if (preSelectedScheduleId && open.some((s) => s.id === preSelectedScheduleId)) {
                    setScheduleId(preSelectedScheduleId);
                }
            })
            .catch(() => setSchedules([]))
            .finally(() => setLoadingSchedules(false));
    }, [courseId, isOpen, preSelectedScheduleId]);

    // Animation
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            const t = setTimeout(() => setShow(true), 10);
            return () => clearTimeout(t);
        } else {
            setShow(false);
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
        if (apiError) setApiError('');
    };

    const reset = () => {
        setForm(EMPTY);
        setErrors({});
        setScheduleId('');
        setSchedules([]);
        setSubmitting(false);
        setSubmitted(false);
        setApiError('');
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            reset();
            setIsClosing(false);
            onClose();
        }, 400);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate(form);
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        try {
            setSubmitting(true);
            setApiError('');
            await api.post('/course-registrations', {
                courseId,
                scheduleId: scheduleId || undefined,
                fullName: form.fullName.trim(),
                email: form.email.trim().toLowerCase(),
                phone: form.phone.replace(/\s+/g, ''),
                zalo: form.zalo.trim() || undefined,
                note: form.note.trim() || undefined,
            });
            setSubmitted(true);
            setTimeout(() => handleClose(), 3200);
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                (Array.isArray(err?.response?.data?.message)
                    ? err.response.data.message.join(', ')
                    : null) ||
                'Có lỗi xảy ra, vui lòng thử lại!';
            setApiError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen && !isClosing) return null;

    const visible = show && !isClosing;

    return (
        <div
            className={`fixed inset-0 z-[60] flex items-center justify-center transition-opacity duration-400 ${
                visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
        >
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-400 ${visible ? 'opacity-100' : 'opacity-0'}`}
                onClick={handleClose}
            />

            {/* Modal */}
            <div
                className={`relative z-[70] bg-white rounded-2xl shadow-2xl max-w-md md:max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-6'
                }`}
            >
                {/* Header */}
                <div className="flex-shrink-0 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white px-5 py-4 flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-black">🎓 Đăng ký tư vấn</h2>
                        {courseName && (
                            <p className="text-red-100 text-sm mt-1 line-clamp-2 font-medium">{courseName}</p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-white hover:bg-red-700/50 p-1.5 rounded-full transition-all cursor-pointer ml-3 flex-shrink-0"
                    >
                        <FaTimes size={18} />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto">
                    {submitted ? (
                        /* Success state */
                        <div className="flex flex-col items-center justify-center gap-4 p-10 text-center bg-gradient-to-br from-green-50 to-emerald-50 min-h-[280px]">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-bounce shadow-md">
                                <FaCheckCircle className="text-green-600" size={36} />
                            </div>
                            <h3 className="text-xl font-black text-gray-800">Đăng ký thành công! 🎉</h3>
                            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                                Cảm ơn bạn đã quan tâm đến Sakae. Chúng tôi sẽ liên hệ bạn trong vòng
                                <strong> 24 giờ</strong> làm việc. Vui lòng kiểm tra email để xem xác nhận.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} noValidate className="p-3.5 md:p-5 space-y-4">
                            {/* API Error */}
                            {apiError && (
                                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-3 py-2.5">
                                    <FaExclamationCircle size={15} className="flex-shrink-0 mt-0.5" />
                                    <span>{apiError}</span>
                                </div>
                            )}

                            {/* Full Name */}
                            <Field label="Họ và tên" required error={errors.fullName}>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={form.fullName}
                                    onChange={handleChange}
                                    placeholder="Nguyễn Văn A"
                                    autoComplete="name"
                                    className={inputCls(errors.fullName)}
                                />
                            </Field>

                            {/* Email */}
                            <Field label="Email" required error={errors.email}>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="your@email.com"
                                    autoComplete="email"
                                    className={inputCls(errors.email)}
                                />
                            </Field>

                            {/* Phone + Zalo side by side */}
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Điện thoại" required error={errors.phone}>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="0901234567"
                                        autoComplete="tel"
                                        className={inputCls(errors.phone)}
                                    />
                                </Field>
                                <Field label="Zalo (tùy chọn)">
                                    <input
                                        type="text"
                                        name="zalo"
                                        value={form.zalo}
                                        onChange={handleChange}
                                        placeholder="Số Zalo"
                                        className={inputCls()}
                                    />
                                </Field>
                            </div>

                            {/* Schedule picker */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Lịch khai giảng{' '}
                                    <span className="text-gray-400 font-normal">(tùy chọn)</span>
                                </label>
                                {loadingSchedules ? (
                                    <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                                        <FiLoader size={14} className="animate-spin" />
                                        Đang tải lịch...
                                    </div>
                                ) : schedules.length > 0 ? (
                                    <DropdownSelect
                                        name="scheduleId"
                                        value={scheduleId}
                                        onChange={(value) => setScheduleId(value)}
                                        options={schedules.map((s) => ({
                                            value: s.id,
                                            label: `${new Date(s.startDate).toLocaleDateString('vi-VN')} • ${s.time} • ${s.studyDays}${s.teacher ? ` • GV: ${s.teacher}` : ''} [${s.status}]`,
                                        }))}
                                        placeholder="Chọn lịch khai giảng"
                                        buttonClassName="text-sm"
                                        containerClassName="w-full"
                                    />
                                ) : courseId ? (
                                    <p className="text-xs text-gray-400 italic py-1">
                                        Hiện chưa có lịch khai giảng cụ thể. Chúng tôi sẽ tư vấn khi liên hệ.
                                    </p>
                                ) : null}
                            </div>

                            {/* Note */}
                            <Field label="Ghi chú (tùy chọn)">
                                <textarea
                                    name="note"
                                    value={form.note}
                                    onChange={handleChange}
                                    placeholder="Bạn có câu hỏi hoặc yêu cầu đặc biệt?"
                                    rows={3}
                                    className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:outline-none resize-none text-sm transition-colors"
                                />
                            </Field>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={submitting}
                                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all cursor-pointer text-sm disabled:opacity-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold rounded-xl transition-all cursor-pointer text-sm shadow-md shadow-red-100 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {submitting ? (
                                        <>
                                            <FiLoader size={14} className="animate-spin" />
                                            Đang gửi...
                                        </>
                                    ) : (
                                        '✓ Đăng ký tư vấn'
                                    )}
                                </button>
                            </div>

                            <p className="text-[13px] text-gray-400 text-center">
                                <IoIosCall size={20} className="inline-block" /> Chúng tôi sẽ liên hệ bạn trong vòng 24 giờ làm việc
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const Field = ({ label, required, error, children }) => (
    <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {children}
        {error && (
            <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                <FaExclamationCircle size={11} /> {error}
            </p>
        )}
    </div>
);

const inputCls = (error) =>
    `w-full px-3 py-2 rounded-xl border-2 text-sm transition-colors focus:outline-none focus:shadow-sm ${
        error
            ? 'border-red-400 focus:border-red-500 bg-red-50'
            : 'border-gray-200 focus:border-red-500'
    }`;

export default RegistrationModal;
