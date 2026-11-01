import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
    Bold as BoldIcon,
    Underline as UnderlineIcon,
    RotateCcw,
    RotateCw,
    Minus,
    RemoveFormatting,
    Type,
    Eye,
    Edit3,
    List,
    ListOrdered,
} from 'lucide-react';
import {
    JLPT_FONTS,
    JLPT_FONT_SIZES,
    hasHtmlTags,
    sanitizeJlptHtml,
} from '../../utils/jlptContentUtil';
import JlptContentRenderer from './JlptContentRenderer';

const MIXED_VALUE = '__mixed__';
const HISTORY_LIMIT = 50;

function getSelectionBookmark(editor) {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return null;

    const range = selection.getRangeAt(0);
    if (!editor.contains(range.startContainer) || !editor.contains(range.endContainer)) return null;

    const getEndpoint = (container, offset) => {
        const prefix = document.createRange();
        prefix.selectNodeContents(editor);
        prefix.setEnd(container, offset);
        const text = prefix.toString();
        return {
            offset: text.length,
            markers: (text.match(/\uFEFF/g) || []).length,
        };
    };
    const start = getEndpoint(range.startContainer, range.startOffset);
    const end = getEndpoint(range.endContainer, range.endOffset);
    return {
        start: start.offset,
        end: end.offset,
        startMarkers: start.markers,
        endMarkers: end.markers,
        startContainer: range.startContainer,
        endContainer: range.endContainer,
        range: range.cloneRange(),
    };
}

function findTextPoint(editor, targetOffset) {
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    let remaining = targetOffset;
    let lastText = null;

    while (walker.nextNode()) {
        const node = walker.currentNode;
        lastText = node;
        if (remaining < node.textContent.length) return [node, remaining];
        remaining -= node.textContent.length;
    }

    if (lastText) return [lastText, lastText.textContent.length];
    return [editor, 0];
}

function restoreSelectionBookmark(editor, bookmark, preferTextOffsets = false, focusEditor = false) {
    if (!editor || !bookmark) return false;

    if (
        !preferTextOffsets &&
        bookmark.range &&
        editor.contains(bookmark.startContainer) &&
        editor.contains(bookmark.endContainer) &&
        editor.contains(bookmark.range.startContainer) &&
        editor.contains(bookmark.range.endContainer)
    ) {
        if (focusEditor) editor.focus();
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(bookmark.range);
        return true;
    }

    const start = findTextPoint(editor, bookmark.start);
    const end = findTextPoint(editor, bookmark.end);
    const range = document.createRange();
    range.setStart(start[0], start[1]);
    range.setEnd(end[0], end[1]);
    if (focusEditor) editor.focus();
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
}

function getSanitizedEditorHtml(editor) {
    const clone = editor.cloneNode(true);
    const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach((node) => {
        node.textContent = node.textContent.replace(/\uFEFF/g, '');
    });
    clone.querySelectorAll('span').forEach((span) => {
        if (!span.textContent && !span.querySelector('*') && !span.hasAttribute('data-blank')) {
            span.remove();
        }
    });
    if (!clone.querySelector('*')) return clone.textContent;
    return sanitizeJlptHtml(clone.innerHTML);
}

function getEditorValue(value) {
    return typeof value === 'string' && !hasHtmlTags(value) ? value : sanitizeJlptHtml(value || '');
}

function getPlainTextPasteHtml(text) {
    const container = document.createElement('div');
    let currentList = null;

    text.replace(/\r\n?/g, '\n')
        .split('\n')
        .forEach((line) => {
            if (!line.trim()) {
                currentList = null;
                return;
            }

            const listMatch = line.match(/^\s*(?:([-*+•‣▪◦])|(\d+)[.)])\s+(.+)$/);
            if (listMatch) {
                const tagName = listMatch[2] ? 'ol' : 'ul';
                if (!currentList || currentList.tagName.toLowerCase() !== tagName) {
                    currentList = document.createElement(tagName);
                    container.appendChild(currentList);
                }
                const item = document.createElement('li');
                item.textContent = listMatch[3];
                currentList.appendChild(item);
                return;
            }

            currentList = null;
            const paragraph = document.createElement('p');
            paragraph.textContent = line;
            container.appendChild(paragraph);
        });

    return container.innerHTML;
}

function limitHtmlText(html, maxLength) {
    const container = document.createElement('div');
    container.innerHTML = html;
    let remaining = maxLength;
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach((node) => {
        if (remaining <= 0) {
            node.textContent = '';
            return;
        }
        if (node.textContent.length > remaining) {
            node.textContent = node.textContent.slice(0, remaining);
            remaining = 0;
        } else {
            remaining -= node.textContent.length;
        }
    });

    return container.innerHTML;
}

function removePastedTypography(html) {
    const container = document.createElement('div');
    container.innerHTML = html;
    container.querySelectorAll('[style]').forEach((element) => {
        element.style.removeProperty('font-family');
        element.style.removeProperty('font-size');
        if (!element.getAttribute('style')) element.removeAttribute('style');
    });
    container.querySelectorAll('span').forEach((span) => {
        if (!span.attributes.length && !span.textContent && !span.querySelector('*')) span.remove();
    });
    return container.innerHTML;
}

function setEditorValue(editor, value) {
    if (hasHtmlTags(value)) editor.innerHTML = value;
    else editor.textContent = value;
}

function removeCommittedMarkers(editor) {
    const bookmark = getSelectionBookmark(editor);
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let changed = false;
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
        let markerIndex = node.textContent.indexOf('\uFEFF');
        while (markerIndex !== -1) {
            node.deleteData(markerIndex, 1);
            changed = true;
            markerIndex = node.textContent.indexOf('\uFEFF');
        }
    });
    editor.querySelectorAll('span').forEach((span) => {
        if (!span.textContent && !span.querySelector('*') && !span.hasAttribute('data-blank')) {
            span.remove();
            changed = true;
        }
    });
    if (changed && bookmark) {
        restoreSelectionBookmark(editor, {
            ...bookmark,
            start: bookmark.start - bookmark.startMarkers,
            end: bookmark.end - bookmark.endMarkers,
        });
    }
}

function canonicalCssValue(value) {
    return String(value).toLowerCase().replace(/["']/g, '').replace(/\s+/g, '').trim();
}

function getSelectionStyleValues(editor, property, ignoreBlankMarkers = false) {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return [];
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.startContainer) || !editor.contains(range.endContainer)) return [];

    const elements = new Set();
    if (range.collapsed) {
        const container = range.startContainer;
        const element =
            container.nodeType === Node.TEXT_NODE
                ? container.parentElement
                : container.childNodes[range.startOffset] ||
                  container.childNodes[range.startOffset - 1] ||
                  container;
        if (element && editor.contains(element)) elements.add(element);
    } else {
        const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
            const node = walker.currentNode;
            if (!node.textContent.trim()) continue;
            try {
                if (range.intersectsNode(node)) elements.add(node.parentElement);
            } catch {
                // Ignore detached text nodes while the browser is updating the selection.
            }
        }
    }

    return [...elements]
        .filter(Boolean)
        .filter((element) => !ignoreBlankMarkers || !element.closest('[data-blank="true"]'))
        .map((element) => window.getComputedStyle(element).getPropertyValue(property))
        .filter(Boolean);
}

function getSelectionBoldState(editor) {
    const values = getSelectionStyleValues(editor, 'font-weight', true);
    if (!values.length) return false;

    const boldValues = values.map((value) => Number.parseInt(value, 10) >= 600);
    if (boldValues.some(Boolean) && boldValues.some((isBold) => !isBold)) return 'mixed';
    return boldValues[0];
}

function getToolbarValue(editor, property, choices) {
    const values = getSelectionStyleValues(editor, property);
    if (!values.length) return choices[0]?.value ?? '';

    const uniqueValues = [...new Set(values.map(canonicalCssValue))];
    if (uniqueValues.length > 1) return MIXED_VALUE;

    const observed = uniqueValues[0];
    const matched = choices.find((choice) => {
        if (!choice.value) {
            return observed === canonicalCssValue(window.getComputedStyle(editor).getPropertyValue(property));
        }
        const probe = document.createElement('span');
        probe.style.setProperty(property, choice.value);
        document.body.appendChild(probe);
        const resolved = window.getComputedStyle(probe).getPropertyValue(property);
        probe.remove();
        return observed === canonicalCssValue(resolved);
    });

    return matched?.value ?? choices[0]?.value ?? '';
}

/**
 * JLPT rich-text editor. React draft state is the persisted value; the mounted
 * contentEditable DOM is the editing surface and is never recreated for preview.
 */
export default function JlptRichTextEditor({
    value = '',
    onChange,
    placeholder = 'Nhập nội dung câu hỏi (Ví dụ: 「昨日、学校へ行きました。」)...',
    minHeight = '140px',
    className = '',
    disabled = false,
    autoFocus = false,
    maxLength = null,
}) {
    const editorRef = useRef(null);
    const initializedRef = useRef(false);
    const isComposingRef = useRef(false);
    const draftRef = useRef(getEditorValue(value || ''));
    const lastEmittedRef = useRef(null);
    const selectionBookmarkRef = useRef(null);
    const historyRef = useRef([]);
    const historyIndexRef = useRef(-1);

    const [draftHtml, setDraftHtml] = useState(draftRef.current);
    const [activeFont, setActiveFont] = useState(JLPT_FONTS[0].value);
    const [activeSize, setActiveSize] = useState('16px');
    const [isBoldActive, setIsBoldActive] = useState(false);
    const [isBoldMixed, setIsBoldMixed] = useState(false);
    const [isUnderlineActive, setIsUnderlineActive] = useState(false);
    const [activeList, setActiveList] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    const updateHistoryState = useCallback(() => {
        setCanUndo(historyIndexRef.current > 0);
        setCanRedo(historyIndexRef.current >= 0 && historyIndexRef.current < historyRef.current.length - 1);
    }, []);

    const pushHistory = useCallback(
        (html) => {
            if (historyRef.current[historyIndexRef.current] === html) return;
            const next = historyRef.current.slice(0, historyIndexRef.current + 1);
            next.push(html);
            if (next.length > HISTORY_LIMIT) next.shift();
            historyRef.current = next;
            historyIndexRef.current = next.length - 1;
            updateHistoryState();
        },
        [updateHistoryState],
    );

    const emitEditorChange = useCallback(() => {
        const editor = editorRef.current;
        if (!editor) return;
        const html = getSanitizedEditorHtml(editor);
        if (!html && !editor.querySelector('[data-blank]') && !editor.textContent.includes('\uFEFF')) {
            editor.replaceChildren();
            const range = document.createRange();
            range.selectNodeContents(editor);
            range.collapse(false);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            selectionBookmarkRef.current = getSelectionBookmark(editor);
        }
        draftRef.current = html;
        setDraftHtml(html);
        lastEmittedRef.current = html;
        pushHistory(html);
        onChange?.(html);
    }, [onChange, pushHistory]);

    useLayoutEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        const incoming = getEditorValue(value || '');
        if (lastEmittedRef.current === incoming) {
            lastEmittedRef.current = null;
            initializedRef.current = true;
            return;
        }

        if (!initializedRef.current || incoming !== draftRef.current) {
            draftRef.current = incoming;
            setDraftHtml(incoming);
            setEditorValue(editor, incoming);
            historyRef.current = [incoming];
            historyIndexRef.current = 0;
            selectionBookmarkRef.current = null;
            updateHistoryState();
        }
        initializedRef.current = true;
    }, [value, updateHistoryState]);

    useEffect(() => {
        if (autoFocus) editorRef.current?.focus();
    }, [autoFocus]);

    const refreshSelectionState = useCallback(() => {
        const editor = editorRef.current;
        if (!editor) return;
        const selection = window.getSelection();
        const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
        if (
            !range ||
            document.activeElement !== editor ||
            !editor.contains(range.startContainer) ||
            !editor.contains(range.endContainer)
        ) {
            setIsBoldActive(false);
            setIsBoldMixed(false);
            setIsUnderlineActive(false);
            setActiveList(null);
            return;
        }

        selectionBookmarkRef.current = getSelectionBookmark(editor);
        setActiveFont(getToolbarValue(editor, 'font-family', JLPT_FONTS));
        setActiveSize(getToolbarValue(editor, 'font-size', JLPT_FONT_SIZES));
        const boldState = getSelectionBoldState(editor);
        setIsBoldActive(boldState === true);
        setIsBoldMixed(boldState === 'mixed');
        const parent =
            range.startContainer.nodeType === Node.ELEMENT_NODE
                ? range.startContainer
                : range.startContainer.parentElement;
        const textDecoration = parent ? window.getComputedStyle(parent).textDecorationLine : '';
        setIsUnderlineActive(Boolean(parent?.closest('u')) || textDecoration.split(/\s+/).includes('underline'));
        const list = parent?.closest('li')?.parentElement;
        setActiveList(list?.tagName === 'UL' ? 'unordered' : list?.tagName === 'OL' ? 'ordered' : null);
    }, []);

    useEffect(() => {
        const onSelectionChange = () => refreshSelectionState();
        document.addEventListener('selectionchange', onSelectionChange);
        return () => document.removeEventListener('selectionchange', onSelectionChange);
    }, [refreshSelectionState]);

    const saveSelection = () => {
        const bookmark = getSelectionBookmark(editorRef.current);
        if (bookmark) selectionBookmarkRef.current = bookmark;
    };

    const restoreSavedSelection = (focusEditor = false) =>
        restoreSelectionBookmark(editorRef.current, selectionBookmarkRef.current, false, focusEditor);

    const runCommand = (command) => {
        if (disabled || showPreview) return;
        const bookmark = selectionBookmarkRef.current;
        restoreSavedSelection(true);
        document.execCommand(command, false, null);
        if (bookmark && (command === 'insertUnorderedList' || command === 'insertOrderedList')) {
            restoreSelectionBookmark(editorRef.current, bookmark, true, true);
        }
        saveSelection();
        refreshSelectionState();
        emitEditorChange();
    };

    const handleInsertBlank = () => {
        if (disabled || showPreview || !restoreSavedSelection(true)) return;
        const selection = window.getSelection();
        if (!selection?.rangeCount) return;
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const blank = document.createElement('span');
        blank.className = 'jlpt-blank';
        blank.dataset.blank = 'true';
        blank.contentEditable = 'false';
        blank.textContent = '＿＿＿＿';
        const spacer = document.createTextNode(' ');
        range.insertNode(spacer);
        range.insertNode(blank);
        range.setStartAfter(spacer);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        saveSelection();
        emitEditorChange();
    };

    const applyInlineStyle = (property, styleValue) => {
        if (disabled || showPreview || !editorRef.current) return;
        const editor = editorRef.current;
        const restored = restoreSavedSelection(true);
        if (!restored) editor.focus();
        const selection = window.getSelection();
        const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
        if (!range) return;
        const appliedValue = styleValue || window.getComputedStyle(editor).getPropertyValue(property);

        if (range.collapsed) {
            const span = document.createElement('span');
            span.style.setProperty(property, appliedValue);
            const marker = document.createTextNode('\uFEFF');
            span.appendChild(marker);
            range.insertNode(span);
            range.setStart(marker, 1);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        } else {
            const span = document.createElement('span');
            const fragment = range.extractContents();
            fragment.querySelectorAll('*').forEach((element) => {
                element.style.removeProperty(property);
                if (!element.getAttribute('style')) element.removeAttribute('style');
            });
            span.style.setProperty(property, appliedValue);
            span.appendChild(fragment);
            range.insertNode(span);
            range.selectNodeContents(span);
            selection.removeAllRanges();
            selection.addRange(range);
        }

        saveSelection();
        refreshSelectionState();
        emitEditorChange();
    };

    const handleRemoveFormat = () => {
        if (disabled || showPreview || !restoreSavedSelection(true)) return;
        const selection = window.getSelection();
        if (!selection?.rangeCount || selection.getRangeAt(0).collapsed) return;
        document.execCommand('removeFormat', false, null);
        saveSelection();
        refreshSelectionState();
        emitEditorChange();
    };

    const handleUndo = () => {
        if (historyIndexRef.current <= 0 || !editorRef.current) return;
        const bookmark = selectionBookmarkRef.current ?? getSelectionBookmark(editorRef.current);
        historyIndexRef.current -= 1;
        const html = historyRef.current[historyIndexRef.current];
        setEditorValue(editorRef.current, html);
        draftRef.current = html;
        setDraftHtml(html);
        lastEmittedRef.current = html;
        onChange?.(html);
        restoreSelectionBookmark(editorRef.current, bookmark, true, true);
        refreshSelectionState();
        updateHistoryState();
    };

    const handleRedo = () => {
        if (historyIndexRef.current >= historyRef.current.length - 1 || !editorRef.current) return;
        const bookmark = selectionBookmarkRef.current ?? getSelectionBookmark(editorRef.current);
        historyIndexRef.current += 1;
        const html = historyRef.current[historyIndexRef.current];
        setEditorValue(editorRef.current, html);
        draftRef.current = html;
        setDraftHtml(html);
        lastEmittedRef.current = html;
        onChange?.(html);
        restoreSelectionBookmark(editorRef.current, bookmark, true, true);
        refreshSelectionState();
        updateHistoryState();
    };

    const handleKeyDown = (event) => {
        if (disabled || isComposingRef.current || event.isComposing) return;
        if (event.key === 'Tab') {
            const selection = window.getSelection();
            const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
            const node =
                range?.startContainer.nodeType === Node.ELEMENT_NODE
                    ? range.startContainer
                    : range?.startContainer.parentElement;
            const item = node?.closest('li');
            if (!item || !editorRef.current?.contains(item)) return;

            const list = item.parentElement;
            if (!['UL', 'OL'].includes(list?.tagName)) return;

            event.preventDefault();
            if (event.shiftKey) {
                const parentItem = list.parentElement;
                const parentList = parentItem?.parentElement;
                if (parentItem?.tagName !== 'LI' || !['UL', 'OL'].includes(parentList?.tagName)) return;

                parentItem.after(item);
                if (!list.children.length) list.remove();
            } else {
                const previousItem = item.previousElementSibling;
                if (previousItem?.tagName !== 'LI') return;

                let nestedList = Array.from(previousItem.children).find(
                    (child) => child.tagName === list.tagName,
                );
                if (!nestedList) {
                    nestedList = document.createElement(list.tagName.toLowerCase());
                    previousItem.appendChild(nestedList);
                }
                nestedList.appendChild(item);
                if (!list.children.length) list.remove();
            }
            removeCommittedMarkers(editorRef.current);
            saveSelection();
            refreshSelectionState();
            emitEditorChange();
            return;
        }

        const key = event.key.toLowerCase();
        if ((event.ctrlKey || event.metaKey) && !event.shiftKey && key === 'b') {
            event.preventDefault();
            runCommand('bold');
        } else if ((event.ctrlKey || event.metaKey) && !event.shiftKey && key === 'u') {
            event.preventDefault();
            runCommand('underline');
        } else if ((event.ctrlKey || event.metaKey) && !event.shiftKey && key === 'z') {
            event.preventDefault();
            handleUndo();
        } else if (
            ((event.ctrlKey || event.metaKey) && key === 'y') ||
            ((event.ctrlKey || event.metaKey) && event.shiftKey && key === 'z')
        ) {
            event.preventDefault();
            handleRedo();
        }
    };

    const handlePaste = (event) => {
        if (disabled) return;
        event.preventDefault();
        const clipboard = event.clipboardData;
        const text = clipboard.getData('text/plain');
        const sourceHtml = clipboard.getData('text/html');
        const selection = window.getSelection();
        if (!selection?.rangeCount) return;
        const range = selection.getRangeAt(0);

        let pasteHtml = sourceHtml ? removePastedTypography(sanitizeJlptHtml(sourceHtml)) : '';
        if (!pasteHtml) pasteHtml = getPlainTextPasteHtml(text);

        if (Number.isInteger(maxLength)) {
            const currentLength = editorRef.current.textContent.replace(/\uFEFF/g, '').length;
            const selectedLength = selection.toString().replace(/\uFEFF/g, '').length;
            const available = Math.max(0, maxLength - currentLength + selectedLength);
            pasteHtml = limitHtmlText(pasteHtml, available);
        }

        if (!pasteHtml) return;
        if (document.execCommand('insertHTML', false, pasteHtml)) {
            removeCommittedMarkers(editorRef.current);
            saveSelection();
            refreshSelectionState();
            emitEditorChange();
            return;
        }

        const pasteContainer = document.createElement('div');
        pasteContainer.innerHTML = pasteHtml;
        const fragment = document.createDocumentFragment();
        while (pasteContainer.firstChild) fragment.appendChild(pasteContainer.firstChild);
        range.deleteContents();
        const lastNode = fragment.lastChild;
        range.insertNode(fragment);
        if (lastNode) {
            range.setStartAfter(lastNode);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        removeCommittedMarkers(editorRef.current);
        saveSelection();
        emitEditorChange();
    };

    const handleBeforeInput = (event) => {
        if (!Number.isInteger(maxLength) || isComposingRef.current || event.isComposing) return;
        if (!event.inputType?.startsWith('insert')) return;
        const selection = window.getSelection();
        const currentLength = editorRef.current.textContent.replace(/\uFEFF/g, '').length;
        const selectedLength = selection?.toString().replace(/\uFEFF/g, '').length ?? 0;
        const available = Math.max(0, maxLength - currentLength + selectedLength);
        const insertedLength = event.data?.length ?? 1;
        if (available < insertedLength) event.preventDefault();
    };

    const togglePreview = () => {
        saveSelection();
        setShowPreview((previous) => !previous);
    };

    useLayoutEffect(() => {
        if (!showPreview && selectionBookmarkRef.current) {
            restoreSelectionBookmark(editorRef.current, selectionBookmarkRef.current, false, true);
        }
    }, [showPreview]);

    return (
        <div
            className={`border rounded-xl overflow-hidden transition-colors bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ${
                disabled
                    ? 'opacity-70 cursor-not-allowed'
                    : 'focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20'
            } ${className}`}
        >
            <div className="flex flex-wrap items-center justify-between gap-1.5 px-3 py-2 border-b bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs select-none">
                <div className="flex flex-wrap items-center gap-1">
                    <div className="flex items-center gap-0.5 pr-1.5 border-r border-slate-200 dark:border-slate-700">
                        <button
                            type="button"
                            disabled={disabled || !canUndo}
                            onMouseDown={saveSelection}
                            onClick={handleUndo}
                            title="Hoàn tác (Ctrl+Z)"
                            className="p-1.5 rounded-lg hover:bg-slate-200 cursor-pointer dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            disabled={disabled || !canRedo}
                            onMouseDown={saveSelection}
                            onClick={handleRedo}
                            title="Làm lại (Ctrl+Y)"
                            className="p-1.5 rounded-lg hover:bg-slate-200 cursor-pointer dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                            <RotateCw className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <button
                        type="button"
                        disabled={disabled || showPreview}
                        aria-pressed={isBoldMixed ? 'mixed' : isBoldActive}
                        onMouseDown={(event) => {
                            event.preventDefault();
                            saveSelection();
                        }}
                        onClick={() => runCommand('bold')}
                        title={isBoldMixed ? 'In đậm (vùng chọn hỗn hợp)' : 'In đậm (Ctrl+B)'}
                        className={`flex items-center gap-1 px-2 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                            isBoldActive
                                ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 font-bold border border-red-200 dark:border-red-900/50'
                                : isBoldMixed
                                  ? 'bg-red-50/60 text-red-600 dark:bg-red-950/30 dark:text-red-400 border border-dashed border-red-200 dark:border-red-900/50'
                                  : 'hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                    >
                        <BoldIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        disabled={disabled || showPreview}
                        onMouseDown={(event) => {
                            event.preventDefault();
                            saveSelection();
                        }}
                        onClick={() => runCommand('underline')}
                        title="Gạch chân (Ctrl+U)"
                        className={`flex items-center gap-1 px-2 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${isUnderlineActive ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 font-bold border border-red-200 dark:border-red-900/50' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                    >
                        <UnderlineIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        disabled={disabled || showPreview}
                        aria-label="Danh sách dấu đầu dòng"
                        aria-pressed={activeList === 'unordered'}
                        onMouseDown={(event) => {
                            event.preventDefault();
                            saveSelection();
                        }}
                        onClick={() => runCommand('insertUnorderedList')}
                        title="Danh sách dấu đầu dòng"
                        className={`flex items-center gap-1 px-2 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                            activeList === 'unordered'
                                ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900/50'
                                : 'hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                    >
                        <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        disabled={disabled || showPreview}
                        aria-label="Danh sách đánh số"
                        aria-pressed={activeList === 'ordered'}
                        onMouseDown={(event) => {
                            event.preventDefault();
                            saveSelection();
                        }}
                        onClick={() => runCommand('insertOrderedList')}
                        title="Danh sách đánh số"
                        className={`flex items-center gap-1 px-2 py-1.5 rounded-lg font-medium transition-colors ${
                            activeList === 'ordered'
                                ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900/50'
                                : 'hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer'
                        }`}
                    >
                        <ListOrdered className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        disabled={disabled || showPreview}
                        onMouseDown={(event) => {
                            event.preventDefault();
                            saveSelection();
                        }}
                        onClick={handleInsertBlank}
                        title="Chèn chỗ trống điền khuyết"
                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer font-medium hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 border border-dashed border-slate-300 dark:border-slate-700"
                    >
                        <Minus className="w-3.5 h-3.5" />
                        <span>Chèn chỗ trống</span>
                    </button>

                    <div className="flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-slate-700">
                        <Type className="w-3.5 h-3.5 text-slate-400 hidden sm:inline-block" />
                        <select
                            disabled={disabled || showPreview}
                            value={activeFont}
                            onMouseDown={saveSelection}
                            onChange={(event) => {
                                restoreSavedSelection();
                                applyInlineStyle('font-family', event.target.value);
                            }}
                            className="bg-transparent border cursor-pointer border-slate-200 dark:border-slate-700 rounded-md px-1.5 py-0.5 text-[13px] text-slate-700 dark:text-slate-200 focus:outline-none focus:border-red-500"
                            title="Chọn Font tiếng Nhật an toàn"
                        >
                            {activeFont === MIXED_VALUE && <option value={MIXED_VALUE}>Khác nhau</option>}
                            {JLPT_FONTS.map((font) => (
                                <option key={font.value} value={font.value} className="dark:bg-slate-900">
                                    {font.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <select
                        disabled={disabled || showPreview}
                        value={activeSize}
                        onMouseDown={saveSelection}
                        onChange={(event) => {
                            restoreSavedSelection();
                            applyInlineStyle('font-size', event.target.value);
                        }}
                        className="bg-transparent border cursor-pointer border-slate-200 dark:border-slate-700 rounded-md px-1.5 py-0.5 text-[13px] text-slate-700 dark:text-slate-200 focus:outline-none focus:border-red-500"
                        title="Chọn cỡ chữ"
                    >
                        {activeSize === MIXED_VALUE && <option value={MIXED_VALUE}>Khác nhau</option>}
                        {JLPT_FONT_SIZES.map((size) => (
                            <option key={size.value} value={size.value} className="dark:bg-slate-900">
                                {size.label}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        disabled={disabled || showPreview}
                        onMouseDown={(event) => {
                            event.preventDefault();
                            saveSelection();
                        }}
                        onClick={handleRemoveFormat}
                        title="Xóa định dạng vùng chọn"
                        className="p-1.5 rounded-lg hover:bg-slate-200 cursor-pointer dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                    >
                        <RemoveFormatting className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                </div>

                <button
                    type="button"
                    onMouseDown={saveSelection}
                    onClick={togglePreview}
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${showPreview ? 'bg-red-600 text-white shadow-xs' : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                    title={showPreview ? 'Quay lại soạn thảo' : 'Xem trước như đề thi thật'}
                >
                    {showPreview ? (
                        <>
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Soạn thảo</span>
                        </>
                    ) : (
                        <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem trước</span>
                        </>
                    )}
                </button>
            </div>

            <div className={showPreview ? 'hidden' : 'relative'}>
                <div
                    ref={editorRef}
                    contentEditable={!disabled}
                    suppressContentEditableWarning
                    style={{ minHeight }}
                    onInput={() => {
                        if (!isComposingRef.current) {
                            removeCommittedMarkers(editorRef.current);
                            saveSelection();
                            refreshSelectionState();
                            emitEditorChange();
                        }
                    }}
                    onBeforeInput={handleBeforeInput}
                    onKeyDown={handleKeyDown}
                    onKeyUp={refreshSelectionState}
                    onMouseUp={refreshSelectionState}
                    onBlur={() => {
                        saveSelection();
                        emitEditorChange();
                    }}
                    onPaste={handlePaste}
                    onCompositionStart={() => {
                        isComposingRef.current = true;
                    }}
                    onCompositionEnd={() => {
                        isComposingRef.current = false;
                        removeCommittedMarkers(editorRef.current);
                        saveSelection();
                        refreshSelectionState();
                        emitEditorChange();
                    }}
                    data-placeholder={placeholder}
                    className="jlpt-editor-content p-3 outline-none text-slate-900 dark:text-slate-100 text-base font-normal leading-relaxed whitespace-pre-wrap focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 dark:empty:before:text-slate-500 empty:before:pointer-events-none"
                />
            </div>
            {showPreview && (
                <div
                    style={{ minHeight }}
                    className="p-4 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 text-base"
                >
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Xem trước giao diện đề thi
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                        <JlptContentRenderer content={draftHtml} />
                    </div>
                </div>
            )}
            <div className="px-3 py-1.5 bg-slate-50/60 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-400 dark:text-slate-500 flex items-center justify-between">
                <span>Bôi đen chữ rồi nhấn Gạch chân (Ctrl+U) · Đặt con trỏ để Chèn chỗ trống</span>
                <span>Hỗ trợ Hiragana, Katakana, Kanji</span>
            </div>
        </div>
    );
}
