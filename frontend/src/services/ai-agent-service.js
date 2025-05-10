import axios from 'axios';

// Création d'une instance axios configurée pour les appels API
const apiClient = axios.create({
  baseURL: 'http://localhost:8000',  // Pointer vers le backend FastAPI
  timeout: 30000, // Augmenter le timeout pour permettre au LLM de générer une réponse
  headers: {
    'Content-Type': 'application/json',
  }
});

// Ajouter un intercepteur pour afficher les requêtes et réponses
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🔄 Requête API: ${config.method.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('❌ Erreur lors de la préparation de la requête:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ Réponse API reçue: ${response.status}`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Erreur de réponse API:', error.response || error.message || error);
    return Promise.reject(error);
  }
);

// Données locales pour le mode de secours
const LOCAL_AGENTS = [
  {
    id: 'business',
    name: 'YC Advisor',
    description: 'Conseiller inspiré par les startups Y Combinator et les principes Lean Startup',
    avatar: '👨‍💼',
    prompt: 'Tu es un agent d\'IA spécialisé dans le conseil business, inspiré par les pratiques des meilleures startups Y Combinator.'
  },
  {
    id: 'jobs',
    name: 'Steve Jobs',
    description: 'Conseiller inspiré par la vision produit et le leadership de Steve Jobs',
    avatar: '🍎',
    prompt: 'Tu es un agent d\'IA inspiré par Steve Jobs, co-fondateur d\'Apple et visionnaire dans la conception de produits révolutionnaires.'
  },
  {
    id: 'hormozi',
    name: 'Alex Hormozi',
    description: 'Expert moderne en acquisition clients et création d\'offres irrésistibles',
    avatar: '💰',
    prompt: 'Tu es un agent d\'IA inspiré par Alex Hormozi, entrepreneur moderne et expert en acquisition clients et monétisation.'
  },
  {
    id: 'webinaire',
    name: 'Webinar Expert',
    description: 'Stratégiste en webinaires à fort taux de conversion inspiré par les meilleurs marketers',
    avatar: '🎙️',
    prompt: 'Tu es un expert en webinaires à haute conversion, inspiré par les méthodes de Russell Brunson, Dean Graziosi, Amy Porterfield et Sam Ovens.'
  }
];

// Base de données en mémoire
const LOCAL_DB = {
  conversations: [],
  messages: [],
  nextId: 1,
  contextHistory: {} // Pour stocker l'historique des conversations par ID
};

// Génère un UUID simple pour les identifiants locaux
function generateId() {
  return `local-${LOCAL_DB.nextId++}`;
}

// Génère une réponse locale basée sur le type d'agent et la requête
function generateLocalResponse(agentId, content, conversationId) {
  const contentLower = content.toLowerCase();
  const keywords = contentLower.split(' ').filter(word => word.length > 3).slice(0, 2).join(' et ');
  
  // Récupérer l'historique de la conversation
  const conversationHistory = LOCAL_DB.contextHistory[conversationId] || [];
  let contextPrefix = "";
  
  // Si on a un historique, l'inclure dans le préambule de la réponse
  if (conversationHistory.length > 0) {
    contextPrefix = "Voici notre échange précédent:\n\n";
    conversationHistory.forEach((exchange, index) => {
      if (index < conversationHistory.length - 1) { // On exclut la dernière question qui est la question actuelle
        contextPrefix += `QUESTION: ${exchange.question}\n`;
        contextPrefix += `RÉPONSE: ${exchange.answer}\n\n`;
      }
    });
    contextPrefix += "En tenant compte de cet échange, voici ma réponse à votre nouvelle question:\n\n";
  }
  
  // Réponses spécifiques pour l'agent webinaire
  if (agentId === 'webinaire') {
    // Analyse de réponse ou de contenu de webinaire
    if (contentLower.includes('analyse') || contentLower.includes('analyser') || contentLower.includes('évaluer') || 
        contentLower.includes('améliorer') || contentLower.includes('réviser') || contentLower.includes('commenter') ||
        contentLower.includes('critique') || contentLower.includes('critiquer') || contentLower.match(/^que penses-tu de/)) {
        
      // Extraire le contenu à analyser
      const textToAnalyze = content.replace(/analyse[zr]?|évalue[zr]?|améliore[zr]?|révise[zr]?|commente[zr]?|critique[zr]?|que penses-tu de|qu'en penses-tu|ton avis sur/gi, '').trim();
      
      if (textToAnalyze.length < 10) {
        return `Pour que je puisse analyser votre contenu de webinaire, veuillez partager le texte complet que vous souhaitez faire évaluer (script, email, titre, etc.). Plus vous me donnerez de détails, plus mon analyse sera pertinente.`;
      }
      
      // Analyse du type de contenu
      let analysisType = "contenu de webinaire";
      if (textToAnalyze.length < 100) {
        if (textToAnalyze.includes('?')) {
          analysisType = "titre/accroche";
        } else {
          analysisType = "titre ou courte description";
        }
      } else if (textToAnalyze.includes('@') || contentLower.includes('email') || textToAnalyze.includes('cher') || textToAnalyze.includes('bonjour')) {
        analysisType = "email";
      } else if (textToAnalyze.includes('module') || textToAnalyze.includes('€') || textToAnalyze.includes('euros') || textToAnalyze.includes('prix') || textToAnalyze.includes('offre')) {
        analysisType = "offre commerciale";
      } else if (textToAnalyze.includes('slide') || textToAnalyze.split('\n').length > 10) {
        analysisType = "script de présentation";
      }
      
      // Analyse générale du contenu
      const contentLength = textToAnalyze.length;
      const sentenceCount = textToAnalyze.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
      const avgSentenceLength = contentLength / Math.max(1, sentenceCount);
      const paragraphCount = textToAnalyze.split('\n\n').filter(p => p.trim().length > 0).length;
      const includesBenefits = textToAnalyze.includes('bénéfice') || textToAnalyze.includes('avantage') || textToAnalyze.includes('résultat') || textToAnalyze.includes('obtenir');
      const includesCallToAction = textToAnalyze.includes('cliquez') || textToAnalyze.includes('inscrivez') || textToAnalyze.includes('réservez') || textToAnalyze.includes('maintenant') || textToAnalyze.includes('participez');
      const includesUrgency = textToAnalyze.includes('limite') || textToAnalyze.includes('fin') || textToAnalyze.includes('dernière') || textToAnalyze.includes('aujourd\'hui') || textToAnalyze.includes('demain');
      const includesTestimonial = textToAnalyze.includes('client') || textToAnalyze.includes('témoignage') || textToAnalyze.includes('résultat');
      const includesNumbers = /\d+[k€$]|\d+%|\d+ jours|\d+ semaines|\d+ mois/i.test(textToAnalyze);
      
      // Génération de l'analyse
      let analysis = `# Analyse de votre ${analysisType}\n\n`;
      
      // Points forts
      analysis += "## Points forts\n\n";
      let strengthsCount = 0;
      
      if (includesBenefits) {
        analysis += "✅ Vous mettez bien en avant les bénéfices/résultats pour l'audience\n";
        strengthsCount++;
      }
      
      if (includesCallToAction) {
        analysis += "✅ Présence d'un call-to-action clair qui guide l'audience vers l'action\n";
        strengthsCount++;
      }
      
      if (includesUrgency) {
        analysis += "✅ Utilisation efficace de l'urgence/rareté pour motiver à l'action immédiate\n";
        strengthsCount++;
      }
      
      if (includesTestimonial) {
        analysis += "✅ Inclusion de preuve sociale/témoignages qui renforcent la crédibilité\n";
        strengthsCount++;
      }
      
      if (includesNumbers) {
        analysis += "✅ Utilisation de chiffres spécifiques qui rendent votre message concret et crédible\n";
        strengthsCount++;
      }
      
      if (avgSentenceLength < 20 && avgSentenceLength > 5) {
        analysis += "✅ Phrases de bonne longueur, faciles à comprendre à l'oral\n";
        strengthsCount++;
      }
      
      if (paragraphCount > 1 && analysisType !== "titre/accroche") {
        analysis += "✅ Bonne structure avec paragraphes distincts qui facilitent la compréhension\n";
        strengthsCount++;
      }
      
      if (strengthsCount === 0) {
        analysis += "Aucun point fort majeur identifié selon mes critères d'analyse.\n";
      }
      
      // Points d'amélioration
      analysis += "\n## Points d'amélioration\n\n";
      let improvementsCount = 0;
      
      if (!includesBenefits) {
        analysis += "⚠️ Mettez davantage l'accent sur les bénéfices concrets pour l'audience plutôt que sur les caractéristiques\n";
        improvementsCount++;
      }
      
      if (!includesCallToAction && analysisType !== "titre/accroche") {
        analysis += "⚠️ Ajoutez un call-to-action plus clair pour guider votre audience vers l'étape suivante\n";
        improvementsCount++;
      }
      
      if (!includesUrgency && (analysisType === "offre commerciale" || analysisType === "email")) {
        analysis += "⚠️ Intégrez un élément d'urgence ou de rareté pour encourager une action immédiate\n";
        improvementsCount++;
      }
      
      if (!includesTestimonial && (analysisType === "offre commerciale" || analysisType === "script de présentation")) {
        analysis += "⚠️ Incluez des témoignages ou résultats clients pour renforcer votre crédibilité\n";
        improvementsCount++;
      }
      
      if (!includesNumbers) {
        analysis += "⚠️ Utilisez des chiffres précis pour rendre votre message plus concret et crédible\n";
        improvementsCount++;
      }
      
      if (avgSentenceLength > 25) {
        analysis += "⚠️ Vos phrases sont trop longues (moyenne de " + Math.round(avgSentenceLength) + " caractères). Raccourcissez-les pour plus d'impact à l'oral\n";
        improvementsCount++;
      }
      
      if (paragraphCount <= 1 && contentLength > 200 && analysisType !== "titre/accroche") {
        analysis += "⚠️ Structurez mieux votre contenu en paragraphes distincts pour faciliter la lecture et la compréhension\n";
        improvementsCount++;
      }
      
      if (improvementsCount === 0) {
        analysis += "Je ne vois pas d'améliorations majeures à suggérer selon mes critères d'analyse.\n";
      }
      
      // Recommandations spécifiques selon le type de contenu
      analysis += "\n## Recommandations personnalisées\n\n";
      
      if (analysisType === "titre/accroche") {
        analysis += "Pour optimiser votre titre/accroche de webinaire:\n\n";
        analysis += "1. Intégrez un résultat chiffré précis (ex: 'Comment générer 10K€ en 30 jours')\n";
        analysis += "2. Ajoutez un élément de délai (ex: 'en 4 semaines', 'en 60 jours')\n";
        analysis += "3. Éliminez un obstacle majeur (ex: 'même sans audience', 'sans compétences techniques')\n";
        analysis += "4. Testez 3-5 variations et mesurez les taux d'inscription pour identifier le plus performant\n";
      } 
      else if (analysisType === "email") {
        analysis += "Pour optimiser votre email de webinaire:\n\n";
        analysis += "1. Utilisez un objet court (35-50 caractères) avec élément de curiosité ou bénéfice clair\n";
        analysis += "2. Commencez par une accroche forte dès la première ligne\n";
        analysis += "3. Utilisez format conversationnel et phrases courtes (comme si vous parliez à un ami)\n";
        analysis += "4. Ajoutez un PS qui renforce le bénéfice principal ou crée de l'urgence\n";
        analysis += "5. Incluez au moins 2-3 liens vers votre page d'inscription\n";
      }
      else if (analysisType === "offre commerciale") {
        analysis += "Pour optimiser votre présentation d'offre:\n\n";
        analysis += "1. Structurez clairement vos modules/composants avec bénéfices associés\n";
        analysis += "2. Créez un 'value stack' impressionnant en attribuant une valeur monétaire à chaque élément\n";
        analysis += "3. Intégrez une garantie forte qui élimine le risque\n";
        analysis += "4. Ajoutez 2-3 bonus exclusifs avec accès limité dans le temps\n";
        analysis += "5. Répétez votre call-to-action au moins 3 fois avec instructions très claires\n";
      }
      else if (analysisType === "script de présentation") {
        analysis += "Pour optimiser votre script de présentation:\n\n";
        analysis += "1. Commencez par établir votre crédibilité rapidement (résultats, pas diplômes)\n";
        analysis += "2. Intégrez plus d'histoires personnelles pour créer une connexion émotionnelle\n";
        analysis += "3. Créez des 'pattern interrupts' tous les 8-10 minutes pour maintenir l'attention\n";
        analysis += "4. Posez des questions rhétoriques pour garder l'audience engagée\n";
        analysis += "5. Prévoyez des transitions fluides entre les sections, notamment vers l'offre\n";
      }
      else {
        analysis += "Pour optimiser votre contenu de webinaire:\n\n";
        analysis += "1. Structurez votre contenu avec un cadre clair: problème → solution → preuve → offre\n";
        analysis += "2. Concentrez-vous sur 3-5 points-clés maximum (évitez la surcharge d'information)\n";
        analysis += "3. Intégrez plus d'exemples concrets et d'histoires pour illustrer vos points\n";
        analysis += "4. Prévoyez des moments d'interaction avec l'audience toutes les 5-7 minutes\n";
        analysis += "5. Créez une transition naturelle vers votre offre qui découle logiquement du contenu\n";
      }
      
      // Conclusion positive
      analysis += "\n## Conclusion\n\n";
      if (strengthsCount > improvementsCount) {
        analysis += "Votre contenu est globalement bien construit. Avec les ajustements suggérés, vous pourriez significativement augmenter son efficacité et votre taux de conversion.";
      } else if (improvementsCount > strengthsCount) {
        analysis += "Votre contenu a du potentiel mais nécessite quelques ajustements importants pour maximiser son impact. Concentrez-vous d'abord sur les 2-3 points d'amélioration les plus importants mentionnés ci-dessus.";
      } else {
        analysis += "Votre contenu présente un bon équilibre entre points forts et axes d'amélioration. En travaillant sur les suggestions ci-dessus, vous pourrez rapidement optimiser son efficacité et augmenter vos résultats.";
      }
      
      // Ajouter le préfixe d'historique à la réponse
      return contextPrefix + analysis;
    }
    
    // Réponses thématiques pour les questions courantes sur les webinaires
    
    // Structure du webinaire
    if (contentLower.includes('structure') || contentLower.includes('plan') || contentLower.includes('organiser')) {
      return `Pour structurer efficacement votre webinaire, je recommande ce modèle éprouvé qui convertit à plus de 15% en moyenne:
      
1. Introduction (5 min) : Présentez-vous et établissez votre crédibilité rapidement avec vos résultats concrets
2. Le Problème (10 min) : Amplifiez la douleur du problème que votre audience ressent
3. La Solution (15 min) : Présentez votre méthode/système en étapes claires (3-5 étapes)
4. La Preuve (15 min) : Partagez des études de cas et témoignages frappants
5. L'Offre (15 min) : Présentez votre offre et sa valeur exceptionnelle
6. Levée des objections (10 min) : Anticipez et répondez aux 3-5 objections principales
7. Création d'urgence (5 min) : Bonus limités dans le temps, places limitées
8. Q&R (15-20 min) : Répondez aux questions tout en renforçant votre offre

Assurez-vous de maintenir un rythme dynamique et d'inclure des histoires personnelles qui créent une connexion émotionnelle.`;
    }
    
    // Titre et accroche
    if (contentLower.includes('titre') || contentLower.includes('accroche') || contentLower.includes('sujet') || 
        contentLower.includes('hook') || contentLower.includes('attirer')) {
      return `Pour créer un titre de webinaire irrésistible qui garantit un taux d'inscription élevé, suivez cette formule :

[RÉSULTAT SPÉCIFIQUE] + [DÉLAI] + [SANS INCONVÉNIENT MAJEUR]

Exemples concrets qui convertissent à plus de 40% :
• "Comment générer 10 000€ de ventes en 30 jours avec vos webinaires, même sans audience"
• "Le système en 5 étapes pour créer un tunnel de vente automatisé en 2 semaines, même si vous détestez la technique"
• "Comment vendre vos formations à plus de 1000€ lors de vos webinaires sans paraître commercial"

N'oubliez pas que votre titre doit :
- Promettre un bénéfice mesurable et désirable
- Éliminer le risque perçu ("même si...")
- Créer un sentiment d'urgence avec un délai
- Être spécifique et crédible (évitez les promesses irréalistes)

Testez plusieurs variantes et mesurez les taux d'inscription pour optimiser.`;
    }
    
    // Landing page et inscription
    if (contentLower.includes('landing') || contentLower.includes('inscription') || contentLower.includes('page') || 
        contentLower.includes('convertir') || contentLower.includes('inscrire')) {
      return `Pour maximiser les inscriptions à votre webinaire, votre landing page doit suivre cette structure précise :

1. Headline puissant : Utilisez la formule [RÉSULTAT]+[DÉLAI]+[SANS INCONVÉNIENT]
2. Sous-headline : Clarifiez exactement comment le webinaire va résoudre leur problème
3. Date et heure : Créez de l'urgence avec un compte à rebours
4. 3-5 bénéfices clés : Formulés avec "Vous découvrirez..." ou "Vous apprendrez..."
5. Éléments de preuve : Logos clients, témoignages vidéo courts, résultats chiffrés
6. Bio courte : Établissez votre crédibilité en 3-4 lignes (résultats, pas diplômes)
7. CTA puissant : Gros bouton contrastant avec texte d'action (ex: "Je réserve ma place")
8. Garantie de valeur : "Si vous n'apprenez pas X, je vous offre Y"
9. Scarcité légitime : "Places limitées à 100 participants" ou "Bonus pour les 50 premiers"

Points techniques essentiels :
- Formulaire simple (email uniquement, pas de friction)
- Optimisation mobile obligatoire (60% des inscriptions viennent du mobile)
- Page rapide (<3 secondes de chargement)
- Retargeting pixel installé pour les visiteurs non-inscrits

Les meilleures landing pages de webinaire convertissent entre 25% et 45%.`;
    }
    
    // Emails et séquence
    if (contentLower.includes('email') || contentLower.includes('séquence') || contentLower.includes('sequence') || 
        contentLower.includes('relance') || contentLower.includes('invitation')) {
      return `Voici la séquence email optimale pour maximiser les participations et ventes de votre webinaire :

AVANT LE WEBINAIRE:
• J-7 : Email d'annonce - Présentez la promesse principale et un aperçu des bénéfices
• J-5 : Email de valeur - Partagez un contenu gratuit lié au sujet pour établir votre expertise
• J-3 : Email témoignage - Histoire de réussite d'un client qui a appliqué votre méthode
• J-1 : Email de rappel - Rappel avec l'heure + teaser sur ce qu'ils vont apprendre
• Jour J (matin) : Email "C'est aujourd'hui" - Créez l'excitation et l'anticipation
• Jour J (1h avant) : Email "On commence bientôt" - Lien + rappel des bénéfices

APRÈS LE WEBINAIRE:
• J+1 : Email replay - Pour ceux qui ont manqué + première offre limitée (24h)
• J+2 : Email témoignage - Preuve sociale avec résultats d'un client
• J+3 : Email objection - Levez l'objection principale à l'achat
• J+4 : Email dernier jour - Créez l'urgence pour la fin de l'offre
• J+5 : Email "dernières heures" - Amplifiez l'urgence avec countdown

CONSEILS CLÉS:
• Objets courts (35-50 caractères) et intrigants
• Personnalisez avec prénom dans l'objet (+22% d'ouverture)
• Corps en format conversationnel (comme si vous écriviez à un ami)
• Toujours inclure un CTA clair dans chaque email
• Utilisez la rareté et l'urgence de façon authentique et éthique

Cette séquence génère typiquement 65-75% de participation live et un taux de conversion global de 12-18% sur l'offre.`;
    }
    
    // Scripts de vente
    if (contentLower.includes('script') || contentLower.includes('vente') || contentLower.includes('offre') || 
        contentLower.includes('présentation') || contentLower.includes('pitch')) {
      return `Voici le script de présentation d'offre qui convertit à plus de 15% dans les webinaires à haute performance:

PARTIE 1: TRANSITION (2 min)
"Maintenant que vous avez vu comment [RÉSULTAT PRINCIPAL], je vais vous présenter comment accélérer ces résultats avec mon programme [NOM DU PROGRAMME]..."

PARTIE 2: PRÉSENTATION DU PROGRAMME (5 min)
- Nommez votre méthode/système clairement (ex: "La Méthode PRIME")
- Présentez les modules/étapes avec bénéfices spécifiques pour chacun
- Expliquez pourquoi votre approche est différente des autres

PARTIE 3: CONCRÉTISATION (3 min)
"Concrètement, voici ce que vous recevez..."
- Listez tous les éléments (modules, coachings, bonus, communauté)
- Associez une valeur monétaire à chaque élément
- Créez un "value stack" impressionnant (total élevé)

PARTIE 4: PRIX ET GARANTIE (3 min)
- Présentez d'abord le prix "normal" puis le prix spécial
- Offrez une garantie forte qui élimine le risque
- Expliquez pourquoi ce prix est une évidence comparé aux résultats

PARTIE 5: BONUS LIMITÉS (3 min)
- 2-3 bonus exclusifs pour ceux qui agissent maintenant
- Créez de l'urgence légitime (places limitées, temps limité)
- Expliquez pourquoi vous limitez l'offre

PARTIE 6: APPEL À L'ACTION (2 min)
- Donnez des instructions claires pour commander
- Répétez l'URL ou le processus d'achat 3 fois minimum
- Faites un résumé concis de tout ce qu'ils obtiennent

CONSEILS CRUCIAUX:
- Ne vous excusez JAMAIS de faire une offre
- Parlez avec conviction et enthousiasme
- Répétez que c'est une opportunité, pas une "vente"
- Utilisez des histoires de transformation de clients

Ce script a été perfectionné après plus de 500 webinaires à plus de 7 figures.`;
    }
    
    // Techniques d'engagement
    if (contentLower.includes('engagement') || contentLower.includes('participation') || contentLower.includes('interaction') || 
        contentLower.includes('questions') || contentLower.includes('attentif')) {
      return `Pour maintenir un engagement maximal pendant votre webinaire et éviter les départs prématurés, utilisez ces 7 techniques éprouvées:

1. PATTERN INTERRUPTS (toutes les 10 min)
   • Changez soudainement de ton ou de rythme
   • Posez une question surprenante
   • Partagez une statistique choquante
   • Utilisez des analogies inattendues

2. ENGAGEMENT ACTIF
   • Posez des questions qui nécessitent une réponse dans le chat
   • Faites-le compléter une phrase ("Tapez 1 si vous...")
   • Créez des sondages interactifs pendant la présentation
   • Demandez-leur de prendre des notes actives

3. OPEN LOOPS STRATÉGIQUES
   • Annoncez un contenu à venir sans le dévoiler ("Plus tard, je vais vous montrer...")
   • Promettez un bonus secret pour ceux qui restent jusqu'à la fin
   • Créez du mystère autour d'une technique spécifique

4. STORYTELLING ÉMOTIONNEL
   • Intégrez des histoires personnelles de transformation
   • Utilisez la structure "Avant/Obstacle/Après" pour vos exemples
   • Partagez des échecs vulnérables suivis de réussites

5. VARIATIONS VISUELLES
   • Alternez entre votre visage, slides, et partage d'écran
   • Utilisez des animations et transitions (sans excès)
   • Préparez des slides visuellement impactants (images > texte)

6. OBJECTION HANDLING PRÉVENTIF
   • Anticipez et adressez les doutes courants avant qu'ils n'apparaissent
   • Utilisez "Je sais ce que vous pensez..." pour créer une connexion

7. SEED DROPS STRATÉGIQUES
   • Semez des références à votre offre tout au long du webinaire
   • Mentionnez des résultats de clients en lien avec le contenu actuel

Le webinaire parfait maintient 85-90% de l'audience jusqu'à la partie vente et au moins 70% jusqu'à la fin.`;
    }
    
    // Réponses générales sur les webinaires si aucune correspondance spécifique
    const webinarResponses = [
      `Pour optimiser votre webinaire sur ${keywords || 'ce sujet'}, suivez ces 5 principes fondamentaux:

1. PRÉPARATION: Testez votre équipement technique 24h avant et préparez un plan B en cas de problème
2. STRUCTURE: Suivez le format problème → solution → preuve → offre (60-90 min maximum)
3. ENGAGEMENT: Interagissez avec votre audience toutes les 5-7 minutes pour maintenir l'attention
4. OFFRE: Consacrez 20-25% du temps à présenter votre offre avec urgence légitime
5. SUIVI: Envoyez un replay dans les 24h avec une offre à durée limitée

Ces principes ont été validés sur plus de 1000 webinaires à fort taux de conversion.`,

      `Les erreurs fatales à éviter dans vos webinaires:

1. Trop de contenu théorique sans exemples concrets
2. Présentation désorganisée sans fil conducteur clair
3. Transition maladroite vers l'offre commerciale
4. Problèmes techniques non anticipés
5. Manque d'énergie et d'enthousiasme dans la présentation
6. Absence de call-to-action clairs tout au long du webinaire
7. Réponses vagues aux objections pendant la session Q&R

Évitez ces pièges et votre taux de conversion augmentera d'au moins 30%.`,

      `Pour un webinaire qui convertit à plus de 15%, voici les 4 piliers essentiels:

1. PROMESSE CLAIRE: Un titre qui communique un résultat précis dans un délai défini
2. CONTENU ACTIONNABLE: 3-5 techniques spécifiques que l'audience peut implémenter immédiatement
3. PREUVE SOCIALE: Minimum 3 études de cas ou témoignages avec résultats chiffrés
4. OFFRE IRRÉSISTIBLE: Une proposition à haute valeur perçue avec une urgence légitime

N'oubliez pas que 80% du succès d'un webinaire se joue dans la préparation et la promotion en amont.`,

      `La formule parfaite pour vendre à plus de 1000€ en webinaire:

1. Établissez votre autorité dès les 3 premières minutes
2. Partagez votre parcours personnel (échecs puis succès)
3. Enseignez une méthode propriétaire avec un nom mémorable
4. Montrez des résultats de clients ordinaires devenus extraordinaires
5. Présentez une offre structurée en modules clairs
6. Éliminez le risque avec une garantie forte
7. Créez une rareté authentique (places limitées, bonus temporaires)

Cette séquence a généré plus de 3,5 millions d'euros en ventes de programmes lors des 12 derniers mois.`,

      `Les trois métriques cruciales pour optimiser vos webinaires:

1. TAUX D'INSCRIPTION: Visez 35-45% sur votre page d'inscription
2. TAUX DE PRÉSENCE: Objectif 45-55% des inscrits (augmentez avec des séquences email)
3. TAUX DE CONVERSION: Standard de l'industrie 5-10%, experts 15-20%+

Pour doubler ces taux, testez: différents jours/heures, longueurs de webinaire, ratios contenu/vente, et formulations d'offres. Toujours faire des tests A/B.`,

      `Les 5 éléments psychologiques qui font vendre en webinaire:

1. RÉCIPROCITÉ: Donnez une valeur exceptionnelle avant de demander
2. AUTORITÉ: Démontrez votre expertise par des résultats, pas des diplômes
3. PREUVE SOCIALE: Montrez des témoignages de personnes similaires à votre audience
4. RARETÉ: Limitez les places ou la disponibilité de manière honnête
5. COHÉRENCE: Alignez votre offre parfaitement avec les problèmes identifiés

Intégrez ces 5 principes et votre taux de conversion augmentera de 40% minimum.`,

      `Pour une séquence post-webinaire qui maximise les ventes:

J+1: Email "Replay" avec 1-3 témoignages et lien vers l'offre
J+2: Email "Ce qu'ils ont obtenu" avec études de cas détaillées
J+3: Email "Réponses aux objections" adressant les 3 principales résistances
J+4: Email "Dernière chance" avec compte à rebours et incitatif final
J+5: Email "Fermeture" avec témoignage de transformation majeure

Cette séquence capture généralement 30-40% de ventes supplémentaires après le webinaire live.`
    ];
    
    // Ajouter le préfixe d'historique à la réponse
    return contextPrefix + webinarResponses[Math.floor(Math.random() * webinarResponses.length)];
  }
  
  // Réponses pour les autres agents
  const genericResponses = [
    `Merci pour votre question sur ${keywords || 'ce sujet'}. Je vous recommande d'adopter une approche méthodique et data-driven.`,
    "La clé du succès est d'itérer rapidement et d'obtenir des retours utilisateurs dès que possible.",
    "Concentrez-vous sur la création de valeur pour vos utilisateurs et le reste suivra naturellement."
  ];
  
  // Ajouter le préfixe d'historique à la réponse
  return contextPrefix + genericResponses[Math.floor(Math.random() * genericResponses.length)];
}

// Vérifier si une route est disponible
async function checkApiAvailability() {
  try {
    console.log('Vérification de disponibilité de l\'API...');
    const response = await apiClient.get('/api/health');
    console.log('API disponible:', response.status === 200);
    return response.status === 200;
  } catch (error) {
    console.error('API non disponible:', error.message || error);
    return false;
  }
}

/**
 * Service pour interagir avec les agents IA via l'API
 */
class AIAgentService {
  constructor() {
    this.axios = axios.create({
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    this.LOCAL_AGENTS = [
      {
        id: 'business',
        name: 'YC Advisor',
        description: 'Conseiller inspiré par les startups Y Combinator et les principes Lean Startup',
        avatar: '👨‍💼',
        prompt: 'Tu es un conseiller business expert, inspiré par les principes de Y Combinator.'
      },
      {
        id: 'jobs',
        name: 'Steve Jobs',
        description: 'Conseiller inspiré par la vision produit et le leadership de Steve Jobs',
        avatar: '🍎',
        prompt: 'Tu es Steve Jobs, visionnaire et perfectionniste, avec une approche centrée sur le design et l\'expérience utilisateur.'
      },
      {
        id: 'hormozi',
        name: 'Alex Hormozi',
        description: "Expert moderne en acquisition clients et création d'offres irrésistibles",
        avatar: '💰',
        prompt: 'Tu es un expert en acquisition client et en création d\'offres irrésistibles, inspiré par Alex Hormozi.'
      },
      {
        id: 'webinaire',
        name: 'Webinar Expert',
        description: "Stratégiste en webinaires à fort taux de conversion inspiré par les meilleurs marketers",
        avatar: '🎙️',
        prompt: 'Tu es un expert en création de webinaires à haute conversion et en marketing digital.'
      }
    ];
    
    this.LOCAL_DB = {
      conversations: {},
      messages: {}
    };
    
    this.useLocalMode = false;
    this.availableModels = [];
    this.currentModel = null;
    this.apiHealthCheckAttempts = 0;
    this.maxApiHealthCheckAttempts = 3;
    this.apiLastChecked = 0;
    this.apiCheckInterval = 30000; // 30 secondes
    
    // Vérifier si l'API est disponible au démarrage
    this.checkApi();
  }
  
  async checkApi() {
    try {
      // Éviter de vérifier trop souvent
      const now = Date.now();
      if (now - this.apiLastChecked < this.apiCheckInterval && this.apiHealthCheckAttempts > 0) {
        return this.useLocalMode;
      }
      
      this.apiLastChecked = now;
      
      // Vérifier si l'API est disponible
      const response = await this.axios.get('/health', { timeout: 5000 });
      if (response.status === 200) {
        if (this.useLocalMode) {
          console.log('✅ Backend disponible à nouveau, passage en mode API');
        }
        this.useLocalMode = false;
        this.apiHealthCheckAttempts = 0;
        
        // Si l'API est disponible, récupérer les modèles
        await this.fetchModels();
        
        return false; // API est disponible
      } else {
        this.fallbackToLocalMode('Réponse API non attendue', true);
        return true; // Utiliser le mode local
      }
    } catch (error) {
      return this.fallbackToLocalMode(error.message || 'Erreur de connexion', 
        ++this.apiHealthCheckAttempts >= this.maxApiHealthCheckAttempts);
    }
  }
  
  fallbackToLocalMode(reason, forceLocalMode = false) {
    if (!this.useLocalMode || forceLocalMode) {
      console.warn(`Mode LOCAL: Le backend n'est pas disponible (${reason}). Utilisation du mode local.`);
      this.useLocalMode = true;
      
      // Configurer les modèles par défaut en mode local
      this.availableModels = [
        {id: 'local', name: 'Mode Local', description: 'Réponses prédéfinies (backend non disponible)'}
      ];
      this.currentModel = 'local';
    }
    
    return true; // Indiquer que le mode local est actif
  }
  
  async fetchModels() {
    try {
      const response = await this.axios.get('/models', { timeout: 5000 });
      this.availableModels = response.data;
      
      if (this.availableModels.length > 0 && !this.currentModel) {
        this.currentModel = this.availableModels[0].id;
      }
      return this.availableModels;
    } catch (error) {
      console.warn('Erreur lors de la récupération des modèles:', error);
      // Définir des modèles par défaut en cas d'erreur
      this.availableModels = [
        {id: 'gpt-4.1-2025-04-14', name: 'GPT-4.1 Turbo', description: 'Le plus récent et puissant modèle'},
        {id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Modèle rapide et économique'}
      ];
      
      if (!this.currentModel && this.availableModels.length > 0) {
        this.currentModel = this.availableModels[0].id;
      }
      
      return this.availableModels;
    }
  }
  
  getModels() {
    return this.availableModels;
  }
  
  setCurrentModel(modelId) {
    // Vérifier si le modèle existe dans la liste des modèles disponibles
    const modelExists = this.availableModels.some(model => model.id === modelId);
    
    if (modelExists) {
      this.currentModel = modelId;
      return true;
    } else {
      console.warn(`Le modèle '${modelId}' n'existe pas. Le modèle actuel n'a pas été modifié.`);
      return false;
    }
  }
  
  getCurrentModel() {
    return this.currentModel;
  }

  async getAgents() {
    try {
      // Vérifier l'état de l'API si on est en mode local
      if (this.useLocalMode) {
        const stillUseLocalMode = await this.checkApi();
        if (stillUseLocalMode) {
          return this.LOCAL_AGENTS;
        }
      }
      
      const response = await this.axios.get('/agents', { timeout: 5000 });
      return response.data.agents;
    } catch (error) {
      console.warn('Erreur lors de la récupération des agents, utilisation des agents locaux:', error.message || error);
      this.fallbackToLocalMode(error.message || 'Erreur de récupération des agents');
      return this.LOCAL_AGENTS;
    }
  }

  async createConversation(userId, agentId) {
    try {
      // Vérifier l'état de l'API si on est en mode local
      if (this.useLocalMode) {
        const stillUseLocalMode = await this.checkApi();
        if (stillUseLocalMode) {
          return this.createLocalConversation(userId, agentId);
        }
      }
      
      const response = await this.axios.post('/conversations', {
        user_id: userId,
        agent_id: agentId
      }, { timeout: 5000 });
      
      return response.data;
    } catch (error) {
      console.warn('Erreur lors de la création de la conversation, passage en mode local:', error.message || error);
      this.fallbackToLocalMode(error.message || 'Erreur de création de conversation');
      
      // Créer une conversation locale
      return this.createLocalConversation(userId, agentId);
    }
  }
  
  createLocalConversation(userId, agentId) {
    const conversationId = `${agentId}-${Date.now()}`;
    this.LOCAL_DB.conversations[conversationId] = {
      id: conversationId,
      user_id: userId,
      agent_id: agentId,
      created_at: new Date().toISOString()
    };
    return this.LOCAL_DB.conversations[conversationId];
  }

  async sendMessage(conversationId, content, model = null) {
    if (!model && this.currentModel) {
      model = this.currentModel;
    }
    
    try {
      // Vérifier l'état de l'API si on est en mode local
      if (this.useLocalMode) {
        const stillUseLocalMode = await this.checkApi();
        if (stillUseLocalMode) {
          return this.sendLocalMessage(conversationId, content);
        }
      }
      
      const response = await this.axios.post('/messages', {
        conversation_id: conversationId,
        content: content,
        model: model
      }, { timeout: 30000 }); // Augmenter le timeout pour laisser le LLM générer une réponse
      
      return response.data;
    } catch (error) {
      // Si l'API est indisponible, basculer en mode local
      console.warn('Erreur lors de l\'envoi du message, passage en mode local:', error.message || error);
      this.fallbackToLocalMode(error.message || 'Erreur d\'envoi de message');
      
      // Envoyer un message local
      return this.sendLocalMessage(conversationId, content);
    }
  }
  
  sendLocalMessage(conversationId, content) {
    // Récupérer ou créer la conversation
    const conversation = this.LOCAL_DB.conversations[conversationId] || {
      id: conversationId,
      agent_id: 'business', // Agent par défaut si la conversation n'existe pas
      created_at: new Date().toISOString()
    };
    
    if (!this.LOCAL_DB.conversations[conversationId]) {
      this.LOCAL_DB.conversations[conversationId] = conversation;
    }
    
    // Trouver l'agent
    const agentId = conversation.agent_id;
    const agent = this.LOCAL_AGENTS.find(a => a.id === agentId) || this.LOCAL_AGENTS[0];
    
    // Ajouter le message utilisateur
    const userMessageId = `user-${Date.now()}`;
    const userMessage = {
      id: userMessageId,
      conversation_id: conversationId,
      role: 'user',
      content: content,
      created_at: new Date().toISOString()
    };
    
    if (!this.LOCAL_DB.messages[conversationId]) {
      this.LOCAL_DB.messages[conversationId] = [];
    }
    
    this.LOCAL_DB.messages[conversationId].push(userMessage);
    
    // Générer une réponse
    const response = this.generateLocalResponse(agent.id, content, conversationId);
    
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage = {
      id: assistantMessageId,
      conversation_id: conversationId,
      role: 'assistant',
      content: response,
      created_at: new Date().toISOString(),
      model: 'local'
    };
    
    this.LOCAL_DB.messages[conversationId].push(assistantMessage);
    
    // Stocker l'historique pour le contexte
    if (!this.LOCAL_DB.contextHistory[conversationId]) {
      this.LOCAL_DB.contextHistory[conversationId] = [];
    }
    
    this.LOCAL_DB.contextHistory[conversationId].push({
      question: content,
      answer: response
    });
    
    return {
      user_message: userMessage,
      assistant_message: assistantMessage,
      model_used: 'local'
    };
  }
  
  // Fonction pour générer des réponses locales basées sur l'agent et le contenu
  generateLocalResponse(agentId, userMessage, conversationId) {
    // Récupérer l'historique de la conversation
    const conversationHistory = this.LOCAL_DB.contextHistory[conversationId] || [];
    let contextPrefix = "";
    
    // Si on a un historique, l'inclure dans le préambule de la réponse
    if (conversationHistory.length > 0) {
      contextPrefix = "Voici notre échange précédent:\n\n";
      conversationHistory.forEach((exchange, index) => {
        if (index < conversationHistory.length - 1) { // On exclut la dernière question qui est la question actuelle
          contextPrefix += `QUESTION: ${exchange.question}\n`;
          contextPrefix += `RÉPONSE: ${exchange.answer}\n\n`;
        }
      });
      contextPrefix += "En tenant compte de cet échange, voici ma réponse à votre nouvelle question:\n\n";
    }
    
    // Réponses génériques pour chaque agent
    const responses = {
      business: [
        "D'après mon expérience avec les startups Y Combinator, je vous conseille de vous concentrer d'abord sur un marché de niche avant de vous étendre.",
        "Votre proposition a du potentiel, mais avez-vous validé le problème auprès de clients réels? C'est la première étape selon la méthode Lean Startup.",
        "Pour croître rapidement, concentrez-vous sur un seul canal d'acquisition client qui fonctionne bien, plutôt que de vous disperser.",
        "Votre modèle économique est intéressant, mais essayez d'augmenter votre LTV (valeur vie client) en proposant des services complémentaires.",
        "Pensez à appliquer la règle des 80/20 : identifiez les 20% de vos efforts qui produisent 80% des résultats et concentrez-vous dessus."
      ],
      jobs: [
        "La simplicité est la sophistication ultime. Concentrez-vous sur l'expérience utilisateur avant d'ajouter de nouvelles fonctionnalités.",
        "Ne demandez jamais aux clients ce qu'ils veulent, montrez-leur ce dont ils ont besoin avant même qu'ils ne le réalisent.",
        "Le design n'est pas seulement l'apparence, c'est comment ça fonctionne. Assurez-vous que votre produit est intuitif avant tout.",
        "L'innovation, c'est ce qui distingue un leader d'un suiveur. Osez penser différemment et remettre en question les normes établies.",
        "Concentrez-vous sur l'excellence. Les gens qui se soucient de la qualité veulent que vous soyez fier de votre travail."
      ],
      hormozi: [
        "Pour maximiser votre valeur, créez une offre irrésistible qui élimine le risque pour le client et apporte une transformation claire.",
        "Ne vendez pas des produits ou services, vendez des résultats. C'est ce que les clients veulent vraiment acheter.",
        "Trouvez un canal d'acquisition client que vous pouvez dominer et exploitez-le à fond avant de vous diversifier.",
        "Pour votre pricing, pensez à la valeur que vous apportez et non à vos coûts. Si vous résolvez un problème à 100K€, vous pouvez facturer 10K€ sans problème.",
        "Votre marketing doit se concentrer sur l'impact, pas sur la méthode. Les clients se soucient des résultats, pas de comment vous les obtenez."
      ],
      webinaire: [
        "Pour un webinaire à haute conversion, structurez-le en 3 parties: le problème, la solution et l'offre. Assurez-vous que 80% du contenu apporte une réelle valeur.",
        "Prévoyez des moments d'interaction toutes les 5-7 minutes pour maintenir l'engagement. Questions, sondages et exercices simples fonctionnent très bien.",
        "Votre séquence d'emails avant le webinaire devrait idéalement comporter 3 emails: annonce, rappel avec teasing de contenu, et rappel final 1h avant.",
        "Créez une urgence légitime pour votre offre: places limitées, bonus à durée limitée ou augmentation de prix imminente sont des classiques qui fonctionnent.",
        "Le titre de votre webinaire est crucial. Incluez un résultat spécifique et un délai pour attirer plus d'inscrits: 'Comment [résultat désirable] en [délai court] sans [obstacle commun]'."
      ]
    };
    
    // Réponses pour quand l'utilisateur pose une question sur l'application ou le backend
    const appResponses = [
      "Je suis actuellement en mode local car le backend semble indisponible. Veuillez vérifier que le serveur backend est bien démarré, assurez-vous que le fichier .env est correctement configuré et que les services sont opérationnels.",
      "Il semble y avoir un problème de connexion avec le backend. Vérifiez que le serveur FastAPI est bien démarré sur le port 8000 et que la configuration proxy dans package.json est correcte.",
      "Le mode local est activé car je ne peux pas me connecter au backend. Essayez de redémarrer le serveur backend avec `cd backend && python app_fastapi.py` pour résoudre ce problème.",
      "Je réponds en mode local car l'API est indisponible. Vérifiez les logs du serveur backend pour identifier d'éventuelles erreurs et assurez-vous que toutes les dépendances sont installées avec `pip install -r requirements.txt`."
    ];
    
    // Vérifier si la question concerne l'application elle-même
    const appKeywords = ['api', 'backend', 'serveur', 'connexion', 'erreur', 'problème', 'bug', 'ne fonctionne pas', 'ne marche pas'];
    
    if (appKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
      return contextPrefix + appResponses[Math.floor(Math.random() * appResponses.length)];
    }
    
    // Extraire des mots-clés pour personnaliser la réponse
    const contentLower = userMessage.toLowerCase();
    const keywords = contentLower.split(' ').filter(word => word.length > 3).slice(0, 2).join(' et ');
    
    // Réponses spécifiques pour l'agent webinaire
    if (agentId === 'webinaire' && userMessage.length > 100) {
      // Si c'est une question détaillée sur les webinaires, utiliser la fonction existante
      return generateLocalResponse(agentId, userMessage, conversationId);
    }
    
    // Sélectionner une réponse aléatoire pour l'agent
    const agentResponses = responses[agentId] || responses.business; // Utiliser business comme fallback
    return contextPrefix + agentResponses[Math.floor(Math.random() * agentResponses.length)];
  }
  
  // Méthode pour récupérer les messages d'une conversation
  async getConversationMessages(conversationId) {
    try {
      // Vérifier l'état de l'API si on est en mode local
      if (this.useLocalMode) {
        const stillUseLocalMode = await this.checkApi();
        if (stillUseLocalMode) {
          return this.LOCAL_DB.messages[conversationId] || [];
        }
      }
      
      const response = await this.axios.get(`/messages/conversation/${conversationId}`, { timeout: 5000 });
      return response.data.messages || [];
    } catch (error) {
      console.warn('Erreur lors de la récupération des messages, utilisation des messages locaux:', error.message || error);
      this.fallbackToLocalMode(error.message || 'Erreur de récupération des messages');
      return this.LOCAL_DB.messages[conversationId] || [];
    }
  }
}

const aiAgentService = new AIAgentService();
export default aiAgentService; 
