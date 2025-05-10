import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Components
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Tasks from './pages/Tasks';
import AIAgents from './pages/AIAgents';
import SmartObjectives from './pages/SmartObjectives';

// Styles
import './App.css';

function App() {
  const [selectedTheme, setSelectedTheme] = useState('');
  
  // Exemple de thèmes populaires et récents (à connecter avec le backend plus tard)
  const popularThemes = ['Productivité', 'Santé', 'Finance', 'Apprentissage'];
  const recentThemes = ['Marketing', 'Projet IA', 'Sport'];
  
  const handleThemeSelect = (theme) => {
    setSelectedTheme(theme);
    // TODO: Implémenter la génération de tâches basée sur le thème
    console.log('Thème sélectionné:', theme);
  };
  
  return (
    <Router>
      <div className="app-container bg-gray-50">
        <Sidebar 
          onThemeSelect={handleThemeSelect} 
          popularThemes={popularThemes}
          recentThemes={recentThemes}
        />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard selectedTheme={selectedTheme} />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/smart-objectives" element={<SmartObjectives />} />
            <Route path="/ai-agents" element={<AIAgents />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 