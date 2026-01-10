import { Link } from 'react-router-dom';

const activities = [
    {
        id: 1,
        image: 'http://bizweb.dktcdn.net/100/059/929/themes/76022/assets/sbbn-collec-1.jpg?1747711551525',
        title: 'Lễ hội văn hóa Nhật Bản',
    },
    {
        id: 2,
        image: 'https://bizweb.dktcdn.net/thumb/grande/100/059/929/products/a6e5a99ac9e434ba6df5-compressed.jpg?v=1591672420887',
        title: 'Lớp học thiếu nhi vui nhộn',
    },
    {
        id: 3,
        image: 'https://bizweb.dktcdn.net/thumb/grande/100/059/929/products/8011face-compressed.jpg?v=1594181526853',
        title: 'Giao lưu với giáo viên bản ngữ',
    },
    {
        id: 4,
        image: 'https://bizweb.dktcdn.net/thumb/grande/100/059/929/products/245957676-3743723885852060-3677878218532570884-n.jpg?v=1664356822127',
        title: 'Hoạt động nhóm tại lớp',
    },
];

function ExtracurricularSection() {
    return (
        <section className="py-16 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-[40px] font-extrabold text-gray-900 mb-4">
                        Hoạt động <span className="text-red-600">Ngoại khóa</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Tại Sakae, học viên không chỉ học tiếng Nhật mà còn được trải nghiệm văn hóa, tham gia các hoạt
                        động ngoại khóa thú vị và bổ ích.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {activities.map((item) => (
                        <div
                            key={item.id}
                            className="group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer h-64 md:h-80"
                        >
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                            />

                            {/* Text Container */}
                            <div className="absolute bottom-0 left-0 w-full p-4 bg-black/20 backdrop-blur-sm border-t border-white/20 transition-all duration-300">
                                <h3 className="text-white text-lg font-bold leading-tight">{item.title}</h3>
                                {/* <div className="max-h-0 overflow-hidden group-hover:max-h-20 transition-all duration-500 ease-out">
                                    <div className="pt-2 flex items-center text-red-400 font-semibold text-sm">
                                        <span>Xem chi tiết</span>
                                        <svg
                                            className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                                            ></path>
                                        </svg>
                                    </div>
                                </div> */}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-10">
                    <Link
                        to="/tin-tuc"
                        className="inline-block px-8 py-3 bg-red-600 text-white font-semibold rounded-full shadow-md hover:bg-red-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    >
                        Xem tất cả hình ảnh
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default ExtracurricularSection;
