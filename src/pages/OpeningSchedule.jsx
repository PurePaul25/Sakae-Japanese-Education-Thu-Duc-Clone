import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { schedules } from '../dataTest/schedules';

function OpeningSchedule() {
    const [filterMonth, setFilterMonth] = useState('Tất cả');
    const [filterStatus, setFilterStatus] = useState('Tất cả');
    const [filterCourse, setFilterCourse] = useState('Tất cả');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const tableRef = useRef(null);

    // Lấy danh sách các tháng có trong dữ liệu (ví dụ: '07', '08')
    const months = [...new Set(schedules.map((item) => item.startDate.split('/')[1]))].sort();
    const statuses = [...new Set(schedules.map((item) => item.status))];
    const courses = [...new Set(schedules.map((item) => item.course))];

    const filteredSchedules = schedules.filter((item) => {
        const monthMatch = filterMonth === 'Tất cả' || item.startDate.split('/')[1] === filterMonth;
        const statusMatch = filterStatus === 'Tất cả' || item.status === filterStatus;
        const courseMatch = filterCourse === 'Tất cả' || item.course === filterCourse;
        return monthMatch && statusMatch && courseMatch;
    });

    // Reset trang về 1 khi bộ lọc thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [filterMonth, filterStatus, filterCourse]);

    // Tính toán phân trang
    const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
    const displayedSchedules = filteredSchedules.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleResetFilters = () => {
        setFilterMonth('Tất cả');
        setFilterStatus('Tất cả');
        setFilterCourse('Tất cả');
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        if (tableRef.current) {
            const headerOffset = 120;
            const elementPosition = tableRef.current.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div className="pt-18 min-h-screen bg-gray-50 pb-16">
            {/* Banner / Header */}
            <section className="text-center mb-8 py-12 px-4 md:px-12 bg-red-100">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
                    Lịch <span className="text-red-600">Khai Giảng</span>
                </h1>
                <p className="text-lg text-gray-600 max-w-4xl mx-auto">
                    Cập nhật lịch khai giảng các khóa học tiếng Nhật mới nhất tại Sakae. Hãy đăng ký ngay để nhận ưu
                    đãi!
                </p>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-gray-700 mb-8 text-justify italic text-lg leading-relaxed">
                    Bạn muốn tìm trung tâm học tiếng Nhật tốt ở Thủ Đức có giáo viên bản xứ người Nhật giảng dạy, với
                    mức học phí vừa phải, hãy tham khảo ngay các khóa học tại trung tâm Nhật Ngữ Sakae nhé, cam kết
                    không làm bạn thất vọng.
                </p>

                {/* Bộ lọc */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                        <h3 className="text-lg font-bold text-gray-800">Tìm kiếm lớp học</h3>
                        <button
                            onClick={handleResetFilters}
                            className="text-sm text-red-600 hover:text-red-800 font-medium hover:underline transition-colors cursor-pointer flex items-center gap-1"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            Đặt lại bộ lọc
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Lọc theo tháng */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tháng khai giảng</label>
                            <select
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all cursor-pointer"
                            >
                                <option value="Tất cả">Tất cả các tháng</option>
                                {months.map((month) => (
                                    <option key={month} value={month}>
                                        Tháng {month}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Lọc theo khóa học */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Khóa học</label>
                            <select
                                value={filterCourse}
                                onChange={(e) => setFilterCourse(e.target.value)}
                                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all cursor-pointer"
                            >
                                <option value="Tất cả">Tất cả khóa học</option>
                                {courses.map((course) => (
                                    <option key={course} value={course}>
                                        {course}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Lọc theo trạng thái */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all cursor-pointer"
                            >
                                <option value="Tất cả">Tất cả trạng thái</option>
                                {statuses.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table Container */}
                <div ref={tableRef} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-gray-700 uppercase text-sm text-center leading-normal">
                                    <th className="py-4 px-6 font-bold whitespace-nowrap">Khóa học</th>
                                    <th className="py-4 px-6 font-bold whitespace-nowrap">Giáo viên</th>
                                    <th className="py-4 px-6 font-bold whitespace-nowrap">Ngày khai giảng</th>
                                    <th className="py-4 px-6 font-bold whitespace-nowrap">Giờ học</th>
                                    <th className="py-4 px-6 font-bold whitespace-nowrap">Lịch học</th>
                                    <th className="py-4 px-6 font-bold whitespace-nowrap">Học phí</th>
                                    <th className="py-4 px-6 font-bold text-center whitespace-nowrap">Trạng thái</th>
                                    <th className="py-4 px-6 font-bold text-center whitespace-nowrap">Đăng ký</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm text-center font-medium">
                                {displayedSchedules.length > 0 ? (
                                    displayedSchedules.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                            }`}
                                        >
                                            <td className="py-4 px-6 font-semibold text-gray-800 text-base whitespace-nowrap">
                                                <Link
                                                    to={`/chi-tiet-khoa-hoc/${item.id}`}
                                                    className="hover:text-red-600 hover:underline transition-colors"
                                                >
                                                    {item.course}
                                                </Link>
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap">{item.teacher}</td>
                                            <td className="py-4 px-6 whitespace-nowrap">{item.startDate}</td>
                                            <td className="py-4 px-6 whitespace-nowrap">{item.time}</td>
                                            <td className="py-4 px-6 whitespace-nowrap">{item.days}</td>
                                            <td className="py-4 px-6 font-medium text-red-600 whitespace-nowrap">
                                                {item.tuition}
                                            </td>
                                            <td className="py-4 px-6 text-center whitespace-nowrap">
                                                <span
                                                    className={`py-1 px-3 rounded-full text-xs font-bold ${
                                                        item.status === 'Sắp khai giảng'
                                                            ? 'bg-green-100 text-green-700'
                                                            : item.status === 'Đang nhận học viên'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-gray-200 text-gray-600'
                                                    }`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center whitespace-nowrap">
                                                <Link
                                                    to="/lien-he"
                                                    className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition duration-200 font-medium text-xs inline-block"
                                                >
                                                    Đăng ký
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="py-8 text-center text-gray-500 text-base">
                                            Không tìm thấy lớp học nào phù hợp với bộ lọc.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-8 gap-2">
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

                {/* Note */}
                <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r shadow-sm">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                <span className="font-bold">Lưu ý:</span> Lịch học có thể thay đổi tùy theo tình hình
                                thực tế. Vui lòng liên hệ trực tiếp để được tư vấn chi tiết nhất.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OpeningSchedule;
