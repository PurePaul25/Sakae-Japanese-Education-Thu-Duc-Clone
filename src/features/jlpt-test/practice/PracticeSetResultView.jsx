/**
 * PracticeSetResultView — Phase 3.1
 *
 * Route: /thi-thu-JLPT/practice/result/set/:setId
 *
 * Reads result saved by PracticeSetExamView from localStorage (setResultKey).
 * Backend result shape:
 *   { set, total, answered, unanswered, correct, wrong, score, results[], questions[] }
 *
 * results[i]: { questionId, selectedOptionId, correct, correctOptionId, explanation, readingPassage? }
 * questions[]: question snapshot (no isCorrect — only id, content, options[{id,content,order}], readingPassage?)
 *
 * correctOptionId is ONLY used here in the review AFTER submit — never exposed before.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    FaTrophy,
    FaRedo,
    FaHome,
    FaCheckCircle,
    FaTimes,
    FaListAlt,
    FaChevronLeft,
    FaChevronRight,
    FaBookOpen,
    FaLightbulb,
} from 'react-icons/fa';
import { Grid3x3, X, CheckCircle2, XCircle } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../../../hooks/useSEO';
import {
    setResultKey,
    setStateKey,
    CATEGORY_TO_TYPE_SLUG,
    getPracticeSetDisplayTitle,
} from '../../../types/jlptPractice';
import JlptContentRenderer from '../../../components/jlpt/JlptContentRenderer';
import ReadingImage from '../../../components/jlpt/ReadingImage';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CATEGORY_LABELS = {
    VOCABULARY: 'Từ vựng',
    KANJI: 'Kanji',
    GRAMMAR: 'Ngữ pháp',
    READING: 'Đọc hiểu',
};

// ─── Component ────────────────────────────────────────────────────────────────

const PracticeSetResultView = () => {
    const { setId } = useParams();
    const navigate = useNavigate();

    // ── Responsive detection cho Tablet & Điện thoại ─────────────────────────
    const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ── Load result from localStorage ─────────────────────────────────────────
    const resultData = useMemo(() => {
        try {
            const saved = localStorage.getItem(setResultKey(setId));
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    }, [setId]);

    // Destructure backend result shape
    const set = resultData?.set ?? {};
    const total = resultData?.total ?? 0;
    const unanswered = resultData?.unanswered ?? 0;
    const correct = resultData?.correct ?? 0;
    const wrong = resultData?.wrong ?? 0;
    const score = resultData?.score ?? 0;
    const results = useMemo(() => resultData?.results ?? [], [resultData]);
    const questions = useMemo(() => resultData?.questions ?? [], [resultData]);

    // Build a lookup map: questionId → result record
    const resultMap = useMemo(() => {
        const m = {};
        results.forEach((r) => {
            m[r.questionId] = r;
        });
        return m;
    }, [results]);

    const [reviewIndex, setReviewIndex] = useState(0);
    const [showAll, setShowAll] = useState(false);
    const [showPaletteModal, setShowPaletteModal] = useState(false);

    // ── No result ─────────────────────────────────────────────────────────────
    if (!resultData || !questions.length) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FaTimes size={32} />
                </div>
                <h2 className="text-2xl font-black text-gray-800 mb-2">Không tìm thấy kết quả</h2>
                <p className="text-gray-500 mb-6">Bạn chưa hoàn thành bài thi hoặc dữ liệu bài làm đã bị xóa.</p>
                <button
                    onClick={() => navigate('/thi-thu-JLPT')}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl cursor-pointer transition shadow-xs"
                >
                    Quay về trang luyện tập
                </button>
            </div>
        );
    }

    const categoryLabel = CATEGORY_LABELS[set.category] || set.category || '';
    const examTitle = getPracticeSetDisplayTitle(set);
    const reviewQuestion = questions[reviewIndex];

    // ── Redo: reopen exam popup ───────────────────────────────────────────────
    const handleRedo = () => {
        const popupWidth = 1400;
        const popupHeight = 900;
        const left = (window.screen.width - popupWidth) / 2;
        const top = (window.screen.height - popupHeight) / 2;

        localStorage.removeItem(setStateKey(setId));
        localStorage.removeItem(setResultKey(setId));

        window.open(
            `/thi-thu-JLPT/practice/exam/set/${setId}`,
            `PracticeSetWindow_${setId}`,
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,location=no,toolbar=no,menubar=no`,
        );
        window.close();
    };

    // ── Back to list navigation ───────────────────────────────────────────────
    const handleBackToList = () => {
        if (window.opener) {
            window.close();
        } else {
            const typeSlug = CATEGORY_TO_TYPE_SLUG[set.category] ?? '';
            if (set.level && typeSlug) {
                navigate(`/thi-thu-JLPT/practice/${set.level}/${typeSlug}`);
            } else {
                navigate('/thi-thu-JLPT/practice');
            }
        }
    };

    // ── Single question review renderer ──────────────────────────────────────
    const renderReview = (q, idx) => {
        const rec = resultMap[q.id]; // { selectedOptionId, correct, correctOptionId, explanation }
        const isCorrect = rec?.correct === true;
        const isWrong = rec?.correct === false;

        return (
            <div
                key={q.id}
                className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-gray-200/80 mb-4 transition-all"
            >
                {/* Header câu hỏi */}
                <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                        <span
                            className={`px-3.5 py-1.5 rounded-xl font-black text-sm flex items-center gap-1.5 shadow-2xs ${
                                isCorrect
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : isWrong
                                      ? 'bg-red-50 text-red-700 border border-red-200'
                                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}
                        >
                            {isCorrect && <CheckCircle2 size={15} className="text-emerald-600" />}
                            {isWrong && <XCircle size={15} className="text-red-600" />}
                            <span>Câu {idx + 1}</span>
                        </span>
                        <span
                            className={`text-xs sm:text-sm font-bold ${
                                isCorrect ? 'text-emerald-600' : isWrong ? 'text-red-600' : 'text-gray-500'
                            }`}
                        >
                            {isCorrect ? 'Trả lời đúng' : isWrong ? 'Trả lời sai' : 'Chưa chọn đáp án'}
                        </span>
                    </div>

                    <span className="text-xs font-bold text-gray-400">
                        {idx + 1} / {questions.length}
                    </span>
                </div>

                {/* Đoạn văn đọc hiểu (Reading Passage) nếu có */}
                {(q.readingPassage || rec?.readingPassage) && (
                    <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 sm:p-5 mb-4 shadow-2xs">
                        <div className="flex items-center gap-2 text-blue-700 font-black mb-2 text-sm">
                            <FaBookOpen size={15} />
                            <span>{(q.readingPassage || rec.readingPassage)?.title || 'Đoạn văn đọc hiểu'}</span>
                        </div>
                        {(q.readingPassage || rec?.readingPassage)?.imageUrl && (
                            <ReadingImage
                                src={(q.readingPassage || rec.readingPassage).imageUrl}
                                alt="Ảnh minh họa bài đọc"
                                className="mb-3 max-h-60 w-full rounded-xl border border-blue-100 bg-white p-2"
                            />
                        )}
                        <JlptContentRenderer
                            content={(q.readingPassage || rec.readingPassage)?.passage}
                            className="text-gray-800 text-sm sm:text-base leading-relaxed"
                        />
                    </div>
                )}

                {/* Nội dung câu hỏi */}
                <div className="text-base sm:text-lg text-gray-900 mb-4 leading-relaxed">
                    <JlptContentRenderer content={q.content} />
                </div>

                {/* Danh sách các lựa chọn */}
                <div className="grid gap-2.5 mb-4">
                    {q.options.map((opt) => {
                        const isChosen = rec?.selectedOptionId === opt.id;
                        const isCorrectOpt = rec?.correctOptionId === opt.id;

                        let containerStyle = 'p-2 rounded-2xl border-2 flex items-center gap-3 transition-all ';
                        let badgeStyle =
                            'w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ';

                        if (isCorrectOpt && isChosen) {
                            // Người dùng chọn đúng đáp án
                            containerStyle += 'bg-emerald-50/70 border-emerald-500 text-emerald-900 shadow-2xs';
                            badgeStyle += 'bg-emerald-600 text-white';
                        } else if (isCorrectOpt && !isChosen) {
                            // Đáp án đúng nhưng người dùng chọn sai hoặc bỏ qua
                            containerStyle += 'bg-emerald-50/40 border-emerald-400 text-emerald-800 border-dashed';
                            badgeStyle += 'bg-emerald-100 text-emerald-700 border border-emerald-300';
                        } else if (isChosen && !isCorrectOpt) {
                            // Người dùng chọn sai đáp án này
                            containerStyle += 'bg-red-50/70 border-red-500 text-red-900 shadow-2xs';
                            badgeStyle += 'bg-red-600 text-white';
                        } else {
                            // Lựa chọn thông thường không chọn
                            containerStyle += 'bg-gray-50/40 border-gray-100 text-gray-500 opacity-60';
                            badgeStyle += 'bg-white text-gray-400 border border-gray-200';
                        }

                        return (
                            <div key={opt.id} className={containerStyle}>
                                <div className={badgeStyle}>{String.fromCharCode(64 + opt.order)}</div>
                                <span className="font-bold flex-1 text-sm sm:text-base leading-snug">
                                    {opt.content}
                                </span>

                                {isCorrectOpt && (
                                    <div className="flex items-center gap-1 text-xs font-black text-emerald-600 bg-emerald-100/80 p-1.5 rounded-xl shrink-0">
                                        <FaCheckCircle size={20} />
                                    </div>
                                )}
                                {isChosen && !isCorrectOpt && (
                                    <div className="flex items-center gap-1 text-xs font-black text-red-600 bg-red-100/80 p-1.5 rounded-xl shrink-0">
                                        <FaTimes size={20} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Phần giải thích chi tiết */}
                {rec?.explanation && (
                    <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200/80 shadow-2xs">
                        <h4 className="flex items-center gap-2 text-amber-900 font-black mb-1.5 text-sm">
                            <FaLightbulb className="text-amber-600" />
                            <span>Giải thích chi tiết:</span>
                        </h4>
                        <JlptContentRenderer
                            content={rec.explanation}
                            className="text-amber-950 text-sm sm:text-base font-medium"
                        />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="pt-6 pb-8 bg-gray-50/80 min-h-screen">
            <SEO page="practicejlptTest" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* ── Summary Card ── */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-200/80 text-center mb-8 max-w-4xl mx-auto transition-all">
                    {/* Badge cúp thành tích */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-amber-100 shadow-xs">
                        <FaTrophy size={36} />
                    </div>

                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-1.5">
                        Kết quả luyện tập
                    </h1>
                    <p className="text-gray-800 font-bold text-base sm:text-lg mb-1 break-words">{examTitle}</p>
                    <p className="text-gray-500 text-xs sm:text-sm mb-6">
                        {[categoryLabel, set.level].filter(Boolean).join(' · ')}
                    </p>

                    {/* Vòng tròn điểm số Sakae */}
                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-red-50 to-orange-50 border-4 border-red-200 mb-6 shadow-xs">
                        <div>
                            <div className="text-4xl font-black text-red-600 leading-tight">{score}</div>
                            <div className="text-xs font-black text-gray-400 uppercase tracking-widest">/ 100 điểm</div>
                        </div>
                    </div>

                    {/* Đánh giá kết quả nhanh */}
                    <div className="mb-6">
                        {score >= 80 ? (
                            <span className="inline-block px-4 py-1.5 rounded-full text-[13px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200">
                                Xuất sắc! Bạn nắm rất vững kiến thức 🎉
                            </span>
                        ) : score >= 60 ? (
                            <span className="inline-block px-4 py-1.5 rounded-full text-[13px] font-black bg-blue-100 text-blue-700 border border-blue-200">
                                Đạt yêu cầu! Tiếp tục duy trì phong độ 👍
                            </span>
                        ) : (
                            <span className="inline-block px-4 py-1.5 rounded-full text-[13px] font-black bg-amber-100 text-amber-700 border border-amber-300">
                                Cần cố gắng thêm! Hãy xem lại các câu sai bên dưới 💪
                            </span>
                        )}
                    </div>

                    {/* Lưới 4 thông số thống kê */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 max-w-2xl mx-auto">
                        <div className="p-3.5 sm:p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 shadow-2xs">
                            <div className="text-2xl sm:text-3xl font-black text-emerald-600 mb-0.5">{correct}</div>
                            <div className="text-[11px] font-black text-emerald-600/80 uppercase tracking-wider">
                                Câu đúng
                            </div>
                        </div>
                        <div className="p-3.5 sm:p-4 bg-red-50/70 rounded-2xl border border-red-100 shadow-2xs">
                            <div className="text-2xl sm:text-3xl font-black text-red-600 mb-0.5">{wrong}</div>
                            <div className="text-[11px] font-black text-red-600/80 uppercase tracking-wider">
                                Câu sai
                            </div>
                        </div>
                        <div className="p-3.5 sm:p-4 bg-gray-50 rounded-2xl border border-gray-200/80 shadow-2xs">
                            <div className="text-2xl sm:text-3xl font-black text-gray-600 mb-0.5">{unanswered}</div>
                            <div className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Bỏ qua</div>
                        </div>
                        <div className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-2xs">
                            <div className="text-2xl sm:text-3xl font-black text-slate-800 mb-0.5">{total}</div>
                            <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                                Tổng câu
                            </div>
                        </div>
                    </div>

                    {/* Nút thao tác chính (Đỏ thương hiệu Sakae) */}
                    <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
                        <button
                            onClick={handleRedo}
                            className="px-6 sm:px-8 py-3 cursor-pointer bg-red-600 hover:bg-red-700 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-xs hover:shadow-md active:scale-95"
                        >
                            <FaRedo size={14} />
                            <span>Làm lại đề này</span>
                        </button>
                        <button
                            onClick={handleBackToList}
                            className="px-6 sm:px-8 py-3 cursor-pointer bg-white text-gray-700 hover:text-gray-900 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm shadow-2xs active:scale-95"
                        >
                            <FaHome size={15} />
                            <span>Quay về danh sách</span>
                        </button>
                    </div>
                </div>

                {/* ── Review section ── */}
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* Main review content */}
                    <div className="flex-1 min-w-0">
                        {/* Thanh công cụ xem đáp án */}
                        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs mb-4 sm:flex-row flex-col flex items-center justify-between gap-2">
                            <div>
                                <h2 className="text-xl font-black text-gray-900">Chi tiết đáp án</h2>
                                <p className="text-[13px] text-gray-500 font-medium hidden sm:block">
                                    Xem lại kết quả từng câu hỏi và giải thích ngữ pháp/từ vựng
                                </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                {/* Nút bật Modal Bảng đáp án (Tablet & Điện thoại) */}
                                <button
                                    onClick={() => setShowPaletteModal(true)}
                                    className="lg:hidden px-3 py-2 cursor-pointer rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-gray-200 bg-gray-50 text-gray-700 hover:text-red-600 hover:bg-red-50 active:scale-95 transition-all"
                                    title="Mở bảng đáp án"
                                >
                                    <Grid3x3 size={16} />
                                    <span>Bảng đáp án</span>
                                </button>

                                {/* Nút Chuyển đổi: Xem tất cả vs Từng câu */}
                                <button
                                    onClick={() => setShowAll((v) => !v)}
                                    className={`px-3 sm:px-4 py-2 cursor-pointer rounded-xl font-bold transition-all text-xs sm:text-sm flex items-center gap-1.5 border active:scale-95 ${
                                        showAll
                                            ? 'bg-red-600 border-red-600 text-white shadow-xs'
                                            : 'bg-white border-gray-200 text-gray-700 hover:border-red-300'
                                    }`}
                                >
                                    {showAll ? <FaTimes size={13} /> : <FaListAlt size={13} />}
                                    <span>{showAll ? 'Xem từng câu' : 'Xem tất cả'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Danh sách câu hỏi */}
                        {showAll ? (
                            <div className="space-y-4">{questions.map((q, idx) => renderReview(q, idx))}</div>
                        ) : (
                            <div>
                                {reviewQuestion && renderReview(reviewQuestion, reviewIndex)}

                                {/* Điều hướng câu Trước / Sau */}
                                <div className="flex justify-between gap-4 mt-6">
                                    <button
                                        disabled={reviewIndex === 0}
                                        onClick={() => setReviewIndex((p) => p - 1)}
                                        className={`flex-1 py-3 bg-white rounded-xl font-bold text-gray-700 border border-gray-200 shadow-xs disabled:opacity-40 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 active:scale-98 ${
                                            reviewIndex === 0 ? 'cursor-not-allowed' : 'cursor-pointer'
                                        }`}
                                    >
                                        <FaChevronLeft size={13} />
                                        <span>Câu trước</span>
                                    </button>
                                    <button
                                        disabled={reviewIndex === questions.length - 1}
                                        onClick={() => setReviewIndex((p) => p + 1)}
                                        className={`flex-1 py-3 bg-white rounded-xl font-bold text-gray-900 border border-gray-200 shadow-xs disabled:opacity-40 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 active:scale-98 ${
                                            reviewIndex === questions.length - 1
                                                ? 'cursor-not-allowed'
                                                : 'cursor-pointer'
                                        }`}
                                    >
                                        <span>Câu tiếp theo</span>
                                        <FaChevronRight size={13} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Sidebar Desktop (Bảng đáp án cố định trên màn hình lớn) ── */}
                    <aside className="hidden lg:block lg:w-80 shrink-0">
                        <div className="sticky top-24 bg-white rounded-2xl p-5 shadow-xs border border-gray-200/80">
                            <h3 className="font-black text-gray-800 mb-3 flex items-center gap-2 text-base">
                                <FaListAlt className="text-red-600" />
                                <span>Bảng đáp án</span>
                            </h3>

                            {/* Lưới câu hỏi */}
                            <div className="grid grid-cols-6 gap-2 max-h-[420px] overflow-y-auto px-1 py-1 custom-scrollbar">
                                {questions.map((q, idx) => {
                                    const rec = resultMap[q.id];
                                    const isCorrect = rec?.correct === true;
                                    const isWrong = rec?.correct === false;
                                    const isCurrent = reviewIndex === idx && !showAll;

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setReviewIndex(idx);
                                                setShowAll(false);
                                            }}
                                            className={`relative h-10 w-full rounded-xl text-xs font-black transition-all flex items-center justify-center cursor-pointer active:scale-95 ${
                                                isCurrent
                                                    ? 'bg-red-600 text-white shadow-md shadow-red-200 ring-2 ring-red-400'
                                                    : isCorrect
                                                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200'
                                                      : isWrong
                                                        ? 'bg-red-100 text-red-600 hover:bg-red-200 border border-red-200'
                                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
                                            }`}
                                        >
                                            {idx + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Chú thích màu sắc */}
                            <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-xs font-bold uppercase tracking-wider">
                                <div className="flex items-center gap-2.5 text-gray-500">
                                    <div className="w-3.5 h-3.5 rounded-md bg-red-600 shrink-0" />
                                    <span>Đang xem</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-gray-500">
                                    <div className="w-3.5 h-3.5 rounded-md bg-emerald-100 border border-emerald-200 shrink-0" />
                                    <span>Đúng ({correct})</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-gray-500">
                                    <div className="w-3.5 h-3.5 rounded-md bg-red-100 border border-red-200 shrink-0" />
                                    <span>Sai ({wrong})</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-gray-500">
                                    <div className="w-3.5 h-3.5 rounded-md bg-gray-100 border border-gray-200 shrink-0" />
                                    <span>Bỏ qua ({unanswered})</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* ── Mobile & Tablet Answer Palette Pop-up (Kích hoạt từ icon 9 ô) ── */}
            <AnimatePresence>
                {showPaletteModal && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                        {/* Backdrop làm mờ với fade in / fade out */}
                        <motion.div
                            key="answer-palette-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.22, ease: 'easeOut' }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
                            onClick={() => setShowPaletteModal(false)}
                        />

                        {/* Pop-up Box */}
                        <motion.div
                            key="answer-palette-box"
                            initial={isMobile ? { y: '100%', opacity: 0.8 } : { scale: 0.92, opacity: 0, y: 24 }}
                            animate={isMobile ? { y: 0, opacity: 1 } : { scale: 1, opacity: 1, y: 0 }}
                            exit={isMobile ? { y: '100%', opacity: 0 } : { scale: 0.92, opacity: 0, y: 16 }}
                            transition={
                                isMobile
                                    ? { type: 'spring', damping: 28, stiffness: 320, mass: 0.85 }
                                    : { duration: 0.24, ease: [0.16, 1, 0.3, 1] }
                            }
                            className="relative z-10 w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 border border-gray-100 max-h-[85vh] sm:max-h-[80vh] flex flex-col"
                        >
                            {/* Handle bar vuốt chạm trên Mobile */}
                            <div className="w-12 h-1.5 bg-gray-300/80 rounded-full mx-auto mb-2.5 sm:hidden shrink-0" />

                            {/* Header của Pop-up */}
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                                        <Grid3x3 size={18} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-800 text-base">Bảng đáp án</h3>
                                        <p className="text-xs text-gray-500 font-medium">
                                            <span className="text-emerald-600 font-bold">{correct} đúng</span> •{' '}
                                            <span className="text-red-600 font-bold">{wrong} sai</span> •{' '}
                                            <span className="text-gray-500">{unanswered} bỏ qua</span>
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowPaletteModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                                    aria-label="Đóng bảng đáp án"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Lưới câu hỏi */}
                            <div className="flex-1 overflow-y-auto py-3 pr-1 custom-scrollbar">
                                <div className="grid grid-cols-5 gap-2">
                                    {questions.map((q, idx) => {
                                        const rec = resultMap[q.id];
                                        const isCorrect = rec?.correct === true;
                                        const isWrong = rec?.correct === false;
                                        const isCurrent = reviewIndex === idx && !showAll;

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setReviewIndex(idx);
                                                    setShowAll(false);
                                                    setShowPaletteModal(false);
                                                }}
                                                className={`relative h-11 rounded-xl text-sm font-black transition-all flex items-center justify-center cursor-pointer active:scale-95 ${
                                                    isCurrent
                                                        ? 'bg-red-600 text-white shadow-md shadow-red-200 ring-2 ring-red-400'
                                                        : isCorrect
                                                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200'
                                                          : isWrong
                                                            ? 'bg-red-100 text-red-600 hover:bg-red-200 border border-red-200'
                                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
                                                }`}
                                            >
                                                {idx + 1}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Chú thích màu sắc */}
                            <div className="pt-3 border-t border-gray-100 mt-2">
                                <div className="grid grid-cols-4 gap-2 text-[11px] font-bold text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-md bg-red-600 shrink-0" />
                                        <span>Đang xem</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-200 shrink-0" />
                                        <span>Đúng</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-md bg-red-100 border border-red-200 shrink-0" />
                                        <span>Sai</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-md bg-gray-100 border border-gray-200 shrink-0" />
                                        <span>Bỏ qua</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PracticeSetResultView;
