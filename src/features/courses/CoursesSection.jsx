import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiClock } from 'react-icons/fi';
import RegistrationModal from '../../components/ui/RegistrationModal';
import { getCourses } from '../../services/courseService';

// ─── Spinner loading ──────────────────────────────────────────────────────────
const SpinnerLoading = ({ text = 'Đang tải khóa học nổi bật...' }) => (
    <div className="col-span-full flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-9 h-9 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-500">{text}</p>
    </div>
);

// ─── Course card ───────────────────────────────────────────────────────────────
const CourseCard = ({ course, onRegister }) => {
    const next = course.nextSchedule;

    return (
        <div className="cursor-pointer flex flex-col bg-gray-100 p-4 rounded-xl shadow hover:shadow-xl transition transform hover:translate-y-[-4px] ease-in-out duration-300">
            <img
                src={
                    course.thumbnail ||
                    'https://bizweb.dktcdn.net/thumb/grande/100/059/929/products/z4597684243362-15d5a906850cb4f06c5cdfbac8ed5003-compressed.jpg'
                }
                alt={course.title}
                className="rounded-lg mb-3 h-48 object-cover w-full"
                loading="lazy"
            />

            <div className="flex-grow">
                <h3 className="text-xl font-semibold mb-2 line-clamp-2">{course.title}</h3>
                {course.description && (
                    <p className="text-gray-600 mb-3 text-sm line-clamp-2">{course.description}</p>
                )}
                <div className="text-xs text-gray-500 space-y-1 mb-3">
                    {course.duration && (
                        <p className="flex items-center gap-1">
                            <FiClock size={11} className="text-red-400" />
                            {course.duration}
                        </p>
                    )}
                    {next ? (
                        <p className="flex items-center gap-1">
                            <FiCalendar size={11} className="text-red-400" />
                            Khai giảng: {new Date(next.startDate).toLocaleDateString('vi-VN')}
                            {next.time && ` • ${next.time}`}
                        </p>
                    ) : (
                        <p className="text-gray-400 italic">Chưa có lịch khai giảng</p>
                    )}
                </div>
            </div>

            <div className="flex gap-2 mt-4">
                <Link
                    to={`/khoa-hoc-tieng-nhat/${course.slug}`}
                    className="flex-1 bg-white text-red-600 border border-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition duration-300 cursor-pointer font-semibold text-center text-sm"
                >
                    Chi tiết
                </Link>
                <button
                    onClick={() => onRegister(course)}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition duration-300 cursor-pointer shadow-md hover:shadow-lg font-semibold text-center text-sm"
                >
                    Đăng ký
                </button>
            </div>
        </div>
    );
};

// ─── Main section ──────────────────────────────────────────────────────────────
export default function CoursesSection() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState({ id: '', title: '' });

    useEffect(() => {
        getCourses({ limit: 8, sort: 'newest' })
            .then((res) => {
                const items = res?.data?.items ?? res?.items ?? [];
                // Lấy 4 khóa học ngẫu nhiên từ danh sách
                const shuffled = [...items].sort(() => 0.5 - Math.random());
                setCourses(shuffled.slice(0, 4));
            })
            .catch((err) => {
                console.error('Lỗi tải khóa học trang chủ:', err);
                setCourses([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleRegisterClick = (course) => {
        setSelectedCourse({ id: course.id, title: course.title });
        setIsModalOpen(true);
    };

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <h2 className="text-4xl font-extrabold text-gray-800 mb-10">Khóa học nổi bật tại Sakae</h2>

                <div className="grid lg:grid-cols-4 sm:grid-cols-2 gap-6">
                    {loading ? (
                        <SpinnerLoading />
                    ) : courses.length === 0 ? (
                        <div className="col-span-4 py-10 text-gray-400 text-center">
                            Chưa có khóa học nào. Vui lòng quay lại sau.
                        </div>
                    ) : (
                        courses.map((course) => (
                            <CourseCard key={course.id} course={course} onRegister={handleRegisterClick} />
                        ))
                    )}
                </div>

                {/* Registration Modal */}
                <RegistrationModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedCourse({ id: '', title: '' });
                    }}
                    courseName={selectedCourse.title}
                    courseId={selectedCourse.id}
                />

                {/* Nút xem tất cả */}
                <div className="mt-12">
                    <Link
                        to="/khoa-hoc-tieng-nhat"
                        className="bg-red-600 text-white font-bold py-3 px-8 rounded-full hover:bg-red-700 shadow-xl transition duration-300 transform hover:-translate-y-0.5"
                    >
                        Xem tất cả khóa học
                    </Link>
                </div>
            </div>
        </section>
    );
}
