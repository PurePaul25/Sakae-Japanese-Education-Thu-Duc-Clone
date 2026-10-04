import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const activities = [
    {
        id: 1,
        image: 'https://res.cloudinary.com/dp3gvvsen/image/upload/v1790999680/sbbn-collec-1_lk2xvb.webp',
        title: 'Lễ hội văn hóa Nhật Bản',
    },
    {
        id: 2,
        image: 'https://res.cloudinary.com/dp3gvvsen/image/upload/v1790999679/481148328_525534473900170_8010769586000508021_n_tphcib.jpg',
        title: 'Lớp học thiếu nhi vui nhộn',
    },
    {
        id: 3,
        image: 'https://res.cloudinary.com/dp3gvvsen/image/upload/v1790999680/481274119_528683016918649_9080653390569863226_n_n68ya9.jpg',
        title: 'Giao lưu với giáo viên bản ngữ',
    },
    {
        id: 4,
        image: 'https://res.cloudinary.com/dp3gvvsen/image/upload/v1790999680/481041989_525923197194631_5336081215440318890_n_mzlkqd.jpg',
        title: 'Hoạt động nhóm tại lớp',
    },
];

function ExtracurricularSection() {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    // Bắt sự kiện khi người dùng lướt tới khu vực này
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect(); // Chỉ chạy animation 1 lần khi cuộn tới
                }
            },
            { threshold: 0.15 }, // Kích hoạt khi thấy 15% diện tích section
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <section ref={sectionRef} className="py-16 bg-white border-t border-gray-100 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section - Animation Hiện Lên (Fade Up) */}
                <div
                    className={`text-center mb-12 transition-all duration-200 ease-out ${
                        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                >
                    <h2 className="text-3xl sm:text-[40px] font-extrabold text-gray-900 mb-4">
                        Hoạt động <span className="text-red-600">Ngoại khóa</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Tại Sakae, học viên không chỉ học tiếng Nhật mà còn được trải nghiệm văn hóa, tham gia các hoạt
                        động ngoại khóa thú vị và bổ ích.
                    </p>
                </div>

                {/* Danh sách thẻ - Animation trượt lần lượt từng card (Staggered Fade) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {activities.map((item, index) => (
                        <div
                            key={item.id}
                            style={{ transitionDelay: isVisible ? `${index * 100}ms` : '0ms' }}
                            className={`group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer h-64 md:h-80 transition-all duration-200 ease-out ${
                                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                            }`}
                        >
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-200 ease-out group-hover:scale-110"
                            />

                            {/* Text Container */}
                            <div className="absolute bottom-0 left-0 w-full p-4 bg-black/30 backdrop-blur-md border-t border-white/20 transition-all duration-200">
                                <h3 className="text-white text-lg font-bold leading-tight group-hover:text-red-400 transition-colors duration-200">
                                    {item.title}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Button Bottom - Animation trượt lên */}
                <div
                    className={`text-center mt-10 transition-all duration-200 ease-out delay-300 ${
                        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                    }`}
                >
                    <Link
                        to="/bo-suu-tap"
                        className="inline-block px-8 py-3 bg-red-600 text-white font-semibold rounded-full shadow-md hover:bg-red-700 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 active:translate-y-0"
                    >
                        Xem tất cả hình ảnh
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default ExtracurricularSection;
