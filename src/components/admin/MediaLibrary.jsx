import React, { useState } from 'react';
import { 
    Upload, 
    Search, 
    Link, 
    Trash2, 
    X, 
    Copy, 
    Check, 
    Info,
    Grid,
    List,
    FileImage
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MediaLibrary = () => {
    const [images, setImages] = useState([
        { id: 1, url: 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?q=80&w=300&h=200&auto=format&fit=crop', name: 'Japanese Temple.jpg', size: '1.2 MB', date: '2024-03-20' },
        { id: 2, url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=300&h=200&auto=format&fit=crop', name: 'Kyoto Street.png', size: '2.5 MB', date: '2024-03-21' },
        { id: 3, url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=300&h=200&auto=format&fit=crop', name: 'Mount Fuji.jpg', size: '800 KB', date: '2024-03-22' },
        { id: 4, url: 'https://images.unsplash.com/photo-1528164344705-47542687990d?q=80&w=300&h=200&auto=format&fit=crop', name: 'Sakura Garden.jpg', size: '1.5 MB', date: '2024-03-23' },
        { id: 5, url: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=300&h=200&auto=format&fit=crop', name: 'Tokyo Night.webp', size: '3.1 MB', date: '2024-03-24' },
        { id: 6, url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=300&h=200&auto=format&fit=crop', name: 'Osaka Castle.jpg', size: '2.2 MB', date: '2024-03-25' },
    ]);

    const [selectedImage, setSelectedImage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    const handleCopyLink = (url, id) => {
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDelete = (id) => {
        setImages(images.filter(img => img.id !== id));
        if (selectedImage?.id === id) setSelectedImage(null);
    };

    const filteredImages = images.filter(img => 
        img.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm hình ảnh..." 
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 dark:text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm shadow-red-200 dark:shadow-none cursor-pointer">
                        <Upload size={18} />
                        Tải lên hình ảnh
                    </button>
                </div>
            </div>

            {/* Upload Zone (Drag & Drop Mockup) */}
            <div 
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${
                    isDragging 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/10' 
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50'
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
            >
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mb-3">
                    <FileImage size={24} />
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-medium">Kéo và thả hình ảnh vào đây</p>
                <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">PNG, JPG, SVG tối đa 10MB</p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                <AnimatePresence>
                    {filteredImages.map((image) => (
                        <motion.div 
                            key={image.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="group relative bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer aspect-square"
                            onClick={() => setSelectedImage(image)}
                        >
                            <img src={image.url} alt={image.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleCopyLink(image.url, image.id); }}
                                    className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/40 transition-colors cursor-pointer"
                                    title="Sao chép liên kết"
                                >
                                    {copiedId === image.id ? <Check size={18} /> : <Copy size={18} />}
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDelete(image.id); }}
                                    className="p-2 bg-red-500/80 backdrop-blur-md rounded-lg text-white hover:bg-red-500 transition-colors cursor-pointer"
                                    title="Xóa"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Detail Sidebar / Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Preview */}
                            <div className="flex-1 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden min-h-[300px]">
                                <img src={selectedImage.url} alt={selectedImage.name} className="max-w-full max-h-full object-contain" />
                            </div>

                            {/* Info */}
                            <div className="w-full md:w-80 p-6 flex flex-col border-l border-slate-200 dark:border-slate-800">
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white truncate pr-6">{selectedImage.name}</h3>
                                    <button onClick={() => setSelectedImage(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-4 flex-1">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Kích thước</span>
                                            <span className="font-medium text-slate-700 dark:text-slate-300">{selectedImage.size}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Loại</span>
                                            <span className="font-medium text-slate-700 dark:text-slate-300">{selectedImage.name.split('.').pop().toUpperCase()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Đã tải lên</span>
                                            <span className="font-medium text-slate-700 dark:text-slate-300">{selectedImage.date}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block pl-1">Đường dẫn hình ảnh</label>
                                        <div className="flex gap-2">
                                            <input 
                                                readOnly 
                                                value={selectedImage.url} 
                                                className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs p-2 text-slate-600 dark:text-slate-400 focus:ring-0"
                                            />
                                            <button 
                                                onClick={() => handleCopyLink(selectedImage.url, 'modal')}
                                                className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                                            >
                                                {copiedId === 'modal' ? <Check size={16} /> : <Copy size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 flex gap-3">
                                    <button 
                                        onClick={() => handleDelete(selectedImage.id)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                                    >
                                        <Trash2 size={16} />
                                        Xóa
                                    </button>
                                    <button 
                                        onClick={() => setSelectedImage(null)}
                                        className="flex-1 py-2 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MediaLibrary;
