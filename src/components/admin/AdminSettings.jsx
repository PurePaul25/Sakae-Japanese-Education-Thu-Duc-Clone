import React from 'react';
import { motion } from 'framer-motion';
import { 
    Settings, 
    Bell, 
    Shield, 
    User, 
    Mail, 
    Globe, 
    Moon,
    Save
} from 'lucide-react';

const AdminSettings = ({ admin }) => {
    return (
        <div className="space-y-8 pb-12">
            <div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Cài đặt hệ thông</h2>
                <p className="text-slate-500 mt-1">Quản lý tài khoản và tùy chỉnh trải nghiệm quản trị.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Navigation */}
                <div className="lg:col-span-1 space-y-2">
                    {[
                        { id: 'profile', icon: User, label: 'Thông tin cá nhân' },
                        { id: 'security', icon: Shield, label: 'Bảo mật' },
                        { id: 'notifications', icon: Bell, label: 'Thông báo' },
                        { id: 'general', icon: Globe, label: 'Cài đặt chung' },
                    ].map((item, idx) => (
                        <button 
                            key={item.id}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer ${
                                idx === 0 
                                ? 'bg-red-600 text-white shadow-lg shadow-red-200 dark:shadow-none' 
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Thông tin cá nhân</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-4xl font-bold text-red-600 border-4 border-white dark:border-slate-900 shadow-xl">
                                        {admin?.fullName?.charAt(0) || 'A'}
                                    </div>
                                    <button className="absolute -bottom-2 -right-2 p-2 bg-red-600 text-white rounded-xl shadow-lg hover:scale-110 transition-transform cursor-pointer">
                                        <Mail size={16} />
                                    </button>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white text-xl">{admin?.fullName || 'Administrator'}</h4>
                                    <p className="text-slate-500">{admin?.email || 'admin@sakae.edu.vn'}</p>
                                    <span className="inline-block mt-2 px-3 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 text-[10px] font-bold uppercase tracking-widest rounded-full">
                                        Quản trị viên hệ thống
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Họ và tên</label>
                                    <input 
                                        type="text" 
                                        defaultValue={admin?.fullName}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-red-500/50 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email</label>
                                    <input 
                                        type="email" 
                                        defaultValue={admin?.email}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-red-500/50 outline-none transition-all text-slate-400"
                                        disabled
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Số điện thoại</label>
                                    <input 
                                        type="text" 
                                        placeholder="Nhập số điện thoại..."
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-red-500/50 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Ngôn ngữ</label>
                                    <select className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-red-500/50 outline-none transition-all">
                                        <option value="vi">Tiếng Việt</option>
                                        <option value="ja">Tiếng Nhật</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-200 dark:shadow-none cursor-pointer">
                                    <Save size={20} />
                                    <span>Lưu thay đổi</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Appereance Settings */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center">
                                    <Moon size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white">Giao diện tối</h3>
                                    <p className="text-xs text-slate-500">Sử dụng giao diện màu tối để bảo vệ mắt.</p>
                                </div>
                            </div>
                            <div className="w-12 h-6 bg-red-600 rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
