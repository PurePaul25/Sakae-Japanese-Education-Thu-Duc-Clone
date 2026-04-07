// Hàm tìm kiếm với filter fuzzy
const normalizeText = (text) => {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
};

export const searchContent = (query) => {
    if (!query || query.trim() === '') {
        return { news: [], courses: [], hasResults: false };
    }

    const normalizedQuery = normalizeText(query);
    const results = {
        news: [],
        courses: [],
        hasResults: false,
    };

    // Lấy dữ liệu từ News (mock data - nếu cần lấy từ API thì cập nhật)
    const newsData = [
        {
            id: 1,
            title: 'Hoạt động ngoại khóa tại Sakae',
            image: 'http://bizweb.dktcdn.net/100/059/929/themes/76022/assets/sbbn-collec-1.jpg?1747711551525',
            date: '18/07/2025',
            desc: 'Học viên Sakae đã có dịp trải nghiệm không khí lễ hội văn hóa Nhật Bản với nhiều hoạt động thú vị như mặc yukata và pha trà đạo.',
            category: 'Sự kiện',
        },
        {
            id: 2,
            title: 'Từ "gà mờ" đến thành thạo trợ từ tiếng Nhật, tham khảo bài viết dưới đây',
            image: 'http://bizweb.dktcdn.net/100/059/929/files/315712878-5624748057608095-2146620662772535775-n.png?v=1748232115899',
            date: '26/5/2025',
            desc: 'Bí quyết nắm vững các trợ từ quan trọng ($wa, ga, o, ni,...) trong tiếng Nhật giúp bạn giao tiếp và viết lách trôi chảy hơn ngay từ level N5.',
            category: 'Kiến thức',
        },
        {
            id: 3,
            title: 'TỪ VỰNG BẢNG LƯƠNG CẦN BIẾT CHO CÁC BẠN SẮP SANG NHẬT',
            image: 'http://bizweb.dktcdn.net/100/059/929/articles/493942609-1010388567893707-7651434882821413917-n.jpg?v=1745908085917',
            date: '29/04/2025',
            desc: 'Tổng hợp các từ vựng chuyên ngành liên quan đến bảng lương, thu nhập tại Nhật Bản, giúp bạn dễ dàng hòa nhập và hiểu rõ quyền lợi của mình.',
            category: 'Du học & Việc làm',
        },
        {
            id: 4,
            title: 'Lịch khai giảng các lớp N5, N4, N3 tháng 8/2025',
            image: 'https://bizweb.dktcdn.net/100/059/929/products/n5246-t4-compressed.jpg?v=1681181600203',
            date: '01/08/2025',
            desc: 'Thông báo lịch khai giảng chi tiết các khóa học tiếng Nhật mọi cấp độ trong tháng 8. Đăng ký sớm để nhận ưu đãi học phí hấp dẫn!',
            category: 'Thông báo',
        },
        {
            id: 5,
            title: 'Kinh nghiệm "săn" học bổng du học Nhật Bản thành công',
            image: 'https://bizweb.dktcdn.net/100/059/929/products/8011face-compressed.jpg?v=1594181526853',
            date: '15/07/2025',
            desc: 'Chia sẻ từ cựu học viên Sakae về hành trình chuẩn bị hồ sơ, phỏng vấn và chinh phục thành công học bổng MEXT danh giá.',
            category: 'Du học & Việc làm',
        },
    ];

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

    // Tìm kiếm trong tin tức
    newsData.forEach((news) => {
        const titleMatch = normalizeText(news.title).includes(normalizedQuery);
        const descMatch = normalizeText(news.desc).includes(normalizedQuery);
        const categoryMatch = normalizeText(news.category).includes(normalizedQuery);

        if (titleMatch || descMatch || categoryMatch) {
            results.news.push({
                ...news,
                type: 'news',
            });
        }
    });

    // Tìm kiếm trong khóa học
    classesData.forEach((course) => {
        const nameMatch = normalizeText(course.name).includes(normalizedQuery);
        const descMatch = normalizeText(course.desc).includes(normalizedQuery);
        const levelMatch = normalizeText(course.level).includes(normalizedQuery);

        if (nameMatch || descMatch || levelMatch) {
            results.courses.push({
                ...course,
                type: 'course',
            });
        }
    });

    results.hasResults = results.news.length > 0 || results.courses.length > 0;

    return results;
};
