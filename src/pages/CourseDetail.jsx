import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { schedules } from '../dataTest/schedules';
import { FaCalendarAlt, FaClock, FaUserTie, FaMoneyBillWave, FaBookOpen, FaCheckCircle } from 'react-icons/fa';

const CourseDetail = () => {
    const { id } = useParams();
    const course = schedules.find((item) => item.id === parseInt(id));

    if (!course) {
        return (
            <div className="pt-32 pb-20 text-center min-h-[60vh]">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy khóa học!</h2>
                <Link to="/lich-khai-giang" className="text-red-600 hover:underline">
                    Quay lại lịch khai giảng
                </Link>
            </div>
        );
    }

    // Dữ liệu giả lập thêm cho trang chi tiết (vì schedules chỉ có thông tin cơ bản)
    const courseDetails = {
        description: `Khóa học ${course.course} tại Sakae được thiết kế đặc biệt giúp học viên nắm vững kiến thức nền tảng và phát triển toàn diện 4 kỹ năng Nghe - Nói - Đọc - Viết. Với đội ngũ giáo viên giàu kinh nghiệm, bạn sẽ được trải nghiệm môi trường học tập chuẩn Nhật Bản.`,
        curriculum: [
            'Làm quen với bảng chữ cái Hiragana, Katakana (đối với lớp sơ cấp).',
            'Học từ vựng và ngữ pháp theo giáo trình Minna no Nihongo.',
            'Luyện giao tiếp phản xạ (Kaiwa) với giáo viên bản xứ.',
            'Thực hành nghe hiểu và đọc hiểu qua các bài tập thực tế.',
            'Kiểm tra định kỳ để đánh giá năng lực và bổ sung kiến thức kịp thời.',
        ],
        benefits: [
            'Lớp học sĩ số nhỏ, đảm bảo tương tác tối đa.',
            'Phòng học máy lạnh, trang thiết bị hiện đại.',
            'Được tham gia các hoạt động ngoại khóa văn hóa Nhật Bản.',
            'Hỗ trợ tư vấn du học và việc làm sau khóa học.',
        ],
    };

    return (
        <div className="pt-24 pb-14 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="text-sm mb-6 text-gray-500">
                    <Link to="/" className="hover:text-red-600">
                        Trang chủ
                    </Link>{' '}
                    {' > '}
                    <Link to="/lich-khai-giang" className="hover:text-red-600">
                        Lịch khai giảng
                    </Link>
                    {' > '} <span className="text-gray-800 font-medium">{course.course}</span>
                </nav>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Cột trái: Thông tin chính */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-white px-8 py-6 rounded-2xl shadow-sm border border-gray-100">
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">{course.course}</h1>
                            <div className="flex flex-wrap gap-4 mb-6">
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-bold ${
                                        course.status === 'Sắp khai giảng'
                                            ? 'bg-green-100 text-green-700'
                                            : course.status === 'Đang nhận học viên'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-gray-200 text-gray-600'
                                    }`}
                                >
                                    {course.status}
                                </span>
                                <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-50 text-red-600">
                                    {course.tuition}
                                </span>
                            </div>
                            <p className="text-gray-700 leading-relaxed font-medium mb-6">
                                {courseDetails.description}
                            </p>

                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FaBookOpen className="text-red-600" /> Nội dung khóa học
                            </h3>
                            <ul className="space-y-3 mb-8">
                                {courseDetails.curriculum.map((item, index) => (
                                    <li key={index} className="flex items-start gap-3 text-gray-700">
                                        <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FaUserTie className="text-red-600" /> Quyền lợi học viên
                            </h3>
                            <ul className="space-y-3">
                                {courseDetails.benefits.map((item, index) => (
                                    <li key={index} className="flex items-start gap-3 text-gray-700">
                                        <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Cột phải: Thông tin tóm tắt & Đăng ký */}
                    <div className="md:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-red-600 sticky top-28">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Thông tin lớp học</h3>

                            <div className="space-y-5 mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                                        <FaCalendarAlt />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Ngày khai giảng</p>
                                        <p className="font-semibold text-gray-800">{course.startDate}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                        <FaClock />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Thời gian học</p>
                                        <p className="font-semibold text-gray-800">{course.days}</p>
                                        <p className="text-sm font-medium text-gray-600">{course.time}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                        <FaMoneyBillWave />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Học phí</p>
                                        <p className="font-bold text-red-600 text-lg">{course.tuition}</p>
                                    </div>
                                </div>
                            </div>

                            <Link
                                to="/lien-he"
                                className="block w-full py-3 bg-red-600 text-white text-center font-bold rounded-xl hover:bg-red-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                Đăng ký ngay
                            </Link>
                            <p className="text-xs text-center text-gray-500 mt-4">
                                * Vui lòng liên hệ để được tư vấn chi tiết về ưu đãi.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
