import React from 'react';
import { motion } from 'framer-motion';
import { 
    BookOpen, 
    Plus, 
    Search, 
    Filter,
    Edit3,
    Trash2,
    Eye,
    MoreVertical
} from 'lucide-react';

const AdminCourses = () => {
    const courses = [
        { id: 1, name: 'Sơ cấp N5 - Cấp tốc', category: 'N5', students: 120, status: 'Đang mở', price: '2.500.000đ', image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&q=80&w=200' },
        { id: 2, name: 'Trung cấp N3', category: 'N3', students: 85, status: 'Đang mở', price: '4.200.000đ', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=200' },
        { id: 3, name: 'Luyện thi N2', category: 'N2', students: 45, status: 'Sắp khai giảng', price: '5.500.000đ', image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=200' },
        { id: 4, name: 'Giao tiếp cơ bản', category: 'Kaiwa', students: 60, status: 'Hết chỗ', price: '3.000.000đ', image: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&q=80&w=200' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Danh mục khóa học</h2>
                    <p className="text-slate-500 mt-1">Quản lý và cập nhật thông tin các khóa học tiếng Nhật.</p>
                </div>
                <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-red-200 dark:shadow-none cursor-pointer">
                    <Plus size={20} />
                    <span>Thêm khóa học</span>
                </button>
            </div>

            {/* Filters and Search */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm khóa học..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-red-500/50 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all font-medium cursor-pointer border border-slate-100 dark:border-slate-700">
                        <Filter size={18} />
                        <span>Bộ lọc</span>
                    </button>
                </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {courses.map((course) => (
                    <div key={course.id} className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300 flex flex-col">
                        <div className="relative h-48 overflow-hidden">
                            <img 
                                src={course.image} 
                                alt={course.name} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1 rounded-lg shadow-sm">
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                    course.status === 'Đang mở' ? 'text-green-600' : 
                                    course.status === 'Hết chỗ' ? 'text-red-600' : 'text-orange-600'
                                }`}>
                                    {course.status}
                                </span>
                            </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-red-600 uppercase tracking-widest">{course.category}</span>
                                <div className="text-slate-900 dark:text-white font-bold">{course.price}</div>
                            </div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 line-clamp-1">{course.name}</h3>
                            
                            <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between text-slate-500 text-sm">
                                <div className="flex items-center gap-1.5">
                                    <BookOpen size={14} />
                                    <span>{course.students} học viên</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button className="p-1.5 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer">
                                        <Edit3 size={16} />
                                    </button>
                                    <button className="p-1.5 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add New Empty State */}
                <button className="min-h-[300px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-red-400 hover:text-red-500 transition-all group cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus size={24} />
                    </div>
                    <span className="font-bold">Thêm khóa học mới</span>
                </button>
            </div>
        </div>
    );
};

export default AdminCourses;
