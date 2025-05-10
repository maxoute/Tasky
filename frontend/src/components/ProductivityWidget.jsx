import React, { useState, useEffect } from 'react';
import { habitService } from '../services/api';

const ProductivityWidget = ({ userId }) => {
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
    if (!stats || !stats.daily_data) return null;
    
    const dailyData = stats.daily_data;
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
            <option value="week">01 - 07 Avril</option>
            <option value="month">Avril</option>
            <option value="year">2024</option>
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
      ) : stats ? (
        <div>
          {renderChart()}
          
          <div className="mt-6 flex space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm text-gray-600">Temps de concentration</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
              <span className="text-sm text-gray-600">Implémentation design</span>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Statistiques globales</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-gray-800">{stats.completion_rate || 0}%</p>
                <p className="text-xs text-gray-500">Taux de réussite</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-gray-800">{stats.streak_days || 0}</p>
                <p className="text-xs text-gray-500">Jours consécutifs</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-gray-800">{stats.total_completions || 0}</p>
                <p className="text-xs text-gray-500">Total complétés</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-10">Aucune donnée disponible</p>
      )}
    </div>
  );
};

export default ProductivityWidget; 