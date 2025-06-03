import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // styles globaux
import './tailwind-out.css'; // styles Tailwind générés
import App from './App';

console.log(' Index.jsx loaded - chargement du vrai App!');

const root = ReactDOM.createRoot(document.getElementById('root'));

console.log('🚀 Root created!');

// Supprimer le loader initial une fois React monté
const removeInitialLoader = () => {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.remove();
    console.log('🚀 Initial loader removed!');
  }
};

console.log('🚀 About to render App...');

root.render(<App />);

console.log('🚀 App rendered!');

// Supprimer le loader après un court délai pour s'assurer que React est monté
setTimeout(removeInitialLoader, 100); 