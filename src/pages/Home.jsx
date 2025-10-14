import { useState, useEffect } from 'react';
import { BsChevronCompactLeft, BsChevronCompactRight } from 'react-icons/bs';
import { RxDotFilled } from 'react-icons/rx';
import bannerBg1 from '../assets/banner-bg-1.webp';
import bannerBg2 from '../assets/banner-bg-2.webp';
import bannerBg3 from '../assets/banner-bg-3.jpg';
import aboutBanner from '../assets/aboutBanner.jpg';

const banners = [bannerBg1, bannerBg2, bannerBg3];

function Home() {
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

    useEffect(() => {
        // Tự động chuyển banner sau mỗi 5 giây
        const timer = setInterval(() => {
            setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
        }, 5000);

        // Dọn dẹp interval khi component bị unmount
        return () => clearInterval(timer);
    }, []);

    const prevBanner = () => {
        const isFirstBanner = currentBannerIndex === 0;
        const newIndex = isFirstBanner ? banners.length - 1 : currentBannerIndex - 1;
        setCurrentBannerIndex(newIndex);
    };

    const nextBanner = () => {
        const isLastBanner = currentBannerIndex === banners.length - 1;
        const newIndex = isLastBanner ? 0 : currentBannerIndex + 1;
        setCurrentBannerIndex(newIndex);
    };

    const goToBanner = (bannerIndex) => {
        setCurrentBannerIndex(bannerIndex);
    };

    return (
        <main>
            {/* Hero Section */}
            <section
                style={{ backgroundImage: `url(${banners[currentBannerIndex]})` }}
                className="relative bg-cover bg-center h-[530px] transition-all duration-500 ease-in-out group"
            >
                <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center text-center text-white px-4">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Trung tâm Nhật Ngữ SAKAE</h2>
                    <p className="text-lg md:text-xl mb-6">
                        Chất lượng đào tạo đến từ Nhật Bản. Trang thiết bị hiện đại. Môi trường học tập thoải mái. Trải
                        nghiệm văn hóa, tác phong Nhật Bản.
                    </p>
                    <button className="bg-red-600 px-6 py-3 rounded-lg text-white font-semibold hover:bg-red-700 transition cursor-pointer">
                        Tìm hiểu thêm
                    </button>
                </div>

                {/* Nút chuyển banner Trái */}
                <div className="hidden group-hover:block absolute top-1/2 -translate-y-1/2 left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/40 transition">
                    <BsChevronCompactLeft onClick={prevBanner} size={35} />
                </div>

                {/* Nút chuyển banner Phải */}
                <div className="hidden group-hover:block absolute top-1/2 -translate-y-1/2 right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/40 transition">
                    <BsChevronCompactRight onClick={nextBanner} size={35} />
                </div>

                {/* Indicator Dots */}
                <div className="absolute bottom-5 left-0 right-0 flex justify-center py-2">
                    {banners.map((_, bannerIndex) => (
                        <div
                            key={bannerIndex}
                            onClick={() => goToBanner(bannerIndex)}
                            className={`cursor-pointer text-3xl ${
                                currentBannerIndex === bannerIndex ? 'text-white' : 'text-gray-400/70'
                            }`}
                        >
                            <RxDotFilled />
                        </div>
                    ))}
                </div>
            </section>

            {/* About Section */}
            <section className="py-16 bg-gray-100">
                <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
                    {/* Ảnh */}
                    <div>
                        <img src={aboutBanner} alt="About Sakae" className="rounded-2xl w-145" />
                    </div>

                    {/* Nội dung */}
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-800 mb-4">Về Trung tâm Nhật ngữ Sakae</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Trung tâm Nhật ngữ Sakae tự hào là đơn vị đào tạo tiếng Nhật uy tín, giúp hàng ngàn học viên
                            chinh phục giấc mơ du học và làm việc tại Nhật Bản. Với đội ngũ giáo viên tận tâm và chương
                            trình học chuẩn Nhật, Sakae là điểm đến lý tưởng cho người học tiếng Nhật mọi trình độ.
                        </p>
                        <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition cursor-pointer transform hover:translate-y-[-4px] duration-300 ease-in-outhover:shadow-lg">
                            Xem thêm
                        </button>
                    </div>
                </div>
            </section>

            {/* Courses Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-10">Khóa học nổi bật tại Sakae</h2>

                    <div className="grid md:grid-cols-4 gap-6">
                        {/* Khóa học 1 */}
                        <div className="flex flex-col bg-gray-100 p-4 rounded-xl shadow hover:shadow-xl transition transform hover:translate-y-[-4px] ease-in-out duration-300">
                            <img
                                src="//bizweb.dktcdn.net/thumb/grande/100/059/929/products/z4597684243362-15d5a906850cb4f06c5cdfbac8ed5003-compressed.jpg?v=1691981651677"
                                alt="Khóa học N5 - Sơ Cấp 1"
                                className="rounded-lg mb-3"
                            />

                            <div className="flex-grow">
                                <h3 className="text-xl font-semibold mb-2">Khóa học N5 - Sơ cấp 1</h3>
                                <p className="text-gray-600 mb-5">
                                    Dành cho người mới bắt đầu học tiếng Nhật, làm nền tảng cho những cấp độ sau.
                                </p>
                            </div>
                            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300 cursor-pointer transform hover:translate-y-[-4px] ease-in-out hover:shadow-lg">
                                Xem chi tiết
                            </button>
                        </div>

                        {/* Khóa học 2  */}
                        <div className="flex flex-col bg-gray-100 p-4 rounded-xl shadow hover:shadow-xl transition transform hover:translate-y-[-4px] ease-in-out duration-300">
                            <img
                                src="//bizweb.dktcdn.net/thumb/grande/100/059/929/products/colorful-online-course-facebook-post-recovered.png?v=1749625404853"
                                alt="Khóa học N5 - Cấp tốc (Online)"
                                className="rounded-lg mb-3"
                            />
                            <div className="flex-grow">
                                <h3 className="text-xl font-semibold mb-2">Khóa học N5 - Cấp tốc (Online)</h3>
                                <p className="text-gray-600 mb-5">
                                    khóa tiếng Nhật cho người mới bắt đầu online, không có phương tiện di chuyển
                                </p>
                            </div>
                            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300 cursor-pointer transform hover:translate-y-[-4px] ease-in-out hover:shadow-lg">
                                Xem chi tiết
                            </button>
                        </div>

                        {/* Khóa học 3 */}
                        <div className="flex flex-col bg-gray-100 p-4 rounded-xl shadow hover:shadow-xl transition transform hover:translate-y-[-4px] ease-in-out duration-300">
                            <img
                                src="//bizweb.dktcdn.net/thumb/grande/100/059/929/products/brown-and-yellow-modern-family-collage-photo-collage-4-3-template-compressed.jpg?v=1723878715377"
                                alt="Khóa học N3 - Ngữ pháp tích hợp KAIWA"
                                className="rounded-lg mb-3"
                            />
                            <div className="flex-grow">
                                <h3 className="text-xl font-semibold mb-2">Khóa học N3 - Ngữ pháp tích hợp KAIWA</h3>
                                <p className="text-gray-600 mb-5">
                                    Sử dụng phương pháp giảng dạy trực quang sinh động, giúp người học nắm chắc ngữ pháp
                                    và từ vựng (Trung Cấp)
                                </p>
                            </div>
                            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300 cursor-pointer transform hover:translate-y-[-4px] ease-in-out hover:shadow-lg">
                                Xem chi tiết
                            </button>
                        </div>

                        {/* Khóa học 4 */}
                        <div className="flex flex-col bg-gray-100 p-4 rounded-xl shadow hover:shadow-xl transition transform hover:translate-y-[-4px] ease-in-out duration-300">
                            <img
                                src="//bizweb.dktcdn.net/thumb/grande/100/059/929/products/330597059-254731006984670-4954584067931549400-n-compressed.jpg?v=1683690172157"
                                alt="Khóa học N4 - Cấp tốc"
                                className="rounded-lg mb-3"
                            />
                            <div className="flex-grow">
                                <h3 className="text-xl font-semibold mb-2">Khóa học N4 - Cấp tốc</h3>
                                <p className="text-gray-600 mb-5">
                                    Khóa học dành cho những người đã học qua tiếng Nhật cơ bản, muốn thi lấy chứng chỉ
                                    N4 trong thời gian ngắn (Sơ Trung Cấp)
                                </p>
                            </div>
                            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300 cursor-pointer transform hover:translate-y-[-4px] ease-in-out hover:shadow-lg">
                                Xem chi tiết
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* News Section */}
            <section className="py-20 bg-gray-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
                    {/* Tiêu đề chính đẹp hơn */}
                    <h2 className="text-4xl font-extrabold text-gray-800 mb-12 border-b-4 border-red-500 inline-block pb-1">
                        Tin tức & Sự kiện Nổi bật
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Tin tức 1 */}
                        <div
                            className="flex flex-col bg-white p-6 rounded-2xl shadow-lg border border-gray-100/50 
                          hover:shadow-2xl hover:scale-[1.02] transition duration-300 ease-in-out cursor-pointer"
                        >
                            <img
                                src="//bizweb.dktcdn.net/100/059/929/themes/76022/assets/sbbn-collec-1.jpg?1747711551525"
                                alt="Tin tức 1"
                                className="rounded-xl mb-5 aspect-video object-cover w-full"
                            />

                            {/* Bọc nội dung chính để nó co giãn */}
                            <div className="flex-grow text-left">
                                <h3 className="font-bold text-xl text-gray-900 mb-2 leading-snug">
                                    Hoạt động ngoại khóa tại Sakae
                                </h3>
                                <p className="text-red-600 font-medium text-sm mb-4">
                                    <time dateTime="2025-07-18">18 Tháng 7, 2025</time>
                                </p>
                                {/* Thêm đoạn tóm tắt ngắn để mô tả đầy đủ hơn */}
                                <p className="text-gray-600 mb-4 text-base line-clamp-3">
                                    Tham gia các hoạt động ngoại khóa giúp học viên rèn luyện kỹ năng mềm, tăng cường sự
                                    gắn kết và áp dụng tiếng Nhật vào đời sống thực tế.
                                </p>
                            </div>

                            {/* Link "Xem thêm" với style button nhẹ */}
                            <a
                                href="#"
                                className="mt-auto inline-flex items-center justify-start text-red-600 font-semibold hover:text-red-700 transition duration-150 group"
                            >
                                Xem chi tiết
                                <span className="ml-1 text-lg transform group-hover:translate-x-1 transition duration-150">
                                    →
                                </span>
                            </a>
                        </div>

                        {/* Tin tức 2 - Áp dụng style tương tự */}
                        <div
                            className="flex flex-col bg-white p-6 rounded-2xl shadow-lg border border-gray-100/50 
                          hover:shadow-2xl hover:scale-[1.02] transition duration-300 ease-in-out cursor-pointer"
                        >
                            <img
                                src="//bizweb.dktcdn.net/100/059/929/files/315712878-5624748057608095-2146620662772535775-n.png?v=1748232115899"
                                alt="Tin tức 2"
                                className="rounded-xl mb-5 aspect-video object-cover w-full"
                            />

                            <div className="flex-grow text-left">
                                <h3 className="font-bold text-xl text-gray-900 mb-2 leading-snug">
                                    Từ "gà mờ" đến thành thạo trợ từ tiếng Nhật, tham khảo bài viết dưới đây
                                </h3>
                                <p className="text-red-600 font-medium text-sm mb-4">
                                    <time dateTime="2025-05-26">26 Tháng 5, 2025</time>
                                </p>
                                <p className="text-gray-600 mb-4 text-base line-clamp-3">
                                    Bí quyết nắm vững các trợ từ quan trọng ($wa, ga, o, ni,...) trong tiếng Nhật giúp
                                    bạn giao tiếp và viết lách trôi chảy hơn ngay từ level N5.
                                </p>
                            </div>

                            <a
                                href="#"
                                className="mt-auto inline-flex items-center justify-start text-red-600 font-semibold hover:text-red-700 transition duration-150 group"
                            >
                                Xem chi tiết
                                <span className="ml-1 text-lg transform group-hover:translate-x-1 transition duration-150">
                                    →
                                </span>
                            </a>
                        </div>

                        {/* Tin tức 3 - Áp dụng style tương tự */}
                        <div
                            className="flex flex-col bg-white p-6 rounded-2xl shadow-lg border border-gray-100/50 
                          hover:shadow-2xl hover:scale-[1.02] transition duration-300 ease-in-out cursor-pointer"
                        >
                            <img
                                src="//bizweb.dktcdn.net/100/059/929/articles/493942609-1010388567893707-7651434882821413917-n.jpg?v=1745908085917"
                                alt="Tin tức 3"
                                className="rounded-xl mb-5 aspect-video object-cover w-full"
                            />

                            <div className="flex-grow text-left">
                                <h3 className="font-bold text-xl text-gray-900 mb-2 leading-snug">
                                    TỪ VỰNG BẢNG LƯƠNG CẦN BIẾT CHO CÁC BẠN SẮP SANG NHẬT
                                </h3>
                                <p className="text-red-600 font-medium text-sm mb-4">
                                    <time dateTime="2025-04-29">29 Tháng 4, 2025</time>
                                </p>
                                <p className="text-gray-600 mb-4 text-base line-clamp-3">
                                    Tổng hợp các từ vựng chuyên ngành liên quan đến bảng lương, thu nhập tại Nhật Bản,
                                    giúp bạn dễ dàng hòa nhập và hiểu rõ quyền lợi của mình.
                                </p>
                            </div>

                            <a
                                href="#"
                                className="mt-auto inline-flex items-center justify-start text-red-600 font-semibold hover:text-red-700 transition duration-150 group"
                            >
                                Xem chi tiết
                                <span className="ml-1 text-lg transform group-hover:translate-x-1 transition duration-150">
                                    →
                                </span>
                            </a>
                        </div>
                    </div>

                    {/* Nút xem tất cả */}
                    <div className="mt-12">
                        <a
                            href="/tin-tuc-su-kien"
                            className="bg-red-600 text-white font-bold py-3 px-8 rounded-full 
                           hover:bg-red-700 shadow-xl transition duration-300 transform hover:-translate-y-0.5"
                        >
                            Xem tất cả Tin tức
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Home;
