import React, { useState, useEffect } from 'react';

// Utiliser des clés uniques pour éviter l'avertissement React
const DAYS = [
  { key: 'mon', label: 'L' }, 
  { key: 'tue', label: 'M' }, 
  { key: 'wed', label: 'M' }, 
  { key: 'thu', label: 'J' }, 
  { key: 'fri', label: 'V' }, 
  { key: 'sat', label: 'S' }, 
  { key: 'sun', label: 'D' }
];

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const CalendarWidget = ({ tasks = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendar, setCalendar] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateEvents, setDateEvents] = useState([]);

  // Générer le calendrier
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Premier jour du mois
    const firstDay = new Date(year, month, 1);
    // Dernier jour du mois
    const lastDay = new Date(year, month + 1, 0);
    
    // Jour de la semaine du premier jour (0 = Dimanche, 1 = Lundi, etc.)
    let startDay = firstDay.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1; // Ajuster pour que Lundi soit le premier jour
    
    const daysInMonth = lastDay.getDate();
    
    // Tableau pour stocker tous les jours à afficher
    const days = [];
    
    // Ajouter les jours du mois précédent pour compléter la première semaine
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        currentMonth: false
      });
    }
    
    // Ajouter les jours du mois en cours
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        currentMonth: true,
        today: new Date(year, month, i).toDateString() === new Date().toDateString()
      });
    }
    
    // Ajouter les jours du mois suivant pour compléter la dernière semaine
    const remainingDays = 42 - days.length; // 6 semaines x 7 jours = 42
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        currentMonth: false
      });
    }
    
    // Organiser en semaines
    const calendarWeeks = [];
    for (let i = 0; i < days.length; i += 7) {
      calendarWeeks.push(days.slice(i, i + 7));
    }
    
    setCalendar(calendarWeeks);
  }, [currentDate]);

  // Mettre à jour les événements pour la date sélectionnée
  useEffect(() => {
    if (!tasks || !tasks.length) {
      setDateEvents([]);
      return;
    }

    const events = tasks.filter(task => {
      if (!task.deadline) return false;
      const taskDate = new Date(task.deadline);
      return (
        taskDate.getDate() === selectedDate.getDate() &&
        taskDate.getMonth() === selectedDate.getMonth() &&
        taskDate.getFullYear() === selectedDate.getFullYear()
      );
    });

    setDateEvents(events);
  }, [selectedDate, tasks]);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const formatDate = (date) => {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('fr-FR', options);
  };

  const hasTasks = (date) => {
    if (!tasks || !tasks.length) return false;
    
    return tasks.some(task => {
      if (!task.deadline) return false;
      const taskDate = new Date(task.deadline);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="text-center mb-4">
        <div className="flex justify-between items-center mb-2">
          <button 
            onClick={prevMonth}
            className="text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button 
            onClick={nextMonth}
            className="text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map(day => (
            <div key={day.key} className="text-xs font-medium text-gray-500">
              {day.label}
            </div>
          ))}
        </div>
        
        {calendar.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1 mb-1">
            {week.map((day, dayIndex) => {
              const hasTasksForDay = hasTasks(day.date);
              return (
                <button
                  key={dayIndex}
                  onClick={() => setSelectedDate(day.date)}
                  className={`
                    w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center
                    ${day.currentMonth ? 'text-gray-800' : 'text-gray-400'}
                    ${day.today ? 'bg-black text-white' : ''}
                    ${!day.today && selectedDate.toDateString() === day.date.toDateString() ? 'bg-teal-500 text-white' : ''}
                    ${hasTasksForDay && !(day.today || selectedDate.toDateString() === day.date.toDateString()) ? 'ring-2 ring-teal-200' : ''}
                    hover:bg-gray-100
                  `}
                >
                  {day.date.getDate()}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          {formatDate(selectedDate)}
        </h3>
        
        {dateEvents.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucune tâche prévue</p>
        ) : (
          <ul className="space-y-3">
            {dateEvents.map(event => (
              <li key={event.id} className="bg-teal-50 p-3 rounded-lg border-l-4 border-teal-500">
                <p className="text-sm font-medium text-gray-800">{event.text}</p>
                <div className="flex items-center mt-1">
                  <svg className="w-4 h-4 text-teal-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-teal-600">{event.estimated_time || "Sans durée"}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CalendarWidget; 