import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaClock, FaChevronLeft, FaListAlt, FaTrophy, FaBookOpen } from 'react-icons/fa';
import { jlptTests } from '../../dataTest/jlptTests';
import { levels } from './constants';

const TestSelection = () => {
    const { levelId } = useParams();
    const navigate = useNavigate();
    const tests = jlptTests.filter((t) => t.level === levelId);

    const openExamPopup = (testId) => {
        const popupWidth = 1400;
        const popupHeight = 900;
        const left = (window.screen.width - popupWidth) / 2;
        const top = (window.screen.height - popupHeight) / 2;

        // Clear previous state for a fresh start
        localStorage.removeItem(`jlpt_exam_state_${testId}`);
        localStorage.removeItem(`jlpt_result_${testId}`);

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
                                            <FaTrophy className="text-yellow-500" /> Điểm:{' '}
                                            {levels.find((l) => l.id === test.level)?.passingScore || 0}
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

export default TestSelection;
