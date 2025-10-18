export default function NewsSection() {
    return (
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
                                Tham gia các hoạt động ngoại khóa giúp học viên rèn luyện kỹ năng mềm, tăng cường sự gắn
                                kết và áp dụng tiếng Nhật vào đời sống thực tế.
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
                                Bí quyết nắm vững các trợ từ quan trọng ($wa, ga, o, ni,...) trong tiếng Nhật giúp bạn
                                giao tiếp và viết lách trôi chảy hơn ngay từ level N5.
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
                                Tổng hợp các từ vựng chuyên ngành liên quan đến bảng lương, thu nhập tại Nhật Bản, giúp
                                bạn dễ dàng hòa nhập và hiểu rõ quyền lợi của mình.
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
    );
}
