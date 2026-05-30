import React, { useEffect, useMemo, useState } from 'react';
import { MoreHorizontal, ChevronRight, ChevronLeft, Filter } from 'lucide-react';

const DataTable = ({
    title,
    description,
    columns,
    data,
    onAction,
    isLoading = false,
    hideToolbar = false,
    pageSize = 10,
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalData = data || [];
    const showToolbar = !hideToolbar;

    useEffect(() => {
        setCurrentPage(1);
    }, [data]);

    const totalPages = useMemo(() => Math.ceil(totalData.length / pageSize), [totalData.length, pageSize]);
    const paginatedRows = useMemo(() => {
        if (isLoading) return Array.from({ length: 5 });
        const start = (currentPage - 1) * pageSize;
        return totalData.slice(start, start + pageSize);
    }, [currentPage, data, isLoading, pageSize, totalData]);

    const visiblePageButtons = useMemo(() => {
        if (totalPages <= 5) return Array.from({ length: totalPages }, (_, idx) => idx + 1);
        if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages];
        if (currentPage >= totalPages - 2)
            return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    }, [currentPage, totalPages, pageSize]);

    const startCount = totalData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endCount = isLoading
        ? Math.min(pageSize, totalData.length)
        : Math.min(currentPage * pageSize, totalData.length);

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden transition-all">
            {/* Header */}
            {showToolbar && (
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title || 'Danh sách'}</h3>
                        {description && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                            <Filter size={14} />
                            Lọc
                        </button>
                        <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer shadow-lg shadow-red-200 dark:shadow-none">
                            Thêm mới
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="relative overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className="py-4 px-4.5 text-xs font-extrabold text-slate-700 dark:text-slate-400 uppercase tracking-wider"
                                >
                                    {col.label}
                                </th>
                            ))}
                            <th className="px-5 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {paginatedRows.map((row, rowIdx) => (
                            <tr
                                key={rowIdx}
                                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                            >
                                {columns.map((col, colIdx) => (
                                    <td key={colIdx} className="px-4.5 py-3 text-sm text-slate-600 dark:text-slate-300">
                                        {isLoading ? (
                                            <div className="h-4 w-3/4 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                                        ) : col.render ? (
                                            col.render(row[col.key], row)
                                        ) : (
                                            row[col.key]
                                        )}
                                    </td>
                                ))}
                                <td className="px-3.5 py-4 text-right">
                                    {isLoading ? (
                                        <div className="h-4 w-6 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse mx-auto" />
                                    ) : (
                                        <button className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {!isLoading && paginatedRows.length === 0 && (
                            <tr>
                                <td
                                    colSpan={columns.length + 1}
                                    className="px-5 py-16 text-center text-sm text-slate-500 dark:text-slate-400"
                                >
                                    Không có dữ liệu người dùng.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-950/80">
                        <div className="flex flex-col items-center gap-3 text-slate-600 dark:text-slate-300">
                            <div className="w-10 h-10 border-4 border-slate-300 dark:border-slate-700 border-t-red-500 rounded-full animate-spin"></div>
                            <span>Đang tải danh sách người dùng…</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Hiển thị <span className="font-semibold text-slate-700 dark:text-white">{startCount}</span> đến{' '}
                    <span className="font-semibold text-slate-700 dark:text-white">{endCount}</span> trong số{' '}
                    <span className="font-semibold text-slate-700 dark:text-white">{totalData.length}</span> kết quả
                </p>
                {totalPages > 1 && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        {visiblePageButtons.map((page, idx) =>
                            page === '...' ? (
                                <span key={`dots-${idx}`} className="px-2 text-sm text-slate-500">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={page}
                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                        page === currentPage
                                            ? 'bg-red-600 text-white shadow-sm shadow-red-200 dark:shadow-none'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            ),
                        )}
                        <button
                            className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataTable;
