import { useRef, useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaQuoteLeft } from 'react-icons/fa';

export default function TestimonialsSection() {
    const sliderRef = useRef(null);
    const sectionRef = useRef(null);

    // Drag & Touch States
    const isDraggingRef = useRef(false);
    const startXRef = useRef(0);
    const scrollLeftRef = useRef(0);
    const [isDragging, setIsDragging] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    // IntersectionObserver State cho hiệu ứng Scroll-into-view
    const [isVisible, setIsVisible] = useState(false);

    const testimonials = [
        {
            quote: 'Sau khi đi Nhật về mình đã tham gia lớp học N2 tại trung tâm. Giáo viên nhiệt tình. Chương trình giảng dạy bám sát đề thi JLPT. Chỉ sau 1 khóa mình đã có bằng N2. Cảm ơn thầy cô và trung tâm đã hỗ trợ mình.',
            name: 'Nguyễn Ngọc Linh',
            role: 'Nhân viên văn phòng',
            image: 'https://bizweb.dktcdn.net/100/059/929/themes/76022/assets/testimonial-avatar-1.jpg?1747711551525',
        },
        {
            quote: 'Môi trường học ở Sakae rất thân thiện. Mình thích nhất là các buổi hội thoại thực tế với giáo viên Nhật – giúp cải thiện phản xạ giao tiếp rất nhanh.',
            name: 'Võ Ngọc Hoàng Vinh',
            role: 'Sinh viên ĐH SPKT',
            image: 'https://bizweb.dktcdn.net/100/059/929/themes/76022/assets/testimonial-avatar-2.jpg?1747711551525',
        },
        {
            quote: 'Em rất hài lòng với điều kiện học tập ở đây khi lớp học không quá đông, được trang bị máy điều hoà nhưng mức học phí lại rất vừa phải, phù hợp với học sinh, sinh viên.',
            name: 'Hoàng Huyền Trang',
            role: 'Sinh viên ĐH Ngân Hàng TPHCM',
            image: 'https://bizweb.dktcdn.net/100/059/929/themes/76022/assets/testimonial-avatar-3.jpg?1747711551525',
        },
        {
            quote: 'Cảm ơn Thầy Kurita, quá trình học tại trung tâm đọng lại trong em rất nhiều kỷ niệm. Thầy đã cho em thấy được sự thú vị của tiếng Nhật, không hề khó như em nghĩ.',
            name: 'Nguyễn Thị Tuyết Hảo',
            role: 'Sinh viên ĐH Xã Hội - Nhân Văn',
            image: 'https://bizweb.dktcdn.net/100/059/929/themes/76022/assets/testimonial-avatar-4.jpg?1747711551525',
        },
        {
            quote: 'Học Nhật ngữ là một quá trình lâu dài và đòi hỏi sự kiên trì. Đó cũng chính là điều mà thầy luôn luôn nhắc nhở và động viên học sinh của mình để cố gắng không bỏ cuộc.',
            name: 'Nguyễn Đỗ Khắc Hiếu',
            role: 'Sinh viên ĐH Nông Lâm',
            image: 'https://bizweb.dktcdn.net/100/059/929/themes/76022/assets/testimonial-avatar-5.jpg?1747711551525',
        },
        {
            quote: 'Tiếng Nhật tuy khó nhưng lại rất thú vị đặc biệt là chữ Kanji. Đến với lớp học, mình được giáo viên hướng dẫn rất nhiệt tình và mình nhận ra học tiếng Nhật thật là vui.',
            name: 'Trịnh Minh Phát',
            role: 'Sinh viên CĐ Công Nghệ Thủ Đức',
            image: 'https://bizweb.dktcdn.net/100/059/929/themes/76022/assets/testimonial-avatar-6.jpg?1747711551525',
        },
    ];

    // Scroll Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.15 },
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Cập nhật chỉ số card đang ở trung tâm
    const updateActiveIndex = () => {
        const slider = sliderRef.current;
        if (!slider) return;

        const centerPosition = slider.scrollLeft + slider.clientWidth / 2;
        const children = Array.from(slider.children);
        const nearestIndex = children.reduce(
            (closest, child, index) => {
                const childCenter = child.offsetLeft + child.clientWidth / 2;
                const distance = Math.abs(childCenter - centerPosition);
                return distance < closest.distance ? { index, distance } : closest;
            },
            { index: 0, distance: Infinity },
        ).index;

        setActiveIndex(nearestIndex);
    };

    // Điều hướng bằng nút bấm
    const scrollToCard = (index) => {
        const slider = sliderRef.current;
        if (!slider) return;

        const targetIndex = Math.max(0, Math.min(index, testimonials.length - 1));
        const child = slider.children[targetIndex];
        if (child) {
            slider.scrollTo({ left: child.offsetLeft - slider.offsetLeft, behavior: 'smooth' });
            setActiveIndex(targetIndex);
        }
    };

    // Mouse Drag events
    const handleMouseDown = (e) => {
        const slider = sliderRef.current;
        if (!slider) return;

        isDraggingRef.current = true;
        setIsDragging(true);
        startXRef.current = e.pageX - slider.offsetLeft;
        scrollLeftRef.current = slider.scrollLeft;
    };

    const handleMouseMove = (e) => {
        const slider = sliderRef.current;
        if (!isDraggingRef.current || !slider) return;

        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startXRef.current) * 1.2;
        slider.scrollLeft = scrollLeftRef.current - walk;
    };

    const stopDragging = () => {
        isDraggingRef.current = false;
        setIsDragging(false);
    };

    return (
        <section ref={sectionRef} className="py-16 bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div
                    className={`text-center mb-10 sm:mb-14 transition-all duration-300 ease-out ${
                        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                    }`}
                >
                    <span className="inline-block px-3 py-1 bg-red-100 text-red-600 text-xs sm:text-sm font-semibold rounded-full mb-3">
                        Góc Học Viên
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
                        Cảm nhận học viên <span className="text-red-600">Sakae</span>
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 max-w-5xl mx-auto">
                        Lắng nghe những chia sẻ thực tế từ học viên đã đồng hành cùng Trung tâm Nhật ngữ Sakae.
                    </p>
                </div>

                {/* Slider Container Wrapper */}
                <div
                    className={`relative transition-all duration-300 ease-out delay-150 ${
                        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                >
                    {/* Left & Right Arrow Buttons (Desktop & Tablet) */}
                    <button
                        type="button"
                        onClick={() => scrollToCard(activeIndex - 1)}
                        disabled={activeIndex === 0}
                        className={`hidden sm:flex absolute -left-3 lg:-left-10 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full bg-white text-gray-700 shadow-lg border border-gray-100 transition duration-200 ${
                            activeIndex === 0
                                ? 'opacity-30 cursor-not-allowed'
                                : 'hover:bg-red-600 hover:text-white hover:scale-110 active:scale-95 cursor-pointer'
                        }`}
                        aria-label="Đánh giá trước"
                    >
                        <FiChevronLeft size={22} />
                    </button>

                    <button
                        type="button"
                        onClick={() => scrollToCard(activeIndex + 1)}
                        disabled={activeIndex === testimonials.length - 1}
                        className={`hidden sm:flex absolute -right-3 lg:-right-10 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full bg-white text-gray-700 shadow-lg border border-gray-100 transition duration-200 ${
                            activeIndex === testimonials.length - 1
                                ? 'opacity-30 cursor-not-allowed'
                                : 'hover:bg-red-600 hover:text-white hover:scale-110 active:scale-95 cursor-pointer'
                        }`}
                        aria-label="Đánh giá tiếp theo"
                    >
                        <FiChevronRight size={22} />
                    </button>

                    {/* Scrollable Track */}
                    <div
                        ref={sliderRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={stopDragging}
                        onMouseLeave={stopDragging}
                        onScroll={updateActiveIndex}
                        className={`flex gap-5 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth py-4 px-2 sm:px-4 select-none touch-pan-x overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
                            isDragging ? 'cursor-grabbing' : 'cursor-grab'
                        }`}
                    >
                        {testimonials.map((item, index) => {
                            const isActive = index === activeIndex;
                            return (
                                <div
                                    key={item.name}
                                    className={`snap-center flex-shrink-0 w-[88vw] sm:w-[340px] md:w-[360px] lg:w-[380px] bg-white rounded-2xl p-6 sm:p-7 border-2 transition-all duration-200 flex flex-col justify-between ${
                                        isActive
                                            ? 'border-red-300 shadow-xl scale-[1.02]'
                                            : 'border-gray-100 shadow-md opacity-90 hover:opacity-100'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <FaQuoteLeft className="text-red-400 opacity-80" size={32} />
                                            <div className="flex text-amber-400 text-sm gap-0.5" aria-hidden="true">
                                                ★ ★ ★ ★ ★
                                            </div>
                                        </div>
                                        <p className="text-gray-700 text-sm sm:text-base leading-relaxed italic mb-6">
                                            "{item.quote}"
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex items-center gap-3.5">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-12 h-12 rounded-full object-cover ring-2 ring-red-500/80 flex-shrink-0"
                                            loading="lazy"
                                        />
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-gray-900 text-base truncate">{item.name}</h3>
                                            <p className="text-xs sm:text-sm text-red-600 font-medium truncate">
                                                {item.role}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination Indicators */}
                    <div className="mt-6 flex justify-center items-center gap-2">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => scrollToCard(index)}
                                className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                                    index === activeIndex ? 'bg-red-600 w-7' : 'bg-gray-300 hover:bg-gray-400 w-2'
                                }`}
                                aria-label={`Chuyển tới đánh giá ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
