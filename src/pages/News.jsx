import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const newsData = [
    {
        id: 1,
        title: 'Hoạt động ngoại khóa tại Sakae',
        image: 'http://bizweb.dktcdn.net/100/059/929/themes/76022/assets/sbbn-collec-1.jpg?1747711551525',
        date: '18/07/2025',
        desc: 'Học viên Sakae đã có dịp trải nghiệm không khí lễ hội văn hóa Nhật Bản với nhiều hoạt động thú vị như mặc yukata và pha trà đạo.',
        category: 'Sự kiện',
    },
    {
        id: 2,
        title: 'Từ "gà mờ" đến thành thạo trợ từ tiếng Nhật, tham khảo bài viết dưới đây',
        image: 'http://bizweb.dktcdn.net/100/059/929/files/315712878-5624748057608095-2146620662772535775-n.png?v=1748232115899',
        date: '26/5/2025',
        desc: 'Bí quyết nắm vững các trợ từ quan trọng ($wa, ga, o, ni,...) trong tiếng Nhật giúp bạn giao tiếp và viết lách trôi chảy hơn ngay từ level N5.',
        category: 'Kiến thức',
    },
    {
        id: 3,
        title: 'TỪ VỰNG BẢNG LƯƠNG CẦN BIẾT CHO CÁC BẠN SẮP SANG NHẬT',
        image: 'http://bizweb.dktcdn.net/100/059/929/articles/493942609-1010388567893707-7651434882821413917-n.jpg?v=1745908085917',
        date: '29/04/2025',
        desc: 'Tổng hợp các từ vựng chuyên ngành liên quan đến bảng lương, thu nhập tại Nhật Bản, giúp bạn dễ dàng hòa nhập và hiểu rõ quyền lợi của mình.',
        category: 'Du học & Việc làm',
    },
    {
        id: 4,
        title: 'Lịch khai giảng các lớp N5, N4, N3 tháng 8/2025',
        image: 'https://bizweb.dktcdn.net/100/059/929/products/n5246-t4-compressed.jpg?v=1681181600203',
        date: '01/08/2025',
        desc: 'Thông báo lịch khai giảng chi tiết các khóa học tiếng Nhật mọi cấp độ trong tháng 8. Đăng ký sớm để nhận ưu đãi học phí hấp dẫn!',
        category: 'Thông báo',
    },
    {
        id: 5,
        title: 'Kinh nghiệm "săn" học bổng du học Nhật Bản thành công',
        image: 'https://bizweb.dktcdn.net/100/059/929/products/8011face-compressed.jpg?v=1594181526853',
        date: '15/07/2025',
        desc: 'Chia sẻ từ cựu học viên Sakae về hành trình chuẩn bị hồ sơ, phỏng vấn và chinh phục thành công học bổng MEXT danh giá.',
        category: 'Du học & Việc làm',
    },
];

// Component cho nút lọc, tương tự trang Classes để đồng bộ
const FilterButton = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
            active
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-red-100 hover:text-red-700 cursor-pointer'
        }`}
    >
        {label}
    </button>
);

// Component cho thẻ tin tức
const NewsCard = ({ item }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-1">
            {/* Container flex để chia 2 cột */}
            <div className="flex flex-col md:flex-row">
                {/* Cột trái - Ảnh */}
                <div className="relative md:w-1/3 overflow-hidden border-r border-gray-200">
                    <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-20 object-cover transition-transform duration-500 group-hover:scale-105 min-h-[250px]"
                    />
                    {/* Lớp phủ mờ khi hover */}
                    <div className="absolute inset-0 cursor-pointer bg-white/80 bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 ease-in-out flex items-center justify-center p-4 transform translate-y-full group-hover:translate-y-0">
                        <span className="text-red-600 text-lg font-semibold flex items-center">
                            Xem thêm
                            <span className="ml-1 transform transition-transform duration-300 group-hover:translate-x-1">
                                →
                            </span>
                        </span>
                    </div>
                    <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-semibold py-1 px-3 rounded-full">
                        {item.category}
                    </span>
                </div>
                {/* Cột phải - Nội dung */}
                <div className="md:w-2/3 p-6 flex flex-col justify-between">
                    <div>
                        <span className="text-sm text-gray-500 mb-2 block">{item.date}</span>
                        <h3 className="text-xl font-bold text-gray-800 mb-3 hover:text-red-600 transition-colors duration-300">
                            <Link to={`/tin-tuc/${item.id}`}>{item.title}</Link>
                        </h3>
                        <p className="text-gray-600 mb-5 leading-relaxed line-clamp-3">{item.desc}</p>
                    </div>
                    <Link
                        to={`/tin-tuc/${item.id}`}
                        className="self-start text-red-600 font-semibold text-sm hover:text-red-800 transition-colors duration-300 group"
                    >
                        Xem chi tiết{' '}
                        <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                            →
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

const News = () => {
    const [activeCategory, setActiveCategory] = useState('Tất cả');

    // Tự động lấy các danh mục duy nhất từ newsData và thêm 'Tất cả' vào đầu
    const categories = ['Tất cả', ...new Set(newsData.map((item) => item.category))];

    // Lọc tin tức dựa trên danh mục đang được chọn
    const filteredNews = newsData.filter((item) => activeCategory === 'Tất cả' || item.category === activeCategory);

    return (
        <div className="pt-28 pb-12 bg-gray-100 text-gray-800">
            {/* Tiêu đề */}
            <section className="text-center mb-6 px-4">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
                    Tin tức & <span className="text-red-600">Sự kiện</span>
                </h1>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    Cập nhật các hoạt động, sự kiện và tin tức mới nhất từ trung tâm tiếng Nhật Sakae.
                </p>
            </section>

            {/* Bộ lọc theo danh mục */}
            <section className="max-w-4xl mx-auto mb-10 px-4">
                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-200">
                    {/* Giao diện cho desktop (md trở lên): các nút bấm */}
                    <div className="hidden md:flex items-center gap-3 flex-wrap justify-center">
                        <p className="font-bold text-gray-700">Lọc theo danh mục</p>
                        {categories.map((category) => (
                            <FilterButton
                                key={category}
                                label={category}
                                active={activeCategory === category}
                                onClick={() => setActiveCategory(category)}
                            />
                        ))}
                    </div>

                    {/* Giao diện cho mobile (dưới md): dropdown */}
                    <div className="md:hidden">
                        <label
                            htmlFor="category-filter"
                            className="block text-sm font-bold text-gray-700 mb-2 text-center"
                        >
                            Lọc theo danh mục
                        </label>
                        <select
                            id="category-filter"
                            value={activeCategory}
                            onChange={(e) => setActiveCategory(e.target.value)}
                            className="w-full px-3 py-1.5 text-base border border-gray-300 transition duration-250 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                        >
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            {/* Danh sách tin tức */}
            <section className="max-w-7xl mx-auto px-4">
                {/* Thay grid bằng flex-col để xếp các tin tức theo hàng dọc */}
                <div className="flex flex-col gap-8">
                    {filteredNews.length > 0 ? (
                        filteredNews.map((item) => <NewsCard key={item.id} item={item} />)
                    ) : (
                        <p className="text-center text-gray-500 py-10">Không có tin tức nào trong danh mục này.</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default News;
