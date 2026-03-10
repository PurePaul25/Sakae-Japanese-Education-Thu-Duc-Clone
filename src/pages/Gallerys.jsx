import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ScrollToTopButton from '../components/layout/ScrollToTopButton';
import { FaSearchPlus, FaTimes, FaChevronLeft, FaChevronRight, FaDownload, FaSearchMinus } from 'react-icons/fa';

// Dữ liệu hình ảnh giả lập (Sử dụng các link ảnh có sẵn trong project)
const galleryData = [
    {
        id: 1,
        category: 'Lễ hội',
        title: 'Lễ hội văn hóa Nhật Bản',
        src: 'http://bizweb.dktcdn.net/100/059/929/themes/76022/assets/sbbn-collec-1.jpg?1747711551525',
        date: '15/01/2025',
    },
    {
        id: 2,
        category: 'Lớp học',
        title: 'Được chứng chỉ N4 siêu vip pro nè 🙌',
        src: 'https://scontent.fsgn8-4.fna.fbcdn.net/v/t39.30808-6/614193220_772282895891992_5950287968154225098_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=102&ccb=1-7&_nc_sid=833d8c&_nc_ohc=X5JeVeQbwG0Q7kNvwHEwfri&_nc_oc=Adm7wzYKLAPaddPwtiQYJ90UOs7LRmJIK9fDoGrXLQl_KXx9i3hgyG2b7r9Dse1uVjbhosDzfxphj7vGNPMP50J4&_nc_zt=23&_nc_ht=scontent.fsgn8-4.fna&_nc_gid=xRZzJdNE5W0ax2hgYfyG0A&oh=00_AfoQretOMqLiyXnVvqsU1DTUco874NjbB_V6vZarD7EwMA&oe=6969095D',
        date: '10/01/2026',
    },
    {
        id: 3,
        category: 'Lớp học',
        title: 'Khi thấy bạn thân bảo Tiếng Nhật dễ lắm 😏',
        src: 'https://scontent.fsgn8-4.fna.fbcdn.net/v/t39.30808-6/607257779_767365579717057_5663669594577628631_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=127cfc&_nc_ohc=3EQO91Fk27kQ7kNvwHzL587&_nc_oc=Adl7kfME9je8BROca2wHD_4Ez3_zjltmh0pPYgfMKpuqVFIJuwmJLsQjPsxfcx31xe241Qcn0_Jmhqkd3x6dtJBL&_nc_zt=23&_nc_ht=scontent.fsgn8-4.fna&_nc_gid=e118ofjOO4ZXYJMjJ94QfA&oh=00_AfqfUZG2zeJQbybG6gYRzicNcptHT9UTSyfAz4wsh3cLxg&oe=6968426C',
        date: '03/01/2026',
    },
    {
        id: 4,
        category: 'Lễ hội',
        title: 'Trải nghiệm mặc Yukata nè',
        src: 'https://scontent.fsgn8-4.fna.fbcdn.net/v/t39.30808-6/612606139_771827959270819_7440157257763143469_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=B_GAffDdNXUQ7kNvwFpJ82t&_nc_oc=Admoz61GLv-LTims7lRyimanvmH7y5CrCBICGuDT39xa-9fLegLfLchH7njg7aphRLgmiv7P-5sWRpcNik0ilhv1&_nc_zt=23&_nc_ht=scontent.fsgn8-4.fna&_nc_gid=i8d1cErMDa6dqu1vJWjOqg&oh=00_AfqqQ_tnR7wAvQuogPOTZZOwAsHVGJdZF2Fe8QjHS3uNDg&oe=69684E5C',
        date: '09/01/2026',
    },
    {
        id: 5,
        category: 'Lễ hội',
        title: 'Trải nghiệm Yukata với Thư Sensei',
        src: 'https://scontent.fsgn8-4.fna.fbcdn.net/v/t39.30808-6/612908790_770767156043566_3046240546553224680_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=psXIcgt9IhkQ7kNvwH6tCej&_nc_oc=Adk8Bw2XI9tyVWEilxKHObBU9D3d_hEd0q_hQcscjfFpwFHdy4-xbMKD13LaO3k_FVo32BosAu4SXnj2ygKcO5Xc&_nc_zt=23&_nc_ht=scontent.fsgn8-4.fna&_nc_gid=wy8XcQ9t3jRLupuFBBWCsA&oh=00_AfpIAc_looHLE3LOVsZ00V7NKpns2uFzKOyP60VG8ianzw&oe=696847C5',
        date: '08/01/2026',
    },
    {
        id: 6,
        category: 'Lễ hội',
        title: 'Trải nghiệm mặc yukata với Hằng Sensei',
        src: 'https://scontent.fsgn8-4.fna.fbcdn.net/v/t39.30808-6/607291647_765103603276588_2535051705827498642_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=_hjPf_swikQQ7kNvwECjlgS&_nc_oc=AdmBqg3Zh5KiqD0-QmCzOgBmuUG8Sn55xSQyng1QvTd8-upd3UapNfe5QXakv_vHg1tyidfiUIZrZgpb4otz4nTL&_nc_zt=23&_nc_ht=scontent.fsgn8-4.fna&_nc_gid=VyaqusAcZhHOqVofNrCwpA&oh=00_AfqyUIU9-UPuDOXDl21iIXIEcaj76naXpFJt9BJJKkLWvw&oe=696853F4',
        date: '31/12/2025',
    },
    {
        id: 7,
        category: 'Lễ hội',
        title: 'Trải nghiệm mặc yukata với Hằng Sensei',
        src: 'https://scontent.fsgn8-3.fna.fbcdn.net/v/t39.30808-6/606708540_765103593276589_1542432013069881627_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_ohc=pSsADrwSBJgQ7kNvwE6NXhr&_nc_oc=AdlH2v0Iz_egq0vBA8Wb18te4QZqDUd4nKc-yluygib2Zl30GKqjOSEcBZzRlR9UQJ28aApjGBrmf1xmPKhEA4gD&_nc_zt=23&_nc_ht=scontent.fsgn8-3.fna&_nc_gid=ij_xYEtk41EV9onASYAYJg&oh=00_Afo3jln6CszmWtzTH2p4ixJsEBXOOFl_iPSFKJfoykdhxA&oe=6968549F',
        date: '31/12/2025',
    },
    {
        id: 8,
        category: 'Lễ hội',
        title: 'Trải nghiệm Yukata với Hằng Sensei',
        src: 'https://scontent.fsgn8-3.fna.fbcdn.net/v/t39.30808-6/606905926_765103713276577_6235374595645870673_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_ohc=bMMYzTPsTEQQ7kNvwFgeiuO&_nc_oc=AdlFkQ1HhGIuiyrv258lGsES-B97pJoS-ZmWHujescPTa7Mzy5jfN9ykkvl_oQv6thFC-oRBvm-5_dRgHyF4TPUq&_nc_zt=23&_nc_ht=scontent.fsgn8-3.fna&_nc_gid=467_woOP6eh_0NOFe80BQQ&oh=00_AfqplWk3jMSi69ncwMpY58z2u6HCeKfXjWAJ1WQ0emvzJw&oe=69682E34',
        date: '31/12/2025',
    },
    {
        id: 9,
        category: 'Lớp học',
        title: 'Lớp học 1 kèm 1 chất lượng cao',
        src: 'https://bizweb.dktcdn.net/thumb/grande/100/059/929/products/z3545609258404-be1d0a209873c199716aac1109df7c3c.jpg?v=1662605925647',
        date: '15/08/2024',
    },
    {
        id: 10,
        category: 'Sự kiện',
        title: 'Trao bằng tốt nghiệp',
        src: 'https://bizweb.dktcdn.net/thumb/grande/100/059/929/products/476160146-509377935515824-4799331393811144878-n.jpg?v=1750060533540',
        date: '20/09/2024',
    },
];

const categories = ['Tất cả', 'Lễ hội', 'Lớp học', 'Giao lưu', 'Thiếu nhi', 'Sự kiện'];

const Gallerys = () => {
    const [activeCategory, setActiveCategory] = useState('Tất cả');
    const [sortOrder, setSortOrder] = useState('newest');
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; // Số lượng ảnh hiển thị trên mỗi trang
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const [loading, setLoading] = useState(true);

    const touchStartX = useRef(null);
    const touchEndX = useRef(null);

    // Hàm helper để parse ngày tháng (dd/mm/yyyy)
    const parseDate = (dateStr) => {
        const [day, month, year] = dateStr.split('/');
        return new Date(`${year}-${month}-${day}`);
    };

    const filteredImages = useMemo(() => {
        let images =
            activeCategory === 'Tất cả'
                ? [...galleryData]
                : galleryData.filter((item) => item.category === activeCategory);
        return images.sort((a, b) => {
            const dateA = parseDate(a.date);
            const dateB = parseDate(b.date);
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });
    }, [activeCategory, sortOrder]);

    // Reset về trang 1 khi thay đổi danh mục
    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory]);

    // Tính toán phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredImages.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredImages.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        // Cuộn lên đầu lưới ảnh khi chuyển trang
        const galleryElement = document.getElementById('gallery-grid');
        if (galleryElement) {
            const headerOffset = 100;
            const elementPosition = galleryElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
            });
        }
    };

    // Xử lý chuyển ảnh Next/Prev
    const handleNext = useCallback(
        (e) => {
            e?.stopPropagation();
            if (!selectedImage) return;
            const currentIndex = filteredImages.findIndex((img) => img.id === selectedImage.id);
            const nextIndex = (currentIndex + 1) % filteredImages.length;
            setSelectedImage(filteredImages[nextIndex]);
        },
        [filteredImages, selectedImage],
    );

    const handlePrev = useCallback(
        (e) => {
            e?.stopPropagation();
            if (!selectedImage) return;
            const currentIndex = filteredImages.findIndex((img) => img.id === selectedImage.id);
            const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
            setSelectedImage(filteredImages[prevIndex]);
        },
        [filteredImages, selectedImage],
    );

    // Lắng nghe phím tắt
    useEffect(() => {
        if (!selectedImage) return;
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') setSelectedImage(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedImage, handleNext, handlePrev]);

    // Reset zoom, pan và loading khi đổi ảnh
    useEffect(() => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setLoading(true);
    }, [selectedImage]);

    // Khóa cuộn trang khi modal mở để ngăn chặn việc kéo trang nền
    useEffect(() => {
        if (selectedImage) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedImage]);

    // Reset pan khi zoom về 1
    useEffect(() => {
        if (zoom === 1) setPan({ x: 0, y: 0 });
    }, [zoom]);

    // Xử lý Zoom
    const handleZoomIn = (e) => {
        e.stopPropagation();
        setZoom((prev) => Math.min(prev + 0.5, 3)); // Max zoom 3x
    };

    const handleZoomOut = (e) => {
        e.stopPropagation();
        setZoom((prev) => Math.max(prev - 0.5, 0.5)); // Min zoom 0.5x
    };

    // Xử lý sự kiện chuột và cảm ứng để di chuyển ảnh (Pan)
    const handlePointerDown = (clientX, clientY) => {
        if (zoom > 1) {
            setIsDragging(true);
            dragStartRef.current = { x: clientX, y: clientY };
        } else {
            touchStartX.current = clientX;
            touchEndX.current = null;
        }
    };

    const handlePointerMove = (clientX, clientY) => {
        if (zoom > 1 && isDragging) {
            const dx = clientX - dragStartRef.current.x;
            const dy = clientY - dragStartRef.current.y;
            setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
            dragStartRef.current = { x: clientX, y: clientY };
        } else if (zoom === 1) {
            touchEndX.current = clientX;
        }
    };

    const handlePointerUp = () => {
        setIsDragging(false);
        if (zoom === 1 && touchStartX.current !== null && touchEndX.current !== null) {
            const distance = touchStartX.current - touchEndX.current;
            const isLeftSwipe = distance > 50;
            const isRightSwipe = distance < -50;

            if (isLeftSwipe) handleNext();
            if (isRightSwipe) handlePrev();
        }
        touchStartX.current = null;
        touchEndX.current = null;
    };

    // Mouse Events
    const onMouseDown = (e) => {
        e.preventDefault();
        handlePointerDown(e.clientX, e.clientY);
    };
    const onMouseMove = (e) => {
        if (isDragging) e.preventDefault();
        handlePointerMove(e.clientX, e.clientY);
    };
    const onMouseUp = handlePointerUp;
    const onMouseLeave = () => {
        if (isDragging) handlePointerUp();
    };

    // Touch Events
    const onTouchStart = (e) => {
        if (e.touches.length === 1) {
            handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
        }
    };

    const onTouchMove = (e) => {
        if (e.touches.length === 1) {
            handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    };

    const onTouchEnd = handlePointerUp;

    // Xử lý tải ảnh
    const handleDownload = async (e) => {
        e.stopPropagation();
        if (!selectedImage) return;

        try {
            const response = await fetch(selectedImage.src);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const extension = selectedImage.src.split('.').pop().split('?')[0] || 'jpg';
            link.download = `${selectedImage.title}.${extension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            window.open(selectedImage.src, '_blank');
        }
    };

    return (
        <div className="pt-28 pb-16 bg-gray-50 min-h-screen">
            {/* Header Section */}
            <section className="text-center mb-5 px-4">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
                    Thư viện <span className="text-red-600">Hình ảnh</span>
                </h1>
                <p className="text-gray-600 max-w-5xl mx-auto">
                    Khám phá những khoảnh khắc đáng nhớ, các hoạt động ngoại khóa sôi nổi và môi trường học tập năng
                    động tại Sakae.
                </p>
            </section>

            {/* Filter Section */}
            <section className="max-w-7xl mx-auto px-4 mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-center gap-4 lg:gap-8">
                    {/* Lọc theo danh mục */}
                    <div className="flex flex-col md:flex-row md:items-center gap-x-3 gap-y-2">
                        <span className="font-bold text-gray-700 ml-1 sm:ml-0 whitespace-nowrap">Danh mục:</span>
                        <div className="flex gap-3 overflow-x-auto w-full md:w-auto md:flex-wrap md:justify-center py-2 px-1">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform hover:-translate-y-0.5 whitespace-nowrap flex-shrink-0 ${
                                        activeCategory === cat
                                            ? 'bg-red-600 text-white shadow-md'
                                            : 'bg-white text-gray-600 cursor-pointer border border-gray-200 hover:border-red-400 hover:text-red-600'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sắp xếp theo thời gian */}
                    <div className="flex items-center gap-3 ml-1 sm:ml-0">
                        <span className="font-bold text-gray-700 whitespace-nowrap">Sắp xếp:</span>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-gray-700 cursor-pointer text-sm font-semibold shadow-sm"
                        >
                            <option value="newest">Mới nhất</option>
                            <option value="oldest">Cũ nhất</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Gallery Grid */}
            <section id="gallery-grid" className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
                    {currentItems.map((item) => (
                        <div
                            key={item.id}
                            className="group relative overflow-hidden rounded-xl shadow-md bg-white cursor-pointer aspect-[4/3]"
                            onClick={() => setSelectedImage(item)}
                        >
                            <img
                                src={item.src}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Overlay Effect */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white p-4 text-center">
                                <FaSearchPlus className="text-3xl mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75" />
                                <h3 className="text-lg font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100">
                                    {item.title}
                                </h3>
                                <span className="text-sm bg-red-600 px-3 py-1 rounded-full mt-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-150">
                                    {item.category}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredImages.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">Không tìm thấy hình ảnh nào trong danh mục này.</p>
                    </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-12 gap-2">
                        <button
                            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                                currentPage === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                                    : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border-gray-300 cursor-pointer'
                            }`}
                        >
                            Trước
                        </button>
                        <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg">
                            Trang {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                                currentPage === totalPages
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                                    : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border-gray-300 cursor-pointer'
                            }`}
                        >
                            Sau
                        </button>
                    </div>
                )}
            </section>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in"
                    onClick={() => setSelectedImage(null)}
                >
                    {/* Top Controls */}
                    <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-center z-50">
                        {/* Left Side: Counter (Desktop) / Zoom (Mobile) */}
                        <div className="flex items-center gap-4">
                            {/* Counter Desktop */}
                            <span className="hidden md:block text-white font-medium bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                                {filteredImages.findIndex((img) => img.id === selectedImage.id) + 1} /{' '}
                                {filteredImages.length}
                            </span>

                            {/* Zoom Mobile */}
                            <div className="md:hidden flex items-center gap-2 bg-black/30 rounded-full px-3 py-1 backdrop-blur-sm">
                                <button
                                    onClick={handleZoomOut}
                                    className="text-white/70 hover:text-white p-1 transition-colors"
                                    title="Thu nhỏ"
                                >
                                    <FaSearchMinus size={20} />
                                </button>
                                <span className="text-white text-sm font-medium w-8 text-center">
                                    {Math.round(zoom * 100)}%
                                </span>
                                <button
                                    onClick={handleZoomIn}
                                    className="text-white/70 hover:text-white p-1 transition-colors"
                                    title="Phóng to"
                                >
                                    <FaSearchPlus size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Center: Counter (Mobile) */}
                        <div className="md:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                            <span className="text-white font-medium bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                {filteredImages.findIndex((img) => img.id === selectedImage.id) + 1} /{' '}
                                {filteredImages.length}
                            </span>
                        </div>

                        {/* Right Side: Zoom (Desktop) + Actions */}
                        <div className="flex items-center gap-4">
                            {/* Zoom Desktop */}
                            <div className="hidden md:flex items-center gap-2 bg-black/30 rounded-full px-3 py-1 backdrop-blur-sm">
                                <button
                                    onClick={handleZoomOut}
                                    className="text-white/70 cursor-pointer hover:text-white p-1 transition-colors"
                                    title="Thu nhỏ"
                                >
                                    <FaSearchMinus size={20} />
                                </button>
                                <span className="text-white text-sm font-medium w-8 text-center">
                                    {Math.round(zoom * 100)}%
                                </span>
                                <button
                                    onClick={handleZoomIn}
                                    className="text-white/70 cursor-pointer hover:text-white p-1 transition-colors"
                                    title="Phóng to"
                                >
                                    <FaSearchPlus size={20} />
                                </button>
                            </div>

                            <button
                                onClick={handleDownload}
                                className="text-white/70 cursor-pointer hover:text-white rounded-full hover:bg-white/10 transition-colors bg-black/30 px-3 py-1.5 backdrop-blur-sm"
                                title="Tải ảnh"
                            >
                                <FaDownload size={20} />
                            </button>
                            <button
                                className="text-white/70 cursor-pointer hover:text-white rounded-full hover:bg-white/10 transition-colors bg-black/30 px-3 py-1.5 backdrop-blur-sm"
                                onClick={() => setSelectedImage(null)}
                                title="Đóng"
                            >
                                <FaTimes size={22} />
                            </button>
                        </div>
                    </div>

                    {/* Nút Previous */}
                    <button
                        className="absolute left-4 top-1/2 cursor-pointer -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-50 hidden sm:block"
                        onClick={handlePrev}
                    >
                        <FaChevronLeft size={40} />
                    </button>

                    {/* Nút Next */}
                    <button
                        className="absolute right-4 top-1/2 cursor-pointer -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-50 hidden sm:block"
                        onClick={handleNext}
                    >
                        <FaChevronRight size={40} />
                    </button>

                    <div
                        className="relative w-full h-full flex flex-col items-center justify-center p-4 pb-24"
                        style={{ touchAction: 'none' }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        onMouseUp={onMouseUp}
                        onMouseLeave={onMouseLeave}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        {/* Loading Spinner */}
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center z-40">
                                <div className="w-12 h-12 border-4 border-white/30 border-t-red-600 rounded-full animate-spin"></div>
                            </div>
                        )}

                        <img
                            key={selectedImage.id} // Key giúp React re-render ảnh mới với animation
                            src={selectedImage.src}
                            alt={selectedImage.title}
                            onLoad={() => setLoading(false)}
                            style={{
                                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                                transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                                cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                            }}
                            className={`max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-opacity duration-300 ${
                                loading ? 'opacity-0' : 'opacity-100'
                            }`}
                        />

                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent text-center">
                            <h3 className="text-white text-lg md:text-2xl font-bold mb-2">{selectedImage.title}</h3>
                            <div className="flex items-center justify-center gap-4 text-gray-300 text-sm">
                                <span className="bg-red-600 px-3 py-1 rounded-full text-white">
                                    {selectedImage.category}
                                </span>
                                <span>{selectedImage.date}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ScrollToTopButton />

            {/* CSS Animation cho Modal */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Gallerys;
