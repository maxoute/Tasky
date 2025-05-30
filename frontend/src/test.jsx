import React from 'react';
import ReactDOM from 'react-dom/client';

console.log('🧪 Test file loaded!');

function TestApp() {
  console.log('🧪 TestApp component rendering!');
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightgreen' }}>
      <h1>🎉 React fonctionne !</h1>
      <p>Si tu vois ce message, React se monte correctement.</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TestApp />);

console.log('🧪 Test app rendered!'); 