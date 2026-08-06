import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaUserTie, FaMoneyBillWave, FaBookOpen, FaCheckCircle, FaTag, FaReceipt } from 'react-icons/fa';
import { FiLoader, FiArrowLeft } from 'react-icons/fi';
import { IoIosCall } from "react-icons/io";
import RegistrationModal from '../../components/ui/RegistrationModal';
import SEO from '../../hooks/useSEO.jsx';
import { getCourseBySlug } from '../../services/courseService';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => (n ? Number(n).toLocaleString('vi-VN') + ' đ' : null);

const STATUS_COLORS = {
    'Sắp khai giảng': 'bg-green-100 text-green-700',
    'Đang nhận học viên': 'bg-blue-100 text-blue-700',
    'Đã đầy': 'bg-orange-100 text-orange-700',
    'Đã kết thúc': 'bg-gray-200 text-gray-500',
};

const LEVEL_COLORS = {
    N5: 'bg-emerald-100 text-emerald-700',
    N4: 'bg-blue-100 text-blue-700',
    N3: 'bg-violet-100 text-violet-700',
    N2: 'bg-orange-100 text-orange-700',
    N1: 'bg-red-100 text-red-700',
    Kaiwa: 'bg-pink-100 text-pink-700',
    Business: 'bg-slate-100 text-slate-700',
    Kids: 'bg-yellow-100 text-yellow-700',
};

// Nội dung mặc định khi khóa học không có mô tả chi tiết
const DEFAULT_CURRICULUM = [
    'Học từ vựng và ngữ pháp theo giáo trình Minna no Nihongo.',
    'Luyện giao tiếp phản xạ (Kaiwa) với giáo viên giàu kinh nghiệm.',
    'Thực hành nghe hiểu và đọc hiểu qua các bài tập thực tế.',
    'Kiểm tra định kỳ để đánh giá năng lực và bổ sung kiến thức kịp thời.',
    'Ôn luyện đề thi JLPT từ các kỳ thi trước.',
];

const DEFAULT_BENEFITS = [
    'Lớp học sĩ số nhỏ, đảm bảo tương tác tối đa.',
    'Phòng học máy lạnh, trang thiết bị hiện đại.',
    'Được tham gia các hoạt động ngoại khóa văn hóa Nhật Bản.',
    'Hỗ trợ tư vấn du học và việc làm sau khóa học.',
];

// ─── Schedule Card ────────────────────────────────────────────────────────────
const ScheduleCard = ({ schedule, onRegister }) => {
    const statusCls = STATUS_COLORS[schedule.status] ?? 'bg-gray-100 text-gray-500';
    const isFull = schedule.status === 'Đã đầy' || schedule.status === 'Đã kết thúc';

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-gray-100 rounded-xl border border-gray-200 hover:border-red-200 transition-colors">
            <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[13px] font-bold px-2 py-0.5 rounded-full ${statusCls}`}>
                        {schedule.status}
                    </span>
                    {schedule.title && <span className="text-[13px] text-gray-500">{schedule.title}</span>}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                        <FaCalendarAlt size={12} className="text-red-400" />
                        {new Date(schedule.startDate).toLocaleDateString('vi-VN')}
                        {schedule.endDate && ` – ${new Date(schedule.endDate).toLocaleDateString('vi-VN')}`}
                    </span>
                    <span className="flex items-center gap-1">
                        <FaClock size={12} className="text-red-400" />
                        {schedule.time}
                    </span>
                    <span className="flex items-center gap-1">
                        <FaTag size={12} className="text-red-400" />
                        {schedule.studyDays}
                    </span>
                    {schedule.teacher && (
                        <span className="flex items-center gap-1">
                            <FaUserTie size={12} className="text-red-400" />
                            GV: {schedule.teacher}
                        </span>
                    )}
                </div>
                <p className="text-sm font-bold text-red-600">
                    <FaReceipt size={12} className="inline-block mr-1 mb-2 text-red-400" />
                    <span className="text-xl">{fmt(schedule.tuitionOverride) ?? 'Liên hệ'}</span>
                </p>
            </div>
            <button
                onClick={() => onRegister({ scheduleId: schedule.id })}
                disabled={isFull}
                className="flex-shrink-0 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-sm"
            >
                {isFull ? 'Đã đầy / Kết thúc' : 'Đăng ký lớp này'}
            </button>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const CourseDetailPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [preSelectedScheduleId, setPreSelectedScheduleId] = useState('');

    useEffect(() => {
        if (!slug) return;
        setLoading(true);
        setNotFound(false);

        getCourseBySlug(slug)
            .then((res) => {
                const data = res?.data ?? res;
                if (!data) {
                    setNotFound(true);
                    return;
                }
                setCourse(data);
            })
            .catch((err) => {
                if (err?.response?.status === 404) setNotFound(true);
                else console.error('Lỗi tải khóa học:', err);
            })
            .finally(() => setLoading(false));
    }, [slug]);

    const handleRegisterClick = (opts = {}) => {
        setPreSelectedScheduleId(opts.scheduleId ?? '');
        setIsModalOpen(true);
    };

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-48">
                <div className="w-16 h-16 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Đang tải thông tin khóa học...</p>
            </div>
        );
    }

    // ── Not found ────────────────────────────────────────────────────────────
    if (notFound || !course) {
        return (
            <div className="pt-32 pb-20 text-center min-h-[60vh]">
                <span className="text-5xl block mb-4">😕</span>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Không tìm thấy khóa học</h2>
                <p className="text-gray-500 mb-6">Khóa học này không tồn tại hoặc đã bị gỡ xuống.</p>
                <Link to="/khoa-hoc-tieng-nhat" className="text-red-600 hover:underline font-semibold">
                    ← Xem tất cả khóa học
                </Link>
            </div>
        );
    }

    const openSchedules = (course.schedules ?? []).filter((s) => s.status !== 'Đã kết thúc' && s.status !== 'Đã đầy');
    const allSchedules = course.schedules ?? [];
    const nextSchedule = course.nextSchedule ?? openSchedules[0] ?? null;

    return (
        <div className="pt-24 pb-14 bg-gray-50 min-h-screen">
            <SEO
                customTitle={`${course.title} — Trung tâm Nhật Ngữ Sakae Thủ Đức`}
                customDescription={
                    course.description ||
                    `Khóa học ${course.title} tại Trung tâm Nhật Ngữ Sakae Thủ Đức. Đăng ký tư vấn ngay hôm nay!`
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back button */}
                <button
                    onClick={() => navigate('/khoa-hoc-tieng-nhat')}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 mb-4 transition-colors cursor-pointer"
                >
                    <FiArrowLeft size={16} /> Quay lại danh sách khóa học
                </button>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* ── Cột trái ─────────────────────────────────────────── */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Course header card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {course.thumbnail && (
                                <div className="bg-gray-100 flex items-center justify-center h-[400px] overflow-hidden">
                                    <img
                                        src={course.thumbnail}
                                        alt={course.title}
                                        className="w-full h-full object-contain max-h-[400px]"
                                    />
                                </div>
                            )}
                            <div className="px-3.5 md:px-5 py-4">
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span
                                        className={`text-xs font-black uppercase px-2.5 py-1 rounded-full ${LEVEL_COLORS[course.level] ?? 'bg-gray-100 text-gray-600'}`}
                                    >
                                        {course.level}
                                    </span>
                                    <span className="text-xs font-black uppercase px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                                        {course.type}
                                    </span>
                                </div>
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                                    {course.title}
                                </h1>
                                {course.description && (
                                    <p className="text-gray-700 leading-relaxed">{course.description}</p>
                                )}
                            </div>
                        </div>

                        {/* Lịch khai giảng */}
                        {allSchedules.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-3.5 md:px-5 py-4">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <FaCalendarAlt className="text-red-600" /> Lịch khai giảng
                                </h3>
                                <div className="space-y-3">
                                    {allSchedules.map((s) => (
                                        <ScheduleCard
                                            key={s.id}
                                            schedule={s}
                                            courseId={course.id}
                                            onRegister={handleRegisterClick}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Nội dung khóa học */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-3.5 md:px-5 py-4">
                            {course.content ? (
                                <div
                                    className="prose prose-slate max-w-none dark:prose-invert leading-relaxed
                                        prose-headings:font-bold prose-headings:text-slate-800 dark:prose-headings:text-white
                                        prose-h2:text-xl prose-h3:text-lg
                                        prose-p:my-2 prose-li:my-1
                                        prose-blockquote:border-l-4 prose-blockquote:border-red-400 prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:text-slate-500
                                        prose-a:text-red-600 prose-a:underline"
                                    dangerouslySetInnerHTML={{ __html: course.content }}
                                />
                            ) : (
                                <>
                                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <FaBookOpen className="text-red-600" /> Nội dung khóa học
                                    </h3>
                                    <ul className="space-y-3 mb-8">
                                        {DEFAULT_CURRICULUM.map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-gray-700">
                                                <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <FaUserTie className="text-red-600" /> Quyền lợi học viên
                                    </h3>
                                    <ul className="space-y-3">
                                        {DEFAULT_BENEFITS.map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-gray-700">
                                                <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ── Cột phải ──────────────────────────────────────────── */}
                    <div className="md:col-span-1">
                        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg border-t-4 border-red-600 sticky top-28 space-y-5">
                            <h3 className="text-xl font-bold text-gray-900 text-center">Thông tin khóa học</h3>

                            <div className="space-y-4">
                                {course.duration && (
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                                            <FaClock />
                                        </div>
                                        <div>
                                            <p className="text-[13px] text-gray-500">Thời lượng</p>
                                            <p className="font-semibold text-gray-800">{course.duration}</p>
                                        </div>
                                    </div>
                                )}

                                {nextSchedule && (
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0">
                                            <FaCalendarAlt />
                                        </div>
                                        <div>
                                            <p className="text-[13px] text-gray-500">Khai giảng gần nhất</p>
                                            <p className="font-semibold text-gray-800">
                                                {new Date(nextSchedule.startDate).toLocaleDateString('vi-VN')}
                                            </p>
                                            {nextSchedule.time && (
                                                <p className="text-sm text-gray-500">{nextSchedule.time}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
                                        <FaMoneyBillWave />
                                    </div>
                                    <div>
                                        <p className="text-[13px] text-gray-500">Học phí</p>
                                        {course.tuition ? (
                                            <p className="font-bold text-red-600 text-xl">{fmt(course.tuition)}</p>
                                        ) : (
                                            <p className="font-semibold text-gray-500 text-sm italic">Liên hệ tư vấn</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleRegisterClick()}
                                className="block w-full py-3 cursor-pointer bg-red-600 text-white text-center font-bold rounded-xl hover:bg-red-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                Đăng ký tư vấn ngay
                            </button>

                            <p className="text-[13px] text-center text-gray-500">
                                <IoIosCall size={20} className="inline-block" /> Chúng tôi sẽ liên hệ trong vòng 24 giờ làm việc
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Registration Modal */}
            <RegistrationModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setPreSelectedScheduleId('');
                }}
                courseName={course.title}
                courseId={course.id}
                preSelectedScheduleId={preSelectedScheduleId}
            />
        </div>
    );
};

export default CourseDetailPage;
