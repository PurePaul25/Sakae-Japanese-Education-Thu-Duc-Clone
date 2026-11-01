import React, { useMemo } from 'react';
import { hasHtmlTags, sanitizeJlptHtml } from '../../utils/jlptContentUtil';

/**
 * JlptContentRenderer — Component render nội dung câu hỏi và bài đọc JLPT an toàn.
 * - Tương thích 100% với dữ liệu plain text cũ.
 * - Sanitize nghiêm ngặt nếu nội dung có chứa HTML (chống XSS).
 * - Hiển thị đẹp mắt đoạn gạch chân, font chữ tiếng Nhật và chỗ trống (Blank).
 */
const JlptContentRenderer = ({
    content,
    className = '',
    as = 'div',
}) => {
    const Component = as;

    const isHtml = useMemo(() => hasHtmlTags(content), [content]);

    const sanitizedHtml = useMemo(() => {
        if (!isHtml || !content) return '';
        return sanitizeJlptHtml(content);
    }, [isHtml, content]);

    if (!content) return null;

    if (!isHtml) {
        return (
            <Component className={`whitespace-pre-wrap leading-relaxed select-text ${className}`}>
                {content}
            </Component>
        );
    }

    return (
        <Component
            className={`jlpt-content-rendered leading-relaxed select-text ${className}`}
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
    );
};

export default JlptContentRenderer;
