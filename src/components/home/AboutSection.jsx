import { Link } from 'react-router-dom';
import aboutBanner from '../../assets/aboutBanner.jpg';

export default function AboutSection() {
    return (
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
                    <Link
                        to="/gioi-thieu"
                        className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition cursor-pointer transform hover:translate-y-[-4px] duration-300 ease-in-outhover:shadow-lg"
                    >
                        Xem thêm
                    </Link>
                </div>
            </div>
        </section>
    );
}
