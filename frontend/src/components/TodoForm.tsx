import React, { useState } from 'react';
import { Task } from '../services/task-service';

interface TodoFormProps {
  onSubmit: (taskData: Omit<Task, 'id'>) => void;
  isLoading?: boolean;
  categories?: string[];
}

const TodoForm: React.FC<TodoFormProps> = ({ 
  onSubmit, 
  isLoading = false,
  categories = ['Vidéo', 'Organisation', 'Productivité', 'Travailler', 'Suivi personnel', 'Automatisation', 'Marketing', 'Technique']
}) => {
  const [formData, setFormData] = useState<Omit<Task, 'id'>>({
    title: '',
    completed: false,
    deadline: '',
    category: '',
    priority: 'medium'
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showPreview, setShowPreview] = useState(false);
  
  // Gérer les changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur si l'utilisateur corrige le champ
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    // Validation du titre
    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Le titre doit contenir au moins 3 caractères';
    }
    
    // Validation de la date (optionnelle mais doit être au bon format si fournie)
    if (formData.deadline) {
      // Vérification simple du format "DD mois YYYY"
      const datePattern = /^\d{1,2} [a-zéû]+ \d{4}$/i;
      if (!datePattern.test(formData.deadline)) {
        newErrors.deadline = 'Format de date invalide. Utilisez le format "JJ mois AAAA" (ex: 25 avril 2025)';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      
      // Réinitialiser le formulaire
      setFormData({
        title: '',
        completed: false,
        deadline: '',
        category: '',
        priority: 'medium'
      });
      setShowPreview(false);
    }
  };
  
  // Fonction pour obtenir la couleur de priorité
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Fonction pour obtenir la couleur de catégorie
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'vidéo': return 'bg-blue-500 text-white';
      case 'organisation': return 'bg-purple-500 text-white';
      case 'productivité': return 'bg-green-500 text-white';
      case 'travailler': return 'bg-indigo-500 text-white';
      case 'suivi personnel': return 'bg-pink-500 text-white';
      case 'automatisation': return 'bg-orange-500 text-white';
      case 'marketing': return 'bg-orange-500 text-white';
      case 'technique': return 'bg-gray-700 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Ajouter une tâche</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Titre */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Titre <span className="text-red-500">*</span></label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Entrez le titre de la tâche"
            className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm border ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>
        
        {/* Deadline */}
        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">Deadline</label>
          <input
            type="text"
            id="deadline"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            placeholder="Ex: 25 avril 2025"
            className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm border ${errors.deadline ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.deadline && <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>}
        </div>
        
        {/* Catégorie */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Catégorie</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full bg-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm border border-gray-300"
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        {/* Priorité */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priorité</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="mt-1 block w-full bg-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm border border-gray-300"
          >
            <option value="low">Basse</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
          </select>
        </div>
        
        {/* Prévisualisation */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            {showPreview ? "Masquer l'aperçu" : "Prévisualiser"}
          </button>
          
          {showPreview && formData.title && (
            <div className="mt-2 p-4 border border-gray-200 rounded-md">
              <h3 className="font-medium text-gray-900">{formData.title}</h3>
              
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {formData.deadline && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formData.deadline}
                  </span>
                )}
                
                {formData.category && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(formData.category)}`}>
                    {formData.category}
                  </span>
                )}
                
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(formData.priority)}`}>
                  {formData.priority === 'high' ? 'Haute' : formData.priority === 'medium' ? 'Moyenne' : 'Basse'}
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Bouton de soumission */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-black text-base font-medium text-white hover:bg-gray-800 focus:outline-none sm:text-sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Chargement...
              </>
            ) : 'Ajouter la tâche'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TodoForm; 