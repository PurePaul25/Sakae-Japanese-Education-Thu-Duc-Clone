import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Clock, AlertCircle, Loader2, BookOpen, ChevronRight } from 'lucide-react';
import SEO from '../../../hooks/useSEO';
import { getPracticeSets } from '../../../services/jlptPracticeService';
import {
    TYPE_SLUG_TO_CATEGORY,
    setStateKey,
    setResultKey,
    getPracticeSetDisplayTitle,
} from '../../../types/jlptPractice';

const CATEGORY_LABELS = {
    vocabulary: 'Từ vựng',
    kanji: 'Kanji',
    grammar: 'Ngữ pháp',
    reading: 'Đọc hiểu',
};

const CATEGORY_COLORS = {
    vocabulary: { bg: 'bg-blue-50', text: 'text-blue-600', accent: 'bg-blue-500' },
    kanji: { bg: 'bg-red-50', text: 'text-red-600', accent: 'bg-red-500' },
    grammar: { bg: 'bg-green-50', text: 'text-green-600', accent: 'bg-green-500' },
    reading: { bg: 'bg-purple-50', text: 'text-purple-600', accent: 'bg-purple-500' },
};

const PracticeTestSelection = () => {
    const { levelId, type } = useParams();
    const navigate = useNavigate();

    const [sets, setSets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const category = TYPE_SLUG_TO_CATEGORY[type];
    const colors = CATEGORY_COLORS[type] ?? CATEGORY_COLORS.vocabulary;

    // Fetch practice sets from backend
    useEffect(() => {
        if (!category) {
            setError('Loại luyện tập không hợp lệ.');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        getPracticeSets(levelId, category)
            .then((data) => {
                // Sort by setNumber in case backend order differs
                const sorted = [...(Array.isArray(data) ? data : [])].sort((a, b) => a.setNumber - b.setNumber);
                setSets(sorted);
            })
            .catch((err) => {
                if (err?.response?.status === 401) {
                    setError('Bạn cần đăng nhập để luyện tập.');
                } else {
                    setError('Không thể tải danh sách đề. Vui lòng thử lại.');
                }
            })
            .finally(() => setLoading(false));
    }, [levelId, category]);

    const openSetExamPopup = (set) => {
        const popupWidth = 1400;
        const popupHeight = 900;
        const left = (window.screen.width - popupWidth) / 2;
        const top = (window.screen.height - popupHeight) / 2;

        // Clear previous state for this set
        localStorage.removeItem(setStateKey(set.id));
        localStorage.removeItem(setResultKey(set.id));

        window.open(
            `/thi-thu-JLPT/practice/exam/set/${set.id}`,
            `PracticeSetWindow_${set.id}`,
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,location=no,toolbar=no,menubar=no`,
        );
    };

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="pt-22 pb-14 bg-slate-50 min-h-screen">
            <SEO page="practicejlptTest" />

            <div className="max-w-7xl mx-auto px-4">
                {/* Back button */}
                <button
                    onClick={() => navigate(`/thi-thu-JLPT/practice/${levelId}`)}
                    className="flex items-center gap-2 text-slate-500 hover:text-red-600 font-bold mb-6 transition-colors cursor-pointer group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Quay lại</span>
                </button>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-black tracking-widest uppercase">
                                {levelId}
                            </span>
                            <span className="text-slate-300">/</span>
                            <span
                                className={`px-3 py-1 ${colors.bg} ${colors.text} rounded-lg text-xs font-black tracking-widest uppercase`}
                            >
                                {CATEGORY_LABELS[type] || type}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900">Danh sách bộ đề luyện tập</h1>
                    </div>

                    {!loading && !error && sets.length > 0 && (
                        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                    Tổng số đề
                                </p>
                                <p className="text-xl font-black text-slate-800">{sets.length}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Loading state */}
                {loading && (
                    <div className="flex flex-col items-center justify-center gap-4 py-24">
                        <Loader2 size={36} className="animate-spin text-red-600" />
                        <p className="text-slate-500 font-bold">Đang tải danh sách đề...</p>
                    </div>
                )}

                {/* Error state */}
                {!loading && error && (
                    <div className="flex flex-col items-center justify-center gap-4 py-24">
                        <AlertCircle size={36} className="text-red-500" />
                        <p className="text-slate-700 font-bold text-lg">{error}</p>
                        {error.includes('đăng nhập') ? (
                            <button
                                onClick={() => navigate('/dang-nhap')}
                                className="px-8 py-3 bg-red-500 hover:bg-red-600 transition duration-200 text-white font-black rounded-2xl cursor-pointer"
                            >
                                Đăng nhập ngay
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    setLoading(true);
                                    setError(null);
                                    getPracticeSets(levelId, category)
                                        .then((data) => {
                                            const sorted = [...(Array.isArray(data) ? data : [])].sort(
                                                (a, b) => a.setNumber - b.setNumber,
                                            );
                                            setSets(sorted);
                                        })
                                        .catch(() => setError('Không thể tải danh sách đề. Vui lòng thử lại.'))
                                        .finally(() => setLoading(false));
                                }}
                                className="px-8 py-3 bg-slate-900 text-white font-black rounded-2xl cursor-pointer hover:bg-red-600 transition-all"
                            >
                                Thử lại
                            </button>
                        )}
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && sets.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-4 py-24">
                        <BookOpen size={48} className="text-slate-300" />
                        <p className="text-slate-500 font-bold text-lg text-center">
                            Chưa có đề luyện tập nào cho{' '}
                            <span className="text-slate-700">
                                {levelId} {CATEGORY_LABELS[type]}
                            </span>
                            .
                        </p>
                    </div>
                )}

                {/* Set cards grid */}
                {!loading && !error && sets.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sets.map((set, idx) => (
                            <motion.div
                                key={set.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group relative bg-white p-5 rounded-[1.5rem] border-2 border-transparent hover:border-red-500 hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 cursor-pointer"
                                onClick={() => openSetExamPopup(set)}
                            >
                                {/* Set number badge + title */}
                                <div className="flex items-start gap-4 mb-4">
                                    <div
                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner shrink-0 ${colors.bg} ${colors.text} group-hover:scale-110 transition-transform`}
                                    >
                                        {set.setNumber}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-slate-900 text-lg mb-1 group-hover:text-red-600 transition-colors leading-tight break-words">
                                            {getPracticeSetDisplayTitle(set)}
                                        </h3>
                                        {set.description && (
                                            <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">
                                                {set.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Meta row */}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-4 text-slate-400 text-xs font-bold">
                                        <span className="flex items-center gap-1.5">
                                            <Play size={12} strokeWidth={2.5} fill="currentColor" />
                                            {set.questionCount ?? '—'} câu
                                        </span>
                                        {set.questionCount > 0 && (
                                            <span className="flex items-center gap-1.5">
                                                <Clock size={12} strokeWidth={2.5} />~
                                                {Math.ceil((set.questionCount * 90) / 60)} ph
                                            </span>
                                        )}
                                    </div>
                                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md group-hover:bg-red-600 group-hover:scale-110 transition-all">
                                        <ChevronRight size={18} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PracticeTestSelection;
