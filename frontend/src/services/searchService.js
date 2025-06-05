import axios from 'axios';

// Créer une instance API pour les recherches
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

class SearchService {
  /**
   * Effectue une recherche générale
   */
  async searchGeneral(query, options = {}) {
    try {
      const requestData = {
        query,
        count: options.count || 10,
        country: options.country || 'FR',
        search_lang: options.search_lang || 'fr',
        freshness: options.freshness || 'pm'
      };

      const response = await api.post('/search/general', requestData);
      return response.data;
    } catch (error) {
      console.error('Erreur recherche générale:', error);
      throw error;
    }
  }

  /**
   * Recherche spécifique pour enrichir le contenu d'une vidéo
   */
  async searchVideoContent(videoPrompt) {
    try {
      const response = await api.post('/search/video-research', {
        video_prompt: videoPrompt
      });
      return response.data;
    } catch (error) {
      console.error('Erreur recherche vidéo:', error);
      throw error;
    }
  }

  /**
   * Recherche des tendances et insights sur un sujet
   */
  async searchTrends(topic) {
    try {
      const response = await api.post('/search/trends', {
        topic
      });
      return response.data;
    } catch (error) {
      console.error('Erreur recherche tendances:', error);
      throw error;
    }
  }

  /**
   * Vérifie la santé du service de recherche
   */
  async checkHealth() {
    try {
      const response = await api.get('/search/health');
      return response.data;
    } catch (error) {
      console.error('Erreur health check recherche:', error);
      throw error;
    }
  }

  /**
   * Enrichit automatiquement une vidéo avec des recherches
   */
  async enrichVideoWithResearch(videoData) {
    try {
      const searchResults = await this.searchVideoContent(videoData.prompt);
      
      if (searchResults.success) {
        const research = searchResults.data;
        
        // Enrichir le script avec les informations trouvées
        const enrichedScript = this.enhanceScriptWithResearch(
          videoData.script, 
          research
        );
        
        return {
          ...videoData,
          script: enrichedScript,
          research: research,
          enriched_at: new Date().toISOString()
        };
      }
      
      return videoData;
    } catch (error) {
      console.error('Erreur enrichissement vidéo:', error);
      return videoData; // Retourner la vidéo originale en cas d'erreur
    }
  }

  /**
   * Améliore un script avec les données de recherche
   */
  enhanceScriptWithResearch(originalScript, research) {
    if (!research.research_summary) return originalScript;

    const { key_points, content_suggestions, trending_topics } = research.research_summary;
    
    let enhancedScript = originalScript;
    
    // Ajouter des points clés dans le corps principal
    if (key_points && key_points.length > 0) {
      const keyPointsSection = `

## Points clés à aborder :
${key_points.slice(0, 5).map(point => `- ${point}`).join('\n')}
`;
      
      enhancedScript = enhancedScript.replace(
        '## Corps principal',
        '## Corps principal' + keyPointsSection
      );
    }

    // Ajouter des suggestions de contenu
    if (content_suggestions && content_suggestions.length > 0) {
      const suggestionsSection = `

## Suggestions de contenu :
${content_suggestions.slice(0, 3).map(suggestion => `- ${suggestion}`).join('\n')}
`;
      
      enhancedScript += suggestionsSection;
    }

    // Ajouter les tendances si disponibles
    if (trending_topics && trending_topics.length > 0) {
      const trendsSection = `

## Tendances actuelles :
${trending_topics.slice(0, 2).map(trend => `- ${trend}`).join('\n')}
`;
      
      enhancedScript += trendsSection;
    }

    // Ajouter les sources
    if (research.sources && research.sources.length > 0) {
      const sourcesSection = `

## Sources de référence :
${research.sources.slice(0, 3).map(source => `- [${source.title}](${source.url})`).join('\n')}
`;
      
      enhancedScript += sourcesSection;
    }

    return enhancedScript;
  }

  /**
   * Génère des suggestions de vidéos basées sur les tendances
   */
  async generateVideoSuggestions(topic) {
    try {
      const trendsData = await this.searchTrends(topic);
      
      if (trendsData.success && trendsData.data.content_opportunities) {
        return trendsData.data.content_opportunities.map(opportunity => ({
          id: 'suggestion_' + Date.now() + Math.random(),
          title: opportunity,
          prompt: `Créer une vidéo sur : ${opportunity}`,
          category: 'Suggestion IA',
          priority: 'medium',
          status: 'a_tourner',
          generated_from_trends: true
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Erreur génération suggestions:', error);
      return [];
    }
  }
}

export const searchService = new SearchService(); 