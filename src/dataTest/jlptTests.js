export const jlptTests = [
    {
        id: 'n5-t1',
        level: 'N5',
        title: 'Đề thi thử N5 - Đề số 1',
        totalDuration: 90,
        sections: [
            {
                id: 'n5-s1',
                name: 'Vocabulary',
                duration: 20,
                questions: [
                    {
                        id: 'n5-q1',
                        text: 'Dưới đây là cách đọc chữ Hán của từ "日本語". Hãy chọn đáp án đúng.',
                        options: ['にほんご', 'にぽんご', 'にほんこ', 'にほんき'],
                        correct: 0,
                        explanation: '"日本語" (Nhật Bản Ngữ) đọc là "にほんご" (Nihongo).',
                    },
                    {
                        id: 'n5-q2',
                        text: 'Chọn cách đọc đúng cho "先生":',
                        options: ['せんせい', 'ぜんぜい', 'せんぜい', 'ぜんせい'],
                        correct: 0,
                        explanation: '"先生" (Tiên sinh/Giáo viên) đọc là "せんせい" (Sensei).',
                    },
                    {
                        id: 'n5-q3',
                        text: 'Điền từ đúng: "わたしは ___ です。"',
                        options: ['がくせい', 'せんせい', 'いぬ', 'くるま'],
                        correct: 0,
                        explanation: 'Câu này mang nghĩa "Tôi là sinh viên". "がくせい" là sinh viên.',
                    },
                ],
            },
            {
                id: 'n5-s2',
                name: 'Reading',
                duration: 40,
                readings: [
                    {
                        id: 'n5-reading-1',
                        contentImage: 'https://via.placeholder.com/600x250?text=日本の文化と伝統',
                        passage:
                            'わたしの友達の田中さんは日本から来ました。田中さんは毎日、朝6時に起きて、ジョギングをしています。その後、朝ご飯を食べます。朝ご飯は和食です。米、味噌汁、野菜があります。田中さんは日本の伝統文化が好きです。',
                        passageTranslation:
                            'Bạn của tôi là anh Tanaka, anh ấy đến từ Nhật Bản. Anh Tanaka thức dậy lúc 6 giờ sáng hàng ngày, chạy bộ. Sau đó, anh ấy ăn sáng. Bữa sáng là ăn truyền thống Nhật Bản. Có gạo, miso soup, rau. Anh Tanaka thích văn hóa truyền thống của Nhật Bản.',
                        questions: [
                            {
                                id: 'n5-q4-1',
                                text: '田中さんは何時に起きますか？',
                                questionTranslation: 'Anh Tanaka thức dậy lúc mấy giờ?',
                                options: ['5時', '6時', '7時', '8時'],
                                correct: 1,
                                explanation: '文中では「朝6時に起きて」と書かれています。',
                            },
                            {
                                id: 'n5-q4-2',
                                text: '朝ご飯は何ですか？',
                                questionTranslation: 'Bữa sáng là gì?',
                                options: ['洋食', '和食', '中華料理', 'インド料理'],
                                correct: 1,
                                explanation: '文中では「朝ご飯は和食です」と書かれています。',
                            },
                        ],
                    },
                    {
                        id: 'n5-reading-2',
                        contentImage: 'https://via.placeholder.com/600x250?text=学生の生活',
                        passage:
                            'わたしは大学生です。毎日、8時30分に大学に行きます。大学では、数学と日本語を勉強します。午前中に4つのクラスがあります。12時から13時はお昼ご飯の時間です。食堂でお友達と一緒に食べます。午後は図書館で2時間、勉強します。5時に大学を出ます。帰りに、コンビニでアイスクリームを買います。',
                        passageTranslation:
                            'Tôi là sinh viên đại học. Hàng ngày, tôi đi đại học lúc 8 giờ 30 phút. Tại đại học, tôi học toán và tiếng Nhật. Buổi sáng có 4 lớp học. Từ 12 giờ đến 13 giờ là giờ ăn trưa. Tôi ăn cùng bạn ở nhà ăn. Chiều tôi học ở thư viện 2 tiếng. Tôi rời đại học lúc 5 giờ. Trên đường về, tôi mua kem ở cửa hàng tiện lợi.',
                        questions: [
                            {
                                id: 'n5-q5-1',
                                text: 'あなたは何時に大学に行きますか？',
                                questionTranslation: 'Bạn đi đại học lúc mấy giờ?',
                                options: ['7時30分', '8時', '8時30分', '9時'],
                                correct: 2,
                                explanation: '文中では「毎日、8時30分に大学に行きます」と書かれています。',
                            },
                        ],
                    },
                ],
                questions: [],
            },
            {
                id: 'n5-s3',
                name: 'Listening',
                duration: 30,
                listenings: [
                    {
                        id: 'n5-listening-1',
                        audio: {
                            src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                            duration: 45,
                            startTime: 0,
                            endTime: 45,
                        },
                        questions: [
                            {
                                id: 'n5-q6-1',
                                text: '[Nghe] Người phụ nữ nói cô ấy thích trái kế nào?',
                                options: ['Ringo (Táo)', 'Mikan (Quýt)', 'Banana (Chuối)', 'Budo (Nho)'],
                                correct: 1,
                                explanation: 'Trong hội thoại, nhân vật đã nhắc đến "Mikan ga suki desu".',
                            },
                        ],
                    },
                ],
                questions: [],
            },
        ],
    },
    {
        id: 'n4-t1',
        level: 'N4',
        title: 'Đề thi thử N4 - Đề số 1',
        totalDuration: 115,
        sections: [
            {
                id: 'n4-s1',
                name: 'Từ vựng',
                duration: 25,
                questions: [
                    {
                        id: 'n4-q1',
                        text: 'Cách đọc của "家族" là gì?',
                        options: ['かぞく', 'かそく', 'がぞく', 'がそく'],
                        correct: 0,
                        explanation: '"家族" (Gia đình) đọc là "かぞく" (Kazoku).',
                    },
                ],
            },
            {
                id: 'n4-s2',
                name: 'Ngữ pháp & Đọc hiểu',
                duration: 55,
                questions: [
                    {
                        id: 'n4-q2',
                        text: 'Cấu trúc "〜すぎる" dùng khi nào?',
                        options: ['Làm gì đó quá mức', 'Định làm gì đó', 'Vừa mới làm xong', 'Sắp làm'],
                        correct: 0,
                        explanation: '"V-stem + すぎる" nghĩa là làm gì đó quá đà/quá mức.',
                    },
                ],
            },
            {
                id: 'n4-s3',
                name: 'Nghe hiểu',
                duration: 35,
                questions: [
                    {
                        id: 'n4-q3',
                        text: 'Nhân vật đi đâu?',
                        options: ['Siêu thị', 'Trường học', 'Bệnh viện', 'Công viên'],
                        correct: 2,
                        explanation: 'Hội thoại nhắc đến "Byouin e ikimasu".',
                    },
                ],
            },
        ],
    },
    {
        id: 'n3-t1',
        level: 'N3',
        title: 'Đề thi thử N3 - Đề số 1',
        totalDuration: 140,
        sections: [
            {
                id: 'n3-s1',
                name: 'Từ vựng',
                duration: 30,
                questions: [
                    {
                        id: 'n3-q1',
                        text: 'Từ nào đồng nghĩa với "たぶん"?',
                        options: ['おそらく', 'ぜったい', 'かならず', 'もちろん'],
                        correct: 0,
                        explanation: '"たぶん" (Tabun) và "おそらく" (Osoraku) đều có nghĩa là "có lẽ/có thể".',
                    },
                ],
            },
            {
                id: 'n3-s2',
                name: 'Ngữ pháp & Đọc hiểu',
                duration: 70,
                questions: [],
            },
            {
                id: 'n3-s3',
                name: 'Nghe hiểu',
                duration: 40,
                questions: [],
            },
        ],
    },
];
