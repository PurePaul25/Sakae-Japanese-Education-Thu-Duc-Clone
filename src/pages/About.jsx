import React from 'react';
import ScrollToTopButton from '../components/layout/ScrollToTopButton';

function About() {
    return (
        <div className="pt-30 pb-16 bg-gray-50 text-gray-800">
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
                            src="//bizweb.dktcdn.net/100/059/929/themes/76022/assets/logo-2-1.jpg?1747711551525"
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
                <h2 className="text-4xl font-extrabold text-gray-800 mb-12 border-b-2 border-red-300 inline-block px-4 pb-1">
                    Đội ngũ Giảng viên
                </h2>
                <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            name: 'Phương Thảo Sensei',
                            role: 'Giảng viên N2',
                            exp: '12 năm kinh nghiệm, sống tại Tokyo 5 năm.',
                        },
                        {
                            name: 'Nishimiya Sensei',
                            role: 'Giảng viên Bản ngữ',
                            exp: 'Chuyên sâu về phương pháp học tiếng Nhật hiệu quả và giao tiếp tự nhiên.',
                        },
                        {
                            name: 'Kurita Sensei',
                            role: 'Giảng viên Sơ cấp',
                            exp: 'Hỗ trợ hơn 100 học viên du học thành công tại Nhật Bản.',
                        },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="
                        bg-white p-6 rounded-lg shadow-md border border-gray-200 
                        hover:bg-red-50 hover:shadow-lg transform hover:scale-[1.02]
                        transition duration-300
                    "
                        >
                            {/* Placeholder Ảnh/Avatar */}
                            <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-4xl font-bold text-gray-600">
                                {item.name.charAt(0)}
                            </div>

                            <h3 className="text-xl font-extrabold text-gray-800 mb-1">{item.name}</h3>
                            <p className="text-red-600 font-semibold mb-3">{item.role}</p>
                            <p className="text-gray-700 text-sm italic">{item.exp}</p>
                        </div>
                    ))}
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
                            desc: 'Trang bị máy chiếu, máy lạnh và hệ thống âm thanh tiêu chuẩn, tạo môi trường thoải mái nhất.',
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
            <ScrollToTopButton />
        </div>
    );
}

export default About;
