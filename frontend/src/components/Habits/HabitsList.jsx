import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { Tooltip } from '../common/Tooltip';
import { Modal } from '../common/Modal';
import { HabitNotesForm } from './HabitNotesForm';

export const HabitsList = ({ habits, onComplete, onEdit, onDelete, className = '' }) => {
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [selectedHabit, setSelectedHabit] = useState(null);

    const handleCompleteClick = (habit) => {
        setSelectedHabit(habit);
        setShowNotesModal(true);
    };

    const handleNotesSubmit = async (notes) => {
        await onComplete(selectedHabit.id, notes);
        setShowNotesModal(false);
        setSelectedHabit(null);
    };

    const getStreakColor = (streak) => {
        if (streak >= 7) return 'text-green-600';
        if (streak >= 3) return 'text-yellow-600';
        return 'text-gray-600';
    };

    const getCompletionRateColor = (rate) => {
        if (rate >= 0.8) return 'text-green-600';
        if (rate >= 0.5) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className={`bg-white rounded-lg shadow ${className}`}>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Habitude
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Streak
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Taux de complétion
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Dernière complétion
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {habits.map((habit) => (
                            <tr key={habit.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <div
                                                className="h-10 w-10 rounded-full flex items-center justify-center"
                                                style={{ backgroundColor: habit.color || '#4B5563' }}
                                            >
                                                <Icon name={habit.icon || 'check'} className="text-white" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {habit.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {habit.description}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <span className={`text-sm font-medium ${getStreakColor(habit.streak)}`}>
                                            {habit.streak} jours
                                        </span>
                                        {habit.streak > 0 && (
                                            <Tooltip content={`Plus long streak: ${habit.longest_streak} jours`}>
                                                <Icon name="fire" className="ml-2 text-orange-500" />
                                            </Tooltip>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <span className={`text-sm font-medium ${getCompletionRateColor(habit.completion_rate)}`}>
                                            {Math.round(habit.completion_rate * 100)}%
                                        </span>
                                        <div className="ml-2 w-24 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full"
                                                style={{
                                                    width: `${habit.completion_rate * 100}%`,
                                                    backgroundColor: habit.completion_rate >= 0.8 ? '#059669' :
                                                        habit.completion_rate >= 0.5 ? '#D97706' : '#DC2626'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {habit.last_completion_date ? (
                                        new Date(habit.last_completion_date).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })
                                    ) : (
                                        'Jamais'
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                        <Tooltip content="Compléter">
                                            <Button
                                                onClick={() => handleCompleteClick(habit)}
                                                variant="success"
                                                size="sm"
                                                className="!p-2"
                                            >
                                                <Icon name="check" />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip content="Modifier">
                                            <Button
                                                onClick={() => onEdit(habit)}
                                                variant="secondary"
                                                size="sm"
                                                className="!p-2"
                                            >
                                                <Icon name="pencil" />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip content="Supprimer">
                                            <Button
                                                onClick={() => onDelete(habit.id)}
                                                variant="danger"
                                                size="sm"
                                                className="!p-2"
                                            >
                                                <Icon name="trash" />
                                            </Button>
                                        </Tooltip>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={showNotesModal}
                onClose={() => {
                    setShowNotesModal(false);
                    setSelectedHabit(null);
                }}
                title="Compléter l'habitude"
            >
                <HabitNotesForm
                    habit={selectedHabit}
                    onSubmit={handleNotesSubmit}
                    onCancel={() => {
                        setShowNotesModal(false);
                        setSelectedHabit(null);
                    }}
                />
            </Modal>
        </div>
    );
}; 