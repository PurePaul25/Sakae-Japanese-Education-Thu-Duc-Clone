import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiX, FiCalendar, FiClock, FiUsers, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ScrollToTopButton from '../components/layout/ScrollToTopButton';
import RegistrationModal from '../components/ui/RegistrationModal';
import SEO from '../hooks/useSEO';
import api from '../utils/api';

// ─── Design tokens (shared với Courses.jsx) ───────────────────────────────────
const LEVELS = ['Tất cả', 'N5', 'N4', 'N3', 'N2', 'N1', 'Thiếu nhi', 'Kèm 1:1', 'Kaiwa & Luyện thi'];
const TYPES = ['Tất cả', 'Cấp tốc', 'Siêu tốc', 'Online'];

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

const TYPE_COLORS = {
    'Cấp tốc': 'bg-amber-100 text-amber-700',
    'Siêu tốc': 'bg-rose-100 text-rose-700',
    Online: 'bg-cyan-100 text-cyan-700',
};

function fmt(n) {
    if (!n && n !== 0) return null;
    return Number(n).toLocaleString('vi-VN') + ' đ';
}

// ─── Spinner loading ──────────────────────────────────────────────────────────
const SpinnerLoading = ({ text = 'Đang tải danh sách lớp học...' }) => (
    <div className="col-span-full flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-xl shadow-md">
        <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-500">{text}</p>
    </div>
);

// ─── Course card (giữ nguyên style Classes cũ) ────────────────────────────────
const CourseCard = ({ course, onRegister }) => {
    const next = course.nextSchedule;

    return (
        <div className="bg-white border border-red-500 rounded-xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden flex flex-col transform hover:-translate-y-1.5">
            {/* Ảnh */}
            <div className="h-60 w-full overflow-hidden relative group bg-gradient-to-br from-red-50 to-rose-100">
                {course.thumbnail ? (
                    <Link to={`/khoa-hoc-tieng-nhat/${course.slug}`}>
                        <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                        />
                    </Link>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-7xl opacity-20">🎌</span>
                    </div>
                )}
                {/* Badge level + type */}
                <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm ${LEVEL_COLORS[course.level] ?? 'bg-gray-100 text-gray-600'}`}
                    >
                        {course.level}
                    </span>
                    <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm ${TYPE_COLORS[course.type] ?? 'bg-gray-100 text-gray-600'}`}
                    >
                        {course.type}
                    </span>
                </div>
            </div>

            {/* Nội dung */}
            <div className="p-4 flex-grow flex flex-col">
                <Link to={`/khoa-hoc-tieng-nhat/${course.slug}`}>
                    <h3 className="text-xl font-bold text-red-500 mb-1 hover:text-red-700 hover:underline transition-colors duration-300 line-clamp-2">
                        {course.title}
                    </h3>
                </Link>

                {course.description && (
                    <p className="text-gray-600 mb-2 text-sm flex-grow line-clamp-3">{course.description}</p>
                )}

                {/* Thông tin lịch */}
                <div className="space-y-1.5 text-sm text-gray-500 font-medium mb-4">
                    {course.tuition && (
                        <div className="flex items-center gap-1.5">
                            <span className="text-red-500 font-black text-xl">{fmt(course.tuition)}</span>
                        </div>
                    )}
                    {course.duration && (
                        <div className="flex items-center gap-1.5">
                            <FiClock size={13} className="text-red-400 flex-shrink-0" />
                            <span>
                                Thời lượng: <strong>{course.duration}</strong>
                            </span>
                        </div>
                    )}
                    {next ? (
                        <>
                            <div className="flex items-center gap-1.5">
                                <FiCalendar size={13} className="text-red-400 flex-shrink-0" />
                                <span>
                                    Khai giảng:{' '}
                                    <strong className="text-gray-700">
                                        {new Date(next.startDate).toLocaleDateString('vi-VN')}
                                    </strong>
                                </span>
                            </div>
                            {next.time && (
                                <div className="flex items-center gap-1.5">
                                    <FiClock size={13} className="text-red-400 flex-shrink-0" />
                                    <span>
                                        {next.time} • {next.studyDays}
                                    </span>
                                </div>
                            )}
                            {next.maxStudents && (
                                <div className="flex items-center gap-1.5">
                                    <FiUsers size={13} className="text-red-400 flex-shrink-0" />
                                    <span>{next.maxStudents} học viên</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center gap-1.5 text-gray-400 italic">
                            <FiCalendar size={13} className="flex-shrink-0" />
                            <span>Chưa có lịch khai giảng</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                    <Link
                        to={`/khoa-hoc-tieng-nhat/${course.slug}`}
                        className="flex-1 text-red-600 border border-red-300 text-sm py-2 rounded transition hover:bg-red-50 duration-300 cursor-pointer font-semibold text-center flex items-center justify-center"
                    >
                        Xem thêm
                    </Link>
                    <button
                        onClick={() => onRegister(course, 'register')}
                        className="flex-1 bg-red-600 text-white text-sm py-2 rounded hover:bg-red-700 transition duration-300 cursor-pointer font-semibold"
                    >
                        Đăng ký
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Filter button ─────────────────────────────────────────────────────────────
const FilterButton = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 uppercase rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer ${
            active ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-red-100 hover:text-red-700'
        }`}
    >
        {label}
    </button>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const Classes = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // filters
    const [levelFilter, setLevelFilter] = useState('Tất cả');
    const [typeFilter, setTypeFilter] = useState('Tất cả');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(1);
    const limit = 12;

    // modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);

    const fetchCourses = useCallback(async () => {
        try {
            setLoading(true);
            const params = { page, limit, sort: 'newest' };
            if (search) params.q = search;
            if (levelFilter !== 'Tất cả') params.level = levelFilter;
            if (typeFilter !== 'Tất cả') params.type = typeFilter;

            const res = await api.get('/courses', { params });
            const body = res.data?.data ?? res.data ?? {};
            setCourses(body.items ?? []);
            setTotal(body.meta?.total ?? 0);
            setTotalPages(body.meta?.totalPages ?? 1);
        } catch (err) {
            console.error('Lỗi tải khóa học:', err);
        } finally {
            setLoading(false);
        }
    }, [search, levelFilter, typeFilter, page]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);
    useEffect(() => {
        setPage(1);
    }, [search, levelFilter, typeFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(searchInput.trim());
    };
    const clearSearch = () => {
        setSearch('');
        setSearchInput('');
    };

    const handleCardAction = (course, action) => {
        if (action === 'register') {
            setSelectedClass(course);
            setIsModalOpen(true);
        }
        // 'detail' → có thể navigate đến trang chi tiết sau
    };

    return (
        <div className="pt-28 pb-10 bg-gray-100 text-gray-800">
            <SEO page="classes" />

            {/* Header */}
            <section className="text-center mb-6 px-4">
                <h1 className="text-3xl md:text-5xl font-black text-gray-800 tracking-tight mb-3">
                    KHÓA HỌC <span className="text-red-600">TIẾNG NHẬT</span>
                </h1>
                <p className="text-gray-600 max-w-5xl mx-auto sm:text-lg">
                    Trung tâm Sakae cung cấp nhiều khóa học tiếng Nhật phù hợp với từng trình độ, từ cơ bản đến nâng
                    cao, giúp học viên đạt được mục tiêu học tập nhanh nhất.
                </p>
            </section>

            {/* Bộ lọc */}
            <section className="max-w-5xl mx-auto mb-4 px-4 space-y-3">
                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Tìm kiếm khóa học..."
                            className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-red-500 transition-all"
                        />
                        {searchInput && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                <FiX size={14} />
                            </button>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                        Tìm
                    </button>
                </form>

                {/* Filter panel */}
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-200 space-y-3">
                    <div className="md:flex md:items-center md:gap-3">
                        <span className="font-bold text-gray-700 w-24 flex-shrink-0 block mb-2 md:mb-0">Khóa học:</span>
                        <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-red-400 [&::-webkit-scrollbar-thumb]:rounded-full">
                            {LEVELS.map((l) => (
                                <FilterButton
                                    key={l}
                                    label={l}
                                    active={levelFilter === l}
                                    onClick={() => setLevelFilter(l)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="md:flex md:items-center md:gap-3">
                        <span className="font-bold text-gray-700 w-24 flex-shrink-0 block mb-2 md:mb-0">
                            Loại hình:
                        </span>
                        <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-red-400 [&::-webkit-scrollbar-thumb]:rounded-full">
                            {TYPES.map((t) => (
                                <FilterButton
                                    key={t}
                                    label={t}
                                    active={typeFilter === t}
                                    onClick={() => setTypeFilter(t)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Result count */}
            {!loading && (
                <p className="text-center text-gray-500 mb-4">
                    Tìm thấy <span className="text-red-600 font-bold">{total}</span> khóa học
                </p>
            )}

            {/* Grid */}
            <section className="max-w-[1200px] mx-auto px-4 sm:px-6">
                {loading ? (
                    <SpinnerLoading />
                ) : courses.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-md">
                        <p className="md:text-xl text-gray-500">Không tìm thấy khóa học phù hợp.</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 bg-white rounded-xl shadow-md py-4 px-4 md:px-5">
                        {courses.map((c) => (
                            <CourseCard key={c.id} course={c} onRegister={handleCardAction} />
                        ))}
                    </div>
                )}
            </section>

            {/* Pagination */}
            {totalPages > 1 && !loading && (
                <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-30 hover:border-red-300 hover:text-red-600 transition-all cursor-pointer"
                    >
                        <FiChevronLeft size={16} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-10 h-10 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                                page === p
                                    ? 'bg-red-600 text-white shadow-md'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-30 hover:border-red-300 hover:text-red-600 transition-all cursor-pointer"
                    >
                        <FiChevronRight size={16} />
                    </button>
                </div>
            )}

            {/* Registration Modal */}
            <RegistrationModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedClass(null);
                }}
                courseName={selectedClass?.title || ''}
                courseId={selectedClass?.id || ''}
            />

            <ScrollToTopButton />
        </div>
    );
};

export default Classes;
