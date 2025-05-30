import React from 'react';
import { Icon } from '../common/Icon';
import { Card } from '../common/Card';
import { Progress } from '../common/Progress';

export const HabitsStats = ({ stats, className = '' }) => {
    const getCompletionRateColor = (rate) => {
        if (rate >= 0.8) return 'text-green-600';
        if (rate >= 0.5) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getStreakColor = (streak) => {
        if (streak >= 7) return 'text-green-600';
        if (streak >= 3) return 'text-yellow-600';
        return 'text-gray-600';
    };

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
            {/* Taux de complétion global */}
            <Card>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">
                            Taux de complétion
                        </h3>
                        <p className="text-sm text-gray-500">
                            Moyenne sur toutes les habitudes
                        </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                        <Icon name="chart-bar" className="w-6 h-6 text-blue-600" />
                    </div>
                </div>
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-2xl font-bold ${getCompletionRateColor(stats.completion_rate)}`}>
                            {Math.round(stats.completion_rate * 100)}%
                        </span>
                    </div>
                    <Progress
                        value={stats.completion_rate * 100}
                        color={stats.completion_rate >= 0.8 ? 'green' :
                            stats.completion_rate >= 0.5 ? 'yellow' : 'red'}
                    />
                </div>
            </Card>

            {/* Nombre total d'habitudes */}
            <Card>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">
                            Habitudes actives
                        </h3>
                        <p className="text-sm text-gray-500">
                            Sur {stats.total_habits} habitudes
                        </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                        <Icon name="list-check" className="w-6 h-6 text-purple-600" />
                    </div>
                </div>
                <div className="mt-4">
                    <span className="text-2xl font-bold text-gray-900">
                        {stats.active_habits}
                    </span>
                </div>
            </Card>

            {/* Habitude la plus consistante */}
            <Card>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">
                            Habitude la plus consistante
                        </h3>
                        <p className="text-sm text-gray-500">
                            Meilleur taux de complétion
                        </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                        <Icon name="star" className="w-6 h-6 text-green-600" />
                    </div>
                </div>
                <div className="mt-4">
                    {stats.most_consistent_habit ? (
                        <>
                            <p className="text-sm font-medium text-gray-900">
                                {stats.most_consistent_habit.name}
                            </p>
                            <div className="flex items-center mt-2">
                                <span className={`text-sm ${getCompletionRateColor(stats.most_consistent_habit.completion_rate)}`}>
                                    {Math.round(stats.most_consistent_habit.completion_rate * 100)}%
                                </span>
                                <Progress
                                    value={stats.most_consistent_habit.completion_rate * 100}
                                    color="green"
                                    className="ml-2 flex-1"
                                />
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-gray-500">
                            Aucune habitude suivie
                        </p>
                    )}
                </div>
            </Card>

            {/* Habitudes à surveiller */}
            <Card>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">
                            À surveiller
                        </h3>
                        <p className="text-sm text-gray-500">
                            Habitudes qui ont besoin d'attention
                        </p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-full">
                        <Icon name="exclamation" className="w-6 h-6 text-red-600" />
                    </div>
                </div>
                <div className="mt-4 space-y-3">
                    {stats.needs_attention?.length > 0 ? (
                        stats.needs_attention.map(habit => (
                            <div key={habit.habit_id} className="flex items-center justify-between">
                                <span className="text-sm text-gray-900 truncate">
                                    {habit.name}
                                </span>
                                <div className="flex items-center">
                                    <span className={`text-sm ${getStreakColor(habit.current_streak)}`}>
                                        {habit.current_streak} jours
                                    </span>
                                    <Progress
                                        value={habit.completion_rate * 100}
                                        color="red"
                                        className="ml-2 w-16"
                                    />
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">
                            Toutes les habitudes sont bien suivies
                        </p>
                    )}
                </div>
            </Card>
        </div>
    );
}; 