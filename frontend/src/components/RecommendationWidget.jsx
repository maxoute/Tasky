import React, { useState, useEffect } from 'react';
import { recommendationService } from '../services/api';

const RecommendationWidget = () => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [availableTime, setAvailableTime] = useState('30min');
  const [energyLevel, setEnergyLevel] = useState('medium');
  const [error, setError] = useState(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await recommendationService.getRecommendations(availableTime, energyLevel);
      setRecommendations(data);
    } catch (err) {
      console.error('Erreur lors du chargement des recommandations:', err);
      setError('Impossible de charger les recommandations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchRecommendations();
  };

  const timeOptions = [
    { value: '15min', label: '15 minutes' },
    { value: '30min', label: '30 minutes' },
    { value: '1h', label: '1 heure' },
    { value: '2h', label: '2 heures' },
    { value: '4h', label: 'Demi-journée' }
  ];

  const energyOptions = [
    { value: 'low', label: 'Faible' },
    { value: 'medium', label: 'Moyenne' },
    { value: 'high', label: 'Élevée' }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-fadeIn">
      <h2 className="text-xl font-semibold mb-4">Recommandations intelligentes</h2>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="availableTime" className="block text-sm font-medium text-gray-700 mb-1">
              Temps disponible
            </label>
            <select
              id="availableTime"
              value={availableTime}
              onChange={(e) => setAvailableTime(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              {timeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="energyLevel" className="block text-sm font-medium text-gray-700 mb-1">
              Niveau d'énergie
            </label>
            <select
              id="energyLevel"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              {energyOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors"
          disabled={loading}
        >
          {loading ? 'Chargement...' : 'Obtenir des recommandations'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {recommendations && !loading && (
        <div className="animate-fadeIn">
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700 italic">"{recommendations.message}"</p>
          </div>
          
          <div className="space-y-4">
            {recommendations.recommendations && recommendations.recommendations.length > 0 ? (
              recommendations.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 mr-3">
                    <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center">
                      {index + 1}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium">{rec.text}</h3>
                    <p className="text-sm text-gray-600 mt-1">{rec.reason}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Aucune recommandation disponible</p>
            )}
          </div>
        </div>
      )}
      
      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default RecommendationWidget; 