import React, { useState } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ProtectedRoute from '../../components/ProtectedRoute';
import { 
  Calendar,
  Clock,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  X,
  ArrowLeft,
  ArrowRight,
  
  
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  type: 'unavailable' | 'vacation' | 'training';
}

const Availability: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [unavailableSlots, setUnavailableSlots] = useState<TimeSlot[]>([
    {
      id: '1',
      date: '2024-01-20',
      startTime: '09:00',
      endTime: '18:00',
      reason: 'Formation technique',
      type: 'training'
    },
    {
      id: '2',
      date: '2024-01-25',
      startTime: '14:00',
      endTime: '17:00',
      reason: 'Rendez-vous médical',
      type: 'unavailable'
    },
    {
      id: '3',
      date: '2024-02-01',
      startTime: '00:00',
      endTime: '23:59',
      reason: 'Congé',
      type: 'vacation'
    },
    {
      id: '4',
      date: '2024-02-02',
      startTime: '00:00',
      endTime: '23:59',
      reason: 'Congé',
      type: 'vacation'
    }
  ]);
  const [newSlot, setNewSlot] = useState<Omit<TimeSlot, 'id'>>({
    date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
    startTime: '09:00',
    endTime: '18:00',
    reason: '',
    type: 'unavailable'
  });

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getMonthData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1); i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const isDateUnavailable = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return unavailableSlots.some(slot => slot.date === dateStr);
  };

  const getUnavailableSlotsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return unavailableSlots.filter(slot => slot.date === dateStr);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setNewSlot(prev => ({
      ...prev,
      date: date.toISOString().split('T')[0]
    }));
  };

  const handleAddSlot = () => {
    setShowAddModal(true);
  };

  const handleSaveSlot = () => {
    if (!newSlot.reason) {
      toast.error('Veuillez indiquer une raison');
      return;
    }
    
    if (newSlot.startTime >= newSlot.endTime) {
      toast.error('L\'heure de fin doit être après l\'heure de début');
      return;
    }
    
    const newId = Date.now().toString();
    setUnavailableSlots(prev => [...prev, { ...newSlot, id: newId }]);
    setShowAddModal(false);
    toast.success('Indisponibilité ajoutée avec succès');
  };

  const handleDeleteSlot = (id: string) => {
    setUnavailableSlots(prev => prev.filter(slot => slot.id !== id));
    toast.success('Indisponibilité supprimée');
  };

  const handleSaveAvailability = () => {
    // Logic to save all availability settings
    toast.success('Disponibilités mises à jour avec succès');
  };

  const getSlotTypeColor = (type: string) => {
    switch (type) {
      case 'unavailable':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'vacation':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'training':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Calendar className="w-8 h-8 mr-3 text-primary-600" />
              Gestion des Disponibilités
            </h1>
            <p className="text-gray-600 mt-2">
              Définissez vos périodes d'indisponibilité et congés
            </p>
          </div>
          <Button onClick={handleSaveAvailability}>
            <Save className="w-4 h-4 mr-2" />
            Enregistrer les modifications
          </Button>
        </div>

        {/* Calendar and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <Button variant="ghost" onClick={() => navigateMonth('prev')}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Mois précédent
                </Button>
                <h2 className="text-xl font-semibold text-gray-900 capitalize">
                  {formatDate(currentDate)}
                </h2>
                <Button variant="ghost" onClick={() => navigateMonth('next')}>
                  Mois suivant
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
                  <div key={index} className="text-center font-medium text-gray-700 py-2">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {getMonthData().map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="h-24 bg-gray-50 rounded-lg"></div>;
                  }
                  
                  const isToday = day.toDateString() === new Date().toDateString();
                  const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
                  const isUnavailable = isDateUnavailable(day);
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={`h-24 p-2 rounded-lg border cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-primary-500 bg-primary-50 shadow-md' 
                          : isUnavailable
                          ? 'border-red-200 bg-red-50'
                          : isToday
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => handleDateClick(day)}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-sm font-medium ${
                          isToday ? 'text-blue-600' : 'text-gray-700'
                        }`}>
                          {day.getDate()}
                        </span>
                        {isUnavailable && (
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        )}
                      </div>
                      
                      {/* Show unavailable slots */}
                      <div className="mt-1 space-y-1">
                        {getUnavailableSlotsForDate(day).map((slot, idx) => (
                          <div 
                            key={idx} 
                            className={`text-xs px-1 py-0.5 rounded truncate ${
                              getSlotTypeColor(slot.type)
                            }`}
                          >
                            {slot.type === 'vacation' ? 'Congé' : 
                             slot.type === 'training' ? 'Formation' : 
                             `${slot.startTime}-${slot.endTime}`}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Selected Date Details */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-primary-600" />
                {selectedDate 
                  ? `Disponibilité du ${selectedDate.toLocaleDateString('fr-FR')}`
                  : 'Sélectionnez une date'
                }
              </h3>

              {selectedDate ? (
                <div className="space-y-4">
                  {getUnavailableSlotsForDate(selectedDate).length > 0 ? (
                    <div className="space-y-3">
                      {getUnavailableSlotsForDate(selectedDate).map((slot) => (
                        <div 
                          key={slot.id} 
                          className={`p-3 rounded-lg border ${getSlotTypeColor(slot.type)}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">
                                {slot.type === 'vacation' ? 'Journée entière (Congé)' : 
                                 slot.type === 'training' ? 'Formation' : 
                                 `${slot.startTime} - ${slot.endTime}`}
                              </p>
                              <p className="text-sm mt-1">{slot.reason}</p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteSlot(slot.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-green-50 rounded-lg">
                      <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="font-medium text-green-800">Disponible</p>
                      <p className="text-sm text-green-600 mb-4">Vous êtes disponible à cette date</p>
                    </div>
                  )}

                  <Button 
                    onClick={handleAddSlot}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une indisponibilité
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Sélectionnez une date dans le calendrier</p>
                </div>
              )}
            </Card>

            {/* Upcoming Unavailability */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Prochaines indisponibilités</h3>
              
              <div className="space-y-3">
                {unavailableSlots
                  .filter(slot => new Date(slot.date) >= new Date())
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(0, 5)
                  .map((slot) => (
                    <div 
                      key={slot.id} 
                      className={`p-3 rounded-lg border ${getSlotTypeColor(slot.type)}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {new Date(slot.date).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-sm">
                            {slot.type === 'vacation' ? 'Journée entière (Congé)' : 
                             slot.type === 'training' ? 'Formation' : 
                             `${slot.startTime} - ${slot.endTime}`}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">{slot.reason}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                
                {unavailableSlots.filter(slot => new Date(slot.date) >= new Date()).length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-gray-600">Aucune indisponibilité à venir</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Legend */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Légende</h3>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-sm">Indisponible</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm">Congé</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm">Formation</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-300 mr-2"></div>
                  <span className="text-sm">Aujourd'hui</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Unavailability Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Ajouter une indisponibilité
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={newSlot.date}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type d'indisponibilité
                </label>
                <select
                  value={newSlot.type}
                  onChange={(e) => setNewSlot(prev => ({ 
                    ...prev, 
                    type: e.target.value as 'unavailable' | 'vacation' | 'training',
                    // Set full day for vacation
                    startTime: e.target.value === 'vacation' ? '00:00' : prev.startTime,
                    endTime: e.target.value === 'vacation' ? '23:59' : prev.endTime
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="unavailable">Indisponibilité ponctuelle</option>
                  <option value="vacation">Congé</option>
                  <option value="training">Formation</option>
                </select>
              </div>
              
              {newSlot.type !== 'vacation' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heure de début
                    </label>
                    <input
                      type="time"
                      value={newSlot.startTime}
                      onChange={(e) => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heure de fin
                    </label>
                    <input
                      type="time"
                      value={newSlot.endTime}
                      onChange={(e) => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison
                </label>
                <input
                  type="text"
                  value={newSlot.reason}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Motif de l'indisponibilité"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => setShowAddModal(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSaveSlot}
              >
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Layout>
  );
};

const ProtectedAvailability = () => (
  <ProtectedRoute roles={['technician']}>
    <Availability />
  </ProtectedRoute>
);

export default ProtectedAvailability;