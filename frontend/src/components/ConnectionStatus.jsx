import React, { useState, useEffect } from 'react';
import { testBackendConnection } from '../services/api';

const ConnectionStatus = () => {
  const [status, setStatus] = useState({ 
    success: false, 
    message: 'Vérification de la connexion...', 
    error: null 
  });
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await testBackendConnection();
        setStatus(result);
        
        // Si on est connecté, on masque le message après 5 secondes
        if (result.success) {
          setTimeout(() => {
            setVisible(false);
          }, 5000);
        }
      } catch (error) {
        setStatus({ 
          success: false, 
          message: 'Erreur lors de la vérification de la connexion', 
          error: error.message 
        });
      }
    };

    checkConnection();
  }, []);

  if (!visible) return null;

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      status.success ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
    }`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {status.success ? (
            <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="ml-3">
          <p className={`text-sm font-medium ${status.success ? 'text-green-800' : 'text-red-800'}`}>
            {status.message}
          </p>
          {status.error && (
            <p className="mt-1 text-sm text-red-700">
              {status.error}
            </p>
          )}
          {!status.success && (
            <div className="mt-2">
              <ul className="list-disc pl-5 text-xs text-red-700 space-y-1">
                <li>Vérifiez que le serveur backend est démarré</li>
                <li>Commande pour démarrer le backend: <code className="bg-red-100 px-1 py-0.5 rounded">python app_fastapi.py</code></li>
                <li>Assurez-vous que le backend est accessible sur le port 8000</li>
              </ul>
            </div>
          )}
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={() => setVisible(false)}
            className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus; 