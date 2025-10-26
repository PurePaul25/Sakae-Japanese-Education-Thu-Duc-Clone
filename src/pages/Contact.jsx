import React, { useState } from 'react';
import ScrollToTopButton from '../components/layout/ScrollToTopButton';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });

    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    // ✅ Validate dữ liệu
    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập họ tên!';
        if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email!';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ!';
        if (!formData.message.trim()) newErrors.message = 'Vui lòng nhập nội dung liên hệ!';
        return newErrors;
    };

    // ✅ Khi nhấn Gửi form
    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = validate();

        if (Object.keys(newErrors).length === 0) {
            console.log('Form submitted:', formData);
            setSubmitted(true);
            setFormData({ name: '', email: '', message: '' });

            setErrors({});
            // Tự động ẩn thông báo sau 4.5 giây (4s cho animation + 0.5s cho hiệu ứng ẩn)
            setTimeout(() => {
                setSubmitted(false);
            }, 4500);
        } else {
            setErrors(newErrors);
            setSubmitted(false);
        }
    };

    // Hàm đóng thông báo
    const handleClose = () => {
        setSubmitted(false);
    };
    return (
        <div className="pt-28 pb-14 bg-gray-100 text-gray-800">
            {/* Toast Notification - Thông báo nổi */}
            <div
                className={`fixed top-24 right-5 z-50 transition-all duration-500 ease-in-out ${
                    submitted ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                }`}
            >
                <div
                    className="bg-green-200 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-lg relative"
                    role="alert"
                >
                    <button
                        onClick={handleClose}
                        className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 cursor-pointer"
                    >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                    <p className="font-bold">Gửi thành công!</p>
                    <p>Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể.</p>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500">
                        <div
                            className={`bg-green-700 h-1 rounded-lg ${
                                submitted ? 'w-0 transition-all duration-[4000ms] ease-linear' : 'w-full'
                            }`}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Tiêu đề trang */}
            <section className="text-center mb-12 px-4">
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
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden grid md:grid-cols-2">
                    {/* Cột trái - Thông tin liên hệ */}
                    <div className="p-8 lg:p-12 bg-red-50/50">
                        <h2 className="text-3xl font-bold text-red-600 mb-4">Thông tin liên hệ</h2>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Bạn có thể liên hệ trực tiếp với chúng tôi qua các thông tin dưới đây hoặc điền vào biểu mẫu
                            bên cạnh.
                        </p>

                        <ul className="space-y-6">
                            {[
                                {
                                    icon: '📍',
                                    text: '11 Đường số 2, Khu phố 3 P.Linh Tây, Q.Thủ Đức',
                                    href: 'https://maps.app.goo.gl/VmtnDphVKqbr3pa6A',
                                },
                                { icon: '📞', text: '028 3720 1830', href: 'tel:02837201830' },
                                { icon: '📧', text: 'tuvan@sakae.edu.vn', href: 'mailto:tuvan@sakae.edu.vn' },
                                {
                                    icon: '🕒',
                                    text: 'Thời gian làm việc: Sáng : 8h30 - 20h50 (Thứ 2 - Thứ 7)',
                                },
                            ].map((item) => (
                                <li key={item.icon} className="flex items-start">
                                    <span className="text-lg mr-2">{item.icon}</span>
                                    <a
                                        href={item.href || '#'}
                                        className="text-gray-700 mt-0.5 transform transition hover:translate-x-1.5 duration-300 hover:text-red-600"
                                    >
                                        {item.text}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Cột phải - Form liên hệ */}
                    <form onSubmit={handleSubmit} className="p-8 lg:p-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Gửi tin nhắn cho chúng tôi</h2>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
                                    Họ tên
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition duration-200"
                                    placeholder="Nguyễn Văn A"
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition duration-200"
                                    placeholder="email@example.com"
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-gray-700 font-semibold mb-2">
                                    Nội dung
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows="5"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition duration-200 resize-none"
                                    placeholder="Nhập nội dung bạn muốn gửi..."
                                />
                                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full cursor-pointer mt-6 bg-red-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Gửi liên hệ
                        </button>
                    </form>
                </div>
            </section>
            <ScrollToTopButton />
        </div>
    );
};

export default Contact;
