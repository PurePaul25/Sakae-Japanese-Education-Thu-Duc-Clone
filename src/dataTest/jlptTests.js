export const jlptTests = [
    {
        id: 'n5-t1',
        level: 'N5',
        title: 'Đề thi thử N5 - Đề số 1',
        totalDuration: 90,
        sections: [
            {
                id: 'n5-s1',
                name: 'Từ vựng (Gengo Chishiki)',
                duration: 25,
                questions: [
                    {
                        id: 'n5-q1',
                        text: 'Dưới đây là cách đọc chữ Hán của từ "日本語". Hãy chọn đáp án đúng.',
                        options: ['にほんご', 'にぽんご', 'にほんこ', 'にほんき'],
                        correct: 0,
                        explanation: '"日本語" (Nhật Bản Ngữ) đọc là "にほんご" (Nihongo).'
                    },
                    {
                        id: 'n5-q2',
                        text: 'Chọn cách đọc đúng cho "先生":',
                        options: ['せんせい', 'ぜんぜい', 'せんぜい', 'ぜんせい'],
                        correct: 0,
                        explanation: '"先生" (Tiên sinh/Giáo viên) đọc là "せんせい" (Sensei).'
                    },
                    {
                        id: 'n5-q3',
                        text: 'Điền từ đúng: "わたしは ___ です。"',
                        options: ['がくせい', 'せんせい', 'いぬ', 'くるま'],
                        correct: 0,
                        explanation: 'Câu này mang nghĩa "Tôi là sinh viên". "がくせい" là sinh viên.'
                    }
                ]
            },
            {
                id: 'n5-s2',
                name: 'Ngữ pháp & Đọc hiểu',
                duration: 40,
                questions: [
                    {
                        id: 'n5-q4',
                        text: 'Điền trợ từ: "たなかさん ___ にほんごをべんきょうします。"',
                        options: ['は', 'が', 'を', 'に'],
                        correct: 0,
                        explanation: 'Dùng trợ từ "は" để chỉ chủ ngữ của câu: "Anh Tanaka học tiếng Nhật".'
                    },
                    {
                        id: 'n5-q5',
                        text: 'Đọc đoạn văn sau: "わたしは まいに치 ろくじに おきます。" Câu này nghĩa là gì?',
                        options: ['Tôi thức dậy lúc 6h mỗi ngày', 'Tôi đi ngủ lúc 6h mỗi ngày', 'Tôi ăn cơm lúc 6h mỗi ngày', 'Tôi đi học lúc 6h mỗi ngày'],
                        correct: 0,
                        explanation: '"まいにち" (mỗi ngày), "ろくじ" (6 giờ), "おきます" (thức dậy).'
                    }
                ]
            },
            {
                id: 'n5-s3',
                name: 'Nghe hiểu',
                duration: 25,
                questions: [
                    {
                        id: 'n5-q6',
                        text: '[Nghe] Người phụ nữ nói cô ấy thích trái kế nào? (Giả lập câu hỏi nghe)',
                        options: ['Ringo (Táo)', 'Mikan (Quýt)', 'Banana (Chuối)', 'Budo (Nho)'],
                        correct: 1,
                        explanation: 'Trong hội thoại, nhân vật đã nhắc đến "Mikan ga suki desu".'
                    }
                ]
            }
        ]
    },
    {
        id: 'n4-t1',
        level: 'N4',
        title: 'Đề thi thử N4 - Đề số 1',
        totalDuration: 125,
        sections: [
            {
                id: 'n4-s1',
                name: 'Từ vựng',
                duration: 30,
                questions: [
                    {
                        id: 'n4-q1',
                        text: 'Cách đọc của "家族" là gì?',
                        options: ['かぞく', 'かそく', 'がぞく', 'がそく'],
                        correct: 0,
                        explanation: '"家族" (Gia đình) đọc là "かぞく" (Kazoku).'
                    }
                ]
            },
            {
                id: 'n4-s2',
                name: 'Ngữ pháp & Đọc hiểu',
                duration: 55,
                questions: [{ id: 'n4-q2', text: 'Cấu trúc "〜すぎる" dùng khi nào?', options: ['Làm gì đó quá mức', 'Định làm gì đó', 'Vừa mới làm xong', 'Sắp làm'], correct: 0, explanation: '"V-stem + すぎる" nghĩa là làm gì đó quá đà/quá mức.' }]
            },
            {
                id: 'n4-s3',
                name: 'Nghe hiểu',
                duration: 40,
                questions: [{ id: 'n4-q3', text: 'Nhân vật đi đâu?', options: ['Siêu thị', 'Trường học', 'Bệnh viện', 'Công viên'], correct: 2, explanation: 'Hội thoại nhắc đến "Byouin e ikimasu".' }]
            }
        ]
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
                questions: [{ id: 'n3-q1', text: 'Từ nào đồng nghĩa với "たぶん"?', options: ['おそらく', 'ぜったい', 'かならず', 'もちろん'], correct: 0, explanation: '"たぶん" (Tabun) và "おそらく" (Osoraku) đều có nghĩa là "có lẽ/có thể".' }]
            },
            {
                id: 'n3-s2',
                name: 'Ngữ pháp & Đọc hiểu',
                duration: 70,
                questions: []
            },
            {
                id: 'n3-s3',
                name: 'Nghe hiểu',
                duration: 40,
                questions: []
            }
        ]
    }
];
