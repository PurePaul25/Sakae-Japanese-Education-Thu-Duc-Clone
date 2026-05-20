import React from 'react';

const GalleryCard = ({ image, handleLike, setSelectedImage }) => {
    return (
        <div
            className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer border border-slate-100"
            onClick={() => setSelectedImage(image)}
        >
            <div className="aspect-[4/4.5] overflow-hidden bg-slate-100">
                <img
                    src={image.src}
                    alt={image.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                />
            </div>

            <div className="absolute top-2 left-2 md:top-4 md:left-4">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[10px] font-black text-slate-800 rounded-full uppercase tracking-widest shadow-sm border border-slate-100/10">
                    {image.category}
                </span>
            </div>

            {/* Hover details overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-3 md:p-4">
                <span className="px-2.5 py-0.5 bg-red-600 text-white text-[9px] font-black rounded-full uppercase tracking-wider self-start mb-1 md:mb-2">
                    {image.category}
                </span>
                <h3 className="text-white font-bold text-base leading-tight transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 mb-1.5 md:mb-3">
                    {image.title}
                </h3>
                <div className="flex items-center justify-between border-t border-white/10 pt-1.5 md:pt-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={(e) => handleLike(image.id, e)}
                            className="flex items-center gap-1 text-white hover:text-red-500 transition-colors focus:outline-none cursor-pointer"
                        >
                            <span className={`text-base ${image.isLiked ? 'text-red-500' : ''}`}>❤️</span>
                            <span className="text-xs font-black">{image.likesCount}</span>
                        </button>
                        <div className="flex items-center gap-1 text-white">
                            <span className="text-base">💬</span>
                            <span className="text-xs font-black">{image.commentsCount}</span>
                        </div>
                    </div>
                    <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider">{image.date}</span>
                </div>
            </div>
        </div>
    );
};

export default GalleryCard;
