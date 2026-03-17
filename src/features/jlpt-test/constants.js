// Shared Constants and Utilities for JLPT Mock Test

export const levels = [
    {
        id: 'N1',
        name: 'JLPT N1',
        desc: 'Cao cấp nhất',
        duration: '170 phút',
        passingScore: 100,
        maxScore: 180,
        accent: 'border-purple-500',
    },
    {
        id: 'N2',
        name: 'JLPT N2',
        desc: 'Cao cấp',
        duration: '155 phút',
        passingScore: 90,
        maxScore: 180,
        accent: 'border-blue-600',
    },
    {
        id: 'N3',
        name: 'JLPT N3',
        desc: 'Trung cấp',
        duration: '140 phút',
        passingScore: 95,
        maxScore: 180,
        accent: 'border-green-500',
    },
    {
        id: 'N4',
        name: 'JLPT N4',
        desc: 'Sơ cấp',
        duration: '125 phút',
        passingScore: 90,
        maxScore: 180,
        accent: 'border-orange-500',
    },
    {
        id: 'N5',
        name: 'JLPT N5',
        desc: 'Cơ bản',
        duration: '105 phút',
        passingScore: 80,
        maxScore: 180,
        accent: 'border-red-600',
    },
];

export const formatTime = (seconds) => {
    const totalSeconds = Math.floor(seconds);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
};

export const getTranslatedSectionName = (name, index) => {
    const sectionNames = {
        Vocabulary: 'Từ vựng',
        Reading: 'Đọc hiểu',
        Listening: 'Nghe hiểu',
        'Từ vựng': 'Từ vựng',
        'Ngữ pháp & Đọc hiểu': 'Ngữ pháp & Đọc hiểu',
        'Nghe hiểu': 'Nghe hiểu',
    };
    const displayName = sectionNames[name] || name;
    return `Phần ${index + 1}: ${displayName}`;
};
