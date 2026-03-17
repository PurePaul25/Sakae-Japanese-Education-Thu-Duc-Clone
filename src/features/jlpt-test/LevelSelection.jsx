import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaInfoCircle } from 'react-icons/fa';
import { levels } from './constants';

const LevelSelection = () => {
    const navigate = useNavigate();
    return (
        <div className="pt-26 pb-14 bg-gray-50 min-h-screen">
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

export default LevelSelection;
