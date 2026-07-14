import React from 'react';
import ScrollToTopButton from '../components/layout/ScrollToTopButton';
import SEO from '../hooks/useSEO';

const Contact = () => {
    return (
        <div className="pt-24 pb-12 bg-gray-100 text-gray-800">
            <SEO page="contact" />

            {/* Tiêu đề trang */}
            <section className="text-center mb-6 px-4">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
                    Liên hệ & <span className="text-red-600">Hỗ trợ</span>
                </h1>
                <p className="text-lg text-gray-600 max-w-4xl mx-auto">
                    Sakae luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn. Đừng ngần ngại kết nối với chúng
                    tôi!
                </p>
            </section>

            {/* Nội dung chính */}
            <section className="max-w-6xl mx-auto px-4">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-6 bg-red-100/50">
                        {/* Thời gian làm việc */}
                        <h2 className="text-3xl font-bold text-red-600 mb-2">Thời gian làm việc</h2>
                        <h2 className="text-xl font-bold uppercase mb-1">Từ thứ 2 - thứ 7:</h2>
                        <p className="text-gray-600 leading-relaxed text-xl ml-6">+) Sáng: 8h30 - 11h30</p>
                        <p className="text-gray-600 leading-relaxed text-xl ml-6">+) Chiều: 13h30 - 20h50</p>
                        <h2 className="text-xl font-bold uppercase mb-1">
                            Chủ Nhật:{' '}
                            <span className="text-gray-600 leading-relaxed font-normal lowercase">8h30 - 10h</span>
                        </h2>

                        {/* Thông tin liên hệ */}
                        <h2 className="text-3xl font-bold text-red-600 mb-2 mt-4 border-t border-gray-500 pt-4">
                            Thông tin liên hệ
                        </h2>

                        <ul className="space-y-2">
                            {[
                                {
                                    icon: '📍',
                                    text: '11 Đường số 2, Khu phố 3 (Khu 301), P. Linh Tây, TP. Thủ Đức, TP. Hồ Chí Minh',
                                    href: 'https://maps.app.goo.gl/VmtnDphVKqbr3pa6A',
                                },
                                {
                                    icon: '📞',
                                    text: 'Điện thoại: 028 3720 1830',
                                    href: 'tel:02837201830',
                                },
                                {
                                    icon: '📱',
                                    text: 'Hotline/Zalo: 0945 716 530',
                                    href: 'tel:0945716530',
                                },
                                {
                                    icon: '📧',
                                    text: 'Email: tuvan@sakae.edu.vn',
                                    href: 'mailto:tuvan@sakae.edu.vn',
                                },
                                {
                                    icon: '🌐',
                                    text: 'Facebook: Trung tâm Nhật ngữ Sakae',
                                    href: 'https://www.facebook.com/people/Ti%E1%BA%BFng-Nh%E1%BA%ADt-Sakae-Th%E1%BB%A7-%C4%90%E1%BB%A9c/100093308666371/',
                                },
                            ].map((item) => (
                                <li key={item.icon} className="flex items-start">
                                    <span className="text-lg mr-2">{item.icon}</span>

                                    {item.href ? (
                                        <a
                                            href={item.href}
                                            target={item.href.startsWith('http') ? '_blank' : undefined}
                                            rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                            className="text-gray-700 mt-0.5 transition duration-300 hover:text-red-600 hover:translate-x-1.5"
                                        >
                                            {item.text}
                                        </a>
                                    ) : (
                                        <span className="text-gray-700 mt-0.5">{item.text}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>
            <ScrollToTopButton />
        </div>
    );
};

export default Contact;
