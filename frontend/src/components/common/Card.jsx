import React from 'react';

export const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        {children}
    </div>
); 