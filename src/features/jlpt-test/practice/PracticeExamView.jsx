import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaClock, FaFlag, FaChevronLeft, FaChevronRight, FaListAlt, FaQuestionCircle, FaRedo } from 'react-icons/fa';
import { practiceTests } from '../../../dataTest/practiceTests';
import { formatTime } from '../constants';

const PracticeExamView = () => {
    const { testId, qIndex } = useParams();
    const navigate = useNavigate();

    const currentTest = useMemo(() => practiceTests.find((t) => t.id === testId), [testId]);

    const allQuestions = useMemo(() => {
        if (!currentTest) return [];
        return currentTest.questions;
    }, [currentTest]);

    const currentQuestionIndex = parseInt(qIndex || '0', 10);
    const currentQuestion = allQuestions[currentQuestionIndex];

    const storageKey = `jlpt_practice_state_${testId}`;
    const [answers, setAnswers] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved).answers : {};
    });
    const [flaggedQuestions, setFlaggedQuestions] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved).flagged : {};
    });
    const [timeLeft, setTimeLeft] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            return JSON.parse(saved).timeLeft;
        }
        return currentTest ? currentTest.time * 60 : 0;
    });
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showTimeoutModal, setShowTimeoutModal] = useState(false);

    const submitTest = React.useCallback(() => {
        let correctCount = 0;
        allQuestions.forEach((q) => {
            if (answers[q.id] === q.correct) correctCount++;
        });

        const resultData = {
            score: { correct: correctCount, total: allQuestions.length },
            answers: answers,
            testId: testId,
        };
        localStorage.setItem(`jlpt_practice_result_${testId}`, JSON.stringify(resultData));
        localStorage.removeItem(storageKey);

        navigate(`/thi-thu-JLPT/practice/result/${testId}`, { replace: true });
    }, [allQuestions, answers, testId, storageKey, navigate]);

    useEffect(() => {
        if (currentTest) {
            localStorage.setItem(
                storageKey,
                JSON.stringify({
                    answers,
                    flagged: flaggedQuestions,
                    timeLeft,
                    lastIndex: currentQuestionIndex,
                }),
            );
        }
    }, [answers, flaggedQuestions, timeLeft, currentQuestionIndex, testId, currentTest, storageKey]);

    useEffect(() => {
        let timer;
        if (timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && currentTest) {
            setShowTimeoutModal(true);
        }
        return () => clearInterval(timer);
    }, [timeLeft, currentTest]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentQuestionIndex]);

    const handleAnswerSelect = (idx) => {
        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: idx }));
    };

    const goToQuestion = (idx) => {
        if (idx >= 0 && idx < allQuestions.length) {
            navigate(`/thi-thu-JLPT/practice/exam/${testId}/${idx}`, { replace: true });
        }
    };

    if (!currentTest) return <div className="p-10 text-center">Đề thi không tồn tại.</div>;
    if (!currentQuestion) return <div className="p-10 text-center">Không có câu hỏi.</div>;

    return (
        <div className="bg-gray-50 min-h-screen pt-4">
            {/* Header - EXACT MATCH with ExamView.jsx */}
            <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-gray-300 z-40 px-4 md:px-8 py-2 h-20 sm:h-17 flex items-center gap-0.5 flex-col sm:flex-row justify-between">
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex w-10 h-10 bg-red-600 text-white items-center justify-center rounded-xl font-black">
                        {currentTest.level}
                    </div>
                    <div className="font-black text-gray-800 max-w-full">{currentTest.title}</div>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    <div
                        className={`flex items-center gap-2 px-3 md:px-5 py-1.5 rounded-2xl font-mono font-black text-[15px] md:text-base transition-colors duration-300 ${timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-900'}`}
                    >
                        <FaClock size={16} /> {formatTime(timeLeft)}
                    </div>
                    <button
                        onClick={() => setShowSubmitModal(true)}
                        className="bg-green-600 cursor-pointer text-white px-4 md:px-8 py-2 rounded-2xl font-black text-sm md:text-base hover:bg-green-700 transition shadow-lg shadow-green-100 active:scale-95"
                    >
                        Nộp bài
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="p-2.5 cursor-pointer transition text-gray-400 hover:text-gray-600 border rounded-lg"
                        title="Reload"
                    >
                        <FaRedo size={14} />
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 px-4 py-8 mt-15">
                {/* Main Content */}
                <div className="flex-1 lg:max-w-3xl xl:max-w-4xl mx-auto w-full">
                    {/* Question View Box - Matches ExamView.jsx style */}
                    <div className="bg-white rounded-[1rem] p-5 md:py-6 shadow-sm border border-gray-100 mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xl font-black text-gray-400">Câu {currentQuestionIndex + 1}</span>
                            <button
                                onClick={() =>
                                    setFlaggedQuestions((prev) => ({
                                        ...prev,
                                        [currentQuestion?.id]: !prev[currentQuestion?.id],
                                    }))
                                }
                                className={`p-2.5 rounded-xl cursor-pointer outline-none transition-all ${flaggedQuestions[currentQuestion?.id] ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400 hover:text-orange-400'}`}
                                title="Đánh dấu câu hỏi"
                            >
                                <FaFlag size={16} />
                            </button>
                        </div>

                        <p className="text-lg md:text-xl text-gray-800 font-bold mb-4 leading-relaxed">
                            {currentQuestion?.text}
                        </p>

                        <div className="grid gap-2">
                            {currentQuestion?.options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswerSelect(idx)}
                                    className={`group w-full p-2 rounded-3xl border-2 text-left transition-all flex items-center gap-2.5 ${
                                        answers[currentQuestion.id] === idx
                                            ? 'border-blue-600 bg-blue-50/50 shadow-md ring-0.5 ring-blue-600'
                                            : 'border-gray-50 cursor-pointer hover:border-blue-200 bg-gray-50/30'
                                    }`}
                                >
                                    <div
                                        className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center font-black text-lg transition-all ${
                                            answers[currentQuestion.id] === idx
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-400 border border-gray-100'
                                        }`}
                                    >
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    <span
                                        className={`transition-all ${
                                            answers[currentQuestion.id] === idx
                                                ? 'text-gray-900 font-bold'
                                                : 'text-gray-600 font-medium'
                                        }`}
                                    >
                                        {opt}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Navigation buttons - Matches ExamView.jsx */}
                    <div className="flex justify-between gap-6">
                        <button
                            disabled={currentQuestionIndex === 0}
                            onClick={() => goToQuestion(currentQuestionIndex - 1)}
                            className={`flex-1 py-2 bg-white rounded-2xl font-bold text-gray-600 border border-gray-100 shadow-sm disabled:opacity-30 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 ${currentQuestionIndex === 0 ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            <FaChevronLeft /> Trước
                        </button>
                        <button
                            disabled={currentQuestionIndex === allQuestions.length - 1}
                            onClick={() => goToQuestion(currentQuestionIndex + 1)}
                            className={`flex-1 py-2 bg-white rounded-2xl font-bold text-gray-800 border border-gray-100 shadow-sm disabled:opacity-30 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 ${
                                currentQuestionIndex === allQuestions.length - 1
                                    ? 'cursor-not-allowed'
                                    : 'cursor-pointer'
                            }`}
                        >
                            Tiếp theo <FaChevronRight />
                        </button>
                    </div>
                </div>

                {/* Question List Sidebar - Matches ExamView.jsx style */}
                <div className="lg:w-80 w-full shrink-0 mt-1 h-0">
                    <div className="lg:sticky lg:top-42 bg-white rounded-[1rem] p-5 shadow-sm border border-gray-100">
                        <h3 className="font-black text-gray-800 mb-2.5 flex items-center gap-3">
                            <FaListAlt className="text-red-600" /> Bảng câu hỏi
                        </h3>
                        <div className="grid grid-cols-6 gap-2 max-h-[400px] lg:max-h-none overflow-y-auto pr-2 custom-scrollbar py-2">
                            {allQuestions.map((q, idx) => (
                                <button
                                    key={q.id}
                                    onClick={() => goToQuestion(idx)}
                                    className={`relative h-11 w-full rounded-xl text-sm font-black transition-all flex items-center justify-center ${
                                        currentQuestionIndex === idx
                                            ? 'bg-red-600 text-white shadow-lg shadow-red-100'
                                            : answers[q.id] !== undefined
                                              ? 'bg-green-200 cursor-pointer text-green-700 hover:bg-green-200'
                                              : flaggedQuestions[q.id]
                                                ? 'bg-orange-200 cursor-pointer text-orange-600'
                                                : 'bg-gray-50 cursor-pointer text-gray-400 hover:bg-gray-100'
                                    }`}
                                >
                                    {idx + 1}
                                    {flaggedQuestions[q.id] && currentQuestionIndex !== idx && (
                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-600 rounded-full border-2 border-white"></span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="mt-5 pt-5 border-t border-gray-100 space-y-4 text-xs font-bold uppercase tracking-wider">
                            <div className="flex items-center gap-3 text-gray-400">
                                <div className="w-4 h-4 rounded-md bg-red-600"></div> Đang làm
                            </div>
                            <div className="flex items-center gap-3 text-gray-400">
                                <div className="w-4 h-4 rounded-md bg-green-200"></div> Đã trả lời
                            </div>
                            <div className="flex items-center gap-3 text-gray-400">
                                <div className="w-4 h-4 rounded-md bg-orange-200"></div> Đã đánh dấu
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals styles match ExamView.jsx */}
            {showSubmitModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                        onClick={() => setShowSubmitModal(false)}
                    ></div>
                    <div className="bg-white rounded-[1.5rem] p-8 max-w-lg w-full relative z-[110] text-center shadow-2xl animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
                            <FaQuestionCircle size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-4">Bạn chắc chứ?</h2>
                        <p className="text-gray-500 mb-8 md:text-lg">
                            Một khi nộp bài bạn sẽ không thể sửa lại bài làm của mình nữa!
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={submitTest}
                                className="w-full py-2.5 bg-red-500 cursor-pointer text-white font-black rounded-2xl hover:bg-red-600 transition-all active:scale-95"
                            >
                                Chắc, nộp bài ngay
                            </button>
                            <button
                                onClick={() => setShowSubmitModal(false)}
                                className="w-full py-2.5 bg-gray-100 cursor-pointer text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                            >
                                Hủy để làm tiếp
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showTimeoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"></div>
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full relative z-[110] text-center shadow-2xl animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
                            <FaClock size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-4">Hết giờ!</h2>
                        <p className="text-gray-500 mb-8 text-lg">
                            Thời gian làm bài đã kết thúc. Vui lòng bấm tiếp tục để xem kết quả.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={submitTest}
                                className="w-full py-2.5 bg-red-600 cursor-pointer text-white font-black rounded-2xl hover:bg-red-700 transition-all active:scale-95"
                            >
                                Tiếp tục
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PracticeExamView;
