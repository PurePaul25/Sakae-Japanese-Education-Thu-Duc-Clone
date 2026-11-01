/**
 * JLPT Content Utilities
 * Xử lý khoảng trắng, sanitize HTML và phát hiện định dạng an toàn cho đề thi JLPT
 */

// Danh sách font an toàn hỗ trợ tiếng Nhật
export const JLPT_FONTS = [
    { label: 'Mặc định (Sans-serif)', value: '' },
    { label: 'Noto Sans JP', value: "'Noto Sans JP', sans-serif" },
    { label: 'Meiryo (メイリオ)', value: "'Meiryo', 'メイリオ', sans-serif" },
    { label: 'MS Mincho (明朝体)', value: "'MS Mincho', 'ＭＳ 明朝', serif" },
    { label: 'Yu Gothic (游ゴシック)', value: "'Yu Gothic', '游ゴシック', sans-serif" },
    { label: 'Serif (Có chân)', value: 'serif' },
];

// Danh sách cỡ chữ hỗ trợ
export const JLPT_FONT_SIZES = [
    { label: '12px (Nhỏ)', value: '12px' },
    { label: '14px (Vừa)', value: '14px' },
    { label: '16px (Chuẩn)', value: '16px' },
    { label: '18px (Lớn)', value: '18px' },
    { label: '20px (Rất lớn)', value: '20px' },
    { label: '24px (Tiêu đề)', value: '24px' },
];

// Kiểm tra xem chuỗi có chứa HTML tags không
export function hasHtmlTags(str) {
    if (!str || typeof str !== 'string') return false;
    return /<\/?[a-z][\s\S]*>/i.test(str) || /&lt;\/?(?:b|strong|u|i|em|br|p|div|span|ul|ol|li)\b[^&]*?&gt;/i.test(str);
}

// Chuẩn hóa khoảng trắng: loại bỏ khoảng trắng thừa ở đầu và cuối mà không làm hỏng HTML hoặc khoảng trắng giữa câu
export function normalizeJlptWhitespace(content) {
    if (!content || typeof content !== 'string') return '';

    // Nếu không chứa HTML: trim chuẩn thông thường
    if (!hasHtmlTags(content)) {
        return content.trim();
    }

    if (typeof DOMParser === 'undefined') return content;

    const doc = new DOMParser().parseFromString(content, 'text/html');
    const root = doc.body;
    const isBlankMarker = (node) =>
        node.nodeType === Node.ELEMENT_NODE && node.getAttribute('data-blank') === 'true';
    const hasContent = (node) =>
        Boolean(node.textContent.trim()) ||
        (node.nodeType === Node.ELEMENT_NODE &&
            (isBlankMarker(node) || Boolean(node.querySelector('[data-blank="true"]'))));

    const trimBoundary = (parent, fromStart) => {
        while (parent.firstChild) {
            const node = fromStart ? parent.firstChild : parent.lastChild;
            if (node.nodeType === Node.TEXT_NODE) {
                node.textContent = fromStart
                    ? node.textContent.replace(/^\s+/, '')
                    : node.textContent.replace(/\s+$/, '');
                if (!node.textContent) {
                    node.remove();
                    continue;
                }
                break;
            }

            if (node.nodeType !== Node.ELEMENT_NODE) {
                node.remove();
                continue;
            }
            if (isBlankMarker(node)) break;
            if (node.tagName === 'BR') {
                node.remove();
                continue;
            }

            trimBoundary(node, fromStart);
            if (!hasContent(node)) {
                node.remove();
                continue;
            }
            break;
        }
    };

    trimBoundary(root, true);
    trimBoundary(root, false);

    if (!hasContent(root)) {
        return '';
    }

    return root.innerHTML;
}

// Danh sách thẻ an toàn được phép lưu và render
const ALLOWED_TAGS = new Set(['U', 'SPAN', 'B', 'STRONG', 'I', 'EM', 'P', 'BR', 'DIV', 'UL', 'OL', 'LI']);

// Danh sách CSS properties an toàn
const ALLOWED_STYLE_PROPS = [
    'font-size',
    'font-family',
    'text-decoration',
    'text-decoration-line',
    'font-weight',
    'font-style',
];

function convertWordLists(doc) {
    const stack = [];
    const paragraphs = Array.from(doc.body.querySelectorAll('p')).filter((paragraph) => {
        const style = paragraph.getAttribute('style') || '';
        const className = paragraph.getAttribute('class') || '';
        return /mso-list\s*:/i.test(style) || /\bMsoListParagraph/i.test(className);
    });

    paragraphs.forEach((paragraph) => {
        const style = paragraph.getAttribute('style') || '';
        const levelMatch = style.match(/mso-list\s*:\s*[^;]*?\blevel(\d+)\b/i);
        const requestedLevel = Math.min(Number(levelMatch?.[1] || 1), 8);
        const marker = paragraph.querySelector('span[style*="mso-list:Ignore" i]');
        const markerText = marker?.textContent.trim() || '';
        const isOrdered = /^\d+[.)]$/.test(markerText);
        const listTag = isOrdered ? 'ol' : 'ul';
        marker?.remove();

        if (markerText) {
            const firstText = paragraph.firstChild;
            if (firstText?.nodeType === Node.TEXT_NODE) {
                firstText.textContent = firstText.textContent.replace(/^\s*/, '');
            }
        }

        let level = Math.min(requestedLevel, stack.length + 1);
        for (let index = level; index < stack.length; index += 1) stack[index] = null;
        let parent = level === 1 ? paragraph.parentNode : stack[level - 2]?.lastItem;
        if (!parent) {
            stack.length = 0;
            level = 1;
            parent = paragraph.parentNode;
        }
        if (!parent) return;

        let current = stack[level - 1];
        const isAdjacentTopLevelList =
            level !== 1 || current?.list.nextElementSibling === paragraph;
        if (
            !current ||
            current.tag !== listTag ||
            current.list.parentNode !== parent ||
            !isAdjacentTopLevelList
        ) {
            const list = doc.createElement(listTag);
            if (level === 1) parent.insertBefore(list, paragraph);
            else parent.appendChild(list);
            current = { tag: listTag, list, lastItem: null };
            stack[level - 1] = current;
        }

        const item = doc.createElement('li');
        while (paragraph.firstChild) item.appendChild(paragraph.firstChild);
        current.list.appendChild(item);
        current.lastItem = item;
        stack.length = level;
        paragraph.remove();
    });
}

function normalizeListStructure(root, doc) {
    root.querySelectorAll('ul, ol').forEach((list) => {
        const paragraph = list.parentElement?.tagName === 'P' ? list.parentElement : null;
        if (paragraph) paragraph.after(list);
    });

    root.querySelectorAll('ul, ol').forEach((list) => {
        Array.from(list.childNodes).forEach((child) => {
            if (child.nodeType === Node.TEXT_NODE && !child.textContent.trim()) {
                child.remove();
                return;
            }
            if (child.nodeType === Node.ELEMENT_NODE && child.tagName === 'LI') return;

            const item = doc.createElement('li');
            list.insertBefore(item, child);
            item.appendChild(child);
        });
    });

    Array.from(root.querySelectorAll('li')).forEach((item) => {
        if (item.parentElement?.tagName === 'UL' || item.parentElement?.tagName === 'OL') return;
        const list = doc.createElement('ul');
        const wrapper = item.parentElement?.closest('p, span, b, strong, u, i, em');
        if (wrapper) wrapper.after(list);
        else item.parentNode?.insertBefore(list, item);
        list.appendChild(item);
    });
}

/**
 * Sanitize HTML nghiêm ngặt:
 * - Chỉ cho phép các thẻ định dạng văn bản và danh sách đề thi JLPT
 * - Chỉ cho phép thuộc tính an toàn: class="jlpt-blank", data-blank="true", style (font-size, font-family, ...)
 * - Loại bỏ hoàn toàn script, iframe, onload, onerror, javascript: links
 */
export function sanitizeJlptHtml(html) {
    if (!html || typeof html !== 'string') return '';
    const normalizedHtml = html.replace(
        /&lt;(\/?)(b|strong|u|i|em|br|p|div|span|ul|ol|li)(\s*\/?)&gt;/gi,
        '<$1$2$3>',
    );
    if (typeof window === 'undefined') {
        return normalizedHtml.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(normalizedHtml, 'text/html');
        convertWordLists(doc);

        function cleanNode(node) {
            // Duyệt từ dưới lên để an toàn khi remove child
            const children = Array.from(node.childNodes);
            for (const child of children) {
                if (child.nodeType === Node.ELEMENT_NODE) {
                    const tagName = child.tagName.toUpperCase();

                    // Nếu thẻ không nằm trong whitelist -> thay bằng text hoặc xóa nếu là script/style
                    if (!ALLOWED_TAGS.has(tagName)) {
                        if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'NOSCRIPT', 'SVG'].includes(tagName)) {
                            node.removeChild(child);
                            continue;
                        } else {
                            cleanNode(child);
                            const fragment = doc.createDocumentFragment();
                            while (child.firstChild) {
                                fragment.appendChild(child.firstChild);
                            }
                            node.replaceChild(fragment, child);
                            continue;
                        }
                    }

                    // Lọc thuộc tính (Attributes whitelist)
                    const attributes = Array.from(child.attributes);
                    for (const attr of attributes) {
                        const attrName = attr.name.toLowerCase();

                        // Loại bỏ tất cả event handlers (on*)
                        if (attrName.startsWith('on')) {
                            child.removeAttribute(attr.name);
                            continue;
                        }

                        if (attrName === 'class') {
                            // Chỉ cho phép class jlpt-blank
                            const classes = attr.value.split(/\s+/).filter((c) => c === 'jlpt-blank');
                            if (classes.length > 0) {
                                child.setAttribute('class', classes.join(' '));
                            } else {
                                child.removeAttribute('class');
                            }
                        } else if (attrName === 'data-blank') {
                            child.setAttribute('data-blank', 'true');
                        } else if (attrName === 'contenteditable') {
                            child.setAttribute('contenteditable', 'false');
                        } else if (attrName === 'style') {
                            // Lọc CSS styles an toàn
                            const safeStyles = [];
                            const styleText = child.getAttribute('style') || '';
                            const declarations = styleText.split(';');

                            for (const decl of declarations) {
                                const [prop, ...valParts] = decl.split(':');
                                if (!prop || valParts.length === 0) continue;
                                const cleanProp = prop.trim().toLowerCase();
                                const cleanVal = valParts.join(':').trim();

                                if (ALLOWED_STYLE_PROPS.includes(cleanProp)) {
                                    // Chặn expression() hoặc javascript:
                                    if (!/javascript|expression|url/i.test(cleanVal)) {
                                        safeStyles.push(`${cleanProp}: ${cleanVal}`);
                                    }
                                }
                            }

                            if (safeStyles.length > 0) {
                                child.setAttribute('style', safeStyles.join('; '));
                            } else {
                                child.removeAttribute('style');
                            }
                        } else {
                            // Thuộc tính không được phép -> xóa
                            child.removeAttribute(attr.name);
                        }
                    }

                    // Đệ quy dọn dẹp các node con
                    cleanNode(child);
                }
            }
        }

        cleanNode(doc.body);
        normalizeListStructure(doc.body, doc);
        return doc.body.innerHTML;
    } catch {
        return normalizedHtml.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
}
