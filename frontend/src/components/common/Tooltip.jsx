import React, { useState } from 'react';

export const Tooltip = ({ content, children, className = '' }) => {
    const [visible, setVisible] = useState(false);
    return (
        <span
            className={`relative inline-block ${className}`}
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            {children}
            {visible && (
                <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded bg-gray-900 text-white text-xs shadow-lg whitespace-nowrap">
                    {content}
                </span>
            )}
        </span>
    );
}; 