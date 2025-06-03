import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Icon } from '../common/Icon';

const MOOD_OPTIONS = [
    { value: 'great', label: 'Excellent', icon: 'face-smile', color: 'text-green-600' },
    { value: 'good', label: 'Bien', icon: 'face-smile', color: 'text-yellow-600' },
    { value: 'okay', label: 'Moyen', icon: 'face-meh', color: 'text-orange-600' },
    { value: 'bad', label: 'Difficile', icon: 'face-frown', color: 'text-red-600' }
];

export const HabitNotesForm = ({ habit, onSubmit, onCancel }) => {
    const [notes, setNotes] = useState('');
    const [mood, setMood] = useState('');
    const [value, setValue] = useState(habit?.target_value || 1);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            notes,
            mood,
            value,
            timestamp: new Date().toISOString()
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations sur l'habitude */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                    <div
                        className="h-10 w-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: habit?.color || '#4B5563' }}
                    >
                        <Icon name={habit?.icon || 'check'} className="text-white" />
                    </div>
                    <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                            {habit?.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {habit?.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Valeur réalisée */}
            <div>
                <Input
                    label={`Valeur réalisée (${habit?.unit || 'fois'})`}
                    type="number"
                    value={value}
                    onChange={(e) => setValue(parseInt(e.target.value))}
                    min={1}
                    required
                />
            </div>

            {/* Humeur */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment vous sentez-vous ?
                </label>
                <div className="grid grid-cols-4 gap-4">
                    {MOOD_OPTIONS.map(option => (
                        <label
                            key={option.value}
                            className={`
                                flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer
                                ${mood === option.value
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }
                            `}
                        >
                            <input
                                type="radio"
                                name="mood"
                                value={option.value}
                                checked={mood === option.value}
                                onChange={(e) => setMood(e.target.value)}
                                className="sr-only"
                            />
                            <Icon
                                name={option.icon}
                                className={`w-8 h-8 ${option.color} mb-2`}
                            />
                            <span className="text-sm text-gray-700">
                                {option.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Notes */}
            <div>
                <Input
                    label="Notes (optionnel)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Comment ça s'est passé ? Des difficultés particulières ?"
                    multiline
                    rows={4}
                />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                >
                    Annuler
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                >
                    Valider
                </Button>
            </div>
        </form>
    );
}; 