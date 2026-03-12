import React, { useState, useEffect, useMemo } from 'react';
import ScrollToTopButton from '../components/layout/ScrollToTopButton';
import {
    FaClock,
    FaFlag,
    FaChevronLeft,
    FaChevronRight,
    FaCheckCircle,
    FaBookOpen,
    FaTimes,
    FaListAlt,
    FaInfoCircle,
    FaQuestionCircle,
    FaTrophy,
    FaRedo,
    FaHome,
    FaPlay,
    FaPause,
    FaStepBackward,
    FaStepForward,
    FaVolumeUp,
} from 'react-icons/fa';
import { Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import { jlptTests } from '../dataTest/jlptTests';

// Shared Constants
const levels = [
    { id: 'N1', name: 'JLPT N1', desc: 'Cao cấp nhất', duration: '170 phút', accent: 'border-purple-500' },
    { id: 'N2', name: 'JLPT N2', desc: 'Cao cấp', duration: '155 phút', accent: 'border-blue-600' },
    { id: 'N3', name: 'JLPT N3', desc: 'Trung cấp', duration: '140 phút', accent: 'border-green-500' },
    { id: 'N4', name: 'JLPT N4', desc: 'Sơ cấp', duration: '125 phút', accent: 'border-orange-500' },
    { id: 'N5', name: 'JLPT N5', desc: 'Cơ bản', duration: '90 phút', accent: 'border-red-600' },
];

const formatTime = (seconds) => {
    const totalSeconds = Math.floor(seconds);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
};

const getTranslatedSectionName = (name, index) => {
    const sectionNames = {
        'Vocabulary': 'Từ vựng',
        'Reading': 'Đọc hiểu',
        'Listening': 'Nghe hiểu',
        'Từ vựng': 'Từ vựng',
        'Ngữ pháp & Đọc hiểu': 'Ngữ pháp & Đọc hiểu',
        'Nghe hiểu': 'Nghe hiểu'
    };
    const displayName = sectionNames[name] || name;
    return `Phần ${index + 1}: ${displayName}`;
};

// --- Sub-components ---

const LevelSelection = () => {
    const navigate = useNavigate();
    return (
        <div className="pt-28 pb-16 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-10">
                    <span className="inline-block px-4 py-1 bg-red-100 text-red-600 rounded-full font-bold mb-4 uppercase tracking-widest">
                        Thi thử JLPT
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Chọn Cấp Độ Thi Thử</h1>
                    <p className="text-gray-600 text-lg max-w-5xl mx-auto">
                        Chọn cấp độ phù hợp để bắt đầu luyện đề. Mỗi đề thi đều được thiết kế sát với cấu trúc chuẩn
                        JLPT mới nhất.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                    {levels.map((level) => (
                        <button
                            key={level.id}
                            onClick={() => navigate(`level/${level.id}`)}
                            className={`group bg-white cursor-pointer p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:-translate-y-1 flex flex-col items-center text-center ${level.accent.replace('border-', 'hover:border-')}`}
                        >
                            <div
                                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-opacity-80 ${level.id === 'N5' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'}`}
                            >
                                <span className="text-3xl font-black">{level.id}</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{level.name}</h3>
                            <p className="text-sm text-gray-500 mb-4">{level.desc}</p>
                            <div className="mt-auto pt-4 border-t border-gray-100 w-full">
                                <span className="text-xs font-bold text-gray-400 flex items-center justify-center gap-2">
                                    <FaClock size={12} /> {level.duration}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-12 bg-white p-8 md:px-10 md:py-8 rounded-[2rem] shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
                        <FaInfoCircle className="text-red-600" /> Cấu trúc và thời gian thi JLPT
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-sm">
                        <div className="space-y-4">
                            <h4 className="font-bold text-red-600 border-b pb-2">N5 (90 phút)</h4>
                            <ul className="space-y-2 text-gray-600">
                                <li>• Từ vựng (20-25 phút)</li>
                                <li>• Ngữ pháp + Đọc hiểu (40-50 phút)</li>
                                <li>• Nghe hiểu (30 phút)</li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-bold text-red-600 border-b pb-2">N4 (115-125 phút)</h4>
                            <ul className="space-y-2 text-gray-600">
                                <li>• Từ vựng (25-30 phút)</li>
                                <li>• Ngữ pháp + Đọc hiểu (55 phút)</li>
                                <li>• Nghe hiểu (35 phút)</li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-bold text-red-600 border-b pb-2">N3 (140 phút)</h4>
                            <ul className="space-y-2 text-gray-600">
                                <li>• Từ vựng (30 phút)</li>
                                <li>• Ngữ pháp + Đọc hiểu (70 phút)</li>
                                <li>• Nghe hiểu (40 phút)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TestSelection = () => {
    const { levelId } = useParams();
    const navigate = useNavigate();
    const tests = jlptTests.filter((t) => t.level === levelId);

    const openExamPopup = (testId) => {
        const popupWidth = 1400;
        const popupHeight = 900;
        const left = (window.screen.width - popupWidth) / 2;
        const top = (window.screen.height - popupHeight) / 2;

        window.open(
            `/thi-thu-JLPT/exam/${testId}`,
            `ExamWindow_${testId}`,
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,location=no,toolbar=no,menubar=no`,
        );
    };

    return (
        <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto px-4">
                <button
                    onClick={() => navigate('/thi-thu-JLPT')}
                    className="flex items-center cursor-pointer gap-2 text-red-600 font-bold mb-4 hover:gap-3 transition-all"
                >
                    <FaChevronLeft /> Quay lại chọn cấp độ
                </button>

                <h1 className="text-3xl font-black text-gray-900 mb-10 flex items-center gap-4">
                    Danh sách đề thi{' '}
                    <span className="px-4 py-1 bg-red-600 text-white rounded-full text-lg">{levelId}</span>
                </h1>

                {tests.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {tests.map((test) => (
                            <div
                                key={test.id}
                                className="bg-white rounded-[1rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                            >
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                                            <FaListAlt size={20} />
                                        </div>
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                            {test.sections.length} PHẦN THI
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-black text-gray-800 mb-2 group-hover:text-red-600 transition-colors">
                                        {test.title}
                                    </h3>
                                    <div className="flex items-center gap-6 text-sm text-gray-500 mb-6 font-medium">
                                        <span className="flex items-center gap-2">
                                            <FaClock className="text-red-500" /> {test.totalDuration} phút
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <FaQuestionCircle className="text-orange-500" />{' '}
                                            {test.sections.reduce((a, section) => {
                                                let count = section.questions?.length || 0;
                                                if (section.readings)
                                                    count += section.readings.reduce(
                                                        (rCount, reading) => rCount + (reading.questions?.length || 0),
                                                        0,
                                                    );
                                                if (section.listenings)
                                                    count += section.listenings.reduce(
                                                        (lCount, listening) =>
                                                            lCount + (listening.questions?.length || 0),
                                                        0,
                                                    );
                                                return a + count;
                                            }, 0)}{' '}
                                            câu hỏi
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => openExamPopup(test.id)}
                                        className="w-full py-2 cursor-pointer bg-gray-900 text-white font-bold rounded-2xl hover:bg-red-600 transition-all shadow-lg hover:shadow-red-200 active:scale-95 transform"
                                    >
                                        Bắt đầu làm bài
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-20 rounded-[3rem] text-center shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                            <FaBookOpen size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Đang cập nhật đề thi</h3>
                        <p className="text-gray-500">Các đề thi {levelId} đang được đội ngũ Sakae hoàn thiện.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const ExamView = () => {
    const { testId, qIndex } = useParams();
    const navigate = useNavigate();

    const currentTest = useMemo(() => jlptTests.find((t) => t.id === testId), [testId]);
    const [selectedSectionId, setSelectedSectionId] = useState(null);
    const [audioStates, setAudioStates] = useState({});

    // Flatten all questions from sections, readings, and listenings
    const allQuestions = useMemo(() => {
        if (!currentTest) return [];
        const questions = [];
        currentTest.sections.forEach((section, sIdx) => {
            const translatedSectionName = getTranslatedSectionName(section.name, sIdx);
            // Regular questions
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
            // Reading passages
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
            // Listening passages
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

    // Get unique sections
    const sections = useMemo(() => {
        if (!currentTest) return [];
        return currentTest.sections.map((s, idx) => ({ 
            id: s.id, 
            name: getTranslatedSectionName(s.name, idx) 
        }));
    }, [currentTest]);

    // Filter questions by selected section
    const filteredQuestions = useMemo(
        () => (selectedSectionId ? allQuestions.filter((q) => q.sectionId === selectedSectionId) : allQuestions),
        [allQuestions, selectedSectionId],
    );

    const currentQuestionIndex = parseInt(qIndex || '0', 10);
    const currentQuestion = filteredQuestions[currentQuestionIndex];

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
        if (saved) return JSON.parse(saved).timeLeft;
        return currentTest ? currentTest.totalDuration * 60 : 0;
    });
    const [showSubmitModal, setShowSubmitModal] = useState(false);

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
        } else if (timeLeft === 0) {
            submitTest();
        }
        return () => clearInterval(timer);
    }, [timeLeft, submitTest]);

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
        setSelectedSectionId(selectedSectionId === sectionId ? null : sectionId);
        navigate(`/thi-thu-JLPT/exam/${testId}/0`, { replace: true });
    };

    if (!currentTest) return <div className="p-10 text-center">Đề thi không tồn tại.</div>;
    if (!currentQuestion) return <div className="p-10 text-center">Không có câu hỏi.</div>;

    return (
        <div className="bg-gray-50 min-h-screen pt-4">
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
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => handleSectionChange(section.id)}
                                className={`px-4 py-2 rounded-2xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                                    selectedSectionId === section.id
                                        ? 'bg-red-600 text-white shadow-lg shadow-red-100'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'
                                }`}
                            >
                                {section.name}
                            </button>
                        ))}
                    </div>

                    {/* Reading Passage Display */}
                    {currentQuestion?.sectionType === 'reading' && currentQuestion?.isFirstQuestionOfReading && (
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
                            <div className="bg-white rounded-[2rem] p-5 shadow-xl border border-gray-100 mb-6 border-l-8 border-l-blue-600 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                                                <FaVolumeUp size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-xl text-gray-800">Phần Nghe Hiểu</h3>
                                                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">聴解</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-[1.5rem] p-6 border border-gray-100">
                                        <div className="flex flex-col gap-4">
                                            {/* Progress Bar and Time */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-black text-blue-600">
                                                    <span>{formatTime(audioStates[currentQuestion.listeningId]?.currentTime || 0)}</span>
                                                    <span>{formatTime(audioStates[currentQuestion.listeningId]?.duration || 0)}</span>
                                                </div>
                                                <div className="relative h-2 bg-gray-200 rounded-full group">
                                                    <input
                                                        type="range"
                                                        id={`audio-range-${currentQuestion.listeningId}`}
                                                        min="0"
                                                        max={audioStates[currentQuestion.listeningId]?.duration || 100}
                                                        value={audioStates[currentQuestion.listeningId]?.currentTime || 0}
                                                        onChange={(e) => {
                                                            const audio = document.getElementById(`audio-${currentQuestion.listeningId}`);
                                                            if (audio) {
                                                                const time = parseFloat(e.target.value);
                                                                audio.currentTime = time;
                                                                setAudioStates(prev => ({
                                                                    ...prev,
                                                                    [currentQuestion.listeningId]: { ...prev[currentQuestion.listeningId], currentTime: time }
                                                                }));
                                                            }
                                                        }}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    />
                                                    <div 
                                                        className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-100" 
                                                        style={{ width: `${((audioStates[currentQuestion.listeningId]?.currentTime || 0) / (audioStates[currentQuestion.listeningId]?.duration || 1)) * 100}%` }}
                                                    >
                                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Controls */}
                                            <div className="flex items-center justify-center gap-6">
                                                <button
                                                    onClick={() => {
                                                        const audio = document.getElementById(`audio-${currentQuestion.listeningId}`);
                                                        if (audio) audio.currentTime = Math.max(0, audio.currentTime - 10);
                                                    }}
                                                    className="p-3 text-gray-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all cursor-pointer"
                                                    title="Lùi 10s"
                                                >
                                                    <FaStepBackward size={18} />
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        const audio = document.getElementById(`audio-${currentQuestion.listeningId}`);
                                                        if (audio) {
                                                            if (audio.paused) audio.play();
                                                            else audio.pause();
                                                        }
                                                    }}
                                                    className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                                >
                                                    {audioStates[currentQuestion.listeningId]?.playing ? (
                                                        <FaPause size={24} />
                                                    ) : (
                                                        <FaPlay size={24} className="ml-1" />
                                                    )}
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        const audio = document.getElementById(`audio-${currentQuestion.listeningId}`);
                                                        if (audio) audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
                                                    }}
                                                    className="p-3 text-gray-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all cursor-pointer"
                                                    title="Tiến 10s"
                                                >
                                                    <FaStepForward size={18} />
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
                                                currentTime: 0
                                            },
                                        }));
                                    }}
                                    onPlay={() =>
                                        setAudioStates((prev) => ({
                                            ...prev,
                                            [currentQuestion.listeningId]: { ...prev[currentQuestion.listeningId], playing: true },
                                        }))
                                    }
                                    onPause={() =>
                                        setAudioStates((prev) => ({
                                            ...prev,
                                            [currentQuestion.listeningId]: { ...prev[currentQuestion.listeningId], playing: false },
                                        }))
                                    }
                                    onTimeUpdate={(e) => {
                                        setAudioStates((prev) => ({
                                            ...prev,
                                            [currentQuestion.listeningId]: { 
                                                ...prev[currentQuestion.listeningId], 
                                                currentTime: e.target.currentTime 
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
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full relative z-[110] text-center shadow-2xl animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-12 transition-transform hover:rotate-0">
                            <FaQuestionCircle size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-4">Bạn chắc chứ?</h2>
                        <p className="text-gray-500 mb-8 text-lg">
                            Một khi nộp bài bạn sẽ không thể sửa lại bài làm của mình nữa!
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={submitTest}
                                className="w-full py-2.5 bg-red-600 cursor-pointer text-white font-black rounded-2xl hover:bg-red-700 transition-all active:scale-95"
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
        </div>
    );
};

const ResultView = () => {
    const { testId } = useParams();
    const navigate = useNavigate();

    const resultData = useMemo(() => {
        const saved = localStorage.getItem(`jlpt_result_${testId}`);
        return saved ? JSON.parse(saved) : null;
    }, [testId]);

    const currentTest = useMemo(() => jlptTests.find((t) => t.id === testId), [testId]);
    const [reviewQuestionIndex, setReviewQuestionIndex] = useState(0);
    const [showAllAnswers, setShowAllAnswers] = useState(false);

    // Flatten all questions from sections, readings, and listenings
    const allQuestions = useMemo(() => {
        if (!currentTest) return [];
        const questions = [];
        currentTest.sections.forEach((section, sIdx) => {
            const translatedSectionName = getTranslatedSectionName(section.name, sIdx);
            // Regular questions
            if (section.questions && section.questions.length > 0) {
                section.questions.forEach((q) => {
                    questions.push({ ...q, sectionName: translatedSectionName });
                });
            }
            // Reading passages
            if (section.readings && section.readings.length > 0) {
                section.readings.forEach((reading) => {
                    reading.questions.forEach((q) => {
                        questions.push({ ...q, sectionName: translatedSectionName });
                    });
                });
            }
            // Listening passages
            if (section.listenings && section.listenings.length > 0) {
                section.listenings.forEach((listening) => {
                    listening.questions.forEach((q) => {
                        questions.push({ ...q, sectionName: translatedSectionName });
                    });
                });
            }
        });
        return questions;
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

    const percent = Math.round((score.correct / score.total) * 100);
    const reviewQuestion = allQuestions[reviewQuestionIndex];

    const handleRedo = () => {
        const popupWidth = 1400;
        const popupHeight = 900;
        const left = (window.screen.width - popupWidth) / 2;
        const top = (window.screen.height - popupHeight) / 2;

        window.open(
            `/thi-thu-JLPT/exam/${testId}`,
            `ExamWindow_${testId}`,
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,location=no,toolbar=no,menubar=no`,
        );
    };

    return (
        <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4">
                {/* Summary Card */}
                <div className="bg-white rounded-[1rem] p-6 shadow-sm border border-gray-100 text-center mb-8 max-w-4xl mx-auto">
                    <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                        <FaTrophy size={40} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Kết quả bài thi</h1>
                    <p className="text-gray-500 text-lg mb-6">{currentTest.title}</p>

                    <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6">
                        <div className="p-4 bg-red-50 rounded-[1.5rem]">
                            <div className="text-2xl md:text-3xl font-black text-red-600 mb-1">{score.correct}</div>
                            <div className="text-[10px] md:text-xs font-black text-red-400 uppercase tracking-wider">
                                Câu đúng
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-[1.5rem]">
                            <div className="text-2xl md:text-3xl font-black text-gray-800 mb-1">{score.total}</div>
                            <div className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-wider">
                                Tổng câu
                            </div>
                        </div>
                        <div className="p-4 bg-green-50 rounded-[1.5rem]">
                            <div className="text-2xl md:text-3xl font-black text-green-600 mb-1">{percent}%</div>
                            <div className="text-[10px] md:text-xs font-black text-green-400 uppercase tracking-wider">
                                Tỷ lệ
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 justify-center">
                        <button
                            onClick={handleRedo}
                            className="px-8 py-3 cursor-pointer bg-gray-900 text-white font-black rounded-2xl hover:bg-red-600 transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-gray-200"
                        >
                            <FaRedo /> Làm lại đề này
                        </button>
                        <button
                            onClick={() => navigate('/thi-thu-JLPT')}
                            className="px-8 py-3 cursor-pointer bg-white text-gray-700 font-black rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <FaHome /> Quay về cấp độ
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Review Content */}
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
                            <div className="space-y-6">
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
                                            <div>
                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                                                    {q.sectionName}
                                                </div>
                                                <div
                                                    className={`text-sm font-bold ${answers[q.id] === q.correct ? 'text-green-600' : 'text-red-600'}`}
                                                >
                                                    {answers[q.id] === q.correct
                                                        ? 'Câu trả lời đúng'
                                                        : 'Câu trả lời sai'}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-lg text-gray-800 font-bold mb-3">{q.text}</p>
                                        <div className="grid gap-2 mb-6">
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
                                                {q.explanation || 'Đang cập nhật giải thích cho câu hỏi này.'}
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
                                        <div>
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                                                {reviewQuestion.sectionName}
                                            </div>
                                            <div
                                                className={`text-sm font-bold ${answers[reviewQuestion.id] === reviewQuestion.correct ? 'text-green-600' : 'text-red-600'}`}
                                            >
                                                {answers[reviewQuestion.id] === reviewQuestion.correct
                                                    ? 'Câu trả lời đúng'
                                                    : 'Câu trả lời sai'}
                                            </div>
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
                                            {reviewQuestion.explanation || 'Đang cập nhật giải thích cho câu hỏi này.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Navigation buttons for review */}
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

                    {/* Result Sidebar */}
                    <div className="lg:w-80 w-full shrink-0">
                        <div className="lg:sticky lg:top-44 bg-white rounded-[1rem] p-5 shadow-sm border border-gray-100">
                            <h3 className="font-black text-gray-800 mb-3 flex items-center gap-3">
                                <FaListAlt className="text-red-600" /> Bảng đáp án
                            </h3>
                            <div className="grid grid-cols-6 gap-2 max-h-[400px] lg:max-h-none overflow-y-auto pr-2 custom-scrollbar py-2">
                                {allQuestions.map((q, idx) => (
                                    <button
                                        key={q.id}
                                        onClick={() => {
                                            setReviewQuestionIndex(idx);
                                            setShowAllAnswers(false);
                                        }}
                                        className={`relative h-11 w-full rounded-xl text-sm font-black transition-all flex items-center justify-center ${
                                            reviewQuestionIndex === idx && !showAllAnswers
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                                                : answers[q.id] === q.correct
                                                  ? 'bg-green-200 text-green-700 hover:bg-green-200'
                                                  : 'bg-red-200 text-red-600 hover:bg-red-200'
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
            <ScrollToTopButton />
        </div>
    );
};

// --- Main Route Handler ---

const JLPTMockTest = () => {
    return (
        <Routes>
            <Route index element={<LevelSelection />} />
            <Route path="level/:levelId" element={<TestSelection />} />
            <Route path="exam/:testId/:qIndex" element={<ExamView />} />
            <Route path="exam/:testId" element={<ExamView />} />
            <Route path="result/:testId" element={<ResultView />} />
        </Routes>
    );
};

export default JLPTMockTest;
