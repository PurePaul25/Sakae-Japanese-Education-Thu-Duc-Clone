import { useState, useEffect } from 'react';

import { BsChevronCompactLeft, BsChevronCompactRight } from 'react-icons/bs';
import { RxDotFilled } from 'react-icons/rx';
import bannerBg1 from '../../assets/banner-bg-1.webp';
import bannerBg2 from '../../assets/banner-bg-2.webp';
import bannerBg3 from '../../assets/banner-bg-3.jpg';

const banners = [bannerBg1, bannerBg2, bannerBg3];
export default function HeroSection() {
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

    useEffect(() => {
        // Tự động chuyển banner sau mỗi 5 giây
        const timer = setInterval(() => {
            setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
        }, 5000);

        // Dọn dẹp interval khi component bị unmount
        return () => clearInterval(timer);
    }, []);

    const prevBanner = () => {
        const isFirstBanner = currentBannerIndex === 0;
        const newIndex = isFirstBanner ? banners.length - 1 : currentBannerIndex - 1;
        setCurrentBannerIndex(newIndex);
    };

    const nextBanner = () => {
        const isLastBanner = currentBannerIndex === banners.length - 1;
        const newIndex = isLastBanner ? 0 : currentBannerIndex + 1;
        setCurrentBannerIndex(newIndex);
    };

    const goToBanner = (bannerIndex) => {
        setCurrentBannerIndex(bannerIndex);
    };

    return (
        <section
            style={{ backgroundImage: `url(${banners[currentBannerIndex]})` }}
            className="relative bg-cover bg-center h-[530px] transition-all duration-500 ease-in-out group"
        >
            <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center text-center text-white px-4">
                <h2 className="text-3xl md:text-5xl font-bold mb-4">Trung tâm Nhật Ngữ SAKAE</h2>
                <p className="text-lg md:text-xl mb-6">
                    Chất lượng đào tạo đến từ Nhật Bản. Trang thiết bị hiện đại. Môi trường học tập thoải mái. Trải
                    nghiệm văn hóa, tác phong Nhật Bản.
                </p>
                <button className="bg-red-600 px-6 py-3 rounded-lg text-white font-semibold hover:bg-red-700 transition cursor-pointer">
                    Tìm hiểu thêm
                </button>
            </div>

            {/* Nút chuyển banner Trái */}
            <div className="hidden group-hover:block absolute top-1/2 -translate-y-1/2 left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/40 transition">
                <BsChevronCompactLeft onClick={prevBanner} size={35} />
            </div>

            {/* Nút chuyển banner Phải */}
            <div className="hidden group-hover:block absolute top-1/2 -translate-y-1/2 right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/40 transition">
                <BsChevronCompactRight onClick={nextBanner} size={35} />
            </div>

            {/* Indicator Dots */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center py-2">
                {banners.map((_, bannerIndex) => (
                    <div
                        key={bannerIndex}
                        onClick={() => goToBanner(bannerIndex)}
                        className={`cursor-pointer text-3xl ${
                            currentBannerIndex === bannerIndex ? 'text-white' : 'text-gray-400/70'
                        }`}
                    >
                        <RxDotFilled />
                    </div>
                ))}
            </div>
        </section>
    );
}
