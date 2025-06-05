import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { themeService } from '../services/api';
import { searchService } from '../services/searchService';

const Tasks = () => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'a_tourner', 'a_monter', 'a_publier', 'publie'
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('list'); // 'list' ou 'generator'
  const [prompt, setPrompt] = useState('');
  const [generatedVideos, setGeneratedVideos] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchServiceHealth, setSearchServiceHealth] = useState(null);
  const [newVideo, setNewVideo] = useState({
    title: '',
    prompt: '',
    script: '',
    status: 'a_tourner',
    deadline: '',
    category: 'Orra Academy',
    priority: 'medium'
  });

  // États possibles des vidéos
  const videoStates = [
    { key: 'a_tourner', label: 'À tourner', color: 'bg-red-100 text-red-800', emoji: '🎬' },
    { key: 'a_monter', label: 'À monter', color: 'bg-yellow-100 text-yellow-800', emoji: '✂️' },
    { key: 'a_publier', label: 'À publier', color: 'bg-blue-100 text-blue-800', emoji: '📤' },
    { key: 'publie', label: 'Publié', color: 'bg-green-100 text-green-800', emoji: '✅' }
  ];

  // Liste des catégories disponibles
  const categories = [
    'Orra Academy', 'N8N Tutorial', 'IA Agents', 'Automatisation', 
    'Python', 'Productivité', 'Formation', 'Tech Review'
  ];

  useEffect(() => {
    fetchVideos();
    checkSearchServiceHealth();
  }, []);

  const fetchVideos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        console.log('📊 [Videos] Données reçues:', data.tasks);
        // Transformer les tâches en vidéos avec des états par défaut
        const videosData = (data.tasks || []).map(task => ({
          ...task,
          status: task.status || 'a_tourner',
          prompt: task.prompt || '',
          script: task.script || task.text || '',
          title: task.text || task.title || 'Vidéo sans titre'
        }));
        setVideos(videosData);
      } else {
        throw new Error('Erreur lors du chargement');
      }
    } catch (err) {
      setError('Erreur lors du chargement des vidéos.');
      setVideos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const checkSearchServiceHealth = async () => {
    try {
      const health = await searchService.checkHealth();
      setSearchServiceHealth(health);
    } catch (error) {
      console.error('Erreur vérification santé service recherche:', error);
      setSearchServiceHealth({ status: 'unhealthy', error: error.message });
    }
  };

  const toggleTaskCompletion = async (taskId) => {
    try {
      const taskToUpdate = videos.find(t => t.id === taskId);
      if (!taskToUpdate) return;
      
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !taskToUpdate.completed }),
      });

      if (response.ok) {
        fetchVideos(); // Recharger les vidéos
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      fetchVideos();
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchVideos(); // Recharger les vidéos
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      fetchVideos();
    }
  };

  const addTask = async (taskData) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        fetchVideos(); // Recharger les vidéos
      }
    } catch (err) {
      console.error('Erreur lors de la création:', err);
      fetchVideos();
    }
  };

  const moveTaskToBottom = (taskId) => {
    const taskToMove = videos.find(task => task.id === taskId);
    if (!taskToMove) return;
    
    setVideos(prevTasks => [
      ...prevTasks.filter(task => task.id !== taskId),
      taskToMove
    ]);
  };

  // Fonction pour soumettre le formulaire d'ajout de tâche
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation simple
    if (!newVideo.title.trim()) {
      alert('Veuillez saisir un titre pour la vidéo');
      return;
    }
    
    // Préparer les données de la vidéo
    const taskData = {
      title: newVideo.title,
      deadline: newVideo.deadline || 'Non définie',
      category: newVideo.category || 'Autre',
      priority: newVideo.priority,
      completed: false,
      status: newVideo.status,
      prompt: newVideo.prompt,
      script: newVideo.script
    };
    
    try {
      setIsLoading(true);
      
      // Envoyer la nouvelle vidéo au backend
      await addTask(taskData);
      
      // Réinitialiser le formulaire et fermer le modal
      setNewVideo({
        title: '',
        deadline: '',
        category: 'Orra Academy',
        priority: 'medium',
        status: 'a_tourner',
        prompt: '',
        script: ''
      });
      setShowModal(false);
    } catch (err) {
      console.error('Erreur lors de la création de la vidéo:', err);
      alert('Erreur lors de la création de la vidéo. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewVideo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Générer des vidéos avec l'IA
  const generateVideos = async () => {
    if (!prompt.trim()) {
      alert('Veuillez saisir un prompt ou une description pour générer des vidéos');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      // 🚀 Envoyer SEULEMENT vers N8N Webhook
      console.log('📡 Envoi du prompt vers N8N Webhook...');
      
      const webhookPayload = {
        event_type: "video_prompt_received",
        timestamp: new Date().toISOString(),
        source: "tasky_interface",
        data: {
          topic: prompt,
          target_audience: "créateurs de contenu",
          request_id: `video_${Date.now()}`,
          status: "prompt_received",
          next_action: "generate_script"
        },
        metadata: {
          generated_by: "Orra Academy - Tasky Interface",
          version: "1.0",
          user: "Maxens - CTO Orra Academy"
        }
      };

      const webhookResponse = await fetch('https://n8n.orra-academy.com/webhook/a91757b0-e982-4343-bcfd-87b807eb34d7', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Orra-Academy-Tasky/1.0'
        },
        body: JSON.stringify(webhookPayload)
      });

      if (webhookResponse.ok) {
        console.log('✅ Prompt envoyé avec succès vers N8N!');
        alert('✅ Prompt envoyé avec succès vers N8N!');
        
        // Réinitialiser le prompt après envoi réussi
        setPrompt('');
      } else {
        throw new Error(`Erreur HTTP ${webhookResponse.status}: ${webhookResponse.statusText}`);
      }
      
    } catch (err) {
      console.error('Erreur lors de l\'envoi vers N8N:', err);
      setError(`Erreur lors de l'envoi vers N8N: ${err.message}`);
      alert(`❌ Erreur lors de l'envoi vers N8N: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Ajouter une vidéo générée à la liste principale
  const addGeneratedVideo = async (task) => {
    const taskData = {
      title: task.text || task.title,
      deadline: task.deadline || 'Non définie',
      category: task.hashtags ? task.hashtags[0] : (task.category || 'Autre'),
      priority: task.eisenhower === 'important_urgent' ? 'high' : 
               task.eisenhower === 'important_not_urgent' ? 'medium' : 'low',
      completed: false,
      status: task.status || 'a_tourner',
      prompt: task.prompt || '',
      script: task.script || task.text || ''
    };
    
    try {
      setIsLoading(true);
      
      // Envoyer la vidéo au backend
      await addTask(taskData);
        
        // Retirer la vidéo de la liste des vidéos générées
        setGeneratedVideos(prev => prev.filter(t => t.id !== task.id));
        
        alert('Vidéo ajoutée avec succès !');
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la vidéo générée:', err);
      alert('Erreur lors de l\'ajout de la vidéo. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVideos = videos.filter(task => {
    if (filter === 'a_tourner') return task.status === 'a_tourner';
    if (filter === 'a_monter') return task.status === 'a_monter';
    if (filter === 'a_publier') return task.status === 'a_publier';
    if (filter === 'publie') return task.status === 'publie';
    return true; // 'all'
  });

  // Fonction pour déterminer la couleur de priorité
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour obtenir la couleur de catégorie
  const getCategoryColor = (category) => {
    if (!category) return 'bg-gray-500 text-white';
    
    switch (category.toLowerCase()) {
      case 'vidéo': return 'bg-blue-500 text-white';
      case 'organisation': return 'bg-purple-500 text-white';
      case 'productivité': return 'bg-green-500 text-white';
      case 'travailler': return 'bg-indigo-500 text-white';
      case 'suivi personnel': return 'bg-pink-500 text-white';
      case 'automatisation': return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const updateVideoStatus = async (videoId, newStatus) => {
    try {
      const response = await fetch(`/api/tasks/${videoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchVideos(); // Recharger les vidéos
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      fetchVideos();
    }
  };

  const moveVideoUp = (videoId) => {
    const currentIndex = videos.findIndex(v => v.id === videoId);
    if (currentIndex > 0) {
      const newVideos = [...videos];
      [newVideos[currentIndex], newVideos[currentIndex - 1]] = [newVideos[currentIndex - 1], newVideos[currentIndex]];
      setVideos(newVideos);
    }
  };

  const moveVideoDown = (videoId) => {
    const currentIndex = videos.findIndex(v => v.id === videoId);
    if (currentIndex < videos.length - 1) {
      const newVideos = [...videos];
      [newVideos[currentIndex], newVideos[currentIndex + 1]] = [newVideos[currentIndex + 1], newVideos[currentIndex]];
      setVideos(newVideos);
    }
  };

  const generateScriptForVideo = async (video) => {
    if (!video.prompt) {
      alert('Veuillez d\'abord ajouter un prompt pour cette vidéo');
      return;
    }

    setIsGenerating(true);
    try {
      // 1. Utiliser notre service de génération enrichi avec Brave Search
      console.log('🔍 Génération de script personnalisé pour:', video.prompt);
      
      const response = await fetch('/api/search/generate-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: video.prompt,
          target_audience: 'entrepreneurs',
          style: 'orra_academy',
          include_research: true
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const scriptData = await response.json();
      
      let generatedScript;
      if (scriptData.success && scriptData.script) {
        // Script personnalisé généré avec succès
        generatedScript = scriptData.script;
        console.log('✅ Script personnalisé généré avec recherche');
      } else {
        // Fallback avec script enrichi de base
        console.log('⚠️ Utilisation du script de base enrichi');
        generatedScript = generateOrraAcademyScript(video.prompt, video.title);
      }

      // 2. Mettre à jour la vidéo avec le script enrichi
      const updateData = { 
        script: generatedScript,
        research_data: scriptData.research_data ? JSON.stringify(scriptData.research_data) : null,
        enriched_with_search: scriptData.success || false
      };

      const updateResponse = await fetch(`/api/tasks/${video.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (updateResponse.ok) {
        fetchVideos();
        const message = scriptData.success 
          ? '✨ Script personnalisé généré avec recherche Brave Search !' 
          : '📝 Script de base généré avec succès !';
        alert(message);
      }
    } catch (err) {
      console.error('Erreur lors de la génération du script:', err);
      
      // Fallback complet en cas d'erreur
      const fallbackScript = generateOrraAcademyScript(video.prompt, video.title);
      
      const updateData = { 
        script: fallbackScript,
        research_data: null,
        enriched_with_search: false
      };

      try {
        const updateResponse = await fetch(`/api/tasks/${video.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });

        if (updateResponse.ok) {
          fetchVideos();
          alert('📝 Script de secours généré avec succès !');
        }
      } catch (updateErr) {
        console.error('Erreur lors de la sauvegarde:', updateErr);
        alert('Erreur lors de la génération du script');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Fonction pour générer un script de qualité Orra Academy
  const generateOrraAcademyScript = (prompt, title) => {
    const today = new Date().toLocaleDateString('fr-FR');
    
    return `${title || prompt} - Script Orra Academy

## Introduction (0-30s)
Salut tout le monde ! C'est Maxens, CTO de l'Orra Academy. 
Bienvenue sur notre chaîne ! Aujourd'hui, ${today}, on plonge dans ${prompt.toLowerCase()}.

Et croyez-moi, après avoir testé ça sur plus de 50 projets clients, j'ai des éléments de réponse très concrets !

## Corps principal (30s-4min)

### 1. Le contexte 2025
- Pourquoi cette question devient cruciale maintenant
- Les évolutions majeures du domaine
- Mon retour d'expérience chez Orra Academy

### 2. Les points essentiels
- Comprendre les fondamentaux
- Mise en pratique avec des cas concrets
- Cas d'usage professionnels que j'ai testés
- Bonnes pratiques et erreurs à éviter

### 3. Mon conseil d'expert
- Ce que je recommande selon votre profil
- Les outils que j'utilise vraiment
- ROI et résultats mesurables

## Call to action (4-4:30min)
Si tu veux maîtriser ça comme un pro, j'ai créé une formation complète sur ${prompt.toLowerCase()} sur Orra Academy.

Tout ce dont tu as besoin pour passer expert !
Lien en description : orra-academy.com

## Conclusion (4:30-5min)
Voilà les amis ! Maintenant tu as toutes les cartes en main.

Pose tes questions en commentaires, j'y réponds toujours !

À très bientôt pour un nouveau tuto !
Maxens 🚀`;
  };

  const enrichVideoWithResearch = async (videoId) => {
    const video = videos.find(v => v.id === videoId);
    if (!video || !video.prompt) {
      alert('Impossible d\'enrichir cette vidéo : prompt manquant');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('🔍 Enrichissement avec recherche pour:', video.prompt);
      const enrichedVideo = await searchService.enrichVideoWithResearch(video);
      
      if (enrichedVideo.research) {
        const response = await fetch(`/api/tasks/${videoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            script: enrichedVideo.script,
            research_data: JSON.stringify(enrichedVideo.research),
            enriched_with_search: true
          }),
        });

        if (response.ok) {
          fetchVideos();
          alert('Vidéo enrichie avec des recherches en ligne !');
        }
      }
    } catch (err) {
      console.error('Erreur lors de l\'enrichissement:', err);
      alert('Erreur lors de l\'enrichissement avec recherche');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTrendingSuggestions = async () => {
    setIsGenerating(true);
    try {
      console.log('🔍 Recherche de suggestions tendances...');
      const suggestions = await searchService.generateVideoSuggestions('IA automatisation N8N');
      
      if (suggestions.length > 0) {
        setGeneratedVideos(suggestions.map(suggestion => ({
          ...suggestion,
          script: `
# Script pour "${suggestion.title}"

## Introduction (0-30s)
Salut tout le monde ! Bienvenue sur Orra Academy. Aujourd'hui, on va découvrir ${suggestion.title.toLowerCase()}.

## Corps principal (30s-3min)
- Analyse des tendances actuelles
- Mise en pratique avec des exemples concrets
- Opportunités pour votre activité
- Conseils d'experts

## Call to action (3-3:30min)
Pour aller plus loin, découvrez notre formation complète sur orra-academy.com !

## Conclusion (3:30-4min)
À bientôt pour une nouvelle vidéo tendance !
          `
        })));
        
        alert(`${suggestions.length} suggestions de vidéos tendances générées !`);
      } else {
        alert('Aucune suggestion trouvée pour le moment');
      }
    } catch (err) {
      console.error('Erreur génération suggestions:', err);
      alert('Erreur lors de la génération de suggestions');
    } finally {
      setIsGenerating(false);
    }
  };

  const [expandedScripts, setExpandedScripts] = useState(new Set());

  const toggleScriptExpansion = (videoId) => {
    const newExpanded = new Set(expandedScripts);
    if (newExpanded.has(videoId)) {
      newExpanded.delete(videoId);
    } else {
      newExpanded.add(videoId);
    }
    setExpandedScripts(newExpanded);
  };

  const getStatusState = (status) => {
    return videoStates.find(state => state.key === status) || videoStates[0];
  };

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-futuristic">Mes Vidéos</h1>
        
        {/* Indicateur de santé de l'agent de recherche */}
        {searchServiceHealth && (
          <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            searchServiceHealth.status === 'healthy' 
              ? 'bg-green-100 text-green-800' 
              : searchServiceHealth.status === 'degraded'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {searchServiceHealth.status === 'healthy' && (
              <>
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                🔍 Agent de recherche actif
              </>
            )}
            {searchServiceHealth.status === 'degraded' && (
              <>
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                🔍 Agent de recherche limité
              </>
            )}
            {searchServiceHealth.status === 'unhealthy' && (
              <>
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                🔍 Agent de recherche indisponible
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Notification pour l'agent de recherche */}
      {searchServiceHealth && searchServiceHealth.status !== 'healthy' && (
        <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Agent de recherche Brave Search
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  L'agent de recherche enrichit automatiquement vos scripts avec des informations du web.
                  {searchServiceHealth.has_api_key === false && (
                    <span className="block mt-1">
                      <strong>Pour l'activer :</strong> Ajoutez votre clé API Brave Search dans le fichier backend/.env
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tabs */}
      <div className="mb-6 flex space-x-4 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 ${activeTab === 'list' ? 'border-b-2 border-black font-semibold' : 'text-gray-500'}`}
        >
          Liste de vidéos
        </button>
        <button 
          onClick={() => setActiveTab('generator')}
          className={`px-4 py-2 ${activeTab === 'generator' ? 'border-b-2 border-black font-semibold' : 'text-gray-500'}`}
        >
          Envoi vers N8N
        </button>
      </div>
      
      {activeTab === 'list' ? (
        <>
          {/* Filtres */}
          <div className="mb-6 flex space-x-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-black text-white' : 'bg-gray-100'}`}
            >
              Toutes
            </button>
            <button 
              onClick={() => setFilter('a_tourner')}
              className={`px-4 py-2 rounded-md ${filter === 'a_tourner' ? 'bg-black text-white' : 'bg-gray-100'}`}
            >
              À tourner
            </button>
            <button 
              onClick={() => setFilter('a_monter')}
              className={`px-4 py-2 rounded-md ${filter === 'a_monter' ? 'bg-black text-white' : 'bg-gray-100'}`}
            >
              À monter
            </button>
            <button 
              onClick={() => setFilter('a_publier')}
              className={`px-4 py-2 rounded-md ${filter === 'a_publier' ? 'bg-black text-white' : 'bg-gray-100'}`}
            >
              À publier
            </button>
            <button 
              onClick={() => setFilter('publie')}
              className={`px-4 py-2 rounded-md ${filter === 'publie' ? 'bg-black text-white' : 'bg-gray-100'}`}
            >
              Publiées
            </button>
          </div>
          
          {/* Liste des vidéos format tableau */}
          {isLoading && videos.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : (
            <div className="overflow-hidden shadow-sm rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vidéo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      État & Catégorie
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Échéance
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVideos.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                        Aucune vidéo {filter === 'a_tourner' ? 'à tourner' : filter === 'a_monter' ? 'à monter' : filter === 'a_publier' ? 'à publier' : 'publiée'} trouvée
                      </td>
                    </tr>
                  ) : (
                    filteredVideos.map(task => (
                      <motion.tr 
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="flex flex-col space-y-1">
                              <button
                                onClick={() => moveVideoUp(task.id)}
                                className="text-gray-400 hover:text-gray-600 text-xs"
                                title="Monter"
                              >
                                ▲
                              </button>
                              <button
                                onClick={() => moveVideoDown(task.id)}
                                className="text-gray-400 hover:text-gray-600 text-xs"
                                title="Descendre"
                              >
                                ▼
                              </button>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {task.text || task.title || 'Vidéo sans titre'}
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                {task.prompt && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    📝 Prompt
                                  </span>
                                )}
                                {task.script && (
                                  <button
                                    onClick={() => toggleScriptExpansion(task.id)}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200"
                                  >
                                    📝 Script {expandedScripts.has(task.id) ? '▼' : '▶'}
                                  </button>
                                )}
                                {!task.script && task.prompt && (
                                  <button
                                    onClick={() => generateScriptForVideo(task)}
                                    disabled={isGenerating}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50"
                                  >
                                    🤖 Générer script enrichi
                                  </button>
                                )}
                                {task.script && task.prompt && (
                                  <button
                                    onClick={() => enrichVideoWithResearch(task.id)}
                                    disabled={isGenerating}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 disabled:opacity-50"
                                  >
                                    🔍 Enrichir recherche
                                  </button>
                                )}
                              </div>
                              {expandedScripts.has(task.id) && task.script && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-2 p-3 bg-gray-50 rounded text-xs max-w-md overflow-auto max-h-40"
                                >
                                  <pre className="whitespace-pre-wrap text-gray-700">
                                    {task.script}
                                  </pre>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-2">
                            <select
                              value={task.status || 'a_tourner'}
                              onChange={(e) => updateVideoStatus(task.id, e.target.value)}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-black ${getStatusState(task.status).color}`}
                            >
                              {videoStates.map(state => (
                                <option key={state.key} value={state.key}>
                                  {state.emoji} {state.label}
                                </option>
                              ))}
                            </select>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                              {task.category || 'Autre'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {task.deadline && task.deadline !== 'Non définie' ? (
                            new Date(task.deadline).toLocaleDateString('fr-FR')
                          ) : (
                            'Non définie'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => toggleTaskCompletion(task.id)}
                              className={`p-1 rounded-full ${task.completed ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}`}
                              title={task.completed ? 'Marquer comme non terminée' : 'Marquer comme terminée'}
                            >
                              {task.completed ? '✅' : '⭕'}
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Supprimer"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Bouton d'ajout */}
          <div className="mt-8 flex justify-center">
            <button 
              className="px-6 py-3 bg-black text-white rounded-full flex items-center shadow-lg hover:bg-gray-800 transition-colors"
              onClick={() => setShowModal(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Ajouter une vidéo
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Générateur de vidéos IA */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Envoi de prompts vers N8N</h2>
            <p className="text-gray-600 mb-4">
              Envoyez vos prompts directement vers votre workflow N8N pour automatiser la génération de contenu.
            </p>
            
            <div className="mb-6">
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">Prompt ou description</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  name="prompt"
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-black focus:border-black sm:text-sm"
                  placeholder="Ex: Créer un tutoriel sur N8N, Expliquer les agents IA, Formation sur l'automatisation..."
                />
                <button
                  type="button"
                  onClick={generateVideos}
                  disabled={isGenerating}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none disabled:opacity-50"
                >
                  {isGenerating ? 'Envoi en cours...' : '📡 Envoyer vers N8N'}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">
                {error}
              </div>
            )}
            
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Intégration N8N Active</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Vos prompts sont directement envoyés vers votre workflow N8N pour traitement automatique.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Indicateur de chargement lors d'une opération */}
      {isLoading && videos.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-black text-white py-2 px-4 rounded-md shadow-lg">
          <div className="flex items-center">
            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Chargement...
          </div>
        </div>
      )}
      
      {/* Modal d'ajout de vidéo */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Fond semi-transparent */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowModal(false)}></div>

            {/* Centrage modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Contenu modal */}
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={() => setShowModal(false)}
                >
                  <span className="sr-only">Fermer</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">Ajouter une nouvelle vidéo</h3>
                  
                  <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {/* Titre */}
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">Titre</label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        placeholder="Entrez le titre de la vidéo"
                        value={newVideo.title}
                        onChange={handleChange}
                      />
                    </div>
                    
                    {/* Deadline */}
                    <div>
                      <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">Deadline</label>
                      <input
                        type="text"
                        name="deadline"
                        id="deadline"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        placeholder="Ex: 25 avril 2025"
                        value={newVideo.deadline}
                        onChange={handleChange}
                      />
                    </div>
                    
                    {/* Catégorie */}
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700">Catégorie</label>
                      <select
                        name="category"
                        id="category"
                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        value={newVideo.category}
                        onChange={handleChange}
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
                        name="priority"
                        id="priority"
                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        value={newVideo.priority}
                        onChange={handleChange}
                      >
                        <option value="low">Basse</option>
                        <option value="medium">Moyenne</option>
                        <option value="high">Haute</option>
                      </select>
                    </div>
                    
                    {/* État */}
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">État</label>
                      <select
                        name="status"
                        id="status"
                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        value={newVideo.status}
                        onChange={handleChange}
                      >
                        {videoStates.map(state => (
                          <option key={state.key} value={state.key}>{state.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Prompt */}
                    <div>
                      <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">Prompt</label>
                      <input
                        type="text"
                        name="prompt"
                        id="prompt"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        placeholder="Entrez le prompt pour la vidéo"
                        value={newVideo.prompt}
                        onChange={handleChange}
                      />
                    </div>
                    
                    {/* Script */}
                    <div>
                      <label htmlFor="script" className="block text-sm font-medium text-gray-700">Script</label>
                      <input
                        type="text"
                        name="script"
                        id="script"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        placeholder="Entrez le script pour la vidéo"
                        value={newVideo.script}
                        onChange={handleChange}
                      />
                    </div>
                    
                    {/* Boutons */}
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                      <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm"
                        onClick={() => setShowModal(false)}
                      >
                        Annuler
                      </button>
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
                        ) : 'Ajouter'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks; 