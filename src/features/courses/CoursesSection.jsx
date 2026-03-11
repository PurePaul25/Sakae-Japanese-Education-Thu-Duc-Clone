import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RegistrationModal from '../../components/ui/RegistrationModal';

// Fake API data từ Classes
const classesData = [
    {
        id: 1,
        name: 'Lớp tiếng Nhật sơ cấp (N5)',
        level: 'N5',
        type: 'Cấp tốc',
        image: 'https://bizweb.dktcdn.net/thumb/grande/100/059/929/products/z4597684243362-15d5a906850cb4f06c5cdfbac8ed5003-compressed.jpg?v=1691981651677',
        desc: 'Dành cho người mới bắt đầu học tiếng Nhật. Học viên được làm quen với bảng chữ cái, ngữ pháp và mẫu câu cơ bản.',
        schedule: 'Tối Thứ 2 - 4 - 6 | 18:00 - 21:00',
    },
    {
        id: 2,
        name: 'Lớp tiếng Nhật N4',
        level: 'N4',
        type: 'Siêu tốc',
        image: 'https://bizweb.dktcdn.net/thumb/grande/100/059/929/products/330597059-254731006984670-4954584067931549400-n-compressed.jpg?v=1683690172157',
        desc: 'Nâng cao kiến thức từ N5, tập trung vào các mẫu ngữ pháp phức tạp hơn và luyện đọc hiểu sơ cấp.',
        schedule: 'Chiều Thứ 2 - 3 - 4 - 5 - 6 | 13:30 - 16:30',
    },
    {
        id: 3,
        name: 'Lớp luyện thi JLPT N3',
        level: 'N3',
        type: 'Cấp tốc',
        image: 'https://bizweb.dktcdn.net/thumb/grande/100/059/929/products/brown-and-yellow-modern-family-collage-photo-collage-4-3-template-compressed.jpg?v=1723878715377',
        desc: 'Tập trung củng cố ngữ pháp, luyện nghe - đọc, giúp học viên tự tin giao tiếp và thi JLPT N3.',
        schedule: 'Tối Thứ 3 - 5 - 7 | 18:00 - 21:00',
    },
    {
        id: 4,
        name: 'Lớp luyện thi JLPT N2',
        level: 'N2',
        type: 'Cấp tốc',
        image: 'https://bizweb.dktcdn.net/thumb/grande/100/059/929/products/476160146-509377935515824-4799331393811144878-n.jpg?v=1750060533540',
        desc: 'Khóa học chuyên sâu ôn thi JLPT N2, bao gồm chiến lược làm bài, luyện đề và cải thiện kỹ năng đọc - nghe nâng cao.',
        schedule: 'Tối Thứ 2 - 4 - 6 | 18:00 - 21:00',
    },
    {
        id: 5,
        name: 'Lớp N5 Cấp tốc',
        level: 'N5',
        type: 'Siêu tốc',
        image: 'https://bizweb.dktcdn.net/thumb/grande/100/059/929/products/n5246-t4-compressed.jpg?v=1681181600203',
        desc: 'Hoàn thành chương trình N5 trong thời gian ngắn, phù hợp cho người cần chứng chỉ gấp để du học hoặc làm việc.',
        schedule: 'Tối Thứ 2 - 3 - 4 - 5 - 6 | 18:00 - 21:00',
    },
    {
        id: 6,
        name: 'Lớp N3 Online',
        level: 'N3',
        type: 'Online',
        image: 'https://bizweb.dktcdn.net/thumb/grande/100/059/929/products/8011face-compressed.jpg?v=1594181526853',
        desc: 'Học trực tuyến với giáo viên qua Zoom, linh hoạt về thời gian và địa điểm, chương trình học không đổi.',
        schedule: 'Tối Thứ 3 - 5 - 7 | 18:00 - 21:00',
    },
    {
        id: 7,
        name: 'Lớp N4 Cấp tốc',
        level: 'N4',
        type: 'Siêu tốc',
        image: 'https://bizweb.dktcdn.net/thumb/grande/100/059/929/files/315712878-5624748057608095-2146620662772535775-n.png?v=1748232115899',
        desc: 'Đẩy nhanh tiến độ học N4, tập trung luyện giải đề và các kỹ năng cần thiết để thi đạt trong thời gian ngắn.',
        schedule: 'Tối Thứ 2 - 3 - 4 - 5 - 6 | 18:00 - 21:00',
    },
    {
        id: 8,
        name: 'Lớp N5 Online',
        level: 'N5',
        type: 'Online',
        image: 'https://bizweb.dktcdn.net/thumb/grande/100/059/929/products/n5-onl.jpg?v=1719284018860',
        desc: 'Khóa học N5 trực tuyến cho người ở xa hoặc không có thời gian đến trung tâm, đảm bảo chất lượng tương đương lớp offline.',
        schedule: 'Tối Thứ 2 - 4 - 6 | 18:00 - 21:00',
    },
];

// Hàm lấy 4 items ngẫu nhiên từ mảng
const getRandomItems = (array, count = 4) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

export default function CoursesSection() {
    const [courses, setCourses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    const handleRegisterClick = (e, course) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedCourse(course);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
    };

    useEffect(() => {
        // Lấy 4 items ngẫu nhiên từ classesData
        const randomCourses = getRandomItems(classesData, 4);
        setCourses(randomCourses);
    }, []);

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <h2 className="text-4xl font-extrabold text-gray-800 mb-10">Khóa học nổi bật tại Sakae</h2>

                <div className="grid lg:grid-cols-4 sm:grid-cols-2 gap-6">
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            className="cursor-pointer flex flex-col bg-gray-100 p-4 rounded-xl shadow hover:shadow-xl transition transform hover:translate-y-[-4px] ease-in-out duration-300"
                        >
                            <img src={course.image} alt={course.name} className="rounded-lg mb-3 h-48 object-cover" />

                            <div className="flex-grow">
                                <h3 className="text-xl font-semibold mb-2">{course.name}</h3>
                                <p className="text-gray-600 mb-3 text-sm">{course.desc}</p>
                                <p className="text-xs text-gray-500 mb-3">
                                    <span className="font-semibold text-gray-700">Lịch:</span> {course.schedule}
                                </p>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Link
                                    to={`/chi-tiet-khoa-hoc/${course.id}`}
                                    className="flex-1 bg-white text-red-600 border border-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition duration-300 cursor-pointer font-semibold text-center text-sm"
                                >
                                    Chi tiết
                                </Link>
                                <button
                                    onClick={(e) => handleRegisterClick(e, course)}
                                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition duration-300 cursor-pointer shadow-md hover:shadow-lg font-semibold text-center text-sm"
                                >
                                    Đăng ký
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Registration Modal */}
                <RegistrationModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    courseName={selectedCourse?.name || ''}
                    courseId={selectedCourse?.id || ''}
                />

                {/* Nút xem tất cả */}
                <div className="mt-12">
                    <Link
                        to="/khoa-hoc"
                        className="bg-red-600 text-white font-bold py-3 px-8 rounded-full 
                           hover:bg-red-700 shadow-xl transition duration-300 transform hover:-translate-y-0.5"
                    >
                        Xem tất cả khóa học
                    </Link>
                </div>
            </div>
        </section>
    );
}
