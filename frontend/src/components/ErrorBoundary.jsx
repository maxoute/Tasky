import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Met à jour le state pour afficher l'UI de fallback
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Détection plus approfondie des erreurs d'extension
    const isExtensionError = (
      error.message?.includes('extension') ||
      error.message?.includes('chrome-extension') ||
      error.message?.includes('Cannot read properties of undefined') ||
      error.stack?.includes('chrome-extension') ||
      errorInfo.componentStack?.includes('chrome-extension')
    );
    
    // Log l'erreur seulement si ce n'est pas lié à une extension
    if (!isExtensionError) {
      console.error('Erreur capturée par ErrorBoundary:', error, errorInfo);
    } else {
      console.warn('🛡️ Erreur d\'extension bloquée par ErrorBoundary');
    }
  }

  render() {
    if (this.state.hasError) {
      // Interface de fallback personnalisée
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 text-red-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.884-.833-2.598 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Une erreur est survenue
            </h2>
            <p className="text-gray-600 mb-4">
              Quelque chose s'est mal passé. Rechargez la page pour continuer.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 