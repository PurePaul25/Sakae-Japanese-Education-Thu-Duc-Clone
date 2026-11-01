import { useState, useEffect, useRef } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../../contexts/ToastContext';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FiEdit2, FiMail, FiPhone, FiMapPin, FiCalendar, FiUser, FiCheck, FiX } from 'react-icons/fi';
import SEO from '../../hooks/useSEO';
import api from '../../utils/api';
import { ASSETS } from '../../constants/assets';

const PROFILE_INPUT_CLASS =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 ';

const UserProfile = ({ isAdmin = false }) => {
    const { user, updateUser } = useUser();
    const { addToast } = useToast();
    const fileInputRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profile, setProfile] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        phoneNumber: '',
        address: '',
        dateOfBirth: '',
        gender: '',
        bio: '',
    });

    useEffect(() => {
        if (!user?.id) {
            setIsLoading(false);
            return;
        }

        const currentUser = {
            ...user,
            ...(user?.user || {}),
        };

        let isMounted = true;

        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/users/profile');
                const data = response.data.data || response.data;
                if (!isMounted) return;
                setProfile(data);
                setFormData({
                    username: data.username || '',
                    fullName: data.fullName || '',
                    phoneNumber: data.phoneNumber || '',
                    address: data.address || '',
                    dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
                    gender: data.gender || '',
                    bio: data.bio || '',
                });

                if (
                    data.fullName !== currentUser.fullName ||
                    data.email !== currentUser.email ||
                    data.username !== currentUser.username ||
                    data.phoneNumber !== currentUser.phoneNumber ||
                    data.address !== currentUser.address ||
                    data.bio !== currentUser.bio ||
                    data.dateOfBirth !== currentUser.dateOfBirth
                ) {
                    updateUser(data);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchProfile();

        return () => {
            isMounted = false;
        };
    }, [user, user?.id, updateUser]);

    const handleAvatarClick = () => {
        if (!isEditing) {
            addToast('Vui lòng nhấn "Chỉnh sửa" trước khi thay đổi ảnh đại diện', 'info');
            return;
        }
        fileInputRef.current?.click();
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Kiểm tra loại file
        if (!file.type.startsWith('image/')) {
            addToast('Vui lòng chọn tệp hình ảnh', 'error');
            return;
        }

        // Kiểm tra dung lượng (5MB = 5 * 1024 * 1024 bytes)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            addToast('Kích thước ảnh quá lớn (tối đa 5MB). Vui lòng chọn ảnh nhẹ hơn.', 'error');
            // Reset input file để người dùng có thể chọn lại cùng 1 file sau khi bị lỗi
            e.target.value = '';
            return;
        }

        setSelectedFile(file);

        // Thu hồi URL cũ để tránh rò rỉ bộ nhớ
        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }

        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        // Reset input để có thể chọn lại chính file này nếu muốn
        e.target.value = '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);

            let currentAvatarUrl = profile?.avatar;

            // 1. Upload avatar trước nếu có chọn ảnh mới
            if (selectedFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', selectedFile);

                try {
                    const uploadRes = await api.post('/users/avatar', uploadFormData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    // Giả sử API trả về { avatar: 'url_moi' }
                    currentAvatarUrl = uploadRes.data.avatar || uploadRes.data.data?.avatar;
                } catch (err) {
                    console.error('Upload avatar error:', err);
                    addToast('Upload ảnh thất bại, nhưng vẫn đang lưu các thông tin khác...', 'warning');
                }
            }

            // 2. Cập nhật thông tin profile
            const patchData = { ...formData };
            if (!patchData.dateOfBirth) {
                delete patchData.dateOfBirth;
            }

            const response = await api.patch('/users/profile', patchData);
            const updatedProfile = response.data.data || response.data;

            // 3. Hợp nhất dữ liệu mới nhất (bao gồm cả avatar mới)
            const finalUserData = {
                ...user,
                ...updatedProfile,
                avatar: currentAvatarUrl,
            };

            setProfile(finalUserData);
            updateUser(finalUserData); // Cập nhật Global Context (Header sẽ nhận được)

            setIsEditing(false);
            setSelectedFile(null);
            setPreviewUrl(null);
            addToast('Cập nhật hồ sơ thành công!', 'success');
        } catch (error) {
            console.error('Error updating profile:', error);
            addToast(error.response?.data?.message || error.message || 'Lưu thông tin thất bại', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa cập nhật';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="animate-spin rounded-full h-14 w-14 border-4 border-red-600/30 border-t-red-600"></div>
                <p className="text-2xl font-semibold text-red-600 animate-pulse tracking-wider">ĐANG TẢI...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <SEO page="userProfile" />

            {/* Header / Banner */}
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
                            src={previewUrl || profile?.avatar || ASSETS.DEFAULT_AVATAR}
                            alt={profile?.fullName}
                            className="w-26 h-26 rounded-2xl border-2 border-white object-cover shadow-xl relative z-10 bg-white"
                        />
                        <button
                            onClick={handleAvatarClick}
                            className={`absolute -bottom-2.5 -right-2.5 p-2 text-white rounded-xl shadow-md cursor-pointer transition-all hover:scale-105 z-20 ${
                                isEditing ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-400 opacity-70'
                            }`}
                        >
                            <FiEdit2 size={16} />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </motion.div>
                    <div className="pb-4 md:pb-8 text-white">
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl md:text-3xl font-black mb-1 drop-shadow-md"
                        >
                            {profile?.fullName || (isAdmin ? 'Quản trị viên' : 'Học viên Sakae')}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="opacity-90 flex items-center gap-2 text-sm font-medium bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full w-fit"
                        >
                            <FiUser size={14} />
                            {isAdmin ? 'Quản trị viên' : 'Học viên'} • {profile?.username || 'user'}
                        </motion.p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Information Card */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 md:p-6"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Thông tin cá nhân</h2>
                            <div className="flex items-center gap-2">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="inline-flex items-center cursor-pointer gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-600/20 transition-all duration-200 hover:bg-red-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-slate-900"
                                        >
                                            <FiCheck size={14} /> {isSaving ? 'Đang lưu...' : 'Lưu'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                setSelectedFile(null);
                                                setPreviewUrl(null);
                                                setFormData({
                                                    username: profile?.username || '',
                                                    fullName: profile?.fullName || '',
                                                    phoneNumber: profile?.phoneNumber || '',
                                                    address: profile?.address || '',
                                                    dateOfBirth: profile?.dateOfBirth
                                                        ? profile?.dateOfBirth.split('T')[0]
                                                        : '',
                                                    gender: profile?.gender || '',
                                                    bio: profile?.bio || '',
                                                });
                                            }}
                                            className="inline-flex items-center cursor-pointer gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white dark:focus-visible:ring-offset-slate-900"
                                        >
                                            <FiX size={14} /> Hủy
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="inline-flex items-center gap-2 cursor-pointer rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition-all duration-200 hover:border-red-200 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20 dark:focus-visible:ring-offset-slate-900"
                                    >
                                        <FiEdit2 size={14} /> Chỉnh sửa
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    Họ và tên
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className={PROFILE_INPUT_CLASS}
                                    />
                                ) : (
                                    <p className="font-medium text-slate-700 dark:text-slate-200">
                                        {profile?.fullName}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    Tên người dùng
                                </label>
                                {isEditing ? (
                                    <div className="relative">
                                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 select-none text-sm text-slate-400">
                                            @
                                        </span>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            className={`${PROFILE_INPUT_CLASS} pl-7 pr-2.5`}
                                            placeholder="ten_nguoi_dung"
                                        />
                                    </div>
                                ) : (
                                    <p className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                                        <span className="text-slate-500 dark:text-slate-400">@</span>
                                        {profile?.username}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    Email
                                </label>
                                <p className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                                    <FiMail className="text-slate-400" /> {profile?.email}
                                </p>
                            </div>{' '}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    Số điện thoại
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className={PROFILE_INPUT_CLASS}
                                    />
                                ) : (
                                    <p className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                                        <FiPhone className="text-slate-400" /> {profile?.phoneNumber || 'Chưa cập nhật'}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    Giới tính
                                </label>
                                {isEditing ? (
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className={`${PROFILE_INPUT_CLASS} cursor-pointer`}
                                    >
                                        <option value="">Chọn giới tính</option>
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                ) : (
                                    <p className="font-medium text-slate-700 dark:text-slate-200">
                                        {profile?.gender || 'Chưa cập nhật'}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    Ngày sinh
                                </label>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        className={PROFILE_INPUT_CLASS}
                                    />
                                ) : (
                                    <p className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                                        <FiCalendar className="text-slate-400" /> {formatDate(profile?.dateOfBirth)}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    Ngày tham gia
                                </label>
                                <p className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                                    <FiCalendar className="text-slate-400" /> {formatDate(profile?.createdAt)}
                                </p>
                            </div>
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    Địa chỉ
                                </label>
                                {isEditing ? (
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows="2"
                                        className={`${PROFILE_INPUT_CLASS} resize-none`}
                                    />
                                ) : (
                                    <p className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                                        <FiMapPin className="text-slate-400" /> {profile?.address || 'Chưa cập nhật'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 md:p-6"
                    >
                        <h2 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">Giới thiệu bản thân</h2>
                        {isEditing ? (
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Hãy chia sẻ một chút về bản thân bạn..."
                                className={`${PROFILE_INPUT_CLASS} resize-none leading-relaxed`}
                            />
                        ) : (
                            <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                                {profile?.bio || 'Học viên chưa cập nhật phần giới thiệu bản thân.'}
                            </p>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
