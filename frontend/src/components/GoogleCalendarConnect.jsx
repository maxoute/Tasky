import React, { useState } from 'react';

const GoogleCalendarConnect = () => {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setLoading(true);
    setError('');
    try {
      window.location.href = '/api/google/auth';
    } catch (e) {
      setError('Erreur lors de la connexion à Google Calendar');
    } finally {
      setLoading(false);
    }
  };

  // Optionnel : vérifier la connexion en appelant /api/google/events/today

  return (
    <div className="mb-4">
      {connected ? (
        <div className="text-green-600 font-medium">Google Calendar connecté</div>
      ) : (
        <button
          onClick={handleConnect}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? 'Connexion...' : 'Connecter mon Google Calendar'}
        </button>
      )}
      {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
    </div>
  );
};

export default GoogleCalendarConnect; 