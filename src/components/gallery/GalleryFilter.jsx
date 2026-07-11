import React, { useState, useEffect, useRef } from 'react';

const UserCustomSelect = ({ value, onChange, options, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => opt.value === value) || { label: placeholder, value };

    return (
        <div ref={containerRef} className="relative flex-1 sm:flex-initial min-w-[110px] sm:min-w-[130px]">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl text-sm font-black bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer text-slate-700 outline-none border border-slate-200/40 shadow-sm"
            >
                <span className="truncate">{selectedOption.label}</span>
                <svg
                    className={`w-3.5 h-3.5 fill-current text-slate-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                >
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 left-0 right-0 sm:right-auto bg-white border border-slate-150 rounded-xl shadow-2xl z-[150] max-h-56 overflow-y-auto py-1.5 min-w-[140px] animate-fadeIn">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                                onChange(opt.value);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 text-xs transition-all flex items-center justify-between font-black
                                ${
                                    opt.value === value
                                        ? 'bg-red-50 text-red-600'
                                        : 'text-slate-600 cursor-pointer hover:bg-slate-50'
                                }`}
                        >
                            <span>{opt.label}</span>
                            {opt.value === value && <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const categories = ['Tất cả', 'Lễ hội', 'Lớp học', 'Giao lưu', 'Thiếu nhi', 'Sự kiện', 'Du học'];

const GalleryFilter = ({
    activeCategory,
    setActiveCategory,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    monthOptions,
    yearOptions,
    setCurrentPage,
    sortOrder,
    setSortOrder,
}) => {
    const sortOptions = [
        { label: 'Mới nhất', value: 'newest' },
        { label: 'Cũ nhất', value: 'oldest' },
    ];

    return (
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-8">
            {/* Category horizontal scrolling bar */}
            <div className="w-full lg:w-auto overflow-x-auto scrollbar-none py-2">
                <div className="flex gap-2 min-w-max">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => {
                                setActiveCategory(category);
                                setCurrentPage(1);
                            }}
                            className={`px-3.5 py-2 rounded-full text-xs sm:text-sm font-black uppercase transition-all duration-300 flex-shrink-0 cursor-pointer ${
                                activeCategory === category
                                    ? 'bg-red-600 text-white shadow-md shadow-red-200 -translate-y-0.5'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/50 shadow-sm'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Select Dropdowns Container */}
            <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-full lg:w-auto justify-between lg:justify-end items-center flex-wrap sm:flex-nowrap">
                <UserCustomSelect
                    value={selectedMonth}
                    onChange={(val) => {
                        setSelectedMonth(val);
                        setCurrentPage(1);
                    }}
                    options={monthOptions}
                    placeholder="Tháng (Tất cả)"
                />

                <UserCustomSelect
                    value={selectedYear}
                    onChange={(val) => {
                        setSelectedYear(val);
                        setCurrentPage(1);
                    }}
                    options={yearOptions}
                    placeholder="Năm (Tất cả)"
                />

                <UserCustomSelect
                    value={sortOrder}
                    onChange={(val) => {
                        setSortOrder(val);
                        setCurrentPage(1);
                    }}
                    options={sortOptions}
                    placeholder="Sắp xếp"
                />
            </div>
        </div>
    );
};

export default GalleryFilter;
