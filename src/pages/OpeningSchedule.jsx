import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FiCalendar, FiClock, FiUsers, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScrollToTopButton from '../components/layout/ScrollToTopButton';
import RegistrationModal from '../components/ui/RegistrationModal';
import SEO from '../hooks/useSEO';
import api from '../utils/api';

// ─── constants ────────────────────────────────────────────────────────────────
const STATUSES = ['Tất cả', 'Sắp khai giảng', 'Đang nhận học viên', 'Đã đầy', 'Đã kết thúc'];

const STATUS_STYLES = {
    'Sắp khai giảng': 'bg-blue-100 text-blue-700',
    'Đang nhận học viên': 'bg-emerald-100 text-emerald-700',
    'Đã đầy': 'bg-red-100 text-red-700',
    'Đã kết thúc': 'bg-gray-100 text-gray-500',
};

const LEVEL_COLORS = {
    N5: 'bg-emerald-100 text-emerald-700',
    N4: 'bg-blue-100 text-blue-700',
    N3: 'bg-violet-100 text-violet-700',
    N2: 'bg-orange-100 text-orange-700',
    N1: 'bg-red-100 text-red-700',
    'Thiếu nhi': 'bg-pink-100 text-pink-700',
    'Kèm 1:1': 'bg-slate-100 text-slate-700',
    'Kaiwa & Luyện thi': 'bg-yellow-100 text-yellow-700',
};

const STATUS_TEXT_COLORS = {
    'Sắp khai giảng': 'text-blue-700',
    'Đang nhận học viên': 'text-emerald-600',
    'Đã đầy': 'text-red-700',
    'Đã kết thúc': 'text-gray-500',
};

const ITEMS_PER_PAGE = 8;

// ─── spinner loading ─────────────────────────────────────────────────────────
const SpinnerLoading = ({ text = 'Đang tải lịch khai giảng...' }) => (
    <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-500">{text}</p>
    </div>
);

// ─── schedule card ────────────────────────────────────────────────────────────
const ScheduleCard = ({ s, onRegister }) => {
    const course = s.course ?? {};
    const levelColor = LEVEL_COLORS[course.level] ?? 'bg-gray-100 text-gray-600';
    const statusStyle = STATUS_STYLES[s.status] ?? 'bg-gray-100 text-gray-600';
    const statusTextColor = STATUS_TEXT_COLORS[s.status] ?? 'text-gray-600';
    const spotsLeft = s.maxStudents - s.currentStudents;
    const isFull = spotsLeft <= 0;

    return (
        <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-red-100 transition-all duration-300 overflow-hidden">
            <div className="flex gap-0 md:gap-4">
                {/* thumbnail strip */}
                <div className="hidden flex-1 md:block w-24 flex-shrink-0 relative overflow-hidden bg-gradient-to-br from-red-50 to-rose-100">
                    {course.thumbnail ? (
                        <Link to={`/khoa-hoc-tieng-nhat/${course.slug}`}>
                            <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-full h-full object-contain max-h-[175px]"
                                loading="lazy"
                            />
                        </Link>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">🎌</div>
                    )}
                </div>

                {/* content */}
                <div className="flex-4 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div className="flex flex-wrap gap-1.5">
                            {course.level && (
                                <span
                                    className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${levelColor}`}
                                >
                                    {course.level}
                                </span>
                            )}
                            {course.type && (
                                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                                    {course.type}
                                </span>
                            )}
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${statusStyle}`}>
                            {s.status}
                        </span>
                    </div>

                    <Link
                        to={`/khoa-hoc-tieng-nhat/${course.slug}`}
                        className="font-extrabold text-gray-800 text-base leading-snug mb-2 group-hover:text-red-600 transition-colors duration-200"
                    >
                        {course.title ?? 'Khóa học'}
                    </Link>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[13px] text-gray-500 font-medium mb-1.5">
                        <span className="flex items-center gap-1.5">
                            <FiCalendar size={13} className="text-red-400 flex-shrink-0" />
                            Khai giảng:{' '}
                            <strong className="text-gray-700">
                                {new Date(s.startDate).toLocaleDateString('vi-VN')}
                            </strong>
                        </span>
                        {s.endDate && (
                            <span className="flex items-center gap-1.5">
                                <FiCalendar size={13} className="text-gray-400 flex-shrink-0" />
                                Kết thúc: {new Date(s.endDate).toLocaleDateString('vi-VN')}
                            </span>
                        )}
                        <span className="flex items-center gap-1.5">
                            <FiClock size={13} className="text-red-400 flex-shrink-0" />
                            {s.time} • {s.studyDays}
                        </span>
                        {s.teacher && (
                            <span className="flex items-center gap-1.5">
                                <GraduationCap size={13} className="text-red-400 flex-shrink-0" />
                                Giáo viên: {s.teacher}
                            </span>
                        )}
                        <span className="flex items-center gap-1.5">
                            {' '}
                            <FiUsers size={13} className="text-red-400 flex-shrink-0" />{' '}
                            <span className={`font-bold ${statusTextColor}`}> {s.maxStudents} học viên </span>{' '}
                        </span>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={() => onRegister(s)}
                            disabled={isFull || s.status === 'Đã kết thúc'}
                            className={`px-4 py-2 text-[13px] font-bold rounded-xl transition-all cursor-pointer ${
                                isFull || s.status === 'Đã kết thúc'
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-100'
                            }`}
                        >
                            {s.status === 'Đã kết thúc' ? 'Đã kết thúc' : isFull ? 'Đã đầy' : 'Đăng ký tư vấn'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── main page ────────────────────────────────────────────────────────────────
const OpeningSchedule = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);

    // filters
    const [filterStatus, setFilterStatus] = useState('Tất cả');
    const [filterLevel, setFilterLevel] = useState('Tất cả');
    const [filterMonth, setFilterMonth] = useState('Tất cả');
    const [page, setPage] = useState(1);
    const topRef = useRef(null);

    useEffect(() => {
        api.get('/courses/schedules')
            .then((res) => {
                const data = res.data?.data ?? res.data ?? [];
                setSchedules(data);
            })
            .catch((err) => console.error('Lỗi tải lịch khai giảng:', err))
            .finally(() => setLoading(false));
    }, []);

    // Derived filter options from loaded data
    const levels = useMemo(
        () => ['Tất cả', ...new Set(schedules.map((s) => s.course?.level).filter(Boolean))],
        [schedules],
    );
    const months = useMemo(() => {
        const ms = [
            ...new Set(
                schedules
                    .map((s) => {
                        const d = new Date(s.startDate);
                        return isNaN(d) ? null : `${d.getMonth() + 1}/${d.getFullYear()}`;
                    })
                    .filter(Boolean),
            ),
        ].sort();
        return ['Tất cả', ...ms];
    }, [schedules]);

    const filtered = useMemo(() => {
        return schedules.filter((s) => {
            const statusOk = filterStatus === 'Tất cả' || s.status === filterStatus;
            const levelOk = filterLevel === 'Tất cả' || s.course?.level === filterLevel;
            const d = new Date(s.startDate);
            const monthStr = isNaN(d) ? '' : `${d.getMonth() + 1}/${d.getFullYear()}`;
            const monthOk = filterMonth === 'Tất cả' || monthStr === filterMonth;
            return statusOk && levelOk && monthOk;
        });
    }, [schedules, filterStatus, filterLevel, filterMonth]);

    // reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [filterStatus, filterLevel, filterMonth]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const handlePageChange = (p) => {
        setPage(p);
        topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const [modalOpen, setModalOpen] = useState(false);
    const [modalCourse, setModalCourse] = useState({ id: '', title: '' });

    const handleRegister = (schedule) => {
        setModalCourse({
            id: schedule.course?.id ?? '',
            title: schedule.course?.title ?? 'Khóa học',
        });
        setModalOpen(true);
    };

    return (
        <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
            <SEO
                customTitle="Lịch Khai Giảng - Trung tâm Nhật Ngữ Sakae Thủ Đức"
                customDescription="Toàn bộ lịch khai giảng các khóa học tiếng Nhật tại Trung tâm Sakae Thủ Đức — N5, N4, N3, N2, N1, Kaiwa, Business."
            />

            <div className="max-w-6xl mx-auto px-4 sm:px-6" ref={topRef}>
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-800 tracking-tight mb-3">
                        LỊCH <span className="text-red-600">KHAI GIẢNG</span>
                    </h1>
                    <p className="text-gray-500 max-w-xl mx-auto md:text-base">
                        Cập nhật lịch khai giảng mới nhất của tất cả các khóa học tại Sakae.
                    </p>
                </div>

                {/* Stats bar */}
                {!loading && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                        {[
                            { label: 'Tổng lịch', value: schedules.length, color: 'text-gray-700' },
                            {
                                label: 'Sắp khai giảng',
                                value: schedules.filter((s) => s.status === 'Sắp khai giảng').length,
                                color: 'text-blue-600',
                            },
                            {
                                label: 'Đang nhận',
                                value: schedules.filter((s) => s.status === 'Đang nhận học viên').length,
                                color: 'text-emerald-600',
                            },
                            {
                                label: 'Đã đầy',
                                value: schedules.filter((s) => s.status === 'Đã đầy').length,
                                color: 'text-red-600',
                            },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center"
                            >
                                <div className={`text-2xl font-black ${item.color}`}>{item.value}</div>
                                <div className="text-xs text-gray-400 font-medium mt-0.5">{item.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                        <FiFilter size={14} />
                        Bộ lọc
                    </div>

                    {/* Trạng thái */}
                    <div className="md:flex md:items-center md:gap-1">
                        <span className="font-bold text-gray-700 w-24 shrink-0 block mb-2 md:mb-0">Trạng thái:</span>

                        <div className="flex-1 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-red-400 [&::-webkit-scrollbar-thumb]:rounded-full">
                            <div className="flex w-max gap-2">
                                {STATUSES.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setFilterStatus(s)}
                                        className={`shrink-0 px-3 py-1.5 rounded-full text-[13px] uppercase font-bold transition-all cursor-pointer ${
                                            filterStatus === s
                                                ? 'bg-red-600 text-white shadow-sm'
                                                : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Cấp độ */}
                    <div className="md:flex md:items-center md:gap-1">
                        <span className="font-bold text-gray-700 w-24 shrink-0 block mb-2 md:mb-0">Cấp độ:</span>

                        <div className="flex-1 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-red-400 [&::-webkit-scrollbar-thumb]:rounded-full">
                            <div className="flex w-max gap-2">
                                {levels.map((l) => (
                                    <button
                                        key={l}
                                        onClick={() => setFilterLevel(l)}
                                        className={`shrink-0 px-3 py-1.5 rounded-full text-[13px] uppercase font-bold transition-all cursor-pointer ${
                                            filterLevel === l
                                                ? 'bg-red-600 text-white shadow-sm'
                                                : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                                        }`}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Thời gian */}
                    <div className="md:flex md:items-center md:gap-1">
                        <span className="font-bold text-gray-700 w-24 shrink-0 block mb-2 md:mb-0">Thời gian:</span>

                        <div className="flex-1 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-red-400 [&::-webkit-scrollbar-thumb]:rounded-full">
                            <div className="flex w-max gap-2">
                                {months.map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setFilterMonth(m)}
                                        className={`shrink-0 px-3 py-1.5 rounded-full text-[13px] uppercase font-bold transition-all cursor-pointer ${
                                            filterMonth === m
                                                ? 'bg-red-600 text-white shadow-sm'
                                                : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                                        }`}
                                    >
                                        {m === 'Tất cả' ? 'Tất cả tháng' : `T.${m}`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Result info */}
                {!loading && (
                    <p className="text-sm text-gray-400 font-medium mb-4 text-center">
                        Hiển thị <span className="text-red-600 font-bold">{filtered.length}</span> lịch khai giảng
                    </p>
                )}

                {/* List */}
                <div className="space-y-3">
                    {loading ? (
                        <SpinnerLoading />
                    ) : paged.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <span className="text-4xl block mb-3">📅</span>
                            <h3 className="text-lg font-black text-gray-700 mb-1">Không có lịch khai giảng</h3>
                            <p className="text-sm text-gray-400">Thử thay đổi bộ lọc để xem thêm.</p>
                        </div>
                    ) : (
                        paged.map((s) => <ScheduleCard key={s.id} s={s} onRegister={handleRegister} />)
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && !loading && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                        <button
                            onClick={() => handlePageChange(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-30 hover:border-red-300 hover:text-red-600 transition-all cursor-pointer"
                        >
                            <FiChevronLeft size={16} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => handlePageChange(p)}
                                className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all cursor-pointer ${page === p ? 'bg-red-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600'}`}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-30 hover:border-red-300 hover:text-red-600 transition-all cursor-pointer"
                        >
                            <FiChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>

            <ScrollToTopButton />

            <RegistrationModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                courseName={modalCourse.title}
                courseId={modalCourse.id}
            />
        </div>
    );
};

export default OpeningSchedule;
