import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    FaClock,
    FaFlag,
    FaChevronLeft,
    FaChevronRight,
    FaListAlt,
    FaInfoCircle,
    FaQuestionCircle,
    FaRedo,
    FaPlay,
    FaPause,
    FaAngleDoubleLeft,
    FaAngleDoubleRight,
    FaVolumeUp,
} from 'react-icons/fa';
import { jlptTests } from '../../dataTest/jlptTests';
import { formatTime, getTranslatedSectionName } from './constants';
import SEO from '../../hooks/useSEO';

const ExamView = () => {
    const { testId, qIndex } = useParams();
    const navigate = useNavigate();

    const currentTest = useMemo(() => jlptTests.find((t) => t.id === testId), [testId]);

    const [selectedSectionId, setSelectedSectionId] = useState(() => {
        const storageKeyLocal = `jlpt_exam_state_${testId}`;
        const saved = localStorage.getItem(storageKeyLocal);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.selectedSectionId) return parsed.selectedSectionId;
        }
        if (currentTest && currentTest.sections.length > 0) {
            return currentTest.sections[0].id;
        }
        return null;
    });
    const [completedSections, setCompletedSections] = useState(() => {
        const storageKeyLocal = `jlpt_exam_state_${testId}`;
        const saved = localStorage.getItem(storageKeyLocal);
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.completedSections || [];
        }
        return [];
    });
    const [audioStates, setAudioStates] = useState({});

    const allQuestions = useMemo(() => {
        if (!currentTest) return [];
        const questions = [];
        currentTest.sections.forEach((section, sIdx) => {
            const translatedSectionName = getTranslatedSectionName(section.name, sIdx);
            if (section.questions && section.questions.length > 0) {
                section.questions.forEach((q) => {
                    questions.push({
                        ...q,
                        sectionId: section.id,
                        sectionName: translatedSectionName,
                        sectionType: 'question',
                    });
                });
            }
            if (section.readings && section.readings.length > 0) {
                section.readings.forEach((reading) => {
                    reading.questions.forEach((q, idx) => {
                        questions.push({
                            ...q,
                            sectionId: section.id,
                            sectionName: translatedSectionName,
                            sectionType: 'reading',
                            readingId: reading.id,
                            contentImage: reading.contentImage,
                            passage: reading.passage,
                            passageTranslation: reading.passageTranslation,
                            isFirstQuestionOfReading: idx === 0,
                        });
                    });
                });
            }
            if (section.listenings && section.listenings.length > 0) {
                section.listenings.forEach((listening) => {
                    listening.questions.forEach((q, idx) => {
                        questions.push({
                            ...q,
                            sectionId: section.id,
                            sectionName: translatedSectionName,
                            sectionType: 'listening',
                            listeningId: listening.id,
                            audio: listening.audio,
                            isFirstQuestionOfListening: idx === 0,
                        });
                    });
                });
            }
        });
        return questions;
    }, [currentTest]);

    const sections = useMemo(() => {
        if (!currentTest) return [];
        return currentTest.sections.map((s, idx) => ({
            id: s.id,
            name: getTranslatedSectionName(s.name, idx),
        }));
    }, [currentTest]);

    const filteredQuestions = useMemo(
        () => (selectedSectionId ? allQuestions.filter((q) => q.sectionId === selectedSectionId) : allQuestions),
        [allQuestions, selectedSectionId],
    );

    const currentQuestionIndex = parseInt(qIndex || '0', 10);
    const currentQuestion = filteredQuestions[currentQuestionIndex];

    const currentSection = useMemo(() => {
        if (!currentTest || !selectedSectionId) return null;
        return currentTest.sections.find((s) => s.id === selectedSectionId);
    }, [currentTest, selectedSectionId]);

    const currentSectionDuration = useMemo(() => {
        return currentSection?.duration || 0;
    }, [currentSection]);

    const storageKey = `jlpt_exam_state_${testId}`;
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
            const parsed = JSON.parse(saved);
            if (parsed.timeLeftPerSection && parsed.selectedSectionId) {
                return parsed.timeLeftPerSection[parsed.selectedSectionId] || currentSectionDuration * 60;
            }
            return parsed.timeLeft;
        }
        return currentSectionDuration ? currentSectionDuration * 60 : 0;
    });
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showSectionChangeModal, setShowSectionChangeModal] = useState(false);
    const [showTimeoutModal, setShowTimeoutModal] = useState(false);
    const [nextSectionId, setNextSectionId] = useState(null);

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
        localStorage.setItem(`jlpt_result_${testId}`, JSON.stringify(resultData));
        localStorage.removeItem(storageKey);

        navigate(`/thi-thu-JLPT/result/${testId}`, { replace: true });
    }, [allQuestions, answers, testId, storageKey, navigate]);

    useEffect(() => {
        if (currentTest && currentTest.sections.length > 0 && !selectedSectionId) {
            setSelectedSectionId(currentTest.sections[0].id);
        }
    }, [currentTest]);

    useEffect(() => {
        if (selectedSectionId && currentSectionDuration) {
            const saved = localStorage.getItem(storageKey);
            const existingData = saved ? JSON.parse(saved) : {};

            if (!existingData.timeLeftPerSection || !existingData.timeLeftPerSection[selectedSectionId]) {
                setTimeLeft(currentSectionDuration * 60);
            }
        }
    }, [selectedSectionId, currentSectionDuration, storageKey]);

    useEffect(() => {
        if (currentTest) {
            const saved = localStorage.getItem(storageKey);
            const existingData = saved ? JSON.parse(saved) : {};
            const timeLeftPerSection = existingData.timeLeftPerSection || {};

            if (selectedSectionId) {
                timeLeftPerSection[selectedSectionId] = timeLeft;
            }

            localStorage.setItem(
                storageKey,
                JSON.stringify({
                    answers,
                    flagged: flaggedQuestions,
                    timeLeft,
                    timeLeftPerSection,
                    lastIndex: currentQuestionIndex,
                    selectedSectionId,
                    completedSections,
                }),
            );
        }
    }, [
        answers,
        flaggedQuestions,
        timeLeft,
        currentQuestionIndex,
        testId,
        currentTest,
        storageKey,
        selectedSectionId,
        completedSections,
    ]);

    useEffect(() => {
        let timer;
        if (timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && currentTest && selectedSectionId) {
            setShowTimeoutModal(true);
        }
        return () => clearInterval(timer);
    }, [timeLeft, currentTest, selectedSectionId]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
    }, [currentQuestionIndex]);

    const handleAnswerSelect = (idx) => {
        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: idx }));
    };

    const goToQuestion = (idx) => {
        if (idx >= 0 && idx < filteredQuestions.length) {
            navigate(`/thi-thu-JLPT/exam/${testId}/${idx}`, { replace: true });
        }
    };

    const handleSectionChange = (sectionId) => {
        if (completedSections.includes(sectionId)) {
            alert('Phần này đã hoàn thành. Bạn không thể quay lại để chỉnh sửa!');
            return;
        }

        if (sectionId !== selectedSectionId) {
            setNextSectionId(sectionId);
            setShowSectionChangeModal(true);
        }
    };

    const confirmSectionChange = () => {
        if (nextSectionId && currentTest) {
            setCompletedSections((prev) => [...prev, selectedSectionId]);

            const nextSection = currentTest.sections.find((s) => s.id === nextSectionId);
            const nextSectionDuration = nextSection?.duration || 0;

            setSelectedSectionId(nextSectionId);
            navigate(`/thi-thu-JLPT/exam/${testId}/0`, { replace: true });

            setTimeLeft(nextSectionDuration * 60);

            setShowSectionChangeModal(false);
            setNextSectionId(null);
        }
    };

    const handleTimeoutContinue = () => {
        if (!currentTest) return;

        const currentSectionIndex = currentTest.sections.findIndex((s) => s.id === selectedSectionId);

        if (currentSectionIndex < currentTest.sections.length - 1) {
            const nextSection = currentTest.sections[currentSectionIndex + 1];
            const nextSectionDuration = nextSection?.duration || 0;

            setCompletedSections((prev) => [...prev, selectedSectionId]);

            setSelectedSectionId(nextSection.id);
            navigate(`/thi-thu-JLPT/exam/${testId}/0`, { replace: true });
            setTimeLeft(nextSectionDuration * 60);
        } else {
            submitTest();
        }

        setShowTimeoutModal(false);
    };

    if (!currentTest) return <div className="p-10 text-center">Đề thi không tồn tại.</div>;
    if (!currentQuestion) return <div className="p-10 text-center">Không có câu hỏi.</div>;

    return (
        <div className="bg-gray-50 min-h-screen pt-4">
            <SEO page="jlptTest" />
            {/* Header */}
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

            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 px-4 py-8 mt-13.5">
                {/* Main Content */}
                <div className="flex-1 lg:max-w-3xl xl:max-w-4xl mx-auto w-full">
                    {/* Section Selector Buttons */}
                    <div className="mb-4 flex flex-nowrap overflow-x-auto gap-3 pb-2 custom-scrollbar no-scrollbar-mobile">
                        {sections.map((section) => {
                            const isCompleted = completedSections.includes(section.id);
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => handleSectionChange(section.id)}
                                    disabled={isCompleted}
                                    className={`px-4 py-2 rounded-2xl font-bold transition-all whitespace-nowrap ${
                                        selectedSectionId === section.id
                                            ? 'bg-red-600 text-white shadow-lg shadow-red-100 cursor-pointer'
                                            : isCompleted
                                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                                              : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300 cursor-pointer'
                                    }`}
                                    title={isCompleted ? 'Phần này đã hoàn thành' : ''}
                                >
                                    {section.name}
                                    {isCompleted && ' ✓'}
                                </button>
                            );
                        })}
                    </div>

                    {/* Reading Passage Display */}
                    {currentQuestion?.sectionType === 'reading' && (
                        <div className="bg-white rounded-[1rem] px-5 pt-5 pb-2 shadow-sm border border-gray-100 mb-6">
                            {currentQuestion?.contentImage && (
                                <div className="mb-4 flex justify-center">
                                    <img
                                        src={currentQuestion.contentImage}
                                        alt="Reading content"
                                        className="max-w-full h-auto max-h-64 rounded-lg"
                                    />
                                </div>
                            )}
                            {currentQuestion?.passage && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                                    <p className="text-gray-700 font-medium leading-relaxed mb-2">
                                        {currentQuestion.passage}
                                    </p>
                                    {currentQuestion?.passageTranslation && (
                                        <p className="text-gray-500 italic text-sm leading-relaxed">
                                            {currentQuestion.passageTranslation}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Audio Player for Listening */}
                    {currentQuestion?.sectionType === 'listening' &&
                        currentQuestion?.isFirstQuestionOfListening &&
                        currentQuestion?.audio && (
                            <div className="bg-white rounded-[1.5rem] p-4 shadow-xl border border-gray-100 mb-6 border-l-8 border-l-red-600 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                                                <FaVolumeUp size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-xl text-gray-800">Phần Nghe Hiểu</h3>
                                                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">
                                                    聴解
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-[1.5rem] p-6 border border-gray-100">
                                        <div className="flex flex-col gap-4">
                                            {/* Progress Bar and Time */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-black text-red-600">
                                                    <span>
                                                        {formatTime(
                                                            audioStates[currentQuestion.listeningId]?.currentTime || 0,
                                                        )}
                                                    </span>
                                                    <span>
                                                        {formatTime(
                                                            audioStates[currentQuestion.listeningId]?.duration || 0,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="relative h-2 bg-gray-200 rounded-full group">
                                                    <input
                                                        type="range"
                                                        id={`audio-range-${currentQuestion.listeningId}`}
                                                        min="0"
                                                        max={audioStates[currentQuestion.listeningId]?.duration || 100}
                                                        value={
                                                            audioStates[currentQuestion.listeningId]?.currentTime || 0
                                                        }
                                                        onChange={(e) => {
                                                            const audio = document.getElementById(
                                                                `audio-${currentQuestion.listeningId}`,
                                                            );
                                                            if (audio) {
                                                                const time = parseFloat(e.target.value);
                                                                audio.currentTime = time;
                                                                setAudioStates((prev) => ({
                                                                    ...prev,
                                                                    [currentQuestion.listeningId]: {
                                                                        ...prev[currentQuestion.listeningId],
                                                                        currentTime: time,
                                                                    },
                                                                }));
                                                            }
                                                        }}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    />
                                                    <div
                                                        className="absolute top-0 left-0 h-full bg-red-600 rounded-full transition-all duration-100"
                                                        style={{
                                                            width: `${((audioStates[currentQuestion.listeningId]?.currentTime || 0) / (audioStates[currentQuestion.listeningId]?.duration || 1)) * 100}%`,
                                                        }}
                                                    >
                                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-red-600 rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Controls */}
                                            <div className="flex items-center justify-center gap-6">
                                                <button
                                                    onClick={() => {
                                                        const audio = document.getElementById(
                                                            `audio-${currentQuestion.listeningId}`,
                                                        );
                                                        if (audio)
                                                            audio.currentTime = Math.max(0, audio.currentTime - 10);
                                                    }}
                                                    className="p-3 text-gray-400 hover:text-red-600 hover:bg-white rounded-xl transition-all cursor-pointer"
                                                    title="Lùi 10s"
                                                >
                                                    <FaAngleDoubleLeft size={18} />
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        const audio = document.getElementById(
                                                            `audio-${currentQuestion.listeningId}`,
                                                        );
                                                        if (audio) {
                                                            if (audio.paused) audio.play();
                                                            else audio.pause();
                                                        }
                                                    }}
                                                    className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                                >
                                                    {audioStates[currentQuestion.listeningId]?.playing ? (
                                                        <FaPause size={24} />
                                                    ) : (
                                                        <FaPlay size={24} className="ml-1" />
                                                    )}
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        const audio = document.getElementById(
                                                            `audio-${currentQuestion.listeningId}`,
                                                        );
                                                        if (audio)
                                                            audio.currentTime = Math.min(
                                                                audio.duration,
                                                                audio.currentTime + 10,
                                                            );
                                                    }}
                                                    className="p-3 text-gray-400 hover:text-red-600 hover:bg-white rounded-xl transition-all cursor-pointer"
                                                    title="Tiến 10s"
                                                >
                                                    <FaAngleDoubleRight size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <audio
                                    id={`audio-${currentQuestion.listeningId}`}
                                    src={currentQuestion.audio.src}
                                    onLoadedMetadata={(e) => {
                                        setAudioStates((prev) => ({
                                            ...prev,
                                            [currentQuestion.listeningId]: {
                                                ...prev[currentQuestion.listeningId],
                                                duration: e.target.duration,
                                                currentTime: 0,
                                            },
                                        }));
                                    }}
                                    onPlay={() =>
                                        setAudioStates((prev) => ({
                                            ...prev,
                                            [currentQuestion.listeningId]: {
                                                ...prev[currentQuestion.listeningId],
                                                playing: true,
                                            },
                                        }))
                                    }
                                    onPause={() =>
                                        setAudioStates((prev) => ({
                                            ...prev,
                                            [currentQuestion.listeningId]: {
                                                ...prev[currentQuestion.listeningId],
                                                playing: false,
                                            },
                                        }))
                                    }
                                    onTimeUpdate={(e) => {
                                        setAudioStates((prev) => ({
                                            ...prev,
                                            [currentQuestion.listeningId]: {
                                                ...prev[currentQuestion.listeningId],
                                                currentTime: e.target.currentTime,
                                            },
                                        }));
                                    }}
                                    className="hidden"
                                />
                            </div>
                        )}

                    {/* Question View */}
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

                        {typeof currentQuestion?.text === 'object' && currentQuestion?.text?.type === 'image' ? (
                            <div className="mb-4 flex justify-center">
                                <img
                                    src={currentQuestion.text.src}
                                    alt="Question"
                                    className="max-w-full h-auto rounded-lg"
                                />
                            </div>
                        ) : (
                            <p className="text-lg md:text-xl text-gray-800 font-bold mb-4 leading-relaxed">
                                {currentQuestion?.text}
                            </p>
                        )}

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
                                            typeof opt === 'object' && opt.type === 'image'
                                                ? ''
                                                : answers[currentQuestion.id] === idx
                                                  ? 'text-gray-900 font-bold'
                                                  : 'text-gray-600'
                                        }`}
                                    >
                                        {typeof opt === 'object' && opt.type === 'image' ? (
                                            <img src={opt.src} alt="Option" className="max-w-full h-auto max-h-20" />
                                        ) : (
                                            opt
                                        )}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between gap-6">
                        <button
                            disabled={currentQuestionIndex === 0}
                            onClick={() => goToQuestion(currentQuestionIndex - 1)}
                            className={`flex-1 py-2 bg-white rounded-2xl font-bold text-gray-600 border border-gray-100 shadow-sm disabled:opacity-30 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 ${currentQuestionIndex === 0 ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            <FaChevronLeft /> Trước
                        </button>
                        <button
                            disabled={currentQuestionIndex === filteredQuestions.length - 1}
                            onClick={() => goToQuestion(currentQuestionIndex + 1)}
                            className={`flex-1 py-2 bg-white rounded-2xl font-bold text-gray-800 border border-gray-100 shadow-sm disabled:opacity-30 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 ${
                                currentQuestionIndex === filteredQuestions.length - 1
                                    ? 'cursor-not-allowed'
                                    : 'cursor-pointer'
                            }`}
                        >
                            Tiếp theo <FaChevronRight />
                        </button>
                    </div>
                </div>

                {/* Question List Sidebar */}
                <div className="lg:w-80 w-full shrink-0 mt-2">
                    <div className="lg:sticky lg:top-42 bg-white rounded-[1rem] p-5 shadow-sm border border-gray-100">
                        <h3 className="font-black text-gray-800 mb-2.5 flex items-center gap-3">
                            <FaListAlt className="text-red-600" /> Bảng câu hỏi
                        </h3>
                        <div className="grid grid-cols-6 gap-2 max-h-[400px] lg:max-h-none overflow-y-auto pr-2 custom-scrollbar py-2">
                            {filteredQuestions.map((q, idx) => (
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

            {/* Submit Confirmation Modal */}
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

            {/* Section Change Confirmation Modal */}
            {showSectionChangeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                        onClick={() => setShowSectionChangeModal(false)}
                    ></div>
                    <div className="bg-white rounded-[1.5rem] p-8 max-w-lg w-full relative z-[110] text-center shadow-2xl animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
                            <FaInfoCircle size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-4">Chuyển sang phần tiếp theo?</h2>
                        <p className="text-gray-500 mb-8 md:text-lg">
                            Khi bạn chuyển sang phần tiếp theo, bạn sẽ không thể quay lại phần này để chỉnh sửa bài làm
                            nữa!
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={confirmSectionChange}
                                className="w-full py-2.5 bg-red-500 cursor-pointer text-white font-black rounded-2xl hover:bg-red-600 transition-all active:scale-95"
                            >
                                Chuyển phần
                            </button>
                            <button
                                onClick={() => {
                                    setShowSectionChangeModal(false);
                                    setNextSectionId(null);
                                }}
                                className="w-full py-2.5 bg-gray-100 cursor-pointer text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                            >
                                Hủy để làm tiếp
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Timeout Modal */}
            {showTimeoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                        onClick={() => setShowTimeoutModal(false)}
                    ></div>
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full relative z-[110] text-center shadow-2xl animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
                            <FaClock size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-4">Hết giờ!</h2>
                        <p className="text-gray-500 mb-8 text-lg">
                            Thời gian làm bài phần này đã kết thúc. Vui lòng tiếp tục sang phần tiếp theo.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleTimeoutContinue}
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

export default ExamView;
