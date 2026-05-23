export const REACTIONS = [
    { type: 'LIKE', emoji: '👍', label: 'Thích' },
    { type: 'LOVE', emoji: '❤️', label: 'Yêu thích' },
    { type: 'HAHA', emoji: '😂', label: 'Haha' },
    { type: 'WOW', emoji: '😮', label: 'Wow' },
    { type: 'SAD', emoji: '😢', label: 'Buồn' },
    { type: 'ANGRY', emoji: '😡', label: 'Phẫn nộ' },
];

export const getReactionEmoji = (type) => {
    if (!type) return '🤍';
    const reaction = REACTIONS.find((r) => r.type === type);
    return reaction ? reaction.emoji : '👍'; // Default liked
};

export const getReactionLabel = (type) => {
    if (!type) return 'Thích';
    const reaction = REACTIONS.find((r) => r.type === type);
    return reaction ? reaction.label : 'Thích';
};
