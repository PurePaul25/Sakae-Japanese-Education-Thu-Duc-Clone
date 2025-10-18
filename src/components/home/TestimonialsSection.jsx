export default function TestimonialsSection() {
    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-[40px] font-extrabold text-gray-900 mb-4">
                        Cảm nhận học viên <span className="text-red-600">Sakae</span>
                    </h2>
                    <p className="text-lg text-gray-600">
                        Lắng nghe chia sẻ từ những người đã tin tưởng lựa chọn Sakae.
                    </p>
                </div>

                {/* Slider container với hiệu ứng mờ (Fading effect) */}
                <div className="relative">
                    <div className="hidden lg:block absolute inset-y-0 left-0 w-12 z-10 pointer-events-none bg-gradient-to-r from-gray-50 to-transparent"></div>
                    <div className="hidden lg:block absolute inset-y-0 right-0 w-12 z-10 pointer-events-none bg-gradient-to-l from-gray-50 to-transparent"></div>

                    <div className="mt-4 px-6 flex overflow-x-auto space-x-6 md:space-x-10 lg:space-x-8 snap-x snap-mandatory pb-8">
                        {/* Học viên 1 */}
                        <div className="snap-center flex-shrink-0 w-11/12 sm:w-2/3 md:w-[350px] lg:w-[380px] bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 border border-red-200 flex flex-col min-h-[320px]">
                            <svg
                                className="w-10 h-10 text-red-300 opacity-75 mb-4 mx-auto"
                                fill="currentColor"
                                viewBox="0 0 32 32"
                                aria-hidden="true"
                            >
                                <path d="M9.333 22.583C13.083 22.583 16.167 19.5 16.167 15.75C16.167 11.917 13.083 8.833 9.333 8.833C5.583 8.833 2.5 11.917 2.5 15.75C2.5 21.083 9.333 29.5 9.333 29.5C9.333 29.5 10.5 22.583 9.333 22.583ZM22.667 22.583C26.417 22.583 29.5 19.5 29.5 15.75C29.5 11.917 26.417 8.833 22.667 8.833C18.917 8.833 15.833 11.917 15.833 15.75C15.833 21.083 22.667 29.5 22.667 29.5C22.667 29.5 23.833 22.583 22.667 22.583Z" />
                            </svg>
                            <div className="flex-grow text-center">
                                <p className="text-lg text-gray-700 font-medium italic mb-6">
                                    “Sau khi đi Nhật về mình đã tham gia lớp học N2 tại trung tâm. Giáo viên nhiệt tình.
                                    Chương trình giảng dạy bám sát đề thi jlpt. Chỉ sau 1 khóa mình đã có bằng N2. Cảm
                                    ơn thầy cô và trung tâm đã hỗ trợ mình.”
                                </p>
                            </div>
                            <div className="mt-auto pt-4 border-t border-gray-100 text-center flex flex-col items-center">
                                <img
                                    src="//bizweb.dktcdn.net/100/059/929/themes/76022/assets/testimonial-avatar-1.jpg?1747711551525"
                                    alt="Nguyễn Ngọc Linh"
                                    className="w-18 h-18 rounded-full object-cover ring-2 ring-red-500 mb-2"
                                />
                                <h4 className="font-bold text-xl text-gray-900">Nguyễn Ngọc Linh</h4>
                                <p className="text-sm text-red-600">Nhân viên văn phòng</p>
                            </div>
                        </div>

                        {/* Học viên 2*/}
                        <div className="snap-center flex-shrink-0 w-11/12 sm:w-2/3 md:w-[350px] lg:w-[380px] bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 border border-red-200 flex flex-col min-h-[320px]">
                            <svg
                                className="w-10 h-10 text-red-300 opacity-75 mb-4 mx-auto"
                                fill="currentColor"
                                viewBox="0 0 32 32"
                                aria-hidden="true"
                            >
                                <path d="M9.333 22.583C13.083 22.583 16.167 19.5 16.167 15.75C16.167 11.917 13.083 8.833 9.333 8.833C5.583 8.833 2.5 11.917 2.5 15.75C2.5 21.083 9.333 29.5 9.333 29.5C9.333 29.5 10.5 22.583 9.333 22.583ZM22.667 22.583C26.417 22.583 29.5 19.5 29.5 15.75C29.5 11.917 26.417 8.833 22.667 8.833C18.917 8.833 15.833 11.917 15.833 15.75C15.833 21.083 22.667 29.5 22.667 29.5C22.667 29.5 23.833 22.583 22.667 22.583Z" />
                            </svg>
                            <div className="flex-grow text-center">
                                <p className="text-lg text-gray-700 font-medium italic mb-6">
                                    “Môi trường học ở Sakae rất thân thiện. Mình thích nhất là các buổi hội thoại thực
                                    tế với giáo viên Nhật – giúp cải thiện phản xạ rất nhanh.”
                                </p>
                            </div>
                            <div className="mt-auto pt-4 border-t border-gray-100 text-center flex flex-col items-center">
                                <img
                                    src="//bizweb.dktcdn.net/100/059/929/themes/76022/assets/testimonial-avatar-2.jpg?1747711551525"
                                    alt="Võ Ngọc Hoàng Vinh"
                                    className="w-18 h-18 rounded-full object-cover ring-2 ring-red-500 mb-2"
                                />
                                <h4 className="font-bold text-xl text-gray-900">Võ Ngọc Hoàng Vinh</h4>
                                <p className="text-sm text-red-600">Sinh viên ĐH SPKT</p>
                            </div>
                        </div>

                        {/* Học viên 3 */}
                        <div className="snap-center flex-shrink-0 w-11/12 sm:w-2/3 md:w-[350px] lg:w-[380px] bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 border border-red-200 flex flex-col min-h-[320px]">
                            <svg
                                className="w-10 h-10 text-red-300 opacity-75 mb-4 mx-auto"
                                fill="currentColor"
                                viewBox="0 0 32 32"
                                aria-hidden="true"
                            >
                                <path d="M9.333 22.583C13.083 22.583 16.167 19.5 16.167 15.75C16.167 11.917 13.083 8.833 9.333 8.833C5.583 8.833 2.5 11.917 2.5 15.75C2.5 21.083 9.333 29.5 9.333 29.5C9.333 29.5 10.5 22.583 9.333 22.583ZM22.667 22.583C26.417 22.583 29.5 19.5 29.5 15.75C29.5 11.917 26.417 8.833 22.667 8.833C18.917 8.833 15.833 11.917 15.833 15.75C15.833 21.083 22.667 29.5 22.667 29.5C22.667 29.5 23.833 22.583 22.667 22.583Z" />
                            </svg>
                            <div className="flex-grow text-center">
                                <p className="text-lg text-gray-700 font-medium italic mb-6">
                                    “Em rất hài lòng với điều kiện học tập ở đây khi lớp học không quá đông, được trang
                                    bị máy điều hoà nhưng mức học phí lại rất vừa phải, phù hợp với nhiều đối tượng,
                                    nhất là các bạn học sinh, sinh viên.”
                                </p>
                            </div>
                            <div className="mt-auto pt-4 border-t border-gray-100 text-center flex flex-col items-center">
                                <img
                                    src="//bizweb.dktcdn.net/100/059/929/themes/76022/assets/testimonial-avatar-3.jpg?1747711551525"
                                    alt="Hoàng Huyền Trang"
                                    className="w-18 h-18 rounded-full object-cover ring-2 ring-red-500 mb-2"
                                />
                                <h4 className="font-bold text-xl text-gray-900">Hoàng Huyền Trang</h4>
                                <p className="text-sm text-red-600">Sinh viên ĐH Ngân Hàng TPHCM</p>
                            </div>
                        </div>

                        {/* Học viên 4 */}
                        <div className="snap-center flex-shrink-0 w-11/12 sm:w-2/3 md:w-[350px] lg:w-[380px] bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 border border-red-200 flex flex-col min-h-[320px]">
                            <svg
                                className="w-10 h-10 text-red-300 opacity-75 mb-4 mx-auto"
                                fill="currentColor"
                                viewBox="0 0 32 32"
                                aria-hidden="true"
                            >
                                <path d="M9.333 22.583C13.083 22.583 16.167 19.5 16.167 15.75C16.167 11.917 13.083 8.833 9.333 8.833C5.583 8.833 2.5 11.917 2.5 15.75C2.5 21.083 9.333 29.5 9.333 29.5C9.333 29.5 10.5 22.583 9.333 22.583ZM22.667 22.583C26.417 22.583 29.5 19.5 29.5 15.75C29.5 11.917 26.417 8.833 22.667 8.833C18.917 8.833 15.833 11.917 15.833 15.75C15.833 21.083 22.667 29.5 22.667 29.5C22.667 29.5 23.833 22.583 22.667 22.583Z" />
                            </svg>
                            <div className="flex-grow text-center">
                                <p className="text-lg text-gray-700 font-medium italic mb-6">
                                    “Cảm ơn Thầy Kurita, quá trình học tại trung tâm đọng lại trong em rất nhiều kỷ
                                    niệm. Thầy đã cho em thấy được sự thú vị của tiếng Nhật, không hề khó như các bạn đã
                                    nghĩ.”
                                </p>
                            </div>
                            <div className="mt-auto pt-4 border-t border-gray-100 text-center flex flex-col items-center">
                                <img
                                    src="//bizweb.dktcdn.net/100/059/929/themes/76022/assets/testimonial-avatar-4.jpg?1747711551525"
                                    alt="Nguyễn Thị Tuyết Hảo"
                                    className="w-18 h-18 rounded-full object-cover ring-2 ring-red-500 mb-2"
                                />
                                <h4 className="font-bold text-xl text-gray-900">Nguyễn Thị Tuyết Hảo</h4>
                                <p className="text-sm text-red-600">Sinh viên ĐH Xã Hội - Nhân Văn</p>
                            </div>
                        </div>

                        {/* Học viên 5 */}
                        <div className="snap-center flex-shrink-0 w-11/12 sm:w-2/3 md:w-[350px] lg:w-[380px] bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 border border-red-200 flex flex-col min-h-[320px]">
                            <svg
                                className="w-10 h-10 text-red-300 opacity-75 mb-4 mx-auto"
                                fill="currentColor"
                                viewBox="0 0 32 32"
                                aria-hidden="true"
                            >
                                <path d="M9.333 22.583C13.083 22.583 16.167 19.5 16.167 15.75C16.167 11.917 13.083 8.833 9.333 8.833C5.583 8.833 2.5 11.917 2.5 15.75C2.5 21.083 9.333 29.5 9.333 29.5C9.333 29.5 10.5 22.583 9.333 22.583ZM22.667 22.583C26.417 22.583 29.5 19.5 29.5 15.75C29.5 11.917 26.417 8.833 22.667 8.833C18.917 8.833 15.833 11.917 15.833 15.75C15.833 21.083 22.667 29.5 22.667 29.5C22.667 29.5 23.833 22.583 22.667 22.583Z" />
                            </svg>
                            <div className="flex-grow text-center">
                                <p className="text-lg text-gray-700 font-medium italic mb-6">
                                    “Học Nhật ngữ là một quá trình lâu dài và đòi hỏi sự kiên trì. Đó cũng chính là điều
                                    mà thầy luôn luôn nhắc nhở và động viên học sinh của mình để mọi người cố gắng và
                                    không bỏ cuộc giữa chừng.”
                                </p>
                            </div>
                            <div className="mt-auto pt-4 border-t border-gray-100 text-center flex flex-col items-center">
                                <img
                                    src="//bizweb.dktcdn.net/100/059/929/themes/76022/assets/testimonial-avatar-5.jpg?1747711551525"
                                    alt="Nguyễn Đỗ Khắc Hiếu"
                                    className="w-18 h-18 rounded-full object-cover ring-2 ring-red-500 mb-2"
                                />
                                <h4 className="font-bold text-xl text-gray-900">Nguyễn Đỗ Khắc Hiếu</h4>
                                <p className="text-sm text-red-600">Sinh viên ĐH Nông Lâm</p>
                            </div>
                        </div>

                        {/* Học viên 6 */}
                        <div className="snap-center flex-shrink-0 w-11/12 sm:w-2/3 md:w-[350px] lg:w-[380px] bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 border border-red-200 flex flex-col min-h-[320px]">
                            <svg
                                className="w-10 h-10 text-red-300 opacity-75 mb-4 mx-auto"
                                fill="currentColor"
                                viewBox="0 0 32 32"
                                aria-hidden="true"
                            >
                                <path d="M9.333 22.583C13.083 22.583 16.167 19.5 16.167 15.75C16.167 11.917 13.083 8.833 9.333 8.833C5.583 8.833 2.5 11.917 2.5 15.75C2.5 21.083 9.333 29.5 9.333 29.5C9.333 29.5 10.5 22.583 9.333 22.583ZM22.667 22.583C26.417 22.583 29.5 19.5 29.5 15.75C29.5 11.917 26.417 8.833 22.667 8.833C18.917 8.833 15.833 11.917 15.833 15.75C15.833 21.083 22.667 29.5 22.667 29.5C22.667 29.5 23.833 22.583 22.667 22.583Z" />
                            </svg>
                            <div className="flex-grow text-center">
                                <p className="text-lg text-gray-700 font-medium italic mb-6">
                                    “Tiếng Nhật tuy khó nhưng lại rất thú vị đặc biệt là chữ Kanji. Đến với lớp học,
                                    mình được giáo viên hướng dẫn rất nhiệt tình và mình nhận ra học tiếng Nhật thật là
                                    vui.”
                                </p>
                            </div>
                            <div className="mt-auto pt-4 border-t border-gray-100 text-center flex flex-col items-center">
                                <img
                                    src="//bizweb.dktcdn.net/100/059/929/themes/76022/assets/testimonial-avatar-6.jpg?1747711551525"
                                    alt="Trịnh Minh Phát"
                                    className="w-18 h-18 rounded-full object-cover ring-2 ring-red-500 mb-2"
                                />
                                <h4 className="font-bold text-xl text-gray-900">Trịnh Minh Phát</h4>
                                <p className="text-sm text-red-600">Sinh viên CĐ Công Nghệ Thủ Đức</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
