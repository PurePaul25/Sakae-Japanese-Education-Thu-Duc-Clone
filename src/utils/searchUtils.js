const normalizeText = (text = '') => {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
};

const classesData = [
    {
        id: 1,
        name: 'Lớp tiếng Nhật sơ cấp (N5)',
        level: 'N5',
        type: 'Cấp tốc',
        image: 'https://bizweb.dktcdn.net/thumb/grande/100/059/929/products/z4597684243362-15d5a906850cb4f06c5cdfbac8ed5003-compressed.jpg?v=1691981651677',
        desc: 'Dành cho người mới bắt đầu học tiếng Nhật. Học viên được làm quen với bảng chữ cái, ngữ pháp và mẫu câu cơ bản.',
        schedule: 'Tối Thứ 2 - 4 - 6 | 18:00 - 21:00',
    },
    {
        id: 2,
        name: 'Lớp tiếng Nhật N4',
        level: 'N4',
        type: 'Siêu tốc',
        image: 'https://bizweb.dktcdn.net/thumb/grande/100/059/929/products/330597059-254731006984670-4954584067931549400-n-compressed.jpg?v=1683690172157',
        desc: 'Nâng cao kiến thức từ N5, tập trung vào các mẫu ngữ pháp phức tạp hơn và luyện đọc hiểu sơ cấp.',
        schedule: 'Chiều Thứ 2 - 3 - 4 - 5 - 6 | 13:30 - 16:30',
    },
    {
        id: 3,
        name: 'Lớp luyện thi JLPT N3',
        level: 'N3',
        type: 'Cấp tốc',
        image: 'https://bizweb.dktcdn.net/thumb/grande/100/059/929/products/brown-and-yellow-modern-family-collage-photo-collage-4-3-template-compressed.jpg?v=1723878715377',
        desc: 'Tập trung củng cố ngữ pháp, luyện nghe - đọc, giúp học viên tự tin giao tiếp và thi JLPT N3.',
        schedule: 'Tối Thứ 3 - 5 - 7 | 18:00 - 21:00',
    },
    {
        id: 4,
        name: 'Lớp luyện thi JLPT N2',
        level: 'N2',
        type: 'Cấp tốc',
        image: 'https://bizweb.dktcdn.net/thumb/grande/100/059/929/products/476160146-509377935515824-4799331393901144878-n.jpg?v=1750060533540',
        desc: 'Khóa học chuyên sâu ôn thi JLPT N2, bao gồm chiến lược làm bài, luyện đề và cải thiện kỹ năng đọc - nghe nâng cao.',
        schedule: 'Tối Thứ 2 - 4 - 6 | 18:00 - 21:00',
    },
    {
        id: 5,
        name: 'Lớp N5 Cấp tốc',
        level: 'N5',
        type: 'Siêu tốc',
        image: 'https://bizweb.dktcdn.net/thumb/grande/100/059/929/products/n5246-t4-compressed.jpg?v=1681181600203',
        desc: 'Hoàn thành chương trình N5 trong thời gian ngắn, phù hợp cho người cần chứng chỉ gấp để du học hoặc làm việc.',
        schedule: 'Tối Thứ 2 - 3 - 4 - 5 - 6 | 18:00 - 21:00',
    },
];

export const searchCourses = (query) => {
    if (!query || query.trim() === '') {
        return [];
    }

    const normalizedQuery = normalizeText(query);
    return classesData.filter((course) => {
        const nameMatch = normalizeText(course.name).includes(normalizedQuery);
        const descMatch = normalizeText(course.desc).includes(normalizedQuery);
        const levelMatch = normalizeText(course.level).includes(normalizedQuery);
        return nameMatch || descMatch || levelMatch;
    });
};

export const searchContent = (query) => {
    const courses = searchCourses(query);
    return {
        news: [],
        courses,
        hasResults: courses.length > 0,
    };
};
