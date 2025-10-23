import React, { useState } from 'react';

const classesData = [
    {
        id: 1,
        name: 'Lớp tiếng Nhật sơ cấp (N5)',
        level: 'N5',
        type: 'Thường',
        image: 'https://bizweb.dktcdn.net/thumb/grande/100/059/929/products/z4597684243362-15d5a906850cb4f06c5cdfbac8ed5003-compressed.jpg?v=1691981651677',
        desc: 'Dành cho người mới bắt đầu học tiếng Nhật. Học viên được làm quen với bảng chữ cái, ngữ pháp và mẫu câu cơ bản.',
        schedule: 'Thứ 2 - 4 - 6 | 18:00 - 20:00',
    },
    {
        id: 2,
        name: 'Lớp tiếng Nhật N4',
        level: 'N4',
        type: 'Cấp tốc',
        image: 'https://bizweb.dktcdn.net/thumb/grande/100/059/929/products/330597059-254731006984670-4954584067931549400-n-compressed.jpg?v=1683690172157',
        desc: 'Nâng cao kiến thức từ N5, tập trung vào các mẫu ngữ pháp phức tạp hơn và luyện đọc hiểu sơ cấp.',
        schedule: 'Thứ 3 - 5 - 7 | 18:00 - 20:00',
    },
    {
        id: 3,
        name: 'Lớp luyện thi JLPT N3',
        level: 'N3',
        type: 'Cấp tốc',
        image: 'https://bizweb.dktcdn.net/thumb/grande/100/059/929/products/brown-and-yellow-modern-family-collage-photo-collage-4-3-template-compressed.jpg?v=1723878715377',
        desc: 'Tập trung củng cố ngữ pháp, luyện nghe - đọc, giúp học viên tự tin giao tiếp và thi JLPT N3.',
        schedule: 'Thứ 3 - 5 - 7 | 18:00 - 20:00',
    },
    {
        id: 4,
        name: 'Lớp luyện thi JLPT N2',
        level: 'N2',
        type: 'Cấp tốc',
        image: 'https://bizweb.dktcdn.net/thumb/grande/100/059/929/products/476160146-509377935515824-4799331393811144878-n.jpg?v=1750060533540',
        desc: 'Khóa học chuyên sâu ôn thi JLPT N2, bao gồm chiến lược làm bài, luyện đề và cải thiện kỹ năng đọc - nghe nâng cao.',
        schedule: 'Thứ 2 - 4 - 6 | 18:00 - 20:00',
    },
    {
        id: 5,
        name: 'Lớp N5 Cấp tốc',
        level: 'N5',
        type: 'Cấp tốc',
        image: 'https://bizweb.dktcdn.net/thumb/grande/100/059/929/products/n5246-t4-compressed.jpg?v=1681181600203',
        desc: 'Hoàn thành chương trình N5 trong thời gian ngắn, phù hợp cho người cần chứng chỉ gấp để du học hoặc làm việc.',
        schedule: 'Thứ 2 đến Thứ 6 | 18:00 - 20:30',
    },
    {
        id: 6,
        name: 'Lớp N3 Online',
        level: 'N3',
        type: 'Online',
        image: 'https://bizweb.dktcdn.net/thumb/grande/100/059/929/products/8011face-compressed.jpg?v=1594181526853',
        desc: 'Học trực tuyến với giáo viên qua Zoom, linh hoạt về thời gian và địa điểm, chương trình học không đổi.',
        schedule: 'Tối Thứ 3 - 5 - 7 | 20:00 - 22:00',
    },
    {
        id: 7,
        name: 'Lớp N4 Cấp tốc',
        level: 'N4',
        type: 'Cấp tốc',
        image: 'https://bizweb.dktcdn.net/thumb/grande/100/059/929/files/315712878-5624748057608095-2146620662772535775-n.png?v=1748232115899',
        desc: 'Đẩy nhanh tiến độ học N4, tập trung luyện giải đề và các kỹ năng cần thiết để thi đạt trong thời gian ngắn.',
        schedule: 'Thứ 2 đến Thứ 6 | 18:00 - 20:30',
    },
    {
        id: 8,
        name: 'Lớp N5 Online',
        level: 'N5',
        type: 'Online',
        image: 'https://bizweb.dktcdn.net/thumb/grande/100/059/929/products/n5-onl.jpg?v=1719284018860',
        desc: 'Khóa học N5 trực tuyến cho người ở xa hoặc không có thời gian đến trung tâm, đảm bảo chất lượng tương đương lớp offline.',
        schedule: 'Tối Thứ 2 - 4 - 6 | 20:00 - 22:00',
    },
];

const FilterButton = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
            active
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-red-100 hover:text-red-700 cursor-pointer'
        }`}
    >
        {label}
    </button>
);

const Classes = () => {
    const [levelFilter, setLevelFilter] = useState('Tất cả');
    const [typeFilter, setTypeFilter] = useState('Tất cả');

    const filteredClasses = classesData.filter((cls) => {
        const levelMatch = levelFilter === 'Tất cả' || cls.level === levelFilter;
        const typeMatch = typeFilter === 'Tất cả' || cls.type === typeFilter;
        return levelMatch && typeMatch;
    });

    return (
        <div className="pt-28 pb-10 bg-gray-100 text-gray-800">
            {/* Tiêu đề */}
            <section className="text-center mb-10 px-4">
                <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-800 mb-3">Các khóa học tại Sakae</h1>
                <p className="text-gray-600 max-w-5xl mx-auto sm:text-lg">
                    Trung tâm Sakae cung cấp nhiều khóa học tiếng Nhật phù hợp với từng trình độ, từ cơ bản đến nâng
                    cao, giúp học viên đạt được mục tiêu học tập nhanh nhất.
                </p>
            </section>

            {/* Bộ lọc */}
            <section className="max-w-4xl mx-auto mb-12 px-4">
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-200 space-y-4">
                    {/* Lọc theo cấp độ */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-700 w-24">Cấp độ:</span>
                        <div className="flex gap-2 flex-wrap">
                            {['Tất cả', 'N5', 'N4', 'N3', 'N2'].map((level) => (
                                <FilterButton
                                    key={level}
                                    label={level}
                                    active={levelFilter === level}
                                    onClick={() => setLevelFilter(level)}
                                />
                            ))}
                        </div>
                    </div>
                    {/* Lọc theo loại hình */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-700 w-24">Loại hình:</span>
                        <div className="flex gap-2 flex-wrap">
                            {['Tất cả', 'Cấp tốc', 'Siêu tốc', 'Online'].map((type) => (
                                <FilterButton
                                    key={type}
                                    label={type}
                                    active={typeFilter === type}
                                    onClick={() => setTypeFilter(type)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Danh sách các lớp học */}
            <section className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-8 py-6 px-4 sm:px-6 bg-white rounded-xl shadow-md">
                {filteredClasses.length > 0 ? (
                    filteredClasses.map((cls) => (
                        <div
                            key={cls.id}
                            className="bg-white border-1 border-red-500 rounded-xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden flex flex-col transform hover:-translate-y-1.5"
                        >
                            {/* Vùng ảnh với chiều cao cố định */}
                            <div className="h-60 w-full overflow-hidden relative group cursor-pointer">
                                <img
                                    src={cls.image}
                                    alt={cls.name}
                                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                                />
                                {/* Lớp phủ mờ khi hover */}
                                <div className="absolute inset-0 bg-white/80 bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 ease-in-out flex items-center justify-center p-4 transform translate-y-full group-hover:translate-y-0">
                                    <span className="text-red-600 text-lg font-semibold flex items-center">
                                        Xem thêm
                                        <span className="ml-1 transform transition-transform duration-300 group-hover:translate-x-1">
                                            →
                                        </span>
                                    </span>
                                </div>
                            </div>
                            {/* Nội dung thẻ */}
                            <div className="px-6 py-4 flex-grow flex flex-col">
                                <a
                                    href="#"
                                    className="text-xl font-bold text-red-500 mb-2 hover:text-red-700 transition-colors duration-300 hover:underline"
                                >
                                    {cls.name}
                                </a>
                                <p className="text-gray-600 mb-4 text-sm flex-grow">{cls.desc}</p>
                                <div className="flex gap-2 justify-between mb-4 mt-1">
                                    <button className="w-38 text-red-600 border text-sm py-2 rounded transition duration-300 transform hover:-translate-y-1.5 cursor-pointer">
                                        Xem thêm
                                    </button>
                                    <button className="w-38 bg-red-600 text-white text-sm py-2 rounded hover:bg-red-700 transition duration-300 transform hover:-translate-y-1.5 cursor-pointer">
                                        Đăng ký
                                    </button>
                                </div>
                                <div className="mt-auto pt-3 border-t border-gray-200">
                                    <p className="text-sm text-gray-500 font-medium">
                                        <span className="font-semibold">Lịch học:</span> {cls.schedule}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-16">
                        <p className="text-xl text-gray-500">Không tìm thấy khóa học phù hợp với lựa chọn của bạn.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Classes;
