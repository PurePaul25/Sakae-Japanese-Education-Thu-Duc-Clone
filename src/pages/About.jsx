import React from 'react';
import ScrollToTopButton from '../components/layout/ScrollToTopButton';
import SEO from '../hooks/useSEO.jsx';
import { ASSETS } from '../constants/assets';

function About() {
    return (
        <div className="pt-30 pb-16 bg-gray-50 text-gray-800">
            <SEO page="about" />
            {/* 1. Giới thiệu Chính (Header Section) */}
            <section className="max-w-6xl mx-auto px-4 text-center mb-8 border-b border-gray-200 pb-8">
                <h1 className="text-5xl font-extrabold text-red-600 mb-6 border-b-4 border-red-100 inline-block px-4 pb-1">
                    Về Trung tâm Nhật ngữ Sakae
                </h1>
                <p className="text-lg md:text-xl font-medium text-gray-700 leading-relaxed max-w-5xl mx-auto mb-4">
                    Trung tâm Nhật ngữ Sakae là nơi đào tạo tiếng Nhật chuyên sâu với đội ngũ giảng viên tận tâm và
                    chương trình học chất lượng, giúp học viên đạt được mục tiêu du học, làm việc và phát triển bản
                    thân.
                </p>
            </section>

            {/* 2. Ảnh + Sứ mệnh */}
            <section className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid md:grid-cols-2 gap-12 items-center bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-red-300">
                    {/* Cột 1: Nội dung Sứ mệnh */}
                    <div className="order-1">
                        <h2 className="text-3xl font-extrabold mb-5 text-red-600 leading-tight border-b-2 border-red-300 pb-2">
                            Sứ mệnh của chúng tôi
                        </h2>
                        <p className="text-gray-700 text-lg mb-4">
                            <span className="text-xl font-bold text-blue-500 mr-2">✓</span>
                            Sakae hướng đến việc trở thành cầu nối giữa Việt Nam và Nhật Bản, giúp học viên không chỉ
                            giỏi tiếng Nhật mà còn am hiểu văn hóa, phong cách làm việc của người Nhật.
                        </p>
                        <p className="text-gray-700 text-lg">
                            <span className="text-xl font-bold text-blue-500 mr-2">✓</span>
                            Với hơn 10 năm kinh nghiệm giảng dạy, Sakae luôn đồng hành cùng học viên trong hành trình
                            chinh phục tiếng Nhật, từ những bài học cơ bản đến luyện thi JLPT N1 - N5.
                        </p>
                    </div>

                    {/* Cột 2: Ảnh */}
                    <div className="order-2">
                        <img
                            src={ASSETS.BANNERS.ABOUT_PAGE}
                            alt="About Sakae"
                            className="rounded-xl shadow-lg w-full h-auto transition duration-300 ease-in-out transform hover:scale-[1.02]"
                        />
                    </div>
                </div>
            </section>

            {/* 3. Giá trị cốt lõi (Sử dụng Divider và Border nổi bật) */}
            <section className="max-w-6xl mx-auto px-4 mt-10 text-center border-t border-gray-200 pt-10">
                <h2 className="text-4xl font-extrabold text-gray-800 mb-12 border-b-2 border-red-300 inline-block px-4 pb-1">
                    Giá trị cốt lõi
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        {
                            title: 'Tận tâm',
                            icon: '❤️',
                            desc: 'Giảng viên luôn theo sát từng học viên, hỗ trợ tận tình và tâm huyết với công việc giảng dạy.',
                        },
                        {
                            title: 'Chất lượng',
                            icon: '🌟',
                            desc: 'Chương trình học được cập nhật liên tục, phù hợp mọi trình độ. Với trang thiết bị hiện đại, tất cả các phòng học được trang bị máy lạnh sẽ mang đến cho học viên một môi trường học tập thoải mái nhất.',
                        },
                        {
                            title: 'Hiệu quả',
                            icon: '🚀',
                            desc: 'Cam kết kết quả học tập rõ ràng và tiến bộ thực tế. Luôn đặt mục tiêu N5-N1 của học viên lên hàng đầu.',
                        },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="
                        bg-white p-6 rounded-lg shadow-md border border-gray-200 
                        hover:shadow-xl hover:shadow-red-100 transform hover:translate-y-[-8px] 
                        transition duration-300
                    "
                        >
                            <div className="text-4xl mb-3 text-red-600">{item.icon}</div>
                            <h3 className="text-xl font-bold text-red-600 mb-2">{item.title}</h3>
                            <p className="text-gray-600">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. Đội ngũ Giảng viên Chuyên nghiệp (Sử dụng Card và chia 3 cột) */}
            <section className="max-w-6xl mx-auto px-4 mt-10 text-center border-t border-gray-200 pt-10">
                <h2 className="text-4xl font-extrabold text-gray-800 mb-4 border-b-2 border-red-300 inline-block px-4 pb-1">
                    Đội ngũ Giảng viên
                </h2>

                <p className="text-gray-600 mb-6 max-w-4xl mx-auto md:text-lg leading-relaxed">
                    Đội ngũ giáo viên Nhật – Việt được đào tạo bài bản, tận tình với học viên và tâm huyết với công việc
                    giảng dạy. Chúng tôi cam kết chất lượng đầu ra dựa trên các tiêu chuẩn khắt khe và tốt nhất
                </p>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Giáo viên Nhật Bản */}
                    <div className="bg-gradient-to-br from-white to-red-50/30 p-5 rounded-3xl border border-red-100 shadow-sm hover:shadow-md transition-all duration-300 text-left relative overflow-hidden group">
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-red-500/5 rounded-full group-hover:scale-110 transition-transform duration-500"></div>

                        <div className="flex items-center gap-4 mb-4">
                            {/* Flag Japan */}
                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                <div className="w-full h-full bg-white flex items-center justify-center border border-gray-100">
                                    <div className="w-5 h-5 bg-red-500 rounded-full"></div>
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-gray-800">Giáo viên Nhật Bản</h3>
                        </div>

                        <p className="text-gray-700 leading-relaxed text-justify font-medium">
                            Đạt Chứng chỉ Năng lực Giáo dục Nhật Ngữ hoặc hoàn thành Chương trình Đào tạo Giáo viên
                            Tiếng Nhật 420 giờ, có bề dày kinh nghiệm giảng dạy thực tế.
                        </p>
                    </div>

                    {/* Giáo viên Việt Nam */}
                    <div className="bg-gradient-to-br from-white to-red-50/30 p-5 rounded-3xl border border-red-100 shadow-sm hover:shadow-md transition-all duration-300 text-left relative overflow-hidden group">
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-red-500/5 rounded-full group-hover:scale-110 transition-transform duration-500"></div>

                        <div className="flex items-center gap-4 mb-4">
                            {/* Flag Vietnam */}
                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                <div className="w-full h-full bg-red-500 flex items-center justify-center">
                                    <span className="text-yellow-300 text-2xl">★</span>
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-gray-800">Giáo viên Việt Nam</h3>
                        </div>

                        <p className="text-gray-700 leading-relaxed text-justify font-medium">
                            Đạt trình độ tối thiểu tương đương N3, am hiểu tâm lý học viên Việt Nam và sở hữu phương
                            pháp sư phạm truyền cảm hứng.
                        </p>
                    </div>
                </div>
            </section>

            {/* 5. Cơ sở vật chất & Môi trường học tập (Sử dụng List với Icon) */}
            <section className="max-w-6xl mx-auto px-4 mt-10 border-t border-gray-200 pt-10">
                <h2 className="text-4xl font-extrabold text-gray-800 mb-12 text-center border-b-2 border-red-300 inline-block px-4 pb-1">
                    Cơ sở vật chất
                </h2>

                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 text-left">
                    {[
                        {
                            title: 'Phòng học hiện đại',
                            icon: '🖥️',
                            desc: 'Trang bị thiết bị thông minh, máy lạnh và âm thanh tiêu chuẩn, tạo môi trường thoải mái nhất.',
                        },
                        {
                            title: 'Hoạt động học tập đa dạng',
                            icon: '🎉',
                            desc: 'Các buổi hoạt động văn hóa trải nghiệm giúp học viên thực hành ngôn ngữ trong môi trường thực tế.',
                        },
                        {
                            title: 'Không gian chung thân thiện',
                            icon: '🍵',
                            desc: 'Khu vực tự học và nghỉ ngơi được thiết kế ấm cúng, là nơi trao đổi kiến thức và kết nối.',
                        },
                        {
                            title: 'Vị trí thuận lợi',
                            icon: '📍',
                            desc: 'Trung tâm nằm tại khu vực dễ dàng di chuyển, gần các phương tiện giao thông công cộng.',
                        },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200 transform hover:scale-105 transition duration-200"
                        >
                            <div className="text-3xl pt-1 text-blue-600">{item.icon}</div>
                            <div>
                                <h3 className="text-xl font-bold text-red-600 mb-1">{item.title}</h3>
                                <p className="text-gray-700">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 5. Cơ sở vật chất & Môi trường học tập (Sử dụng List với Icon) */}
            <section className="max-w-6xl mx-auto px-4 mt-10 border-t border-gray-200 pt-10">
                <h2 className="text-4xl font-extrabold text-gray-800 mb-4 text-center border-b-2 border-red-300 inline-block px-4 pb-1">
                    Tài liệu, giáo trình
                </h2>

                <div className="text-gray-700 text-lg leading-relaxed">
                    <p>Tài liệu do giáo viên của trung tâm tự biên soạn.</p>
                    <p>Chương trình sơ cấp và trung cấp: Giáo trình chuẩn
                        quốc tế Minna no Nihongo (bản phát hành chính thức). 
                    </p>
                    <p>Lớp Luyện thi: Đào tạo theo Hệ thống Bằng Năng
                        lực Nhật ngữ Quốc tế, luôn cập nhật thông tin mới nhất.
                    </p>
                </div>
            </section>

            <h3 className="max-w-6xl mx-auto text-2xl font-bold text-red-500 px-4 mt-10">
                HÃY ĐẾN VỚI CHÚNG TÔI VÀ CẢM NHẬN!
            </h3>
            <ScrollToTopButton />
        </div>
    );
}

export default About;
