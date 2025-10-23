import { Link } from 'react-router-dom';

export default function CoursesSection() {
    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <h2 className="text-4xl font-extrabold text-gray-800 mb-10">Khóa học nổi bật tại Sakae</h2>

                <div className="grid lg:grid-cols-4 sm:grid-cols-2 gap-6">
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
                                Sử dụng phương pháp giảng dạy trực quang sinh động, giúp người học nắm chắc ngữ pháp và
                                từ vựng (Trung Cấp)
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
                                Khóa học dành cho những người đã học qua tiếng Nhật cơ bản, muốn thi lấy chứng chỉ N4
                                trong thời gian ngắn (Sơ Trung Cấp)
                            </p>
                        </div>
                        <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300 cursor-pointer transform hover:translate-y-[-4px] ease-in-out hover:shadow-lg">
                            Xem chi tiết
                        </button>
                    </div>
                </div>

                {/* Nút xem tất cả */}
                <div className="mt-12">
                    <Link
                        to="/thong-tin-lop-hoc"
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
