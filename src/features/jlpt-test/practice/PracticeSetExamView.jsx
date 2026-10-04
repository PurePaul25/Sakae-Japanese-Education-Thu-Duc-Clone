/**
 * PracticeSetExamView — Phase 3.1
 *
 * Route: /thi-thu-JLPT/practice/exam/set/:setId
 *
 * Behaviour:
 * - Fetch questions from GET /jlpt/practice/sets/:setId (no isCorrect in response)
 * - User clicks option → store { [questionId]: optionId } ONLY — no API call
 * - User clicks "Nộp bài" → POST /jlpt/practice/sets/:setId/submit
 * - Backend grades everything, frontend shows result from backend response
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    FaClock,
    FaFlag,
    FaChevronLeft,
    FaChevronRight,
    FaListAlt,
    FaQuestionCircle,
    FaRedo,
    FaBookOpen,
} from 'react-icons/fa';
import { Loader2, AlertCircle, Grid3x3, X } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { formatTime } from '../constants';
import SEO from '../../../hooks/useSEO';
import { getPracticeSet, submitPracticeSet } from '../../../services/jlptPracticeService';
import { setStateKey, setResultKey, calcExamTime } from '../../../types/jlptPractice';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CATEGORY_LABELS = {
    VOCABULARY: 'Từ vựng',
    KANJI: 'Kanji',
    GRAMMAR: 'Ngữ pháp',
    READING: 'Đọc hiểu',
};

// ─── Component ────────────────────────────────────────────────────────────────

const PracticeSetExamView = () => {
    const { setId } = useParams();
    const navigate = useNavigate();

    const stateKey = setStateKey(setId);
    const resultKey = setResultKey(setId);

    // ── Fetch state ──────────────────────────────────────────────────────────
    const [setInfo, setSetInfo] = useState(null); // { id, level, category, title, questions[] }
    const [fetchLoading, setFetchLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    // ── Exam state ───────────────────────────────────────────────────────────
    const [selectedAnswers, setSelectedAnswers] = useState(() => {
        try {
            const saved = localStorage.getItem(stateKey);
            return saved ? (JSON.parse(saved).selectedAnswers ?? {}) : {};
        } catch {
            return {};
        }
    });
    const [flaggedQuestions, setFlaggedQuestions] = useState(() => {
        try {
            const saved = localStorage.getItem(stateKey);
            return saved ? (JSON.parse(saved).flagged ?? {}) : {};
        } catch {
            return {};
        }
    });
    const [timeLeft, setTimeLeft] = useState(null);
    const timeLeftRef = useRef(null);

    // ── UI state ─────────────────────────────────────────────────────────────
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showTimeoutModal, setShowTimeoutModal] = useState(false);
    const [showPaletteModal, setShowPaletteModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // Nhận diện màn hình điện thoại (<640px) vs tablet (>=640px) để áp dụng animation tối ưu
    const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ── Optimized State Persistence (Chống giật / lag) ────────────────────────
    const saveExamState = useCallback(
        (currentTime) => {
            if (!setInfo) return;
            try {
                localStorage.setItem(
                    stateKey,
                    JSON.stringify({
                        selectedAnswers,
                        flagged: flaggedQuestions,
                        timeLeft: currentTime !== undefined ? currentTime : (timeLeftRef.current ?? 0),
                        setInfo,
                        lastIndex: currentIndex,
                    }),
                );
            } catch {
                // Ignore localStorage errors
            }
        },
        [setInfo, selectedAnswers, flaggedQuestions, currentIndex, stateKey],
    );

    // Lưu state khi chọn đáp án, đánh dấu câu hỏi hoặc chuyển câu
    useEffect(() => {
        if (!setInfo || timeLeft === null) return;
        saveExamState();
    }, [selectedAnswers, flaggedQuestions, currentIndex, setInfo, saveExamState, timeLeft]);

    // Lưu state khi người dùng đóng trình duyệt hoặc chuyển tab
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (timeLeftRef.current !== null) {
                saveExamState(timeLeftRef.current);
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [saveExamState]);

    // ── Fetch set on mount ───────────────────────────────────────────────────
    useEffect(() => {
        if (!setId) {
            setFetchError('Không tìm thấy bộ đề.');
            setFetchLoading(false);
            return;
        }

        // Restore saved state (mid-session reload)
        const saved = (() => {
            try {
                const raw = localStorage.getItem(stateKey);
                return raw ? JSON.parse(raw) : null;
            } catch {
                return null;
            }
        })();

        if (saved?.setInfo?.questions?.length) {
            setSetInfo(saved.setInfo);
            const initialTime = saved.timeLeft ?? calcExamTime(saved.setInfo.questions.length);
            setTimeLeft(initialTime);
            timeLeftRef.current = initialTime;
            if (typeof saved.lastIndex === 'number' && saved.lastIndex < saved.setInfo.questions.length) {
                setCurrentIndex(saved.lastIndex);
            }
            setFetchLoading(false);
            return;
        }

        getPracticeSet(setId)
            .then((data) => {
                setSetInfo(data);
                const t = calcExamTime(data.questions.length);
                setTimeLeft(t);
                timeLeftRef.current = t;
            })
            .catch((err) => {
                if (err?.response?.status === 401) {
                    setFetchError('Bạn cần đăng nhập để luyện tập.');
                } else if (err?.response?.status === 404) {
                    setFetchError('Bộ đề không tồn tại hoặc đã bị vô hiệu hóa.');
                } else {
                    setFetchError('Không thể tải đề. Vui lòng thử lại.');
                }
            })
            .finally(() => setFetchLoading(false));
    }, [setId, stateKey]);

    // ── Timer (Tối ưu chu kỳ ghi đĩa để tránh giật lag) ────────────────────────
    useEffect(() => {
        if (timeLeft !== null && timeLeft <= 0) {
            setShowTimeoutModal(true);
        }
    }, [timeLeft]);

    const isTimerActive = timeLeft !== null && timeLeft > 0 && !fetchLoading && !isSubmitting;

    useEffect(() => {
        if (!isTimerActive) return;

        const id = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === null) return null;
                if (prev <= 1) {
                    clearInterval(id);
                    return 0;
                }
                const next = prev - 1;
                timeLeftRef.current = next;
                // Lưu định kỳ mỗi 5s để tránh I/O nghẽn main thread
                if (next % 5 === 0) {
                    saveExamState(next);
                }
                return next;
            });
        }, 1000);

        return () => clearInterval(id);
    }, [isTimerActive, saveExamState]);

    // ── Scroll on question change (Chỉ cuộn mượt khi đã cuộn trang) ───────────
    useEffect(() => {
        if (window.scrollY > 80) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [currentIndex]);

    // ── Click option: ONLY update local state, NO API call ────────────────────
    const handleOptionClick = useCallback(
        (questionId, optionId) => {
            if (isSubmitting) return;
            setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
        },
        [isSubmitting],
    );

    // ── Submit entire set to backend ──────────────────────────────────────────
    const handleSubmit = useCallback(async () => {
        if (!setInfo || isSubmitting) return;

        const answers = Object.entries(selectedAnswers).map(([questionId, optionId]) => ({
            questionId,
            optionId,
        }));

        if (answers.length === 0) {
            setSubmitError('Bạn chưa trả lời câu nào. Hãy chọn ít nhất một đáp án trước khi nộp bài.');
            setShowSubmitModal(false);
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);
        try {
            const result = await submitPracticeSet(setId, answers);

            const resultWithSnapshot = {
                ...result,
                questions: setInfo.questions,
            };

            localStorage.setItem(resultKey, JSON.stringify(resultWithSnapshot));
            localStorage.removeItem(stateKey);

            navigate(`/thi-thu-JLPT/practice/result/set/${setId}`, { replace: true });
        } catch (err) {
            setIsSubmitting(false);
            setSubmitError(
                err?.response?.status === 401
                    ? 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'
                    : 'Không thể nộp bài. Vui lòng thử lại.',
            );
        }
    }, [setInfo, isSubmitting, selectedAnswers, setId, resultKey, stateKey, navigate]);

    const goToQuestion = useCallback(
        (idx) => {
            if (setInfo && idx >= 0 && idx < setInfo.questions.length) {
                setCurrentIndex(idx);
            }
        },
        [setInfo],
    );

    // ── Memoized Metrics ─────────────────────────────────────────────────────
    const questions = setInfo?.questions ?? [];
    const currentQuestion = questions[currentIndex];
    const selectedOptionId = currentQuestion ? (selectedAnswers[currentQuestion.id] ?? null) : null;

    const answeredCount = useMemo(() => Object.keys(selectedAnswers).length, [selectedAnswers]);
    const totalQuestions = questions.length;
    const unansweredCount = Math.max(0, totalQuestions - answeredCount);
    const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

    // ── Early returns ─────────────────────────────────────────────────────────
    if (fetchLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
                <Loader2 size={40} className="animate-spin text-red-600" />
                <p className="text-gray-500 font-bold text-lg">Đang tải đề...</p>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4 text-center">
                <AlertCircle size={40} className="text-red-500" />
                <p className="text-gray-800 font-black text-xl">{fetchError}</p>
                {fetchError.includes('đăng nhập') ? (
                    <button
                        onClick={() => navigate('/dang-nhap')}
                        className="mt-2 px-8 py-3 bg-red-600 text-white font-black rounded-2xl cursor-pointer hover:bg-red-700 transition"
                    >
                        Đăng nhập ngay
                    </button>
                ) : (
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 px-8 py-3 bg-gray-900 text-white font-black rounded-2xl cursor-pointer hover:bg-gray-800 transition"
                    >
                        Thử lại
                    </button>
                )}
            </div>
        );
    }

    if (!setInfo || !questions.length) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4 text-center">
                <div className="text-5xl">📭</div>
                <p className="text-gray-800 font-black text-xl">Đề này hiện chưa có câu hỏi.</p>
                <button
                    onClick={() => window.close()}
                    className="mt-2 px-8 py-3 bg-gray-900 text-white font-black rounded-2xl cursor-pointer hover:bg-gray-800 transition"
                >
                    Đóng
                </button>
            </div>
        );
    }

    const examTitle = `${CATEGORY_LABELS[setInfo.category] || setInfo.category} — ${setInfo.level} — Đề số ${setInfo.setNumber}`;

    return (
        <div className="bg-gray-50/80 min-h-screen">
            <SEO page="practicejlptTest" />

            {/* ── Fixed Top Header ── */}
            <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200/90 z-40 shadow-xs">
                {/* Container căn giữa khớp hoàn toàn với chiều rộng nội dung bài thi bên dưới */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    {/* Hàng 1: Tiêu đề đề thi & Các nút chức năng */}
                    <div className="py-2 sm:py-2.5 flex items-center sm:flex-row flex-col justify-between gap-2 sm:gap-4">
                        {/* Bên trái: Badge JLPT & Tên bài thi */}
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 bg-red-600 text-white flex items-center justify-center rounded-xl font-black text-xs sm:text-sm shadow-xs">
                                {setInfo.level}
                            </div>
                            <div className="min-w-0">
                                <h1 className="font-black text-gray-800 text-xs sm:text-base truncate leading-tight">
                                    {examTitle}
                                </h1>
                                <span className="text-[11px] text-gray-400 font-medium hidden sm:inline-block">
                                    Luyện thi JLPT Sakae
                                </span>
                            </div>
                        </div>

                        {/* Bên phải: Đồng hồ, Nút nộp bài (đỏ chủ đạo), Nút 9 ô grid (Mobile) & Nút Reload */}
                        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                            {timeLeft !== null && (
                                <div
                                    className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl font-mono font-bold text-xs sm:text-sm transition-colors ${
                                        timeLeft < 300
                                            ? 'bg-red-50 text-red-600 ring-1 ring-red-200 animate-pulse'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}
                                    title="Thời gian làm bài còn lại"
                                >
                                    <FaClock className="text-xs sm:text-sm shrink-0" />
                                    <span>{formatTime(timeLeft)}</span>
                                </div>
                            )}

                            {/* Nút Nộp bài — Màu đỏ thương hiệu Sakae */}
                            <button
                                onClick={() => setShowSubmitModal(true)}
                                disabled={isSubmitting}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl font-black text-xs sm:text-sm transition-all shadow-xs hover:shadow-md active:scale-95 disabled:opacity-60 cursor-pointer flex items-center gap-1.5"
                            >
                                {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
                            </button>

                            {/* Icon 9 ô grid (Mobile) — Đặt cạnh icon mũi xoay vòng */}
                            <button
                                onClick={() => setShowPaletteModal(true)}
                                className="lg:hidden p-2 sm:p-2.5 cursor-pointer text-gray-700 hover:text-red-600 hover:bg-red-50 border border-gray-200 rounded-xl bg-white shadow-2xs active:scale-95 transition-all flex items-center justify-center relative"
                                title="Bảng câu hỏi"
                                aria-label="Mở bảng câu hỏi"
                            >
                                <Grid3x3 size={17} />
                                {unansweredCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full ring-2 ring-white" />
                                )}
                            </button>

                            {/* Icon mũi xoay vòng (Reload) */}
                            <button
                                onClick={() => window.location.reload()}
                                className="p-2 sm:p-2.5 cursor-pointer transition text-gray-400 hover:text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-xl bg-white flex items-center justify-center active:scale-95"
                                title="Tải lại đề"
                                aria-label="Tải lại đề"
                            >
                                <FaRedo size={13} />
                            </button>
                        </div>
                    </div>

                    {/* Hàng 2: Thanh tiến độ — Kích thước vừa vặn theo container, không full tràn trang */}
                    <div className="pb-2 pt-1">
                        <div className="flex items-center justify-between text-xs font-bold text-gray-600 mb-1">
                            <span className="flex items-center gap-1.5 text-[11px] sm:text-xs">
                                <span className="text-gray-500 font-medium">Tiến độ bài làm:</span>
                                <span className="text-red-600 font-black">
                                    {answeredCount}/{totalQuestions}
                                </span>{' '}
                                câu
                            </span>
                            <span className="text-red-600 font-black text-[11px] sm:text-xs">
                                {Math.round(progressPercent)}%
                            </span>
                        </div>
                        {/* Track thanh tiến độ màu đỏ Sakae */}
                        <div
                            className="w-full bg-red-50/80 border border-red-100/50 h-2 rounded-full overflow-hidden relative"
                            title={`Tiến độ làm bài: ${answeredCount}/${totalQuestions} câu`}
                        >
                            <div
                                className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300 ease-out rounded-full"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Main Layout Container ── */}
            <main className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8 px-4 sm:px-6 pt-38 sm:pt-32 pb-8">
                {/* ── Question Area ── */}
                <div className="flex-1 lg:max-w-3xl xl:max-w-4xl mx-auto w-full">
                    {/* Reading Passage (nếu có) */}
                    {currentQuestion.readingPassage && (
                        <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-5 md:p-6 mb-4 shadow-xs">
                            <div className="flex items-center gap-2 mb-3 text-blue-700 font-black">
                                <FaBookOpen size={16} />
                                <span>Đoạn văn đọc hiểu</span>
                                {currentQuestion.readingPassage.title && (
                                    <span className="font-medium text-blue-500">
                                        — {currentQuestion.readingPassage.title}
                                    </span>
                                )}
                            </div>
                            {currentQuestion.readingPassage.imageUrl && (
                                <img
                                    src={currentQuestion.readingPassage.imageUrl}
                                    alt="Đoạn văn đọc hiểu"
                                    className="w-full rounded-xl mb-4 object-contain max-h-64 bg-white p-2 border border-blue-100"
                                />
                            )}
                            <p className="text-gray-800 font-medium leading-relaxed whitespace-pre-wrap text-base md:text-lg">
                                {currentQuestion.readingPassage.passage}
                            </p>
                        </div>
                    )}

                    {/* Question Card */}
                    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-gray-200/80 mb-4 transition-all">
                        {/* Header của câu hỏi: Số câu & Nút Flag */}
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-lg sm:text-xl font-black text-gray-800 flex items-center gap-2">
                                <span>Câu {currentIndex + 1}</span>
                                <span className="text-xs sm:text-sm font-bold text-gray-400">/ {totalQuestions}</span>
                            </span>
                            <button
                                onClick={() =>
                                    setFlaggedQuestions((prev) => ({
                                        ...prev,
                                        [currentQuestion.id]: !prev[currentQuestion.id],
                                    }))
                                }
                                className={`p-2.5 rounded-xl cursor-pointer outline-none transition-all active:scale-95 ${
                                    flaggedQuestions[currentQuestion.id]
                                        ? 'bg-amber-100 text-amber-600 ring-1 ring-amber-300'
                                        : 'bg-gray-100 text-gray-400 hover:text-amber-500 hover:bg-amber-50'
                                }`}
                                title={flaggedQuestions[currentQuestion.id] ? 'Bỏ đánh dấu' : 'Đánh dấu xem lại'}
                            >
                                <FaFlag size={15} />
                            </button>
                        </div>

                        {/* Question Content */}
                        <p className="text-base sm:text-lg text-gray-900 font-bold mb-5 leading-relaxed">
                            {currentQuestion.content}
                        </p>

                        {/* Options */}
                        <div className="grid gap-2.5">
                            {currentQuestion.options.map((opt) => {
                                const isSelected = selectedOptionId === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        disabled={isSubmitting}
                                        onClick={() => handleOptionClick(currentQuestion.id, opt.id)}
                                        className={`w-full p-2.5 sm:p-3 rounded-2xl border-2 text-left transition-all duration-150 flex items-center gap-3 active:scale-[0.99] cursor-pointer ${
                                            isSelected
                                                ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-500'
                                                : 'border-gray-100 hover:border-blue-200 bg-gray-50/50 hover:bg-gray-50'
                                        } disabled:cursor-not-allowed`}
                                    >
                                        <div
                                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-black text-sm sm:text-base transition-all shrink-0 ${
                                                isSelected
                                                    ? 'bg-blue-600 text-white shadow-xs'
                                                    : 'bg-white text-gray-500 border border-gray-200'
                                            }`}
                                        >
                                            {String.fromCharCode(64 + opt.order)}
                                        </div>
                                        <span
                                            className={`text-sm sm:text-base leading-snug transition-colors ${
                                                isSelected ? 'text-gray-900 font-bold' : 'text-gray-700 font-medium'
                                            }`}
                                        >
                                            {opt.content}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Submit error */}
                    {submitError && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex items-center gap-3 text-red-700 font-bold text-sm">
                            <AlertCircle size={18} className="shrink-0" />
                            <span>{submitError}</span>
                        </div>
                    )}

                    {/* Navigation Buttons (Trước / Tiếp theo) */}
                    <div className="flex justify-between gap-4">
                        <button
                            disabled={currentIndex === 0}
                            onClick={() => goToQuestion(currentIndex - 1)}
                            className={`flex-1 py-2.5 sm:py-3 bg-white rounded-xl font-bold text-gray-700 border border-gray-200 shadow-xs disabled:opacity-40 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 active:scale-98 ${
                                currentIndex === 0 ? 'cursor-not-allowed' : 'cursor-pointer'
                            }`}
                        >
                            <FaChevronLeft size={13} />
                            <span>Trước</span>
                        </button>
                        <button
                            disabled={currentIndex === totalQuestions - 1}
                            onClick={() => goToQuestion(currentIndex + 1)}
                            className={`flex-1 py-2.5 sm:py-3 bg-white rounded-xl font-bold text-gray-900 border border-gray-200 shadow-xs disabled:opacity-40 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 active:scale-98 ${
                                currentIndex === totalQuestions - 1 ? 'cursor-not-allowed' : 'cursor-pointer'
                            }`}
                        >
                            <span>Tiếp theo</span>
                            <FaChevronRight size={13} />
                        </button>
                    </div>
                </div>

                {/* ── Sidebar Desktop (Bảng câu hỏi hiển thị trên màn hình lớn) ── */}
                <aside className="hidden lg:block lg:w-80 shrink-0">
                    <div className="sticky top-24 bg-white rounded-2xl p-5 shadow-xs border border-gray-200/80">
                        <h3 className="font-black text-gray-800 mb-3 flex items-center gap-2.5 text-base">
                            <FaListAlt className="text-red-600" />
                            <span>Bảng câu hỏi</span>
                        </h3>

                        {/* Question palette grid */}
                        <div className="grid grid-cols-6 gap-2 max-h-[420px] overflow-y-auto pr-1 py-1 custom-scrollbar">
                            {questions.map((q, idx) => {
                                const answered = !!selectedAnswers[q.id];
                                const isCurrent = currentIndex === idx;
                                const flagged = flaggedQuestions[q.id];
                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => goToQuestion(idx)}
                                        className={`relative h-10 w-full rounded-xl text-xs font-black transition-all flex items-center justify-center cursor-pointer active:scale-95 ${
                                            isCurrent
                                                ? 'bg-red-600 text-white shadow-md shadow-red-200 ring-2 ring-red-400'
                                                : answered
                                                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'
                                                  : flagged
                                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300'
                                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'
                                        }`}
                                    >
                                        {idx + 1}
                                        {flagged && !isCurrent && (
                                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Progress info */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-2">
                                <span>Đã hoàn thành</span>
                                <span className="text-red-600 font-black">
                                    {answeredCount}/{totalQuestions}
                                </span>
                            </div>
                            <div className="w-full bg-red-50/80 border border-red-100/50 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>

                        {/* Status Legend */}
                        <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-xs font-bold uppercase tracking-wider">
                            <div className="flex items-center gap-2.5 text-gray-500">
                                <div className="w-3.5 h-3.5 rounded-md bg-red-600 shrink-0" />
                                <span>Đang làm</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-gray-500">
                                <div className="w-3.5 h-3.5 rounded-md bg-blue-100 border border-blue-200 shrink-0" />
                                <span>Đã chọn ({answeredCount})</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-gray-500">
                                <div className="w-3.5 h-3.5 rounded-md bg-amber-100 border border-amber-300 shrink-0" />
                                <span>Đánh dấu xem lại</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </main>

            {/* ── Mobile & Tablet Question Palette Pop-up (Kích hoạt từ icon 9 ô) ── */}
            <AnimatePresence>
                {showPaletteModal && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                        {/* Backdrop làm mờ có animation fade in / fade out */}
                        <motion.div
                            key="palette-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.22, ease: 'easeOut' }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
                            onClick={() => setShowPaletteModal(false)}
                        />

                        {/* Pop-up Box: Mobile trượt từ dưới lên (Spring Bottom-sheet), Tablet nảy nhẹ từ tâm (Center Pop-in) */}
                        <motion.div
                            key="palette-box"
                            initial={isMobile ? { y: '100%', opacity: 0.8 } : { scale: 0.92, opacity: 0, y: 24 }}
                            animate={isMobile ? { y: 0, opacity: 1 } : { scale: 1, opacity: 1, y: 0 }}
                            exit={isMobile ? { y: '100%', opacity: 0 } : { scale: 0.92, opacity: 0, y: 16 }}
                            transition={
                                isMobile
                                    ? { type: 'spring', damping: 28, stiffness: 320, mass: 0.85 }
                                    : { duration: 0.24, ease: [0.16, 1, 0.3, 1] }
                            }
                            className="relative z-10 w-full max-w-xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 border border-gray-100 max-h-[85vh] sm:max-h-[80vh] flex flex-col"
                        >
                            {/* Thanh gạch kéo (Handle bar) trực quan cho Mobile */}
                            <div className="w-12 h-1.5 bg-gray-300/80 rounded-full mx-auto mb-2.5 sm:hidden shrink-0" />

                            {/* Header của Pop-up */}
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                                        <Grid3x3 size={18} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-800 text-base">Bảng câu hỏi</h3>
                                        <p className="text-xs text-gray-500 font-medium">
                                            Đã làm:{' '}
                                            <span className="font-bold text-red-600">
                                                {answeredCount}/{totalQuestions}
                                            </span>{' '}
                                            ({Math.round(progressPercent)}%)
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowPaletteModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                                    aria-label="Đóng bảng câu hỏi"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Thanh tiến độ mini trong Pop-up */}
                            <div className="w-full bg-red-50/80 border border-red-100/50 rounded-full h-2 my-3 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-red-500 to-red-600 h-full rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>

                            {/* Danh sách lưới câu hỏi */}
                            <div className="flex-1 overflow-y-auto py-2 pr-1 custom-scrollbar">
                                <div className="grid grid-cols-5 gap-2">
                                    {questions.map((q, idx) => {
                                        const answered = !!selectedAnswers[q.id];
                                        const isCurrent = currentIndex === idx;
                                        const flagged = flaggedQuestions[q.id];
                                        return (
                                            <button
                                                key={q.id}
                                                onClick={() => {
                                                    goToQuestion(idx);
                                                    setShowPaletteModal(false);
                                                }}
                                                className={`relative h-11 rounded-xl text-sm font-black transition-all flex items-center justify-center cursor-pointer active:scale-95 ${
                                                    isCurrent
                                                        ? 'bg-red-600 text-white shadow-md shadow-red-200 ring-2 ring-red-400'
                                                        : answered
                                                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'
                                                          : flagged
                                                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300'
                                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
                                                }`}
                                            >
                                                {idx + 1}
                                                {flagged && !isCurrent && (
                                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Chú thích màu sắc & Nút Nộp bài nhanh */}
                            <div className="pt-3 border-t border-gray-100 mt-2">
                                <div className="grid grid-cols-3 gap-2 text-[11px] font-bold text-gray-500 mb-3">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-md bg-red-600 shrink-0" />
                                        <span>Đang làm</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-md bg-blue-100 border border-blue-200 shrink-0" />
                                        <span>Đã chọn</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300 shrink-0" />
                                        <span>Đánh dấu</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setShowPaletteModal(false);
                                        setShowSubmitModal(true);
                                    }}
                                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl transition shadow-xs active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <span>Nộp bài ngay</span>
                                    <span className="opacity-90 font-normal">
                                        ({answeredCount}/{totalQuestions})
                                    </span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Submit Confirm Modal ── */}
            <AnimatePresence>
                {showSubmitModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            key="submit-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs"
                            onClick={() => !isSubmitting && setShowSubmitModal(false)}
                        />
                        <motion.div
                            key="submit-box"
                            initial={{ scale: 0.92, opacity: 0, y: 16 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.94, opacity: 0, y: 12 }}
                            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full relative z-10 text-center shadow-2xl"
                        >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-5">
                                <FaQuestionCircle size={36} />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">Xác nhận nộp bài?</h2>
                            {unansweredCount > 0 ? (
                                <p className="text-gray-500 mb-6 text-sm sm:text-base leading-relaxed">
                                    Bạn còn <span className="text-red-600 font-black">{unansweredCount} câu</span> chưa
                                    trả lời. Một khi nộp bài bạn sẽ không thể chỉnh sửa đáp án!
                                </p>
                            ) : (
                                <p className="text-gray-500 mb-6 text-sm sm:text-base leading-relaxed">
                                    Bạn đã hoàn thành tất cả các câu hỏi. Bạn có chắc chắn muốn nộp bài bây giờ không?
                                </p>
                            )}
                            <div className="flex flex-col gap-2.5">
                                <button
                                    onClick={() => {
                                        setShowSubmitModal(false);
                                        handleSubmit();
                                    }}
                                    disabled={isSubmitting}
                                    className="w-full py-3 bg-red-600 hover:bg-red-700 cursor-pointer text-white font-black rounded-xl transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 shadow-xs"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            <span>Đang chấm bài...</span>
                                        </>
                                    ) : (
                                        'Nộp bài'
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowSubmitModal(false)}
                                    disabled={isSubmitting}
                                    className="w-full py-2.5 bg-gray-100 cursor-pointer text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-60"
                                >
                                    Tiếp tục làm bài
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Timeout Modal ── */}
            <AnimatePresence>
                {showTimeoutModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            key="timeout-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs"
                        />
                        <motion.div
                            key="timeout-box"
                            initial={{ scale: 0.92, opacity: 0, y: 16 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.94, opacity: 0, y: 12 }}
                            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full relative z-10 text-center shadow-2xl"
                        >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-5">
                                <FaClock size={36} />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">Hết giờ làm bài!</h2>
                            <p className="text-gray-500 mb-6 text-sm sm:text-base leading-relaxed">
                                Thời gian thi đã kết thúc. Hệ thống sẽ tự động nộp bài và tính điểm cho bạn.
                            </p>
                            <button
                                onClick={() => {
                                    setShowTimeoutModal(false);
                                    handleSubmit();
                                }}
                                disabled={isSubmitting}
                                className="w-full py-3 bg-red-600 hover:bg-red-700 cursor-pointer text-white font-black rounded-xl transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 shadow-xs"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>Đang nộp bài...</span>
                                    </>
                                ) : (
                                    'Xem kết quả'
                                )}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PracticeSetExamView;
