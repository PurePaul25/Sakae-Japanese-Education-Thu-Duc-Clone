import { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FiEdit2, FiMail, FiPhone, FiMapPin, FiCalendar, FiUser } from 'react-icons/fi';

const UserProfile = () => {
    const { user } = useUser();
    const [isEditing, setIsEditing] = useState(false);

    // Mock data for extra info if not in user object
    const extraInfo = {
        phone: '0987 654 321',
        address: 'Quận Thủ Đức, TP. Hồ Chí Minh',
        joinDate: '12/03/2024',
        bio: 'Yêu thích tiếng Nhật và văn hóa Nhật Bản. Đang nỗ lực chinh phục JLPT N2!',
        birthDate: '15/05/2000',
        gender: 'Nam',
    };

    return (
        <div className="space-y-6">
            {/* Header / Banner */}
            <div className="relative h-36 rounded-3xl overflow-hidden bg-gradient-to-br from-red-600 via-red-500 to-red-400 shadow-lg mb-8">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                <div className="absolute top-4 left-6 flex items-end gap-6">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 rounded-2xl bg-white shadow-2xl scale-105"></div>
                        <img
                            src={user?.avatar || 'https://i.pravatar.cc/150'}
                            alt={user?.fullName}
                            className="w-26 h-26 rounded-2xl border-2 border-white object-cover shadow-xl relative z-10 bg-white"
                        />
                        <button className="absolute -bottom-2.5 -right-2.5 p-2 bg-red-600 text-white rounded-xl shadow-md cursor-pointer hover:bg-red-700 transition-all hover:scale-105 z-20">
                            <FiEdit2 size={16} />
                        </button>
                    </motion.div>
                    <div className="pb-8 text-white">
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl md:text-3xl font-black mb-1 drop-shadow-md"
                        >
                            {user?.fullName || 'Học viên Sakae'}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="opacity-90 flex items-center gap-2 text-sm font-medium bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full w-fit"
                        >
                            <FiUser size={14} />
                            Học viên • {user?.username}
                        </motion.p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Information Card */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Thông tin cá nhân</h2>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="text-sm cursor-pointer text-red-600 font-semibold hover:underline flex items-center gap-1"
                            >
                                <FiEdit2 size={14} /> {isEditing ? 'Hủy' : 'Chỉnh sửa'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Họ và tên
                                </label>
                                <p className="text-gray-700 font-medium">{user?.fullName}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Email
                                </label>
                                <p className="text-gray-700 font-medium flex items-center gap-2">
                                    <FiMail className="text-gray-400" /> {user?.email}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Số điện thoại
                                </label>
                                <p className="text-gray-700 font-medium flex items-center gap-2">
                                    <FiPhone className="text-gray-400" /> {extraInfo.phone}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Giới tính
                                </label>
                                <p className="text-gray-700 font-medium">{extraInfo.gender}</p>
                            </div>
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Địa chỉ
                                </label>
                                <p className="text-gray-700 font-medium flex items-center gap-2">
                                    <FiMapPin className="text-gray-400" /> {extraInfo.address}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                    >
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Giới thiệu bản thân</h2>
                        <p className="text-gray-600 leading-relaxed">{extraInfo.bio}</p>
                    </motion.div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                    >
                        <h3 className="font-bold text-gray-800 mb-4">Hoạt động</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <FiCalendar />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs text-[10px] uppercase font-bold tracking-tight">
                                        Ngày tham gia
                                    </p>
                                    <p className="text-gray-700 font-medium">{extraInfo.joinDate}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                    <FiEdit2 />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs text-[10px] uppercase font-bold tracking-tight">
                                        Bài học gần nhất
                                    </p>
                                    <p className="text-gray-700 font-medium">Học Kanji N3 - Bài 5</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-50 p-5 rounded-2xl border border-gray-300 flex flex-col space-y-4"
                    >
                        {/* 👇 Phần này chuyển thành flex-row */}
                        <div className="flex items-center justify-between space-x-3">
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-2xl">
                                🌸
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-800">Thẻ học viên Sakae</h3>
                                <p className="text-xs text-gray-400 font-mono mt-0.5 text-center">
                                    ID: SK-{user?.id?.padStart(4, '0')}
                                </p>
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-2xl font-semibold text-gray-800 tracking-wide">テスト</p>
                        </div>

                        <div className="w-full h-px bg-gray-200"></div>

                        <div className="flex justify-between w-full text-xs items-center px-2">
                            <span className="uppercase tracking-widest text-gray-400">Basic Member</span>
                            <span className="font-bold text-red-600">Sakae Center</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
