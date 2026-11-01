import React, { useState } from 'react';
import { CheckCircle2, Image as ImageIcon, Loader2, Link2, Trash2, Upload } from 'lucide-react';
import { adminUploadReadingImage, adminVerifyReadingImageUrl } from '../../services/jlptPracticeService';
import ReadingImage from '../jlpt/ReadingImage';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const ReadingImageField = ({
    level,
    practiceSetId,
    practiceSets = [],
    imageUrl,
    initialPreviewUrl,
    onPracticeSetChange,
    onImageUrlChange,
}) => {
    const [mode, setMode] = useState('url');
    const [verifiedPreviewUrl, setVerifiedPreviewUrl] = useState(initialPreviewUrl || imageUrl || '');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [urlVerified, setUrlVerified] = useState(false);

    const readingSets = practiceSets.filter((set) => set.level === level && set.category === 'READING');

    const updateUrl = (value) => {
        onImageUrlChange(value);
        setVerifiedPreviewUrl('');
        setUrlVerified(false);
        setError('');
    };

    const handleVerifyUrl = async () => {
        const url = imageUrl.trim();
        if (!url) {
            setError('Vui lòng nhập URL ảnh.');
            return;
        }

        setBusy(true);
        setError('');
        try {
            const verified = await adminVerifyReadingImageUrl(url);
            onImageUrlChange(verified.url);
            setVerifiedPreviewUrl(verified.url);
            setUrlVerified(true);
        } catch (err) {
            const message = err?.response?.data?.message;
            setError(Array.isArray(message) ? message.join(', ') : message || 'Không thể xác minh URL ảnh.');
        } finally {
            setBusy(false);
        }
    };

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        if (!ACCEPTED_TYPES.includes(file.type)) {
            setError('Chỉ hỗ trợ file JPG, PNG hoặc WEBP.');
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            setError('Dung lượng ảnh tối đa là 5 MB.');
            return;
        }
        if (!level || !practiceSetId) {
            setError('Chọn cấp độ và bộ đề Reading trước khi tải ảnh lên.');
            return;
        }

        setBusy(true);
        setError('');
        try {
            const uploaded = await adminUploadReadingImage(file, level, practiceSetId);
            onImageUrlChange(uploaded.imageUrl);
            setVerifiedPreviewUrl(uploaded.imageUrl);
            setUrlVerified(true);
        } catch (err) {
            const message = err?.response?.data?.message;
            setError(Array.isArray(message) ? message.join(', ') : message || 'Tải ảnh thất bại.');
        } finally {
            setBusy(false);
        }
    };

    const chooseMode = (nextMode) => {
        setMode(nextMode);
        setError('');
    };

    return (
        <div className="space-y-3">
            <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bộ đề Reading dùng cho ảnh Cloudinary
                </label>
                <select
                    value={practiceSetId}
                    onChange={(event) => onPracticeSetChange(event.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                    <option value="">Chọn bộ đề Reading</option>
                    {readingSets.map((set) => (
                        <option key={set.id} value={set.id}>
                            #{set.setNumber} {set.title}
                        </option>
                    ))}
                </select>
                {!level && <p className="mt-1 text-xs text-slate-500">Chọn cấp độ JLPT trước.</p>}
                {level && readingSets.length === 0 && (
                    <p className="mt-1 text-xs text-amber-600">Chưa có bộ đề Reading cho {level}; cần tạo bộ đề trước khi upload.</p>
                )}
            </div>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => chooseMode('url')}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${mode === 'url' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
                >
                    <Link2 size={15} /> URL bên ngoài
                </button>
                <button
                    type="button"
                    onClick={() => chooseMode('upload')}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${mode === 'upload' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
                >
                    <Upload size={15} /> Tải file
                </button>
            </div>

            {mode === 'url' ? (
                <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                        value={imageUrl}
                        onChange={(event) => updateUrl(event.target.value)}
                        className="min-w-0 flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                        placeholder="https://..."
                        maxLength={2048}
                    />
                    <button
                        type="button"
                        onClick={handleVerifyUrl}
                        disabled={busy || !imageUrl.trim()}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                        {busy ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                        Xác minh URL
                    </button>
                </div>
            ) : (
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-4 text-sm font-semibold text-slate-600 hover:border-red-400 dark:border-slate-700 dark:text-slate-300">
                    {busy ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                    {busy ? 'Đang tải ảnh lên...' : 'Chọn ảnh JPG, PNG hoặc WEBP (tối đa 5 MB)'}
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        disabled={busy}
                        onChange={handleFileChange}
                    />
                </label>
            )}

            {urlVerified && imageUrl && (
                <p className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 size={14} /> Ảnh đã được xác minh trước khi lưu.
                </p>
            )}
            {error && <p className="text-xs text-red-600" role="alert">{error}</p>}

            {verifiedPreviewUrl && (
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                    <ReadingImage
                        src={verifiedPreviewUrl}
                        alt="Xem trước ảnh minh họa bài đọc"
                        className="max-h-48 w-full bg-slate-50 p-2 dark:bg-slate-800"
                    />
                </div>
            )}
            {imageUrl && (
                <button
                    type="button"
                    onClick={() => updateUrl('')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
                >
                    <Trash2 size={13} /> Bỏ ảnh
                </button>
            )}
        </div>
    );
};

export default ReadingImageField;
