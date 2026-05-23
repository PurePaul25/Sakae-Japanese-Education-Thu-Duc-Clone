import React from 'react';
import { REACTIONS } from './reactionUtils';

const ReactionPicker = ({ isOpen, onSelect, className = 'left-1/2 -translate-x-1/2 origin-bottom' }) => {
    return (
        <div
            className={`absolute bottom-full pb-3 z-[100] transition-all duration-300 ease-out ${
                isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-75 pointer-events-none'
            } ${className}`}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 flex items-center gap-1.5 p-1.5 px-2">
                {REACTIONS.map((r) => (
                    <button
                        key={r.type}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(r.type);
                        }}
                        className="relative group hover:-translate-y-2 hover:scale-110 transition-all duration-300 cursor-pointer p-1"
                    >
                        <span className="text-lg md:text-xl drop-shadow-sm inline-block transform origin-bottom transition-transform duration-200">
                            {r.emoji}
                        </span>
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity duration-200">
                            {r.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ReactionPicker;
