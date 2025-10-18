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
                <div className="absolute bottom-2 left-0 right-0 flex justify-center py-2">
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
                        <h2 className="text-4xl font-extrabold text-gray-800 mb-4">Về Trung tâm Nhật ngữ Sakae</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed text-justify">
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
                    <h2 className="text-4xl font-extrabold text-gray-800 mb-10">Khóa học nổi bật tại Sakae</h2>

                    <div className="grid md:grid-cols-4 gap-6">
                        {/* Khóa học 1 */}
                        <div className="cursor-pointer flex flex-col bg-gray-100 p-4 rounded-xl shadow hover:shadow-xl transition transform hover:translate-y-[-4px] ease-in-out duration-300">
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
                        <div className="cursor-pointer flex flex-col bg-gray-100 p-4 rounded-xl shadow hover:shadow-xl transition transform hover:translate-y-[-4px] ease-in-out duration-300">
                            <img
                                src="//bizweb.dktcdn.net/thumb/grande/100/059/929/products/colorful-online-course-facebook-post-recovered.png?v=1749625404853"
                                alt="Khóa học N5 - Cấp tốc (Online)"
                                className="rounded-lg mb-3"
                            />
                            <div className="flex-grow">
                                <h3 className="text-xl font-semibold mb-2">Khóa học N5 - Cấp tốc (Online)</h3>
                                <p className="text-gray-600 mb-5">
                                    Khóa tiếng Nhật cho người mới bắt đầu online, không có phương tiện di chuyển
                                </p>
                            </div>
                            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300 cursor-pointer transform hover:translate-y-[-4px] ease-in-out hover:shadow-lg">
                                Xem chi tiết
                            </button>
                        </div>

                        {/* Khóa học 3 */}
                        <div className="cursor-pointer flex flex-col bg-gray-100 p-4 rounded-xl shadow hover:shadow-xl transition transform hover:translate-y-[-4px] ease-in-out duration-300">
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
                        <div className="cursor-pointer flex flex-col bg-gray-100 p-4 rounded-xl shadow hover:shadow-xl transition transform hover:translate-y-[-4px] ease-in-out duration-300">
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

                    {/* Nút xem tất cả */}
                    <div className="mt-12">
                        <a
                            href="/tin-tuc-su-kien"
                            className="bg-red-600 text-white font-bold py-3 px-8 rounded-full 
                           hover:bg-red-700 shadow-xl transition duration-300 transform hover:-translate-y-0.5"
                        >
                            Xem tất cả khóa học
                        </a>
                    </div>
                </div>
            </section>

            {/* News Section */}
            <section className="py-20 bg-gray-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
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

                            <div className="flex-grow text-left">
                                <h3 className="font-bold text-xl text-gray-900 mb-2 leading-snug">
                                    Hoạt động ngoại khóa tại Sakae
                                </h3>
                                <p className="text-red-600 font-medium text-sm mb-4">
                                    <time dateTime="2025-07-18">18 Tháng 7, 2025</time>
                                </p>
                                <p className="text-gray-600 mb-4 text-base line-clamp-3">
                                    Tham gia các hoạt động ngoại khóa giúp học viên rèn luyện kỹ năng mềm, tăng cường sự
                                    gắn kết và áp dụng tiếng Nhật vào đời sống thực tế.
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

                        {/* Tin tức 2 */}
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

                        {/* Tin tức 3 */}
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

            {/* Testimonials Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-[40px] font-extrabold text-gray-900 mb-4">
                            Cảm nhận học viên <span className="text-red-600">Sakae</span>
                        </h2>
                        <p className="text-lg text-gray-600">
                            Lắng nghe chia sẻ từ những người đã tin tưởng lựa chọn Sakae.
                        </p>
                    </div>

                    {/* Slider container với hiệu ứng mờ (Fading effect) */}
                    <div className="relative">
                        <div className="hidden lg:block absolute inset-y-0 left-0 w-12 z-10 pointer-events-none bg-gradient-to-r from-gray-50 to-transparent"></div>
                        <div className="hidden lg:block absolute inset-y-0 right-0 w-12 z-10 pointer-events-none bg-gradient-to-l from-gray-50 to-transparent"></div>

                        <div className="mt-4 px-6 flex overflow-x-auto space-x-6 md:space-x-10 lg:space-x-8 snap-x snap-mandatory pb-8">
                            {/* Học viên 1 */}
                            <div className="snap-center flex-shrink-0 w-11/12 sm:w-2/3 md:w-[350px] lg:w-[380px] bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 border border-red-200 flex flex-col min-h-[320px]">
                                <svg
                                    className="w-10 h-10 text-red-300 opacity-75 mb-4 mx-auto"
                                    fill="currentColor"
                                    viewBox="0 0 32 32"
                                    aria-hidden="true"
                                >
                                    <path d="M9.333 22.583C13.083 22.583 16.167 19.5 16.167 15.75C16.167 11.917 13.083 8.833 9.333 8.833C5.583 8.833 2.5 11.917 2.5 15.75C2.5 21.083 9.333 29.5 9.333 29.5C9.333 29.5 10.5 22.583 9.333 22.583ZM22.667 22.583C26.417 22.583 29.5 19.5 29.5 15.75C29.5 11.917 26.417 8.833 22.667 8.833C18.917 8.833 15.833 11.917 15.833 15.75C15.833 21.083 22.667 29.5 22.667 29.5C22.667 29.5 23.833 22.583 22.667 22.583Z" />
                                </svg>
                                <div className="flex-grow text-center">
                                    <p className="text-lg text-gray-700 font-medium italic mb-6">
                                        “Sau khi đi Nhật về mình đã tham gia lớp học N2 tại trung tâm. Giáo viên nhiệt
                                        tình. Chương trình giảng dạy bám sát đề thi jlpt. Chỉ sau 1 khóa mình đã có bằng
                                        N2. Cảm ơn thầy cô và trung tâm đã hỗ trợ mình.”
                                    </p>
                                </div>
                                <div className="mt-auto pt-4 border-t border-gray-100 text-center flex flex-col items-center">
                                    <img
                                        src="//bizweb.dktcdn.net/100/059/929/themes/76022/assets/testimonial-avatar-1.jpg?1747711551525"
                                        alt="Nguyễn Ngọc Linh"
                                        className="w-16 h-16 rounded-full object-cover ring-2 ring-red-500 mb-2"
                                    />
                                    <h4 className="font-bold text-xl text-gray-900">Nguyễn Ngọc Linh</h4>
                                    <p className="text-sm text-red-600">Nhân viên văn phòng</p>
                                </div>
                            </div>

                            {/* Học viên 2*/}
                            <div className="snap-center flex-shrink-0 w-11/12 sm:w-2/3 md:w-[350px] lg:w-[380px] bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 border border-red-200 flex flex-col min-h-[320px]">
                                <svg
                                    className="w-10 h-10 text-red-300 opacity-75 mb-4 mx-auto"
                                    fill="currentColor"
                                    viewBox="0 0 32 32"
                                    aria-hidden="true"
                                >
                                    <path d="M9.333 22.583C13.083 22.583 16.167 19.5 16.167 15.75C16.167 11.917 13.083 8.833 9.333 8.833C5.583 8.833 2.5 11.917 2.5 15.75C2.5 21.083 9.333 29.5 9.333 29.5C9.333 29.5 10.5 22.583 9.333 22.583ZM22.667 22.583C26.417 22.583 29.5 19.5 29.5 15.75C29.5 11.917 26.417 8.833 22.667 8.833C18.917 8.833 15.833 11.917 15.833 15.75C15.833 21.083 22.667 29.5 22.667 29.5C22.667 29.5 23.833 22.583 22.667 22.583Z" />
                                </svg>
                                <div className="flex-grow text-center">
                                    <p className="text-lg text-gray-700 font-medium italic mb-6">
                                        “Môi trường học ở Sakae rất thân thiện. Mình thích nhất là các buổi hội thoại
                                        thực tế với giáo viên Nhật – giúp cải thiện phản xạ rất nhanh.”
                                    </p>
                                </div>
                                <div className="mt-auto pt-4 border-t border-gray-100 text-center flex flex-col items-center">
                                    <img
                                        src="//bizweb.dktcdn.net/100/059/929/themes/76022/assets/testimonial-avatar-2.jpg?1747711551525"
                                        alt="Võ Ngọc Hoàng Vinh"
                                        className="w-16 h-16 rounded-full object-cover ring-2 ring-red-500 mb-2"
                                    />
                                    <h4 className="font-bold text-xl text-gray-900">Võ Ngọc Hoàng Vinh</h4>
                                    <p className="text-sm text-red-600">Sinh viên ĐH SPKT</p>
                                </div>
                            </div>

                            {/* Học viên 3 */}
                            <div className="snap-center flex-shrink-0 w-11/12 sm:w-2/3 md:w-[350px] lg:w-[380px] bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 border border-red-200 flex flex-col min-h-[320px]">
                                <svg
                                    className="w-10 h-10 text-red-300 opacity-75 mb-4 mx-auto"
                                    fill="currentColor"
                                    viewBox="0 0 32 32"
                                    aria-hidden="true"
                                >
                                    <path d="M9.333 22.583C13.083 22.583 16.167 19.5 16.167 15.75C16.167 11.917 13.083 8.833 9.333 8.833C5.583 8.833 2.5 11.917 2.5 15.75C2.5 21.083 9.333 29.5 9.333 29.5C9.333 29.5 10.5 22.583 9.333 22.583ZM22.667 22.583C26.417 22.583 29.5 19.5 29.5 15.75C29.5 11.917 26.417 8.833 22.667 8.833C18.917 8.833 15.833 11.917 15.833 15.75C15.833 21.083 22.667 29.5 22.667 29.5C22.667 29.5 23.833 22.583 22.667 22.583Z" />
                                </svg>
                                <div className="flex-grow text-center">
                                    <p className="text-lg text-gray-700 font-medium italic mb-6">
                                        “Em rất hài lòng với điều kiện học tập ở đây khi lớp học không quá đông, được
                                        trang bị máy điều hoà nhưng mức học phí lại rất vừa phải, phù hợp với nhiều đối
                                        tượng, nhất là các bạn học sinh, sinh viên.”
                                    </p>
                                </div>
                                <div className="mt-auto pt-4 border-t border-gray-100 text-center flex flex-col items-center">
                                    <img
                                        src="//bizweb.dktcdn.net/100/059/929/themes/76022/assets/testimonial-avatar-3.jpg?1747711551525"
                                        alt="Hoàng Huyền Trang"
                                        className="w-16 h-16 rounded-full object-cover ring-2 ring-red-500 mb-2"
                                    />
                                    <h4 className="font-bold text-xl text-gray-900">Hoàng Huyền Trang</h4>
                                    <p className="text-sm text-red-600">Sinh viên ĐH Ngân Hàng TPHCM</p>
                                </div>
                            </div>

                            {/* Học viên 4 */}
                            <div className="snap-center flex-shrink-0 w-11/12 sm:w-2/3 md:w-[350px] lg:w-[380px] bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 border border-red-200 flex flex-col min-h-[320px]">
                                <svg
                                    className="w-10 h-10 text-red-300 opacity-75 mb-4 mx-auto"
                                    fill="currentColor"
                                    viewBox="0 0 32 32"
                                    aria-hidden="true"
                                >
                                    <path d="M9.333 22.583C13.083 22.583 16.167 19.5 16.167 15.75C16.167 11.917 13.083 8.833 9.333 8.833C5.583 8.833 2.5 11.917 2.5 15.75C2.5 21.083 9.333 29.5 9.333 29.5C9.333 29.5 10.5 22.583 9.333 22.583ZM22.667 22.583C26.417 22.583 29.5 19.5 29.5 15.75C29.5 11.917 26.417 8.833 22.667 8.833C18.917 8.833 15.833 11.917 15.833 15.75C15.833 21.083 22.667 29.5 22.667 29.5C22.667 29.5 23.833 22.583 22.667 22.583Z" />
                                </svg>
                                <div className="flex-grow text-center">
                                    <p className="text-lg text-gray-700 font-medium italic mb-6">
                                        “Cảm ơn Thầy Kurita, quá trình học tại trung tâm đọng lại trong em rất nhiều kỷ
                                        niệm. Thầy đã cho em thấy được sự thú vị của tiếng Nhật, không hề khó như các
                                        bạn đã nghĩ.”
                                    </p>
                                </div>
                                <div className="mt-auto pt-4 border-t border-gray-100 text-center flex flex-col items-center">
                                    <img
                                        src="//bizweb.dktcdn.net/100/059/929/themes/76022/assets/testimonial-avatar-4.jpg?1747711551525"
                                        alt="Nguyễn Thị Tuyết Hảo"
                                        className="w-16 h-16 rounded-full object-cover ring-2 ring-red-500 mb-2"
                                    />
                                    <h4 className="font-bold text-xl text-gray-900">Nguyễn Thị Tuyết Hảo</h4>
                                    <p className="text-sm text-red-600">Sinh viên ĐH Xã Hội- Nhân Văn</p>
                                </div>
                            </div>

                            {/* Học viên 5 */}
                            <div className="snap-center flex-shrink-0 w-11/12 sm:w-2/3 md:w-[350px] lg:w-[380px] bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 border border-red-200 flex flex-col min-h-[320px]">
                                <svg
                                    className="w-10 h-10 text-red-300 opacity-75 mb-4 mx-auto"
                                    fill="currentColor"
                                    viewBox="0 0 32 32"
                                    aria-hidden="true"
                                >
                                    <path d="M9.333 22.583C13.083 22.583 16.167 19.5 16.167 15.75C16.167 11.917 13.083 8.833 9.333 8.833C5.583 8.833 2.5 11.917 2.5 15.75C2.5 21.083 9.333 29.5 9.333 29.5C9.333 29.5 10.5 22.583 9.333 22.583ZM22.667 22.583C26.417 22.583 29.5 19.5 29.5 15.75C29.5 11.917 26.417 8.833 22.667 8.833C18.917 8.833 15.833 11.917 15.833 15.75C15.833 21.083 22.667 29.5 22.667 29.5C22.667 29.5 23.833 22.583 22.667 22.583Z" />
                                </svg>
                                <div className="flex-grow text-center">
                                    <p className="text-lg text-gray-700 font-medium italic mb-6">
                                        “Học Nhật ngữ là một quá trình lâu dài và đòi hỏi sự kiên trì. Đó cũng chính là
                                        điều mà thầy luôn luôn nhắc nhở và động viên học sinh của mình để mọi người cố
                                        gắng và không bỏ cuộc giữa chừng.”
                                    </p>
                                </div>
                                <div className="mt-auto pt-4 border-t border-gray-100 text-center flex flex-col items-center">
                                    <img
                                        src="//bizweb.dktcdn.net/100/059/929/themes/76022/assets/testimonial-avatar-5.jpg?1747711551525"
                                        alt="Nguyễn Đỗ Khắc Hiếu"
                                        className="w-16 h-16 rounded-full object-cover ring-2 ring-red-500 mb-2"
                                    />
                                    <h4 className="font-bold text-xl text-gray-900">Nguyễn Đỗ Khắc Hiếu</h4>
                                    <p className="text-sm text-red-600">Sinh viên ĐH Nông Lâm</p>
                                </div>
                            </div>

                            {/* Học viên 6 */}
                            <div className="snap-center flex-shrink-0 w-11/12 sm:w-2/3 md:w-[350px] lg:w-[380px] bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 border border-red-200 flex flex-col min-h-[320px]">
                                <svg
                                    className="w-10 h-10 text-red-300 opacity-75 mb-4 mx-auto"
                                    fill="currentColor"
                                    viewBox="0 0 32 32"
                                    aria-hidden="true"
                                >
                                    <path d="M9.333 22.583C13.083 22.583 16.167 19.5 16.167 15.75C16.167 11.917 13.083 8.833 9.333 8.833C5.583 8.833 2.5 11.917 2.5 15.75C2.5 21.083 9.333 29.5 9.333 29.5C9.333 29.5 10.5 22.583 9.333 22.583ZM22.667 22.583C26.417 22.583 29.5 19.5 29.5 15.75C29.5 11.917 26.417 8.833 22.667 8.833C18.917 8.833 15.833 11.917 15.833 15.75C15.833 21.083 22.667 29.5 22.667 29.5C22.667 29.5 23.833 22.583 22.667 22.583Z" />
                                </svg>
                                <div className="flex-grow text-center">
                                    <p className="text-lg text-gray-700 font-medium italic mb-6">
                                        “Tiếng Nhật tuy khó nhưng lại rất thú vị đặc biệt là chữ Kanji. Đến với lớp học,
                                        mình được giáo viên hướng dẫn rất nhiệt tình và mình nhận ra học tiếng Nhật thật
                                        là vui.”
                                    </p>
                                </div>
                                <div className="mt-auto pt-4 border-t border-gray-100 text-center flex flex-col items-center">
                                    <img
                                        src="//bizweb.dktcdn.net/100/059/929/themes/76022/assets/testimonial-avatar-6.jpg?1747711551525"
                                        alt="Trịnh Minh Phát"
                                        className="w-16 h-16 rounded-full object-cover ring-2 ring-red-500 mb-2"
                                    />
                                    <h4 className="font-bold text-xl text-gray-900">Trịnh Minh Phát</h4>
                                    <p className="text-sm text-red-600">Sinh viên CĐ Công Nghệ Thủ Đức</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Home;
