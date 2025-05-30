import React from 'react';

const icons = {
    check: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
        </svg>
    ),
    pencil: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M17.414 2.586a2 2 0 00-2.828 0l-9.5 9.5A2 2 0 004 14v2a2 2 0 002 2h2a2 2 0 001.414-.586l9.5-9.5a2 2 0 000-2.828zM5 16v-2h2l8.293-8.293-2-2L5 14v2z" />
        </svg>
    ),
    trash: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M6 8a1 1 0 011 1v6a1 1 0 11-2 0V9a1 1 0 011-1zm4 0a1 1 0 011 1v6a1 1 0 11-2 0V9a1 1 0 011-1zm4-3a1 1 0 00-1-1h-3.586l-.707-.707A1 1 0 009.586 3h-1.172a1 1 0 00-.707.293L7 4H3a1 1 0 100 2h1v10a2 2 0 002 2h8a2 2 0 002-2V6h1a1 1 0 100-2h-4z" clipRule="evenodd" />
        </svg>
    ),
    fire: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M13.828 14.828A4 4 0 018 18a4 4 0 01-4-4c0-2.5 2-4.5 4-8 2 3.5 4 5.5 4 8a4 4 0 01-1.172 2.828z" />
        </svg>
    ),
    star: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.388-2.46a1 1 0 00-1.176 0l-3.388 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.388-2.46c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.967z" />
        </svg>
    ),
    'chart-bar': (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1v-6zm6-4a1 1 0 011-1h2a1 1 0 011 1v10a1 1 0 01-1 1h-2a1 1 0 01-1-1V7zm6 8a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z" />
        </svg>
    ),
    'list-check': (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M9 5a1 1 0 100-2 1 1 0 000 2zm0 2a1 1 0 100-2 1 1 0 000 2zm0 2a1 1 0 100-2 1 1 0 000 2zm0 2a1 1 0 100-2 1 1 0 000 2zm0 2a1 1 0 100-2 1 1 0 000 2zm2-10a1 1 0 011 1v12a1 1 0 11-2 0V3a1 1 0 011-1zm4 4a1 1 0 011 1v8a1 1 0 11-2 0V7a1 1 0 011-1z" />
        </svg>
    ),
    exclamation: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-8-4a1 1 0 00-1 1v4a1 1 0 002 0V7a1 1 0 00-1-1zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
    ),
    printer: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M6 2a2 2 0 00-2 2v2h12V4a2 2 0 00-2-2H6zM4 7a2 2 0 00-2 2v5a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2H4zm2 7v2h8v-2H6z" />
        </svg>
    ),
    download: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M3 16a2 2 0 002 2h10a2 2 0 002-2v-2a1 1 0 10-2 0v2H5v-2a1 1 0 10-2 0v2zm7-2a1 1 0 001-1V5a1 1 0 10-2 0v8a1 1 0 001 1zm-3-3a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" />
        </svg>
    ),
    'face-smile': (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-3-7a1 1 0 112 0 1 1 0 01-2 0zm6 0a1 1 0 112 0 1 1 0 01-2 0zm-6.293 2.707a1 1 0 011.414 0A5.978 5.978 0 0010 15c1.306 0 2.417-.417 3.293-1.293a1 1 0 111.414 1.414A7.978 7.978 0 0110 17a7.978 7.978 0 01-4.707-1.879 1 1 0 010-1.414z" />
        </svg>
    ),
    'face-meh': (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-3-7a1 1 0 112 0 1 1 0 01-2 0zm6 0a1 1 0 112 0 1 1 0 01-2 0zm-5 3a1 1 0 100 2h6a1 1 0 100-2H8z" />
        </svg>
    ),
    'face-frown': (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-3-7a1 1 0 112 0 1 1 0 01-2 0zm6 0a1 1 0 112 0 1 1 0 01-2 0zm-6.293 2.707a1 1 0 011.414-1.414A5.978 5.978 0 0110 15c1.306 0 2.417-.417 3.293-1.293a1 1 0 111.414 1.414A7.978 7.978 0 0110 17a7.978 7.978 0 01-4.707-1.879z" />
        </svg>
    ),
};

export const Icon = ({ name, className = '' }) => {
    return icons[name] ? React.cloneElement(icons[name], { className: `${icons[name].props.className} ${className}` }) : null;
}; 