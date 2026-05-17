import React, { useState, useEffect } from 'react';
import { Search, Trash2, X, Edit3, Check, FileImage, Plus, Calendar, Tag, Activity, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import GalleryUploadModal from '../gallery/GalleryUploadModal';

const categories = ['Tất cả', 'Lễ hội', 'Lớp học', 'Giao lưu', 'Thiếu nhi', 'Sự kiện', 'Du học'];

const AdminCustomSelect = ({ value, onChange, options, placeholder, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = React.useRef(null);

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
        <div ref={containerRef} className="relative w-full">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm focus:ring-1 focus:ring-red-500 hover:ring-1 hover:ring-red-300 dark:text-white transition-all cursor-pointer outline-none text-left"
            >
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="truncate">{selectedOption.label}</span>
                </div>
                <svg
                    className={`w-4 h-4 fill-current text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                >
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl z-[100] max-h-60 overflow-y-auto py-1.5 animate-fadeIn">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                                onChange(opt.value);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-all flex items-center justify-between
                                ${
                                    opt.value === value
                                        ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold'
                                        : 'text-slate-600 cursor-pointer dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
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

const MediaLibrary = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Tất cả');
    const [selectedMonth, setSelectedMonth] = useState('Tất cả');
    const [selectedYear, setSelectedYear] = useState('Tất cả');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [imageToDelete, setImageToDelete] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editData, setEditData] = useState({ id: '', title: '', caption: '', category: '' });
    const { addToast } = useToast();

    const years = React.useMemo(() => {
        return [...new Set((images || []).map((img) => new Date(img.createdAt).getFullYear()))].sort((a, b) => b - a);
    }, [images]);

    const categoryOptions = React.useMemo(() => {
        return categories.map((cat) => ({ label: cat, value: cat }));
    }, []);

    const monthOptions = React.useMemo(
        () => [
            { label: 'Tất cả tháng', value: 'Tất cả' },
            ...Array.from({ length: 12 }, (_, i) => ({
                label: `Tháng ${i + 1}`,
                value: String(i + 1),
            })),
        ],
        [],
    );

    const yearOptions = React.useMemo(
        () => [
            { label: 'Tất cả năm', value: 'Tất cả' },
            ...years.map((y) => ({
                label: `Năm ${y}`,
                value: String(y),
            })),
        ],
        [years],
    );

    const fetchGallery = async () => {
        try {
            setLoading(true);
            const response = await api.get('/gallery');
            const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
            setImages(data);
        } catch (error) {
            console.error('Error fetching gallery:', error);
            addToast('Không thể tải danh sách hình ảnh', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGallery();
    }, []);

    const handleDeleteClick = (image) => {
        setImageToDelete(image);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!imageToDelete) return;

        try {
            setIsDeleting(true);
            await api.delete(`/gallery/${imageToDelete.id}`);
            addToast('Xóa ảnh thành công!', 'success');
            setImages(images.filter((img) => img.id !== imageToDelete.id));
            if (selectedImage?.id === imageToDelete.id) setSelectedImage(null);
            setIsDeleteModalOpen(false);
            setImageToDelete(null);
        } catch (error) {
            console.error('Delete error:', error);
            addToast('Lỗi khi xóa ảnh', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEditOpen = (image) => {
        setEditData({
            id: image.id,
            title: image.title || '',
            caption: image.caption || '',
            category: image.category || 'Lớp học',
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            setIsUpdating(true);
            await api.patch(`/gallery/${editData.id}`, editData);
            addToast('Cập nhật thành công!', 'success');
            setIsEditModalOpen(false);
            fetchGallery();
        } catch (error) {
            addToast('Lỗi khi cập nhật', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const filteredImages = (Array.isArray(images) ? images : []).filter((img) => {
        const date = new Date(img.createdAt);
        const imgMonth = date.getMonth() + 1;
        const imgYear = date.getFullYear();

        const matchesSearch =
            (img.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (img.category || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'Tất cả' || img.category === activeCategory;
        const matchesMonth = selectedMonth === 'Tất cả' || String(imgMonth) === selectedMonth;
        const matchesYear = selectedYear === 'Tất cả' || String(imgYear) === selectedYear;

        return matchesSearch && matchesCategory && matchesMonth && matchesYear;
    });

    return (
        <div className="space-y-6">
            {/* Header / Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 flex-1 w-full">
                    {/* Search Input */}
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm ảnh..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-1 focus:ring-red-500 hover:ring-1 hover:ring-red-300 dark:text-white transition-all outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Category Select */}
                    <AdminCustomSelect
                        value={activeCategory}
                        onChange={setActiveCategory}
                        options={categoryOptions}
                        placeholder="Chọn danh mục"
                        icon={<Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
                    />

                    {/* Month Select */}
                    <AdminCustomSelect
                        value={selectedMonth}
                        onChange={setSelectedMonth}
                        options={monthOptions}
                        placeholder="Tất cả tháng"
                        icon={<Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
                    />

                    {/* Year Select */}
                    <AdminCustomSelect
                        value={selectedYear}
                        onChange={setSelectedYear}
                        options={yearOptions}
                        placeholder="Tất cả năm"
                        icon={<Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
                    />
                </div>

                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-red-200 dark:shadow-none cursor-pointer whitespace-nowrap lg:self-stretch"
                >
                    <Plus size={18} />
                    ĐĂNG ẢNH MỚI
                </button>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 text-sm">Đang tải thư viện...</p>
                </div>
            ) : (
                <>
                    {/* Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <AnimatePresence>
                            {filteredImages.map((image) => (
                                <motion.div
                                    key={image.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="group relative bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-500"
                                >
                                    <div
                                        className="aspect-[16/10] overflow-hidden cursor-pointer"
                                        onClick={() => setSelectedImage(image)}
                                    >
                                        <img
                                            src={image.imageUrl}
                                            alt={image.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    </div>

                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-black rounded-full uppercase tracking-widest">
                                                {image.category}
                                            </span>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleEditOpen(image)}
                                                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all cursor-pointer"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(image)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all cursor-pointer"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1 group-hover:text-red-600 transition-colors">
                                            {image.title}
                                        </h3>
                                        <p className="text-slate-500 text-xs mt-1 line-clamp-1 italic">
                                            {image.caption || 'Không có mô tả'}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {filteredImages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-32 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-6">
                                <FileImage size={40} className="text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Không có ảnh nào</h3>
                            <p className="text-slate-500 mt-2">Vui lòng thử bộ lọc khác hoặc đăng ảnh mới.</p>
                        </div>
                    )}
                </>
            )}

            {/* Detail Preview Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-[1rem] max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex-1 bg-slate-900 flex items-center justify-center overflow-hidden">
                                <img
                                    src={selectedImage.imageUrl}
                                    alt={selectedImage.title}
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>

                            <div className="w-full md:w-96 p-8 flex flex-col border-l border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest mb-3 inline-block">
                                            {selectedImage.category}
                                        </span>
                                        <h3 className="font-black text-2xl text-slate-800 dark:text-white leading-tight">
                                            {selectedImage.title}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => setSelectedImage(null)}
                                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-6 flex-1">
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                                                <Activity size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">
                                                    Mô tả
                                                </p>
                                                <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                                                    {selectedImage.caption ||
                                                        'Không có mô tả chi tiết cho tấm ảnh này.'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                                                <Calendar size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">
                                                    Ngày đăng
                                                </p>
                                                <p className="text-slate-600 dark:text-slate-300 mt-1">
                                                    {new Date(selectedImage.createdAt).toLocaleDateString('vi-VN', {
                                                        dateStyle: 'full',
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                                    <button
                                        onClick={() => handleEditOpen(selectedImage)}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-2xl font-bold transition-all cursor-pointer"
                                    >
                                        <Edit3 size={18} />
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(selectedImage)}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl font-bold transition-all cursor-pointer"
                                    >
                                        <Trash2 size={18} />
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsEditModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-900 rounded-[1rem] max-w-2xl w-full overflow-hidden shadow-2xl border border-white/20"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                                    <Edit3 className="text-red-600" /> Sửa thông tin
                                </h3>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all cursor-pointer"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="p-5 space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2 block ml-1">
                                            Tiêu đề ảnh
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-1 focus:ring-red-500 outline-none dark:text-white transition-all font-medium"
                                            value={editData.title}
                                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2 block ml-1">
                                            Danh mục
                                        </label>
                                        <select
                                            className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-1 focus:ring-red-500 outline-none dark:text-white transition-all font-medium cursor-pointer"
                                            value={editData.category}
                                            onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                                        >
                                            {categories
                                                .filter((c) => c !== 'Tất cả')
                                                .map((c) => (
                                                    <option key={c} value={c}>
                                                        {c}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2 block ml-1">
                                            Mô tả ảnh
                                        </label>
                                        <textarea
                                            className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-1 focus:ring-red-500 outline-none dark:text-white transition-all font-medium min-h-[100px]"
                                            value={editData.caption}
                                            onChange={(e) => setEditData({ ...editData, caption: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-all cursor-pointer"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUpdating}
                                        className={`flex-2 py-3 rounded-2xl font-black text-white transition-all shadow-lg
                                            ${isUpdating ? 'bg-slate-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none cursor-pointer'}`}
                                    >
                                        {isUpdating ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Delete Confirmation Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
                        onClick={() => setIsDeleteModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-900 rounded-[1.5rem] max-w-xl w-full overflow-hidden shadow-2xl border border-white/20 p-8 text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="text-red-600" size={40} />
                            </div>

                            <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Xác nhận xóa?</h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                                Bạn có chắc chắn muốn xóa ảnh{' '}
                                <span className="font-bold text-slate-700 dark:text-slate-200">
                                    "{imageToDelete?.title}"
                                </span>
                                ? Hành động này không thể hoàn tác.
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className={`w-full py-3 rounded-2xl font-black text-white transition-all shadow-lg shadow-red-200 dark:shadow-none flex items-center justify-center gap-2
                                        ${isDeleting ? 'bg-slate-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 cursor-pointer'}`}
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            ĐANG XÓA...
                                        </>
                                    ) : (
                                        'ĐỒNG Ý XÓA'
                                    )}
                                </button>
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="w-full py-3 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all cursor-pointer"
                                >
                                    HỦY BỎ
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <GalleryUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUploadSuccess={fetchGallery}
                addToast={addToast}
            />
        </div>
    );
};

export default MediaLibrary;
