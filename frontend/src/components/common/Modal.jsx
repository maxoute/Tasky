import React from 'react';

const SIZES = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
};

export const Modal = ({
    isOpen,
    onClose,
    title = '',
    size = 'md',
    children,
    className = '',
}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-40 transition-opacity"
                onClick={onClose}
            />
            {/* Contenu */}
            <div className={`modal-content relative bg-white rounded-lg shadow-lg p-6 w-full ${SIZES[size] || SIZES.md} mx-4 ${className}`}>
                {/* Bouton de fermeture */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 focus:outline-none"
                    aria-label="Fermer"
                >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                {title && <h2 className="text-xl font-semibold mb-4 text-gray-900">{title}</h2>}
                <div>{children}</div>
            </div>
        </div>
    );
}; 