import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useApi } from '../../hooks/useApi';
import apiService from '../../services/apiService';
import { 
  Calendar,
  Clock,
  MapPin,
  Phone,
  Navigation,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2
} from 'lucide-react';

const Schedule: React.FC = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [missions, setMissions] = useState<any[]>([]);
  const { data, execute: fetchMissions } = useApi(apiService.missions.getAll);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  useEffect(() => {
    if (data) {
      setMissions(data.items);
    }
  }, [data]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
      accepted: { color: 'bg-blue-100 text-blue-800', label: 'Acceptée' },
      'in-progress': { color: 'bg-purple-100 text-purple-800', label: 'En cours' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Terminée' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Annulée' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'border-l-blue-500',
      normal: 'border-l-gray-500',
      high: 'border-l-orange-500',
      urgent: 'border-l-red-500'
    };
    return colors[priority as keyof typeof colors] || 'border-l-gray-500';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - startOfWeek.getDay() + 1); // Lundi

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const getMissionsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return (missions || []).filter(mission => {
      if (!mission || !mission.scheduledDate) {
        return false;
      }
      return new Date(mission.scheduledDate).toISOString().split('T')[0] === dateStr;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Calendar className="w-8 h-8 mr-3 text-primary-600" />
              Planning
            </h1>
            <p className="text-gray-600 mt-2">Gérez votre planning et vos missions</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'week' ? 'bg-bleu text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                Semaine
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'month' ? 'bg-bleu text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                Mois
              </button>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Mission
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => navigateWeek('prev')}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Précédent
            </Button>
            <h2 className="text-lg font-semibold text-gray-900">
              {formatDate(currentDate)}
            </h2>
            <Button variant="ghost" onClick={() => navigateWeek('next')}>
              Suivant
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>

        {/* Week View */}
        {viewMode === 'week' && (
          <div className="grid grid-cols-7 gap-4">
            {getWeekDays(currentDate).map((day, index) => {
              const dayMissions = getMissionsForDate(day);
              const isToday = day.toDateString() === new Date().toDateString();
              
              return (
                <Card key={index} className={`p-4 ${isToday ? 'ring-2 ring-primary-500' : ''}`}>
                  <div className="text-center mb-4">
                    <p className="text-sm font-medium text-gray-600">
                      {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                    </p>
                    <p className={`text-lg font-bold ${isToday ? 'text-primary-600' : 'text-gray-900'}`}>
                      {day.getDate()}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    {dayMissions.map((mission) => (
                      <div
                        key={mission.id}
                        className={`p-2 rounded-lg border-l-4 ${getPriorityColor(mission.priority)} bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors`}
                        //onClick={() => setSelectedDate(day)}
                      >
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {mission.client}
                        </p>
                        <p className="text-xs text-gray-600">
                          {mission.startTime} - {mission.endTime}
                        </p>
                        <div className="mt-1">
                          {getStatusBadge(mission.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Missions List */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Missions à venir</h3>
          <div className="space-y-4">
            {missions.map((mission) => (
              <div key={mission.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{mission.clientId?.firstName} {mission.clientId?.lastName}</h4>
                    <p className="text-sm text-gray-600">{mission.serviceType?.name}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(mission.status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{new Date(mission.scheduledDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{new Date(mission.scheduledDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{mission.clientId?.phone}</span>
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{mission.address}</span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <Navigation className="w-4 h-4 mr-1" />
                      Itinéraire
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Phone className="w-4 h-4 mr-1" />
                      Appeler
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => {
                      console.log('Navigating to mission:', mission);
                      navigate(`/tech/missions/${mission._id}`);
                    }}>
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                      console.log('Navigating to mission:', mission);
                      navigate(`/tech/missions/${mission._id}`);
                    }}>
                      <Edit2 className="w-4 h-4 mr-1" />
                      Modifier
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

const ProtectedSchedule = () => (
  <ProtectedRoute roles={['technician']}>
    <Schedule />
  </ProtectedRoute>
);

export default ProtectedSchedule;