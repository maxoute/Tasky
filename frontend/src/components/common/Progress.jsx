import React from 'react';

const COLORS = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-400',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    gray: 'bg-gray-300',
};

export const Progress = ({ value = 0, color = 'blue', className = '' }) => (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
        <div
            className={`h-2 rounded-full transition-all duration-300 ${COLORS[color] || COLORS.blue}`}
            style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
    </div>
); 