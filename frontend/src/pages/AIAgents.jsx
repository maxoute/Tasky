import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import aiAgentService from '../services/ai-agent-service';

const AIAgents = () => {
  const [selectedAgent, setSelectedAgent] = useState('business');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [conversation, setConversation] = useState([]);
  const [agents, setAgents] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [userId, setUserId] = useState('user-' + Math.random().toString(36).substring(2, 9)); // ID utilisateur temporaire
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);

  // Charger les agents disponibles et les modèles depuis l'API au chargement du composant
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Récupérer les agents
        const fetchedAgents = await aiAgentService.getAgents();
        
        // Récupérer les modèles
        const models = await aiAgentService.getModels();
        setAvailableModels(models);
        
        // Définir le modèle sélectionné par défaut
        const currentModel = aiAgentService.getCurrentModel();
        if (currentModel) {
          setSelectedModel(currentModel);
        } else if (models.length > 0) {
          setSelectedModel(models[0].id);
        }
        
        if (fetchedAgents && fetchedAgents.length > 0) {
          setAgents(fetchedAgents);
        } else {
          // Fallback si l'API ne répond pas
          console.warn('Impossible de récupérer les agents depuis l\'API, utilisation des agents par défaut');
          setAgents([
            {
              id: 'business',
              name: 'YC Advisor',
              description: 'Conseiller inspiré par les startups Y Combinator et les principes Lean Startup',
              avatar: '👨‍💼'
            },
            {
              id: 'jobs',
              name: 'Steve Jobs',
              description: 'Conseiller inspiré par la vision produit et le leadership de Steve Jobs',
              avatar: '🍎'
            },
            {
              id: 'hormozi',
              name: 'Alex Hormozi',
              description: "Expert moderne en acquisition clients et création d'offres irrésistibles",
              avatar: '💰'
            },
            {
              id: 'webinaire',
              name: 'Webinar Expert',
              description: "Stratégiste en webinaires à fort taux de conversion inspiré par les meilleurs marketers",
              avatar: '🎙️'
            }
          ]);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Mettre à jour le modèle sélectionné dans le service
  useEffect(() => {
    if (selectedModel) {
      aiAgentService.setCurrentModel(selectedModel);
    }
  }, [selectedModel]);

  // Démarrer une nouvelle conversation quand l'agent sélectionné change
  useEffect(() => {
    const startNewConversation = async () => {
      try {
        // Créer une nouvelle conversation avec l'agent sélectionné
        const newConversation = await aiAgentService.createConversation(userId, selectedAgent);
        if (newConversation) {
          setActiveConversation(newConversation);
          setConversation([]); // Réinitialiser la conversation
        }
      } catch (error) {
        console.error('Erreur lors de la création d\'une nouvelle conversation:', error);
      }
    };

    if (agents.length > 0) {
      startNewConversation();
    }
  }, [selectedAgent, userId, agents.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim() || isLoading || !activeConversation) return;
    
    // Ajouter la question à la conversation locale pour l'affichage immédiat
    const newMessage = { role: 'user', content: prompt };
    const updatedConversation = [...conversation, newMessage];
    setConversation(updatedConversation);
    
    try {
      setIsLoading(true);
      
      // Envoyer le message à l'API et obtenir la réponse
      const result = await aiAgentService.sendMessage(activeConversation.id, prompt, selectedModel);
      
      if (result) {
        // Ajouter la réponse à la conversation locale
        const assistantMessage = { 
          role: result.assistant_message.role, 
          content: result.assistant_message.content,
          model: result.model_used || selectedModel
        };
        setConversation([...updatedConversation, assistantMessage]);
        setResponse(result.assistant_message.content);
      } else {
        // En cas d'erreur, afficher un message d'erreur
        const errorMessage = { 
          role: 'assistant', 
          content: "Je suis désolé, je n'ai pas pu traiter votre message. Veuillez réessayer ultérieurement." 
        };
        setConversation([...updatedConversation, errorMessage]);
        setResponse(errorMessage.content);
      }
      
      setPrompt('');
    } catch (error) {
      console.error('Erreur lors de la génération de la réponse:', error);
      // Afficher un message d'erreur spécifique dans la conversation
      const errorContent = error.message || "Une erreur est survenue lors du traitement de votre message. Veuillez vérifier que le backend est bien démarré et que votre clé API OpenAI est valide.";
      
      const errorMessage = { 
        role: 'assistant', 
        content: errorContent
      };
      setConversation([...updatedConversation, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer la touche Entrée pour envoyer le message
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Empêche l'insertion d'un saut de ligne
      handleSubmit(e); // Soumet le formulaire
    }
  };

  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
  };

  return (
    <div className="py-8 pl-2 pr-4 max-w-[96%] mx-auto">
      <h1 className="text-3xl font-bold mb-8 font-futuristic ml-4 lg:ml-2">Agents IA</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Sidebar agents */}
        <div className="col-span-1 lg:col-span-4 lg:pl-0">
          <div className="neo-card lg:border-l-0 lg:rounded-l-none lg:mr-2">
            <h2 className="text-xl font-semibold mb-4 p-4 pb-2">Agents disponibles</h2>
            <div className="space-y-1">
              {agents.map(agent => (
                <div 
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  className={`flex items-center p-3 cursor-pointer ${
                    selectedAgent === agent.id ? 'bg-black text-white' : 'bg-white'
                  }`}
                >
                  <div className="text-2xl mr-3 flex-shrink-0">{agent.avatar}</div>
                  <div className="w-full">
                    <h3 className="font-medium">{agent.name}</h3>
                    <p className="text-xs opacity-75 break-words">{agent.description}</p>
                  </div>
                </div>
              ))}
              
              {/* Emplacement pour les futurs agents */}
              <div className="border-t border-gray-200 p-3 flex items-center">
                <div className="text-2xl mr-3 flex-shrink-0 opacity-50">🔮</div>
                <div>
                  <h3 className="font-medium text-gray-400">Plus d'agents bientôt...</h3>
                  <p className="text-xs text-gray-400">D'autres agents seront ajoutés</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sélecteur de modèle */}
          {availableModels.length > 0 && (
            <div className="neo-card mt-4 p-4">
              <h3 className="font-semibold mb-2">Modèle LLM</h3>
              <select 
                value={selectedModel || ''} 
                onChange={handleModelChange}
                className="w-full p-2 border rounded-lg"
              >
                {availableModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name} - {model.description}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Sélectionnez le modèle à utiliser pour générer les réponses
              </p>
            </div>
          )}
        </div>
        
        {/* Agent principal et conversation */}
        <div className="col-span-1 lg:col-span-7 space-y-6 mt-4 lg:mt-0 lg:ml-2">
          {selectedAgent && (
            <>
              {/* Détails de l'agent */}
              <div className="neo-card p-6">
                <div className="flex items-center mb-4">
                  <div className="text-4xl mr-4">{agents.find(a => a.id === selectedAgent)?.avatar}</div>
                  <div>
                    <h2 className="text-2xl font-bold">{agents.find(a => a.id === selectedAgent)?.name}</h2>
                    <p className="text-gray-600">{agents.find(a => a.id === selectedAgent)?.description}</p>
                  </div>
                </div>
                <p className="text-sm bg-gray-50 p-3 rounded-lg">
                  {selectedAgent === 'business' && "Cet agent IA utilise les principes, stratégies et histoires de réussite des plus grandes startups de Y Combinator pour offrir des conseils business pertinents et actionnables."}
                  {selectedAgent === 'jobs' && "Cet agent IA s'inspire de la vision produit et du leadership de Steve Jobs pour vous aider à créer des produits exceptionnels axés sur l'expérience utilisateur et l'innovation."}
                  {selectedAgent === 'hormozi' && "Cet agent IA applique les méthodes d'Alex Hormozi en matière d'acquisition clients et de création d'offres irrésistibles pour maximiser votre valeur et votre impact commercial."}
                  {selectedAgent === 'webinaire' && "Cet agent IA est expert en création de webinaires à haute conversion, incarnant les meilleures stratégies des géants du marketing digital pour guider les participants à prendre des actions."}
                </p>
              </div>
              
              {/* Conversation */}
              <div className="neo-card p-6 min-h-[400px] flex flex-col">
                <div className="flex-grow overflow-y-auto mb-4 space-y-4">
                  {conversation.length === 0 ? (
                    <div className="text-center text-gray-400 py-12">
                      <div className="text-4xl mb-3">💬</div>
                      <p>Posez une question à l'agent pour commencer la conversation</p>
                    </div>
                  ) : (
                    conversation.map((message, index) => (
                      <div 
                        key={index}
                        className={`p-4 rounded-lg animate-fadeInUp ${
                          message.role === 'user' 
                            ? 'bg-gray-100 ml-12' 
                            : 'bg-black text-white mr-12'
                        }`}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mr-3 mt-1">
                            {message.role === 'user' ? (
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                👤
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center border border-white">
                                {agents.find(a => a.id === selectedAgent)?.avatar}
                              </div>
                            )}
                          </div>
                          <div className="flex-grow">
                            <div className="text-sm opacity-75 mb-1">
                              {message.role === 'user' ? 'Vous' : agents.find(a => a.id === selectedAgent)?.name}
                              {message.model && message.role === 'assistant' && (
                                <span className="ml-2 text-xs opacity-50">via {message.model}</span>
                              )}
                            </div>
                            <div style={{ whiteSpace: 'pre-line' }}>{message.content}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {isLoading && (
                    <div className="flex items-center p-4">
                      <div className="w-8 h-8 mr-4">
                        <div className="loading-spinner w-full h-full border-t-black"></div>
                      </div>
                      <span className="text-gray-500">L'agent réfléchit...</span>
                    </div>
                  )}
                </div>
                
                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="mt-auto">
                  <div className="relative">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Posez une question sur votre business, startup ou stratégie..."
                      className="neo-input w-full p-4 pr-12 rounded-lg resize-none"
                      rows="3"
                      disabled={isLoading}
                    ></textarea>
                    <button
                      type="submit"
                      className="absolute right-3 bottom-3 p-2 rounded-lg bg-black text-white disabled:opacity-50"
                      disabled={!prompt.trim() || isLoading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAgents; 