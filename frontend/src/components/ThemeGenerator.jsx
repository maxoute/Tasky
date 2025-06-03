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
    <div className="neo-card p-8 min-h-[400px]">
      <h2 className="text-3xl font-bold mb-4 font-futuristic">Générateur de tâches IA</h2>
      <p className="text-gray-600 mb-6 text-lg">
        Entrez un thème ou un objectif pour générer des tâches personnalisées
      </p>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Ex: Améliorer ma productivité, Organiser un voyage..."
            className="neo-input w-full pl-6 pr-12 py-5 rounded-lg text-lg"
            disabled={isLoading}
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setTheme('')}
            className={`absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 ${
              !theme || isLoading ? 'hidden' : 'block'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </motion.button>
        </div>

        <div className="flex items-center justify-between">
          <label className="inline-flex items-center cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={isSmart} 
                onChange={() => setIsSmart(!isSmart)}
                disabled={isLoading}
              />
              <div className={`block w-14 h-7 rounded-full transition-colors duration-300 ${isSmart ? 'bg-black' : 'bg-gray-300'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition transform duration-300 ${isSmart ? 'translate-x-7' : ''}`}></div>
            </div>
            <span className="ml-3 text-base font-medium text-gray-700">Génération d'objectif SMART</span>
          </label>
          
          <button 
            type="button" 
            className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
            onClick={() => setShowAdvanced(!showAdvanced)}
            disabled={isLoading}
          >
            {showAdvanced ? 'Masquer' : 'Afficher'} les options avancées
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ml-1 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg animated-fade-in">
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                Date limite commune
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                min={today}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="neo-input w-full p-3 rounded-lg"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Toutes les tâches générées auront cette deadline si définie
              </p>
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                id="category"
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="neo-input w-full p-3 rounded-lg"
                disabled={isLoading}
              >
                <option value="">-- Sélectionner une catégorie --</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Assigne automatiquement toutes les tâches à cette catégorie
              </p>
            </div>
          </div>
        )}

        <motion.button
          whileHover={{ y: -2, boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)" }}
          whileTap={{ y: 0, boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)" }}
          type="submit"
          className="neo-button w-full py-4 rounded-lg flex items-center justify-center font-medium text-white text-lg"
          disabled={isLoading || !theme.trim()}
        >
          {isLoading ? (
            <div className="futuristic-loader w-6 h-6 mr-2"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          )}
          {isLoading ? 'Génération en cours...' : 'Générer mes tâches'}
        </motion.button>
      </form>

      <div className="mt-6 p-5 bg-gray-50 rounded-lg flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-base font-medium text-gray-800">Astuce</h3>
          <p className="text-sm text-gray-600 mt-1">
            Essayez des thèmes précis comme "Apprendre la photographie", "Rénover ma chambre" ou "Préparer un marathon".
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThemeGenerator; 