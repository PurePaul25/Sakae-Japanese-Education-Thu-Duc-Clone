import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiCalendar, FiUser, FiArrowLeft, FiShield } from 'react-icons/fi';
import SEO from '../../hooks/useSEO';
import api from '../../utils/api';

const DEFAULT_AVATAR = 'https://res.cloudinary.com/dp3gvvsen/image/upload/v1778731268/sakae-default-user-avatar.jpg';

const PublicProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!id) return;
        setIsLoading(true);
        setNotFound(false);
        api.get(`/users/${id}/public`)
            .then((res) => setProfile(res.data.data || res.data))
            .catch((err) => {
                if (err.response?.status === 404) setNotFound(true);
            })
            .finally(() => setIsLoading(false));
    }, [id]);

    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa cập nhật';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="animate-spin rounded-full h-14 w-14 border-4 border-red-600/30 border-t-red-600"></div>
                <p className="text-2xl font-semibold text-red-600 animate-pulse tracking-wider">ĐANG TẢI...</p>
            </div>
        );
    }

    if (notFound || !profile) {
        return (
            <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-6xl mb-4">🙈</p>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Không tìm thấy người dùng</h2>
                    <p className="text-slate-500 mb-6">Người dùng này có thể đã xóa tài khoản hoặc không tồn tại.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-5 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 transition-colors cursor-pointer"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    const isAdmin = profile.role === 'ADMIN';

    return (
        <div className="bg-gray-50/50 pt-22 pb-12">
            <SEO
                customTitle={`${profile.fullName} | Sakae Academy`}
                customDescription={profile.bio || `Xem hồ sơ của ${profile.fullName} trên Sakae Academy.`}
            />

            <div className="max-w-6xl mx-auto px-3 md:px-4">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-red-600 font-semibold mb-4 mt-1 transition-colors cursor-pointer group"
                >
                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    Quay lại
                </button>

                <div className="space-y-6">
                    {/* Header / Banner — giống hệt UserProfile */}
                    <div className="relative h-36 rounded-3xl overflow-hidden bg-gradient-to-br from-red-600 via-red-500 to-red-400 shadow-lg mb-6">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                        <div className="absolute top-4 left-4 md:top-4 md:left-6 flex items-end gap-6">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.4 }}
                                className="relative"
                            >
                                <div className="absolute inset-0 rounded-2xl bg-white shadow-2xl scale-105"></div>
                                <img
                                    src={profile.avatar || DEFAULT_AVATAR}
                                    alt={profile.fullName}
                                    className="w-26 h-26 rounded-2xl border-2 border-white object-cover shadow-xl relative z-10 bg-white"
                                />
                            </motion.div>
                            <div className="pb-4 md:pb-8 text-white">
                                <motion.h1
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-xl md:text-3xl font-black mb-1 drop-shadow-md flex items-center gap-2"
                                >
                                    {profile.fullName}
                                    {isAdmin && (
                                        <span className="flex items-center gap-1 px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-xs font-black rounded-full uppercase tracking-wider border border-white/30">
                                            <FiShield size={10} /> Admin
                                        </span>
                                    )}
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="opacity-90 flex items-center gap-2 text-sm font-medium bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full w-fit"
                                >
                                    <FiUser size={14} />
                                    {isAdmin ? 'Quản trị viên' : 'Học viên'} • {profile.username || 'user'}
                                </motion.p>
                            </div>
                        </div>
                    </div>

                    {/* Info Cards */}
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-6">
                            {/* Thông tin cơ bản */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-3.5 md:p-6 rounded-2xl shadow-sm border border-gray-100"
                            >
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Thông tin cá nhân</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Họ và tên
                                        </label>
                                        <p className="text-gray-700 font-medium">{profile.fullName}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Tên đăng nhập
                                        </label>
                                        <p className="text-gray-700 font-medium flex items-center gap-2">
                                            <FiUser className="text-gray-400" />@{profile.username || 'Chưa cập nhật'}
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Vai trò
                                        </label>
                                        <p className="text-gray-700 font-medium">
                                            {isAdmin ? 'Quản trị viên' : 'Học viên'}
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Ngày tham gia
                                        </label>
                                        <p className="text-gray-700 font-medium flex items-center gap-2">
                                            <FiCalendar className="text-gray-400" />
                                            {formatDate(profile.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Giới thiệu bản thân */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white p-3.5 md:p-6 rounded-2xl shadow-sm border border-gray-100"
                            >
                                <h2 className="text-xl font-bold text-gray-800 mb-2">Giới thiệu bản thân</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    {profile.bio || 'Người dùng này chưa cập nhật phần giới thiệu bản thân.'}
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicProfile;
