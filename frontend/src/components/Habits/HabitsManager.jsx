import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { HabitsList } from './HabitsList';
import { HabitForm } from './HabitForm';
import { HabitsStats } from './HabitsStats';
import { HabitsReport } from './HabitsReport';
import { Loader } from '../common/Loader';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';

export const HabitsManager = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [habits, setHabits] = useState([]);
    const [stats, setStats] = useState(null);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [selectedHabit, setSelectedHabit] = useState(null);

    // Charger les habitudes et les statistiques
    useEffect(() => {
        if (user) {
            loadHabits();
            loadStats();
        }
    }, [user]);

    const loadHabits = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/habits?user_id=${user.id}`);
            setHabits(response.data);
        } catch (error) {
            showToast('Erreur lors du chargement des habitudes', 'error');
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await api.get(`/api/habits/stats?user_id=${user.id}&period=week`);
            setStats(response.data);
        } catch (error) {
            showToast('Erreur lors du chargement des statistiques', 'error');
            console.error('Erreur:', error);
        }
    };

    const loadReport = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/habits/report?user_id=${user.id}`);
            setReport(response.data);
            setShowReport(true);
        } catch (error) {
            showToast('Erreur lors de la génération du rapport', 'error');
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddHabit = async (habitData) => {
        try {
            setLoading(true);
            const response = await api.post('/api/habits', {
                ...habitData,
                user_id: user.id
            });
            setHabits([...habits, response.data]);
            showToast('Habitude ajoutée avec succès', 'success');
            setShowForm(false);
        } catch (error) {
            showToast('Erreur lors de l\'ajout de l\'habitude', 'error');
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateHabit = async (habitId, habitData) => {
        try {
            setLoading(true);
            const response = await api.put(`/api/habits/${habitId}`, habitData);
            setHabits(habits.map(h => h.id === habitId ? response.data : h));
            showToast('Habitude mise à jour avec succès', 'success');
            setShowForm(false);
            setSelectedHabit(null);
        } catch (error) {
            showToast('Erreur lors de la mise à jour de l\'habitude', 'error');
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteHabit = async (habitId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette habitude ?')) {
            return;
        }

        try {
            setLoading(true);
            await api.delete(`/api/habits/${habitId}`);
            setHabits(habits.filter(h => h.id !== habitId));
            showToast('Habitude supprimée avec succès', 'success');
        } catch (error) {
            showToast('Erreur lors de la suppression de l\'habitude', 'error');
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteHabit = async (habitId, notes = '') => {
        try {
            setLoading(true);
            await api.post(`/api/habits/${habitId}/complete`, { notes });
            await loadHabits();
            await loadStats();
            showToast('Habitude complétée avec succès', 'success');
        } catch (error) {
            showToast('Erreur lors de la complétion de l\'habitude', 'error');
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditHabit = (habit) => {
        setSelectedHabit(habit);
        setShowForm(true);
    };

    if (loading && !habits.length) {
        return <Loader />;
    }

    return (
        <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center py-8 px-2">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 md:p-10 flex flex-col gap-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-0 mb-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">Mes Habitudes</h1>
                        <p className="text-gray-500 text-base md:text-lg">Suivi, stats et coaching IA</p>
                    </div>
                    <div className="flex flex-row flex-wrap gap-3 md:gap-4">
                        <Button
                            onClick={() => {
                                setSelectedHabit(null);
                                setShowForm(true);
                            }}
                            variant="primary"
                        >
                            Nouvelle Habitude
                        </Button>
                        <Button
                            onClick={loadReport}
                            variant="secondary"
                        >
                            Rapport Hebdomadaire
                        </Button>
                    </div>
                </div>

                {stats && <HabitsStats stats={stats} className="mb-4" />}

                <div className="flex flex-col gap-8">
                    <HabitsList
                        habits={habits}
                        onComplete={handleCompleteHabit}
                        onEdit={handleEditHabit}
                        onDelete={handleDeleteHabit}
                        className="mb-2"
                    />
                </div>
            </div>

            <Modal
                isOpen={showForm}
                onClose={() => {
                    setShowForm(false);
                    setSelectedHabit(null);
                }}
                title={selectedHabit ? 'Modifier l\'habitude' : 'Nouvelle habitude'}
            >
                <HabitForm
                    habit={selectedHabit}
                    onSubmit={selectedHabit ? handleUpdateHabit : handleAddHabit}
                    onCancel={() => {
                        setShowForm(false);
                        setSelectedHabit(null);
                    }}
                />
            </Modal>

            <Modal
                isOpen={showReport}
                onClose={() => setShowReport(false)}
                title="Rapport Hebdomadaire"
                size="lg"
            >
                <HabitsReport report={report} />
            </Modal>
        </div>
    );
}; 