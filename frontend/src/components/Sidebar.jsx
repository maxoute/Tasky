import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const Sidebar = ({ onThemeSelect, popularThemes = [], recentThemes = [] }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    setShowThemes(false);
  };
  
  const toggleThemes = (e) => {
    e.preventDefault();
    setShowThemes(!showThemes);
  };

  const handleThemeClick = (theme) => {
    if (onThemeSelect) {
      onThemeSelect(theme);
    }
    setShowThemes(false);
  };

  const navItems = [
    {
      path: '/',
      name: 'Tableau de bord',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      ),
    },
    {
      path: '/tasks',
      name: 'Tâches',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      ),
    },
    {
      path: '/habits',
      name: 'Suivi des habitudes',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      ),
    },
    {
      path: '/weekly-report',
      name: 'Revue Hebdomadaire',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M12 20v-6M6 20V10M18 20V4" />
        </svg>
      ),
    },
    {
      path: '/smart-objectives',
      name: 'Objectifs SMART',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
        </svg>
      ),
    },
    {
      path: '/ai-agents',
      name: 'Agents IA',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
          <circle cx="7.5" cy="14.5" r="1.5"/>
          <circle cx="16.5" cy="14.5" r="1.5"/>
        </svg>
      ),
    },
  ];

  return (
    <div 
      className={`sidebar ${collapsed ? 'w-16' : 'w-64'}`}
      style={{
        transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-700">
        {!collapsed && (
          <div className="flex items-center">
            <div className="text-2xl font-bold font-mono tracking-tighter mr-2">TASK.</div>
            <div className="h-5 w-5 bg-white rounded-full animate-pulse"></div>
          </div>
        )}
        <button 
          onClick={toggleSidebar} 
          className="p-1 rounded-full hover:bg-gray-700 transition-colors"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            className="w-5 h-5"
          >
            {collapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>

      <div className="py-6">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`
            }
          >
            <div className="mr-3 flex-shrink-0">{item.icon}</div>
            {!collapsed && <span>{item.name}</span>}
            {!collapsed && location.pathname === item.path && (
              <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
            )}
          </NavLink>
        ))}

        {!collapsed && onThemeSelect && (
          <div className="mt-4 mx-2">
            <button
              onClick={toggleThemes}
              className="sidebar-item w-full text-left"
            >
              <div className="mr-3 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </div>
              <span>Thèmes</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`ml-auto w-4 h-4 transition-transform ${showThemes ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {showThemes && (
              <div className="py-1 pl-10 pr-2 space-y-1 animate-fadeInUp">
                {recentThemes.length > 0 && (
                  <>
                    <p className="text-xs text-gray-400 uppercase mt-2 mb-1">Récents</p>
                    {recentThemes.map((theme, index) => (
                      <button
                        key={`recent-${index}`}
                        onClick={() => handleThemeClick(theme)}
                        className="w-full text-left py-1 px-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
                      >
                        {theme}
                      </button>
                    ))}
                  </>
                )}
                
                {popularThemes.length > 0 && (
                  <>
                    <p className="text-xs text-gray-400 uppercase mt-3 mb-1">Populaires</p>
                    {popularThemes.map((theme, index) => (
                      <button
                        key={`popular-${index}`}
                        onClick={() => handleThemeClick(theme)}
                        className="w-full text-left py-1 px-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
                      >
                        {theme}
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className={`flex ${collapsed ? 'justify-center' : 'justify-between'} items-center`}>
          {!collapsed && <span className="text-xs text-gray-400">v1.0.2</span>}
          <div className="flex items-center">
            <button className="p-1 rounded-full hover:bg-gray-700 transition-colors">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-5 h-5"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 