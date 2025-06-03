import React, { useState, useEffect } from 'react';
import { habitService } from '../services/api';

function getCurrentWeekRange() {
  const now = new Date();
  const first = now.getDate() - now.getDay() + 1; // Lundi
  const last = first + 6; // Dimanche
  const monday = new Date(now.setDate(first));
  const sunday = new Date(now.setDate(last));
  const format = d => d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' });
  return `${format(monday)} - ${format(sunday)}`;
}
function getCurrentMonth() {
  const now = new Date();
  return now.toLocaleDateString('fr-FR', { month: 'long' });
}
function getCurrentYear() {
  return new Date().getFullYear();
}

const ProductivityWidget = ({ userId, stats: taskStats }) => {
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState('week');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        const habitStats = await habitService.getHabitStats(userId, null, period);
        setStats(habitStats);
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [userId, period]);

  // Utiliser les stats de tâches si disponibles, sinon les stats d'habitudes
  const displayStats = taskStats || stats;

  // Fonction pour créer un point sur le graph en % de la hauteur maximale
  const calculatePoint = (value, maxValue, index, total) => {
    const percentage = maxValue > 0 ? value / maxValue * 100 : 0;
    const x = (index / (total - 1)) * 100;
    return `${x},${100 - percentage}`;
  };

  // Fonction pour créer un chemin SVG pour chaque série de données
  const createPath = (data, maxValue) => {
    if (!data || data.length === 0) return '';
    
    const points = data.map((value, index) => 
      calculatePoint(value.count, maxValue, index, data.length)
    ).join(' ');
    
    return `M ${points}`;
  };

  const renderChart = () => {
    if (!displayStats || !displayStats.daily_data) return null;
    
    const dailyData = displayStats.daily_data;
    const maxValue = Math.max(
      ...dailyData.map(day => Math.max(...day.habits.map(h => h.count)))
    );
    
    return (
      <div className="mt-4 relative h-48">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Axes et grille */}
          <line x1="0" y1="0" x2="0" y2="100" stroke="#e0e0e0" strokeWidth="0.5" />
          <line x1="0" y1="100" x2="100" y2="100" stroke="#e0e0e0" strokeWidth="0.5" />
          
          {/* Lignes horizontales de la grille */}
          <line x1="0" y1="75" x2="100" y2="75" stroke="#e0e0e0" strokeWidth="0.2" strokeDasharray="1" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#e0e0e0" strokeWidth="0.2" strokeDasharray="1" />
          <line x1="0" y1="25" x2="100" y2="25" stroke="#e0e0e0" strokeWidth="0.2" strokeDasharray="1" />
          
          {/* Tracer les lignes pour chaque habitude */}
          {dailyData[0]?.habits.map((habit, habitIndex) => {
            const habitData = dailyData.map(day => ({
              date: day.date,
              count: day.habits[habitIndex]?.count || 0
            }));
            
            const path = createPath(habitData, maxValue);
            const color = habitIndex === 0 ? '#10B981' : '#F59E0B';
            
            return (
              <g key={habitIndex}>
                <path 
                  d={path} 
                  fill="none" 
                  stroke={color} 
                  strokeWidth="2"
                />
                
                {/* Points sur la ligne avec info-bulles */}
                {habitData.map((data, i) => {
                  const x = (i / (habitData.length - 1)) * 100;
                  const y = 100 - (maxValue > 0 ? data.count / maxValue * 100 : 0);
                  
                  return (
                    <g key={i}>
                      <circle 
                        cx={x} 
                        cy={y} 
                        r="1.5" 
                        fill={color} 
                      />
                      
                      {/* Information sur le point */}
                      {i === 1 && (
                        <g transform={`translate(${x + 2}, ${y - 5})`}>
                          <rect x="-20" y="-15" width="40" height="15" rx="3" fill="black" opacity="0.8" />
                          <text x="0" y="-5" fontSize="5" fill="white" textAnchor="middle">
                            {`${data.count.toFixed(1)} - ${habitIndex === 0 ? '2 hours' : '1 hour'}`}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
        
        {/* Légende */}
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          {dailyData.map((day, index) => (
            <div key={index} className="text-center">
              {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Productivité</h2>
        
        <div className="relative inline-block">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="appearance-none bg-gray-50 text-gray-700 border border-gray-200 rounded py-1 px-3 text-sm pr-8 focus:outline-none focus:ring-1 focus:ring-gray-300"
          >
            <option value="week">{getCurrentWeekRange()}</option>
            <option value="month">{getCurrentMonth()}</option>
            <option value="year">{getCurrentYear()}</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        </div>
      ) : displayStats ? (
        <div>
          {/* Graphiques d'habitudes (si disponibles) */}
          {stats && stats.daily_data && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">📈 Évolution des habitudes</h3>
          {renderChart()}
          
              <div className="mt-4 flex space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm text-gray-600">Temps de concentration</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
              <span className="text-sm text-gray-600">Implémentation design</span>
            </div>
          </div>
            </div>
          )}
          
          {/* Métriques de productivité globales */}
          {(taskStats || stats) && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">🎯 Métriques hebdomadaires</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Habitudes */}
                {stats && (
                  <>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                      <p className="text-xl font-bold text-blue-700">{stats.completion_rate || 0}%</p>
                      <p className="text-xs text-blue-600">Taux de réussite</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
                      <p className="text-xl font-bold text-purple-700">{stats.streak_days || 0}</p>
                      <p className="text-xs text-purple-600">Jours consécutifs</p>
                    </div>
                  </>
                )}
                
                {/* Tâches */}
                {taskStats && (
                  <>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
                      <p className="text-xl font-bold text-green-700">{taskStats.completionRate}%</p>
                      <p className="text-xs text-green-600">Tâches terminées</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 text-center">
                      <p className="text-xl font-bold text-orange-700">{taskStats.total}</p>
                      <p className="text-xs text-orange-600">Total tâches</p>
                    </div>
                  </>
                )}
              </div>
              
              {/* Barre de progression globale */}
              {taskStats && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progression générale</span>
                    <span className="text-sm font-bold text-gray-900">{taskStats.completionRate}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 transition-all duration-700"
                      style={{ width: `${taskStats.completionRate}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>{taskStats.completed} terminées</span>
                    <span>{taskStats.pending} en cours</span>
              </div>
              </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">Générez des tâches pour voir vos métriques</p>
          <p className="text-gray-400 text-sm mt-1">Suivez votre productivité en temps réel</p>
        </div>
      )}
    </div>
  );
};

export default ProductivityWidget; 