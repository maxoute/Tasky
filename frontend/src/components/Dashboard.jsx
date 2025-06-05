import React, { useState, useEffect } from 'react';
import ThemeGenerator from './ThemeGenerator';
import TaskList from './TaskList';
import RecommendationWidget from './RecommendationWidget';
import TodayTodoWidget from './TodayTodoWidget';
import CalendarWidget from './CalendarWidget';
import ProductivityWidget from './ProductivityWidget';
import GoogleCalendarConnect from './GoogleCalendarConnect';
import { getGoogleEventsToday } from '../services/api';

const Dashboard = ({
  username = 'Maxens',
  onGenerateTasks,
  isLoading,
  tasks = [],
  onTaskUpdate,
  onTaskDelete,
  activeTheme,
  stats = {}
}) => {
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [googleEvents, setGoogleEvents] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // S'assurer que tasks est toujours un tableau avec une vidéo exemple
  const safeTasks = Array.isArray(tasks) && tasks.length > 0 ? tasks : [
    {
      id: 'video-1',
      text: 'Comment choisir le bon modèle IA pour tes agents n8n',
      completed: false,
      eisenhower_category: 'important_urgent',
      script: `**Introduction** :
- Le nombre de modèles IA augmente, et il devient difficile de choisir le bon modèle pour tes agents n8n.
- Je vais t'expliquer comment sélectionner un bon modèle et comment déléguer ce choix à l'IA.

**Tester les modèles un par un** :
- Utilise n8n pour tester chaque modèle IA et analyse leurs avantages/inconvénients.
- Le site "Artificial Analys" peut t'aider à comparer les modèles sur des critères comme la vitesse, l'intelligence, et le coût.

**Déléguer le choix du modèle à l'IA avec Open Router** :
- **Open Router** permet à l'IA de choisir automatiquement le modèle en fonction de la requête.
- Exemple : une question simple (ex. capitale de l'Espagne) choisira un modèle rapide, une question complexe (ex. calcul mathématique) choisira un modèle plus puissant.

**Démonstration de l'utilisation d'Open Router** :
- Montre une question simple et complexe, avec une explication sur la façon dont le système choisit le modèle en fonction de la demande.
- Démonstration de l'API Open Router et des résultats obtenus dans les logs.

**Création d'une clé API pour Open Router** :
- Explique comment créer une clé API pour se connecter à Open Router et intégrer cette fonctionnalité dans tes agents n8n.

**Bonus exclusif** :
- Je vais te montrer un bonus qui permet de suivre et modifier les modèles utilisés dans tes workflows n8n.
- Cela te permet de gérer efficacement tes agents IA et optimiser les modèles utilisés.`,
      category: 'Orra Academy',
      hashtags: ['n8n', 'ia', 'agents', 'open-router', 'tutorial']
    }
  ];
  
  // Calculer les vraies statistiques depuis les tâches
  const completedTasks = safeTasks.filter(task => task.completed).length;
  const totalTasks = safeTasks.length;
  const pendingTasks = totalTasks - completedTasks;
  const progressPercentage = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;
  
  // Statistiques pour les composants
  const calculatedStats = {
    total: totalTasks,
    completed: completedTasks,
    pending: pendingTasks,
    completionRate: progressPercentage,
    totalTasks,
    completedTasks
  };
  
  // Mise à jour de l'heure en temps réel
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    getGoogleEventsToday().then(res => setGoogleEvents(res.events || [])).catch(() => {});
  }, []);

  // Fonction pour obtenir le salut personnalisé
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simplifié sans stats */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {getGreeting()}, {username} !
            </h1>
            <p className="text-gray-600">
              {currentTime.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Colonne gauche - Générateur et outils */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Générateur de tâches - IMPORTANT */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <ThemeGenerator onTasksGenerated={onGenerateTasks} />
            </div>
            
            {/* Widget Productivité */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <ProductivityWidget userId="1" stats={calculatedStats} />
            </div>
            
            {/* Assistant IA */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Assistant IA</h3>
                <button
                  onClick={() => setShowRecommendations(!showRecommendations)}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    showRecommendations 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {showRecommendations ? 'Actif' : 'Activer'}
                </button>
              </div>
              
              {showRecommendations && (
                <div>
                  <RecommendationWidget />
                </div>
              )}
              
              {!showRecommendations && (
                <div className="text-center py-6 text-gray-500">
                  <p>Activez l'assistant IA pour des suggestions intelligentes</p>
                </div>
              )}
            </div>
            
            {/* Events Google Calendar */}
            {googleEvents.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Agenda Google</h3>
                <ul className="space-y-2">
                  {googleEvents.map(event => (
                    <li key={event.id} className="flex items-center p-2 bg-green-50 rounded border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{event.summary}</p>
                        {event.start && event.start.dateTime && (
                          <p className="text-sm text-gray-500">
                            {new Date(event.start.dateTime).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Focus du jour */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Focus du jour</h3>
              
              <div className="space-y-3">
                {/* Objectif principal */}
                <div className="p-3 bg-amber-50 rounded border-l-4 border-amber-400">
                  <p className="font-medium text-amber-800">Objectif principal</p>
                  <p className="text-sm text-amber-700 mt-1">
                    {safeTasks.length > 0 
                      ? `Terminer ${Math.min(3, safeTasks.filter(t => !t.completed).length)} tâches importantes`
                      : "Créer votre première liste de tâches"
                    }
                  </p>
                </div>
                
                {/* Session Pomodoro */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
                  <div>
                    <p className="font-medium text-blue-800">Session Pomodoro</p>
                    <p className="text-sm text-blue-600">25 min de focus intense</p>
                  </div>
                  <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                    Start
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Colonne droite - TÂCHES PRINCIPALES avec stats intégrées */}
          <div className="lg:col-span-2">
            
            {/* Tâches d'aujourd'hui - ÉLÉMENT PRINCIPAL avec stats */}
            <div className="bg-white rounded-lg border border-gray-200">
              <TodayTodoWidget 
                tasks={safeTasks} 
                onTaskUpdate={onTaskUpdate}
                stats={calculatedStats}
                showDetailedStats={true}
              />
            </div>
            
            {/* Historique récent */}
            {safeTasks.filter(t => t.completed).length > 0 && (
              <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Récemment terminées</h3>
                  <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                    {safeTasks.filter(t => t.completed).length}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {safeTasks
                    .filter(task => task.completed)
                    .slice(0, 5)
                    .map(task => (
                      <div key={task.id} className="flex items-center p-3 bg-green-50 rounded border border-green-200">
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-sm text-green-800 font-medium flex-1">
                          {task.text.length > 40 ? task.text.slice(0, 37) + '...' : task.text}
                        </p>
                      </div>
                    ))}
                </div>
                
                {safeTasks.filter(t => t.completed).length > 5 && (
                  <div className="mt-3 text-center">
                    <button className="text-sm text-green-600">
                      Voir toutes les tâches terminées ({safeTasks.filter(t => t.completed).length})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 