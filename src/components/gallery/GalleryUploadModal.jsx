import React, { useState } from 'react';
import { FaTimes, FaCloudUploadAlt, FaImage } from 'react-icons/fa';
import api from '../../utils/api';

const GalleryUploadModal = ({ isOpen, onClose, onUploadSuccess, addToast }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        caption: '',
        category: 'Lớp học',
    });
    const [isUploading, setIsUploading] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (selectedFile.size > 5 * 1024 * 1024) {
            addToast('Ảnh quá lớn (tối đa 5MB)', 'error');
            return;
        }

        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            addToast('Vui lòng chọn ảnh', 'error');
            return;
        }

        try {
            setIsUploading(true);
            const data = new FormData();
            data.append('image', file);
            data.append('title', formData.title);
            data.append('caption', formData.caption);
            data.append('category', formData.category);

            await api.post('/gallery', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            addToast('Đăng ảnh thành công!', 'success');
            onUploadSuccess();
            onClose();
            // Reset form
            setFile(null);
            setPreview(null);
            setFormData({ title: '', caption: '', category: 'Lớp học' });
        } catch (error) {
            console.error('Upload error:', error);
            addToast('Lỗi khi đăng ảnh', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scaleIn">
                <div className="py-4 px-6  border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-red-500 to-red-600 text-white">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <FaCloudUploadAlt /> Đăng ảnh hoạt động
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 cursor-pointer rounded-full transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-3">
                    <div
                        className={`border-2 border-dashed rounded-xl p-4 transition-all flex flex-col items-center justify-center min-h-[240px] cursor-pointer
                            ${preview ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:border-red-400 bg-gray-50'}`}
                        onClick={() => document.getElementById('gallery-file-input').click()}
                    >
                        {preview ? (
                            <img src={preview} alt="Preview" className="max-h-[180px] rounded-lg shadow-sm" />
                        ) : (
                            <div className="text-center space-y-2">
                                <FaImage className="text-4xl text-gray-300 mx-auto" />
                                <p className="text-sm text-gray-500">Nhấn để chọn ảnh (Tối đa 5MB)</p>
                            </div>
                        )}
                        <input
                            id="gallery-file-input"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tiêu đề</label>
                            <input
                                type="text"
                                placeholder="Nhập tiêu đề ảnh..."
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all text-sm"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="flex w-full items-center justify-between">
                            <div className="flex-1 mr-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Danh mục
                                </label>
                                <select
                                    className="w-full px-3 cursor-pointer py-2 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all text-sm bg-white"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="Lớp học">Lớp học</option>
                                    <option value="Lễ hội">Lễ hội</option>
                                    <option value="Sự kiện">Sự kiện</option>
                                    <option value="Giao lưu">Giao lưu</option>
                                    <option value="Du học">Du học</option>
                                    <option value="Thiếu nhi">Thiếu nhi</option>
                                </select>
                            </div>
                            <div className="flex-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Mô tả ngắn (không bắt buộc)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nhập mô tả ngắn..."
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all text-sm"
                                    value={formData.caption}
                                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-3 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 cursor-pointer rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-all text-sm"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={isUploading}
                            className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all text-sm
                                ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-red-600 to-red-700 hover:shadow-red-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer'}`}
                        >
                            {isUploading ? 'Đang đăng ảnh...' : 'Đăng ngay'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GalleryUploadModal;
