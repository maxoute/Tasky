import React from 'react';
import { Icon } from './Icon';

const ICONS = [
    'check',
    'pencil',
    'trash',
    'fire',
    'star',
    'chart-bar',
    'list-check',
    'exclamation',
    'printer',
    'download',
    'face-smile',
    'face-meh',
    'face-frown',
];

export const IconPicker = ({ value, onChange, className = '' }) => {
    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {ICONS.map(icon => (
                <button
                    key={icon}
                    type="button"
                    className={`w-9 h-9 flex items-center justify-center rounded border-2 transition focus:outline-none ${
                        value === icon ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => onChange(icon)}
                    aria-label={`Choisir l'icône ${icon}`}
                >
                    <Icon name={icon} className="w-6 h-6" />
                </button>
            ))}
        </div>
    );
}; 