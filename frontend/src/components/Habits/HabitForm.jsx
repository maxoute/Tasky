import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { ColorPicker } from '../common/ColorPicker';
import { IconPicker } from '../common/IconPicker';

const FREQUENCY_OPTIONS = [
    { value: 'daily', label: 'Quotidien' },
    { value: 'weekly', label: 'Hebdomadaire' },
    { value: 'weekdays', label: 'Jours de semaine' },
    { value: 'weekends', label: 'Weekends' }
];

const DAYS_OF_WEEK = [
    { value: 'monday', label: 'Lundi' },
    { value: 'tuesday', label: 'Mardi' },
    { value: 'wednesday', label: 'Mercredi' },
    { value: 'thursday', label: 'Jeudi' },
    { value: 'friday', label: 'Vendredi' },
    { value: 'saturday', label: 'Samedi' },
    { value: 'sunday', label: 'Dimanche' }
];

const CATEGORY_OPTIONS = [
    { value: 'health', label: 'Santé' },
    { value: 'productivity', label: 'Productivité' },
    { value: 'learning', label: 'Apprentissage' },
    { value: 'mindfulness', label: 'Bien-être' },
    { value: 'other', label: 'Autre' }
];

export const HabitForm = ({ habit, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        frequency: 'daily',
        custom_days: [],
        category: 'other',
        color: '#4B5563',
        icon: 'check',
        target_value: 1,
        unit: 'fois',
        reminder_time: '',
        active: true
    });

    useEffect(() => {
        if (habit) {
            setFormData({
                ...habit,
                custom_days: habit.frequency === 'custom' ? JSON.parse(habit.frequency) : []
            });
        }
    }, [habit]);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Préparer les données pour l'API
        const submitData = {
            ...formData,
            frequency: formData.frequency === 'custom' ? JSON.stringify(formData.custom_days) : formData.frequency
        };

        // Supprimer les champs non nécessaires
        delete submitData.custom_days;
        delete submitData.id;
        delete submitData.created_at;
        delete submitData.updated_at;
        delete submitData.streak;
        delete submitData.longest_streak;
        delete submitData.last_completion_date;
        delete submitData.completion_rate;

        onSubmit(submitData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Input
                        label="Nom de l'habitude"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        required
                        placeholder="Ex: Méditation matinale"
                    />
                </div>

                <div>
                    <Select
                        label="Catégorie"
                        value={formData.category}
                        onChange={(value) => handleChange('category', value)}
                        options={CATEGORY_OPTIONS}
                    />
                </div>

                <div className="md:col-span-2">
                    <Input
                        label="Description"
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Décrivez votre habitude..."
                        multiline
                        rows={3}
                    />
                </div>

                <div>
                    <Select
                        label="Fréquence"
                        value={formData.frequency}
                        onChange={(value) => handleChange('frequency', value)}
                        options={FREQUENCY_OPTIONS}
                    />
                </div>

                {formData.frequency === 'custom' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Jours de la semaine
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {DAYS_OF_WEEK.map(day => (
                                <label
                                    key={day.value}
                                    className="inline-flex items-center px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.custom_days.includes(day.value)}
                                        onChange={(e) => {
                                            const newDays = e.target.checked
                                                ? [...formData.custom_days, day.value]
                                                : formData.custom_days.filter(d => d !== day.value);
                                            handleChange('custom_days', newDays);
                                        }}
                                        className="sr-only"
                                    />
                                    <span className="text-sm">{day.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <Input
                        label="Valeur cible"
                        type="number"
                        value={formData.target_value}
                        onChange={(e) => handleChange('target_value', parseInt(e.target.value))}
                        min={1}
                        required
                    />
                </div>

                <div>
                    <Input
                        label="Unité"
                        value={formData.unit}
                        onChange={(e) => handleChange('unit', e.target.value)}
                        placeholder="Ex: minutes, pages, km..."
                    />
                </div>

                <div>
                    <Input
                        label="Heure de rappel"
                        type="time"
                        value={formData.reminder_time}
                        onChange={(e) => handleChange('reminder_time', e.target.value)}
                    />
                </div>

                <div className="md:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Couleur
                            </label>
                            <ColorPicker
                                value={formData.color}
                                onChange={(color) => handleChange('color', color)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Icône
                            </label>
                            <IconPicker
                                value={formData.icon}
                                onChange={(icon) => handleChange('icon', icon)}
                            />
                        </div>
                    </div>
                </div>
            </div>

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
                    {habit ? 'Mettre à jour' : 'Créer'}
                </Button>
            </div>
        </form>
    );
}; 