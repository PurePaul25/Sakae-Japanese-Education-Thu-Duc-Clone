import React, { useState, useMemo } from 'react';
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
    FaInfoCircle,
} from 'react-icons/fa';
import { practiceTests } from '../../../dataTest/practiceTests';
import SEO from '../../../hooks/useSEO';

const PracticeResultView = () => {
    const { testId } = useParams();
    const navigate = useNavigate();

    const resultData = useMemo(() => {
        const saved = localStorage.getItem(`jlpt_practice_result_${testId}`);
        return saved ? JSON.parse(saved) : null;
    }, [testId]);

    const currentTest = useMemo(() => {
        return practiceTests.find((t) => t.id === testId);
    }, [testId]);

    const [reviewQuestionIndex, setReviewQuestionIndex] = useState(0);
    const [showAllAnswers, setShowAllAnswers] = useState(false);

    const allQuestions = useMemo(() => {
        if (!currentTest) return [];
        return currentTest.questions;
    }, [currentTest]);

    if (!resultData || !currentTest) {
        return (
            <div className="p-20 text-center">
                <h2 className="text-2xl font-bold mb-4">Không tìm thấy kết quả.</h2>
                <button
                    onClick={() => navigate('/thi-thu-JLPT')}
                    className="bg-red-600 text-white px-6 py-2 rounded-xl"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    const { score, answers } = resultData;
    const reviewQuestion = allQuestions[reviewQuestionIndex];

    const handleRedo = () => {
        const popupWidth = 1400;
        const popupHeight = 900;
        const left = (window.screen.width - popupWidth) / 2;
        const top = (window.screen.height - popupHeight) / 2;

        localStorage.removeItem(`jlpt_practice_state_${testId}`);
        localStorage.removeItem(`jlpt_practice_result_${testId}`);

        window.open(
            `/thi-thu-JLPT/practice/exam/${testId}/0`,
            `PracticeWindow_${testId}`,
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,location=no,toolbar=no,menubar=no`,
        );
        window.close();
    };

    return (
        <div className="pt-10 pb-12 bg-gray-50 min-h-screen">
            <SEO page="practicejlptTest" />

            <div className="max-w-7xl mx-auto px-4">
                {/* Summary Card - Matches ResultView.jsx */}
                <div className="bg-white rounded-[1rem] p-6 shadow-sm border border-gray-100 text-center mb-8 max-w-4xl mx-auto">
                    <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                        <FaTrophy size={40} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Kết quả luyện tập</h1>
                    <p className="text-gray-500 text-lg mb-6">{currentTest.title}</p>

                    <div className="grid grid-cols-2 gap-3 md:gap-6 mb-8 max-w-2xl mx-auto">
                        <div className="p-4 bg-green-50 rounded-[1.5rem] border border-green-100">
                            <div className="text-2xl md:text-3xl font-black text-green-600 mb-1">{score.correct}</div>
                            <div className="text-[10px] md:text-xs font-black text-green-400 uppercase tracking-wider">
                                Câu đúng
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-[1.5rem] border border-gray-100">
                            <div className="text-2xl md:text-3xl font-black text-gray-800 mb-1">{score.total}</div>
                            <div className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-wider">
                                Tổng câu
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 justify-center">
                        <button
                            onClick={handleRedo}
                            className="px-8 py-3 cursor-pointer bg-gray-900 text-white font-black rounded-2xl hover:bg-red-600 transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-gray-200"
                        >
                            <FaRedo /> Làm lại bài này
                        </button>
                        <button
                            onClick={() => {
                                if (window.opener) {
                                    window.close();
                                } else {
                                    navigate('/thi-thu-JLPT/practice');
                                }
                            }}
                            className="px-8 py-3 cursor-pointer bg-white text-gray-700 font-black rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <FaHome /> Quay về danh sách
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Review Content - Matches ResultView.jsx logic */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl md:text-2xl font-black text-gray-900">Chi tiết đáp án</h2>
                            <button
                                onClick={() => setShowAllAnswers(!showAllAnswers)}
                                className={`px-4 py-2 cursor-pointer rounded-xl font-bold transition-all text-sm md:text-base flex items-center gap-2 border-2 ${
                                    showAllAnswers
                                        ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-100'
                                        : 'bg-white border-gray-100 text-gray-600 hover:border-red-200'
                                }`}
                            >
                                {showAllAnswers ? <FaTimes /> : <FaListAlt />}
                                {showAllAnswers ? 'Ẩn danh sách tất cả' : 'Hiển thị tất cả đáp án'}
                            </button>
                        </div>

                        {showAllAnswers ? (
                            <div className="space-y-4">
                                {allQuestions.map((q, idx) => (
                                    <div
                                        key={q.id}
                                        className="bg-white rounded-[1rem] p-5 shadow-sm border border-gray-100"
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <span
                                                className={`px-5 py-2 rounded-lg font-black ${answers[q.id] === q.correct ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                                            >
                                                Câu {idx + 1}
                                            </span>
                                            <div
                                                className={`text-sm font-bold ${answers[q.id] === q.correct ? 'text-green-600' : 'text-red-600'}`}
                                            >
                                                {answers[q.id] === q.correct ? 'Đúng' : 'Sai'}
                                            </div>
                                        </div>
                                        <p className="text-lg text-gray-800 font-bold mb-3">{q.text}</p>
                                        <div className="grid gap-2 mb-4">
                                            {q.options.map((opt, oIdx) => (
                                                <div
                                                    key={oIdx}
                                                    className={`p-2 rounded-xl border-2 flex items-center gap-2 ${
                                                        oIdx === q.correct
                                                            ? 'bg-green-50 border-green-500 text-green-700'
                                                            : oIdx === answers[q.id] && answers[q.id] !== q.correct
                                                              ? 'bg-red-50 border-red-500 text-red-700'
                                                              : 'bg-gray-50 border-transparent text-gray-400 opacity-60'
                                                    }`}
                                                >
                                                    <div
                                                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                                                            oIdx === q.correct
                                                                ? 'bg-green-600 text-white'
                                                                : oIdx === answers[q.id] && answers[q.id] !== q.correct
                                                                  ? 'bg-red-600 text-white'
                                                                  : 'bg-white text-gray-300'
                                                        }`}
                                                    >
                                                        {String.fromCharCode(65 + oIdx)}
                                                    </div>
                                                    <span className="font-bold">{opt}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-blue-50/50 p-3 rounded-[1rem] border border-blue-100">
                                            <h4 className="flex items-center gap-2 text-blue-800 font-black mb-1">
                                                <FaInfoCircle /> Giải thích:
                                            </h4>
                                            <p className="text-blue-700 leading-relaxed text-[15px] font-medium">
                                                {q.explanation || 'Chưa cập nhật giải thích.'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="transition-all duration-500">
                                <div className="bg-white rounded-[1rem] p-5 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span
                                            className={`w-20 h-10 rounded-lg flex items-center justify-center font-black ${answers[reviewQuestion.id] === reviewQuestion.correct ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                                        >
                                            Câu {reviewQuestionIndex + 1}
                                        </span>
                                        <div
                                            className={`text-sm font-bold ${answers[reviewQuestion.id] === reviewQuestion.correct ? 'text-green-600' : 'text-red-600'}`}
                                        >
                                            {answers[reviewQuestion.id] === reviewQuestion.correct ? 'Đúng' : 'Sai'}
                                        </div>
                                    </div>

                                    <p className="text-lg text-gray-800 font-bold mb-3 leading-relaxed">
                                        {reviewQuestion.text}
                                    </p>

                                    <div className="grid gap-2 mb-5">
                                        {reviewQuestion.options.map((opt, oIdx) => {
                                            const isCorrect = oIdx === reviewQuestion.correct;
                                            const isUserChoice = oIdx === answers[reviewQuestion.id];

                                            return (
                                                <div
                                                    key={oIdx}
                                                    className={`p-2 rounded-xl border-2 flex items-center gap-2 transition-all ${
                                                        isCorrect
                                                            ? 'bg-green-50 border-green-500 text-green-700 shadow-sm'
                                                            : isUserChoice
                                                              ? 'bg-red-50 border-red-500 text-red-700'
                                                              : 'bg-gray-50 border-transparent text-gray-400'
                                                    }`}
                                                >
                                                    <div
                                                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black ${
                                                            isCorrect
                                                                ? 'bg-green-600 text-white'
                                                                : isUserChoice
                                                                  ? 'bg-red-600 text-white'
                                                                  : 'bg-white text-gray-300'
                                                        }`}
                                                    >
                                                        {String.fromCharCode(65 + oIdx)}
                                                    </div>
                                                    <span className="font-bold">{opt}</span>
                                                    {isCorrect && (
                                                        <FaCheckCircle className="ml-auto text-green-600" size={24} />
                                                    )}
                                                    {!isCorrect && isUserChoice && (
                                                        <FaTimes className="ml-auto text-red-600" size={24} />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="bg-blue-50/50 p-3 rounded-[1rem] border border-blue-100">
                                        <h4 className="flex items-center gap-2 text-blue-800 font-black mb-1">
                                            <FaInfoCircle /> Giải thích:
                                        </h4>
                                        <p className="text-blue-700 leading-relaxed font-medium text-[15px]">
                                            {reviewQuestion.explanation || 'Chưa cập nhật giải thích.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-between gap-5 mt-6">
                                    <button
                                        disabled={reviewQuestionIndex === 0}
                                        onClick={() => setReviewQuestionIndex((prev) => prev - 1)}
                                        className={`flex-1 py-2.5 bg-white rounded-2xl font-bold text-gray-600 border border-gray-100 shadow-sm disabled:opacity-30 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 ${
                                            reviewQuestionIndex === 0 ? 'cursor-not-allowed' : 'cursor-pointer'
                                        }`}
                                    >
                                        <FaChevronLeft /> Câu trước
                                    </button>
                                    <button
                                        disabled={reviewQuestionIndex === allQuestions.length - 1}
                                        onClick={() => setReviewQuestionIndex((prev) => prev + 1)}
                                        className={`flex-1 py-2.5 bg-white rounded-2xl font-bold text-gray-800 border border-gray-100 shadow-sm disabled:opacity-30 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 ${
                                            reviewQuestionIndex === allQuestions.length - 1
                                                ? 'cursor-not-allowed'
                                                : 'cursor-pointer'
                                        }`}
                                    >
                                        Câu tiếp theo <FaChevronRight />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Matches ResultView.jsx */}
                    <div className="lg:w-80 w-full shrink-0">
                        <div className="lg:sticky lg:top-44 bg-white rounded-[1rem] p-5 shadow-sm border border-gray-100">
                            <h3 className="font-black text-gray-800 mb-3 flex items-center gap-3">
                                <FaListAlt className="text-red-600" /> Bảng đáp án
                            </h3>
                            <div className="grid grid-cols-6 gap-2 max-h-[400px] lg:max-h-none overflow-y-auto pr-2 custom-scrollbar py-2">
                                {allQuestions.map((q, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setReviewQuestionIndex(idx);
                                            setShowAllAnswers(false);
                                        }}
                                        className={`relative h-11 w-full rounded-xl text-sm font-black transition-all flex items-center justify-center ${
                                            reviewQuestionIndex === idx && !showAllAnswers
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                                                : answers[q.id] === q.correct
                                                  ? 'bg-green-200 cursor-pointer text-green-700 hover:bg-green-200'
                                                  : 'bg-red-200 cursor-pointer text-red-600 hover:bg-red-200'
                                        }`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-5 pt-5 border-t border-gray-100 space-y-4 text-xs font-bold uppercase tracking-wider">
                                <div className="flex items-center gap-3 text-gray-400">
                                    <div className="w-4 h-4 rounded-md bg-blue-600"></div> Đang chọn
                                </div>
                                <div className="flex items-center gap-3 text-gray-400">
                                    <div className="w-4 h-4 rounded-md bg-green-200"></div> Đã đúng
                                </div>
                                <div className="flex items-center gap-3 text-gray-400">
                                    <div className="w-4 h-4 rounded-md bg-red-200"></div> Đã sai
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PracticeResultView;
