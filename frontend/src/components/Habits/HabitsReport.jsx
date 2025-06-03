import React from 'react';
import { Icon } from '../common/Icon';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

export const HabitsReport = ({ report }) => {
    if (!report) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
                <p className="text-gray-500">Génération du rapport en cours...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête du rapport */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Rapport Hebdomadaire
                </h2>
                <p className="text-gray-500">
                    {new Date().toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })}
                </p>
            </div>

            {/* Contenu du rapport */}
            <div className="prose prose-blue max-w-none">
                {report.split('\n\n').map((section, index) => (
                    <div key={index} className="mb-6">
                        {section.split('\n').map((paragraph, pIndex) => (
                            <p key={pIndex} className="text-gray-700 leading-relaxed">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                    variant="secondary"
                    onClick={() => window.print()}
                    className="print:hidden"
                >
                    <Icon name="printer" className="w-5 h-5 mr-2" />
                    Imprimer
                </Button>
                <Button
                    variant="primary"
                    onClick={() => {
                        const blob = new Blob([report], { type: 'text/plain' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `rapport-habitudes-${new Date().toISOString().split('T')[0]}.txt`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                    }}
                    className="print:hidden"
                >
                    <Icon name="download" className="w-5 h-5 mr-2" />
                    Télécharger
                </Button>
            </div>

            {/* Styles d'impression */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .modal-content,
                    .modal-content * {
                        visibility: visible;
                    }
                    .modal-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}; 