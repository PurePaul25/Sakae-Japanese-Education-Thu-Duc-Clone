import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

const DropdownSelect = ({
    name,
    value,
    onChange,
    options,
    placeholder,
    icon,
    disabled = false,
    required = false,
    labelClassName = '',
    buttonClassName = '',
    containerClassName = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [popupStyles, setPopupStyles] = useState({});
    const containerRef = useRef(null);
    const popupRef = useRef(null);
    const portalContainerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target) &&
                !popupRef.current?.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const portalNode = document.createElement('div');
        portalContainerRef.current = portalNode;
        document.body.appendChild(portalNode);

        return () => {
            if (portalContainerRef.current && document.body.contains(portalContainerRef.current)) {
                document.body.removeChild(portalContainerRef.current);
            }
        };
    }, []);

    useLayoutEffect(() => {
        if (!isOpen || !containerRef.current) return;

        const updatePosition = () => {
            const rect = containerRef.current.getBoundingClientRect();
            const dropdownHeight = Math.min(options.length * 40, 240);
            const availableBelow = window.innerHeight - rect.bottom;
            const availableAbove = rect.top;
            const openAbove = availableBelow < dropdownHeight && availableAbove > availableBelow;
            const top = openAbove ? rect.top - dropdownHeight - 8 : rect.bottom + 8;
            const dropdownWidth = Math.max(rect.width, 260);
            const viewportRight = window.innerWidth - 8;
            const left = rect.left + dropdownWidth > viewportRight ? Math.max(8, viewportRight - dropdownWidth) : rect.left;

            setPopupStyles({
                position: 'fixed',
                top: `${Math.max(8, top)}px`,
                left: `${left}px`,
                width: `${dropdownWidth}px`,
                maxHeight: '240px',
            });
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [isOpen, options.length]);

    const selectedOption = options.find((opt) => opt.value === value) || {
        label: placeholder,
        value: '',
    };

    const handleNativeChange = (event) => {
        onChange(event.target.value);
    };

    return (
        <div ref={containerRef} className={`relative ${containerClassName}`}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen((prev) => !prev)}
                className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm
                    transition-all text-left
                    bg-white dark:bg-slate-900
                    border border-slate-200 dark:border-slate-700
                    outline-none
                    focus:outline-none
                    focus:ring-1
                    focus:ring-red-500
                    focus:border-red-500
                    ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                    ${buttonClassName}
                    `}
                >
                <div className={`flex items-center gap-2 min-w-0 flex-1 ${labelClassName}`}>
                    {icon}
                    <span className="min-w-0 truncate">{selectedOption.label}</span>
                </div>
                <svg
                    className={`w-3.5 h-3.5 flex-shrink-0 fill-current text-slate-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                    viewBox="0 0 20 20"
                >
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
            </button>

            <select
                name={name}
                value={value}
                onChange={handleNativeChange}
                required={required}
                className="hidden"
                tabIndex={-1}
                aria-hidden="true"
            >
                <option value="" disabled hidden>
                    {placeholder}
                </option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            {isOpen && portalContainerRef.current && createPortal(
                <div
                    ref={popupRef}
                    style={popupStyles}
                    className="bg-white dark:bg-slate-900 border border-slate-400 dark:border-slate-800 rounded-xl shadow-xl z-[99999] max-h-60 overflow-y-auto py-1.5 animate-fadeIn"
                >
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                                onChange(opt.value);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-all flex items-center justify-between ${
                                opt.value === value
                                    ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold'
                                    : 'text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50'
                            }`}
                        >
                            <span className="min-w-0 truncate">{opt.label}</span>
                            {opt.value === value && <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />}
                        </button>
                    ))}
                </div>,
                portalContainerRef.current,
            )}
        </div>
    );
};

export default DropdownSelect;
