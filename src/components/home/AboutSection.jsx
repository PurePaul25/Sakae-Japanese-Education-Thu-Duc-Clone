import { Link } from 'react-router-dom';
import { ASSETS } from '../../constants/assets';

export default function AboutSection() {
    return (
        <section className="py-12 md:py-16 bg-gray-100 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 md:px-8 grid md:grid-cols-2 gap-8 md:gap-10 items-center">
                {/* Ảnh có hiệu ứng scale nhẹ khi hover */}
                <div className="overflow-hidden rounded-2xl">
                    <img
                        src={ASSETS.BANNERS.ABOUT}
                        alt="About Sakae"
                        className="rounded-2xl max-w-xl w-full border border-gray-300 shadow-sm transition-transform duration-200 ease-in-out hover:scale-105"
                    />
                </div>

                {/* Nội dung */}
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4 transition-colors duration-200 hover:text-red-600">
                        Về Trung tâm Nhật ngữ Sakae
                    </h2>
                    <p className="text-gray-600 mb-6 leading-relaxed text-left sm:text-justify text-base md:text-lg">
                        Trung tâm Nhật ngữ Sakae tự hào là đơn vị đào tạo tiếng Nhật uy tín, giúp hàng ngàn học viên
                        chinh phục giấc mơ du học và làm việc tại Nhật Bản. Với đội ngũ giáo viên tận tâm và chương
                        trình học chuẩn Nhật, Sakae là điểm đến lý tưởng cho người học tiếng Nhật mọi trình độ.
                    </p>
                    <Link
                        to="/gioi-thieu"
                        className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer transform transition duration-200 ease-in-out hover:bg-red-700 hover:-translate-y-1 hover:shadow-lg active:translate-y-0"
                    >
                        Xem thêm
                    </Link>
                </div>
            </div>
        </section>
    );
}
