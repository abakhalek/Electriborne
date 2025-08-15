import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import StatsCard from '../../components/StatsCard';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ProtectedRoute from '../../components/ProtectedRoute';
import { 
   
   
  FileText, 
   
  Clock, 
  CheckCircle2,
  AlertTriangle,
  Calendar,
  
  
  User,
  MapPin,
  Phone,
  Navigation,
  Camera,
  Play,
  Pause,
  
  ArrowRight,
  Plus,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../../services/apiService';

const TechDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    let interval: number | null = null;
    
    if (activeTimer) {
      interval = window.setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.dashboard.getTechnicianDashboard();
      setDashboardData(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des données du tableau de bord.');
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
      accepted: { color: 'bg-blue-100 text-blue-800', label: 'Acceptée' },
      'in-progress': { color: 'bg-primary-100 text-primary-800', label: 'En cours' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Terminée' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Annulée' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: 'bg-gray-100 text-gray-800', label: 'Faible' },
      normal: { color: 'bg-blue-100 text-blue-800', label: 'Normale' },
      high: { color: 'bg-orange-100 text-orange-800', label: 'Élevée' },
      urgent: { color: 'bg-red-100 text-red-800', label: 'Urgente' },
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const acceptMission = async (missionId: string) => {
    try {
      await apiService.missions.update(missionId, { status: 'accepted' });
      toast.success('Mission acceptée');
      fetchDashboardData();
    } catch (error) {
      toast.error('Erreur lors de l\'acceptation de la mission');
    }
  };

  const startMission = async (missionId: string) => {
    try {
      await apiService.missions.update(missionId, { status: 'in-progress' });
      setActiveTimer(missionId);
      setTimerSeconds(0);
      toast.success('Mission démarrée');
      fetchDashboardData();
    } catch (error) {
      toast.error('Erreur lors du démarrage de la mission');
    }
  };

  const pauseMission = async (missionId: string) => {
    try {
      await apiService.missions.update(missionId, { status: 'pending' });
      setActiveTimer(null);
      toast.success('Mission mise en pause');
      fetchDashboardData();
    } catch (error) {
      toast.error('Erreur lors de la mise en pause de la mission');
    }
  };

  const completeMission = async (missionId: string) => {
    try {
      await apiService.missions.update(missionId, { status: 'completed' });
      setActiveTimer(null);
      toast.success('Mission terminée avec succès');
      fetchDashboardData();
      
      // Ask if additional quote is needed
      setTimeout(() => {
        if (window.confirm('Souhaitez-vous créer un devis complémentaire pour cette mission?')) {
          navigate(`/tech/quotes/create/${missionId}`);
        }
      }, 500);
    } catch (error) {
      toast.error('Erreur lors de la finalisation de la mission');
    }
  };

  const openNavigation = (address: string) => {
    // Open navigation app
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
  };

  const formatTimer = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading || !dashboardData) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Technicien
          </h1>
          <p className="text-gray-600">Vos missions et planning du jour</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Missions Aujourd'hui"
            value={dashboardData.todayMissionsCount.toString()}
            icon={Calendar}
            change={`${dashboardData.pendingMissionsCount} en attente`}
            changeType="neutral"
            color="primary"
          />
          <StatsCard
            title="Temps Estimé"
            value={dashboardData.estimatedTime}
            icon={Clock}
            change="Planning optimisé"
            changeType="positive"
            color="secondary"
          />
          <StatsCard
            title="Missions Terminées"
            value={dashboardData.completedMissionsCount.toString()}
            icon={CheckCircle2}
            change="Cette semaine"
            changeType="positive"
            color="success"
          />
          <StatsCard
            title="Satisfaction"
            value={`${dashboardData.satisfaction}/5`}
            icon={User}
            change="Excellent travail !"
            changeType="positive"
            color="warning"
          />
        </div>

        {/* Active Mission Timer */}
        {activeTimer && (
          <Card className="p-6 bg-primary-50 border border-primary-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-primary-900">Mission en cours</h3>
                <p className="text-primary-700">
                  {dashboardData.todayMissions.find((m: any) => m._id === activeTimer)?.type}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-primary-700 font-mono">
                  {formatTimer(timerSeconds)}
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => pauseMission(activeTimer)}>
                    <Pause className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => completeMission(activeTimer)}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Terminer
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Today's Missions */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary-600" />
              Missions du Jour - {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/tech/schedule')}>
              Voir planning complet
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="space-y-6">
            {dashboardData.todayMissions.map((mission: any) => (
              <div key={mission._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{`${mission.clientId.firstName} ${mission.clientId.lastName}`}</h4>
                    <p className="text-sm text-gray-600">{mission.serviceType?.name}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(mission.status)}
                    {getPriorityBadge(mission.priority)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="font-medium">{new Date(mission.scheduledDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{mission.clientId?.address || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{mission.clientId?.phone || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
                  </div>
                </div>

                {/* Quote info if available */}
                {mission.quote && (
                  <div className="bg-blue-50 p-3 rounded-lg mb-4">
                    <div className="flex items-center text-sm text-blue-700">
                      <FileText className="w-4 h-4 mr-2 text-blue-600" />
                      <span>Devis associé: {mission.quote.quoteNumber}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/tech/quotes/view/${mission.quote._id}`)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Voir
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openNavigation(mission.clientId.address)}
                    >
                      <Navigation className="w-4 h-4 mr-1" />
                      Itinéraire
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Phone className="w-4 h-4 mr-1" />
                      Appeler
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    {mission.status === 'pending' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => acceptMission(mission._id)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Accepter
                      </Button>
                    )}
                    {mission.status === 'accepted' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => startMission(mission._id)}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Commencer
                      </Button>
                    )}
                    {mission.status === 'in-progress' && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => pauseMission(mission._id)}
                        >
                          <Pause className="w-4 h-4 mr-1" />
                          Pause
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => completeMission(mission._id)}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Terminer
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions & Recent Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="primary" 
                className="flex flex-col items-center p-4 h-auto"
                onClick={() => navigate('/tech/technical-report')}
              >
                <FileText className="w-8 h-8 mb-2" />
                <span className="text-sm">Rapport Technique</span>
              </Button>
              <Button 
                variant="secondary" 
                className="flex flex-col items-center p-4 h-auto"
                onClick={() => navigate('/tech/missions')}
              >
                <Camera className="w-8 h-8 mb-2" />
                <span className="text-sm">Photos Intervention</span>
              </Button>
              <Button 
                variant="warning" 
                className="flex flex-col items-center p-4 h-auto"
                onClick={() => navigate('/tech/messages')}
              >
                <AlertTriangle className="w-8 h-8 mb-2" />
                <span className="text-sm">Signaler Problème</span>
              </Button>
              <Button 
                variant="success" 
                className="flex flex-col items-center p-4 h-auto"
                onClick={() => navigate('/tech/missions')}
              >
                <CheckCircle2 className="w-8 h-8 mb-2" />
                <span className="text-sm">Terminer Mission</span>
              </Button>
            </div>
          </Card>

          {/* Recent Reports */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary-600" />
                Rapports Récents
              </h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/tech/reports')}>
                Voir tous les rapports
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-4">
              {dashboardData.recentReports.map((report: any) => (
                <div key={report._id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{`${report.mission.clientId.firstName} ${report.mission.clientId.lastName}`}</p>
                      <p className="text-sm text-gray-600">{report.mission.type}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      {getStatusBadge(report.status)}
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    <Camera className="w-3 h-3 mr-1 text-gray-400" />
                    <span className="text-xs text-gray-500">{report.photos.length} photos</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Notifications & Availability */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Items */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">À traiter</h3>
            <div className="space-y-4">
              {dashboardData.pendingQuotesCount > 0 && (
                <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-yellow-600 mr-3" />
                    <div>
                      <p className="font-medium text-yellow-800">Devis en attente</p>
                      <p className="text-sm text-yellow-700">{dashboardData.pendingQuotesCount} devis à finaliser</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/tech/quotes')}
                  >
                    Voir
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
              
              {dashboardData.unreadMessagesCount > 0 && (
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-blue-800">Messages non lus</p>
                      <p className="text-sm text-blue-700">{dashboardData.unreadMessagesCount} messages à lire</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/tech/messages')}
                  >
                    Voir
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
              
              {dashboardData.pendingQuotesCount === 0 && dashboardData.unreadMessagesCount === 0 && (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-green-800 font-medium">Tout est à jour !</p>
                  <p className="text-sm text-green-600">Vous n'avez aucun élément en attente</p>
                </div>
              )}
            </div>
          </Card>

          {/* Availability Status */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Statut de Disponibilité</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/tech/availability')}
              >
                Gérer
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className={`w-3 h-3 ${dashboardData.availabilityStatus === 'available' ? 'bg-success-500' : 'bg-warning-500'} rounded-full mr-2`}></div>
              <span className="text-sm font-medium text-gray-900">
                {dashboardData.availabilityStatus === 'available' ? 'Disponible' : 'Indisponible'}
              </span>
            </div>
            
            {dashboardData.nextDayOff && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-blue-800">Prochaine indisponibilité</p>
                    <p className="text-sm text-blue-700">
                      {new Date(dashboardData.nextDayOff).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <Button 
              className="w-full mt-4"
              onClick={() => navigate('/tech/availability')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une indisponibilité
            </Button>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

const ProtectedTechDashboard = () => (
  <ProtectedRoute roles={['technician']}>
    <TechDashboard />
  </ProtectedRoute>
);

export default ProtectedTechDashboard;