import React from 'react';

const COLORS = [
    '#2563eb', // bleu
    '#16a34a', // vert
    '#f59e42', // orange
    '#dc2626', // rouge
    '#a21caf', // violet
    '#fbbf24', // jaune
    '#4B5563', // gris
    '#000000', // noir
    '#ffffff', // blanc
];

export const ColorPicker = ({ value, onChange, className = '' }) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {COLORS.map(color => (
                <button
                    key={color}
                    type="button"
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center focus:outline-none transition ${
                        value === color ? 'border-blue-600 ring-2 ring-blue-300' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => onChange(color)}
                    aria-label={`Choisir la couleur ${color}`}
                >
                    {value === color && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </button>
            ))}
            <input
                type="color"
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-7 h-7 p-0 border-0 bg-transparent cursor-pointer"
                aria-label="Couleur personnalisée"
            />
        </div>
    );
}; 