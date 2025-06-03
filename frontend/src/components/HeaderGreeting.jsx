import React from 'react';

const HeaderGreeting = ({ username }) => {
  // Déterminer le moment de la journée pour adapter la salutation
  const getGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      return 'Bonjour';
    } else if (hour < 18) {
      return 'Bon après-midi';
    } else {
      return 'Bonsoir';
    }
  };

  return (
    <div className="flex items-center justify-between w-full">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          {getGreeting()}, <span className="text-black">{username || 'Maxens'}</span>
        </h2>
      </div>

      <div className="flex items-center">
        <div className="mr-4 text-right">
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>
        
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
          {username ? username.charAt(0).toUpperCase() : 'M'}
        </div>
      </div>
    </div>
  );
};

export default HeaderGreeting; 