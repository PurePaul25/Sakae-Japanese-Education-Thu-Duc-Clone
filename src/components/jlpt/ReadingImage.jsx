import React, { useEffect, useState } from 'react';

const ReadingImage = ({ src, alt = 'Ảnh minh họa bài đọc', className = '' }) => {
    const [failed, setFailed] = useState(false);

    useEffect(() => setFailed(false), [src]);

    if (!src) return null;
    if (failed) {
        return (
            <div className={`flex items-center justify-center rounded-xl bg-slate-100 px-4 py-6 text-sm text-slate-500 ${className}`} role="status">
                Không thể tải ảnh minh họa.
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            loading="lazy"
            className={`max-w-full object-contain ${className}`}
            onError={() => setFailed(true)}
        />
    );
};

export default ReadingImage;
