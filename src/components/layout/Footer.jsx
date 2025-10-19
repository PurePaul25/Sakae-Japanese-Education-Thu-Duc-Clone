import { FaFacebookF, FaTiktok } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';

function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 pt-10 pb-4 mt-10">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 sm:grid-cols-2 gap-8 text-center md:text-left">
                <div>
                    <h3 className="relative pb-2 text-xl font-bold text-white mb-5 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[3px] after:bg-red-500 after:rounded-lg">
                        Bản đồ
                    </h3>
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3140.1714859250465!2d106.75097367909284!3d10.85236262508735!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527961182054f%3A0x6c8bd7cb6c69733a!2zVHJ1bmcgdMOibSBOaOG6rXQgbmfhu68gU2FrYWUgVGjhu6cgxJDhu6lj!5e0!3m2!1svi!2s!4v1760244833138!5m2!1svi!2s"
                        className="w-full h-50 rounded-lg border-0"
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Sakae Location Map"
                    ></iframe>
                </div>
                <div>
                    <h3 className="relative pb-2 text-xl font-bold text-white mb-5 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[3px] after:bg-red-500 after:rounded-lg">
                        SAKAE
                    </h3>
                    <p>Trung tâm Nhật ngữ Sakae – Cùng bạn chinh phục tiếng Nhật</p>
                </div>
                <div>
                    <h3 className="relative pb-2 text-xl font-bold text-white mb-5 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[3px] after:bg-red-500 after:rounded-lg">
                        Chi nhánh và Liên hệ
                    </h3>
                    <p>📍 11 Đường số 2, Khu phố 3 P.Linh Tây, Q.Thủ Đức</p>
                    <a
                        href="tel:02837201830"
                        className="block transition-all duration-300 hover:translate-x-2 hover:text-red-500"
                    >
                        📞 028 3720 1830
                    </a>
                    <a
                        href="mailto:tuvan@sakae.edu.vn"
                        className="block transition-all duration-300 hover:translate-x-2 hover:text-red-500"
                    >
                        📧 tuvan@sakae.edu.vn
                    </a>
                </div>
                <div>
                    <h3 className="relative pb-2 text-xl font-bold text-white mb-5 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[3px] after:bg-red-500 after:rounded-lg">
                        Theo dõi chúng tôi
                    </h3>
                    <div className="flex gap-6 text-[22px] justify-center md:justify-start">
                        <a
                            href="https://www.facebook.com/people/Ti%E1%BA%BFng-Nh%E1%BA%ADt-Sakae-Th%E1%BB%A7-%C4%90%E1%BB%A9c/100093308666371/"
                            className="hover:text-white transform hover:bg-blue-600 hover:rounded-[50%] hover:p-1 hover:scale-130 transition-all duration-300"
                            target="_blank"
                        >
                            <FaFacebookF />
                        </a>
                        <a
                            href="https://www.tiktok.com/@nhatngusakaethuduc?is_from_webapp=1&sender_device=pc"
                            className="hover:text-white transform hover:scale-130 hover:bg-black hover:rounded-[50%] hover:p-1 transition-all duration-300"
                            target="_blank"
                        >
                            <FaTiktok />
                        </a>
                        <a
                            href="https://zalo.me/0945716530"
                            className="hover:text-blue-500 transform hover:scale-130 hover:bg-white hover:rounded-xl hover:p-1 transition-all duration-300"
                            target="_blank"
                        >
                            <SiZalo />
                        </a>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl border-t-2 border-gray-700 mx-auto mt-8 pt-4 pb-1">
                <p className="text-center text-gray-500 mt-1 md:text-sm text-[12px]">
                    © 2025 NHẬT NGỮ SAKAE THỦ ĐỨC. Được làm bởi PurePeter
                </p>
            </div>
        </footer>
    );
}

export default Footer;
