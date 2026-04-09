import React from 'react';
import { MoreHorizontal, ChevronRight, ChevronLeft, Filter } from 'lucide-react';

const DataTable = ({ title, description, columns, data, onAction }) => {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
                    {description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>}
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

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            {columns.map((col, idx) => (
                                <th key={idx} className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    {col.label}
                                </th>
                            ))}
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {data.map((row, rowIdx) => (
                            <tr key={rowIdx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                {columns.map((col, colIdx) => (
                                    <td key={colIdx} className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                                    </td>
                                ))}
                                <td className="px-6 py-4 text-right">
                                    <button className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer">
                                        <MoreHorizontal size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Hiển thị <span className="font-semibold text-slate-700 dark:text-white">1</span> đến <span className="font-semibold text-slate-700 dark:text-white">{data.length}</span> trong số <span className="font-semibold text-slate-700 dark:text-white">24</span> kết quả
                </p>
                <div className="flex items-center gap-2">
                    <button className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer" disabled>
                        <ChevronLeft size={16} />
                    </button>
                    {[1, 2, 3].map(p => (
                        <button key={p} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors cursor-pointer ${p === 1 ? 'bg-red-600 text-white shadow-sm shadow-red-200 dark:shadow-none' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                            {p}
                        </button>
                    ))}
                    <button className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DataTable;
