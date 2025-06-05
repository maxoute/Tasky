import React, { useState } from 'react';
import { themeService } from '../services/api';
import { motion } from 'framer-motion';

const ThemeGenerator = ({ onTasksGenerated }) => {
  const [theme, setTheme] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSmart, setIsSmart] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('');

  // Liste des catégories disponibles
  const categories = [
    "Travail", "Personnel", "Santé", "Finances", 
    "Éducation", "Loisirs", "Famille", "Projets"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!theme.trim()) {
      return;
    }
    
    // Découpage multi-tâches
    const splitThemes = theme.split(/[,;\n]+/).map(t => t.trim()).filter(Boolean);
    if (splitThemes.length > 1) {
      const today = new Date().toISOString().split('T')[0];
      const multiTasks = splitThemes.map((t, i) => ({
        id: `local-multi-${i}`,
        text: t,
        deadline: today,
        completed: false,
      }));
      onTasksGenerated(theme, multiTasks);
      setTheme('');
      setShowAdvanced(false);
      setDeadline('');
      setCategory('');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      console.log("Génération des tâches pour:", theme);
      
      // Préparation des options avec deadline et catégorie si définies
      const options = { 
        is_smart_objective: isSmart,
        ...(deadline && { deadline }),
        ...(category && { category })
      };
      
      // Appel au service
      const result = await themeService.generateTasks(theme, options);
      
      // Vérifier que result contient des tâches
      if (result && result.tasks && result.tasks.length > 0) {
        // Si des options avancées sont définies, les ajouter aux tâches
        let enhancedTasks = [...result.tasks];
        
        if (deadline || category) {
          enhancedTasks = enhancedTasks.map(task => ({
            ...task,
            ...(deadline && !task.deadline && { deadline }),
            ...(category && !task.category && { 
              category,
              hashtags: [...(task.hashtags || []), category.toLowerCase()]
            })
          }));
        }
        
        // Passer le thème et les tâches au composant parent
        onTasksGenerated(theme, enhancedTasks);
        // Réinitialiser le formulaire
        setTheme('');
        setShowAdvanced(false);
        setDeadline('');
        setCategory('');
      } else {
        // En cas d'erreur, utiliser des tâches génériques avec les options avancées
        const today = new Date().toISOString().split('T')[0];
        const fallbackTasks = [
          { 
            id: 'local-1', 
            text: `Rechercher sur "${theme}"`, 
            completed: false,
            deadline: today,
            ...(category && { 
              category,
              hashtags: [category.toLowerCase(), "recherche"]
            })
          },
          { 
            id: 'local-2', 
            text: `Créer un plan pour "${theme}"`, 
            completed: false,
            deadline: today,
            ...(category && { 
              category,
              hashtags: [category.toLowerCase(), "planification"]
            })
          },
          { 
            id: 'local-3', 
            text: `Prendre des notes sur "${theme}"`, 
            completed: false,
            deadline: today,
            ...(category && { 
              category,
              hashtags: [category.toLowerCase(), "documentation"]
            })
          }
        ];
        onTasksGenerated(theme, fallbackTasks);
        setTheme('');
        setShowAdvanced(false);
        setDeadline('');
        setCategory('');
        console.log("Utilisation de tâches de secours");
      }
    } catch (err) {
      console.error('Erreur lors de la génération des tâches:', err);
      setError('Erreur lors de la génération des tâches. Veuillez réessayer.');
      
      // Même en cas d'erreur, générer des tâches localement avec les options avancées
      const today = new Date().toISOString().split('T')[0];
      const fallbackTasks = [
        { 
          id: 'error-1', 
          text: `Rechercher sur "${theme}"`, 
          completed: false,
          deadline: today,
          ...(category && { 
            category,
            hashtags: [category.toLowerCase(), "recherche"]
          })
        },
        { 
          id: 'error-2', 
          text: `Créer un plan pour "${theme}"`, 
          completed: false,
          deadline: today,
          ...(category && { 
            category,
            hashtags: [category.toLowerCase(), "planification"]
          })
        }
      ];
      onTasksGenerated(theme, fallbackTasks);
      setTheme('');
      setShowAdvanced(false);
      setDeadline('');
      setCategory('');
    } finally {
      setIsLoading(false);
    }
  };

  // Calcul de la date minimale (aujourd'hui) pour l'input de deadline
  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Ex: Améliorer ma productivité, Organiser un voyage..."
            className="input-modern w-full pl-6 pr-12 py-4 text-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isLoading}
          />
          {theme && !isLoading && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setTheme('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </motion.button>
          )}
        </div>

        {/* Options avancées */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isSmart}
                onChange={(e) => setIsSmart(e.target.checked)}
                className="sr-only"
              />
              <div className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                isSmart ? 'bg-gradient-to-r from-purple-500 to-blue-600' : 'bg-gray-300'
              }`}>
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                  isSmart ? 'transform translate-x-6' : ''
                }`} />
              </div>
              <span className="ml-3 text-sm font-medium text-gray-700">Génération d'objectif SMART</span>
            </label>
          </div>
          
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors flex items-center"
          >
            <span>Afficher les options avancées</span>
            <svg 
              className={`ml-1 w-4 h-4 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Panel des options avancées */}
        {showAdvanced && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              Options avancées
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date limite (optionnel)
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={today}
                  className="input-modern w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie (optionnel)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-modern w-full"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading || !theme.trim()}
          className={`btn-primary w-full py-4 text-lg font-semibold rounded-xl transition-all duration-300 ${
            isLoading || !theme.trim() 
              ? 'opacity-50 cursor-not-allowed transform-none shadow-none' 
              : 'hover:shadow-lg'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Génération en cours...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Générer mes tâches
            </div>
          )}
        </motion.button>

        {/* Astuce pour l'utilisateur */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800 mb-1">Astuce</p>
              <p className="text-sm text-yellow-700">
                Essayez des thèmes précis comme "Apprendre la photographie", 
                "Rénover ma chambre" ou "Préparer un marathon".
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ThemeGenerator; 