import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import StatsCard from '../../components/StatsCard';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  Zap,
  Wrench,
  FileText,
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Eye,
  Download,
  MessageSquare,
  ArrowRight,
  
  
  Phone
} from 'lucide-react';
import toast from 'react-hot-toast';

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock dashboard data
      const mockData = {
        equipments: [
          {
            id: 1,
            name: 'Borne de recharge principale',
            type: 'Borne 22kW',
            status: 'operational',
            lastMaintenance: '2024-01-10',
            nextMaintenance: '2024-04-10'
          },
          {
            id: 2,
            name: 'Tableau électrique principal',
            type: 'Tableau 400A',
            status: 'operational',
            lastMaintenance: '2024-01-05',
            nextMaintenance: '2024-07-05'
          },
          {
            id: 3,
            name: 'Éclairage LED parking',
            type: 'Système LED',
            status: 'warning',
            lastMaintenance: '2023-12-15',
            nextMaintenance: '2024-02-15'
          }
        ],
        recentInterventions: [
          {
            id: 'INT-2024-001',
            date: '2024-01-15',
            type: 'Installation',
            equipment: 'Borne de recharge principale',
            technician: 'Jean Martin',
            status: 'completed',
            duration: '3h 30min'
          },
          {
            id: 'INT-2024-002',
            date: '2024-01-10',
            type: 'Maintenance',
            equipment: 'Tableau électrique principal',
            technician: 'Marie Dubois',
            status: 'completed',
            duration: '2h 15min'
          }
        ],
        pendingQuotes: [
          {
            id: 'DEV-2024-001',
            title: 'Extension borne de recharge',
            amount: 3200.00,
            date: '2024-01-14',
            validUntil: '2024-02-14',
            status: 'pending'
          },
          {
            id: 'DEV-2024-002',
            title: 'Mise aux normes électriques',
            amount: 1850.00,
            date: '2024-01-12',
            validUntil: '2024-02-12',
            status: 'pending'
          }
        ],
        upcomingInterventions: [
          {
            id: 'INT-2024-003',
            date: '2024-01-18',
            time: '10:00',
            type: 'Diagnostic',
            equipment: 'Installation électrique générale',
            technician: {
              name: 'Pierre Durand',
              phone: '06 45 78 90 12',
              avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
            },
            status: 'scheduled'
          }
        ],
        stats: {
          equipmentCount: 3,
          interventionsThisMonth: 3,
          pendingQuotesCount: 2,
          pendingQuotesAmount: 5050,
          nextMaintenanceDays: 30,
          nextMaintenanceEquipment: 'Éclairage LED'
        }
      };
      
      setDashboardData(mockData);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      operational: { color: 'bg-green-100 text-green-800', label: 'Opérationnel' },
      warning: { color: 'bg-yellow-100 text-yellow-800', label: 'Attention' },
      maintenance: { color: 'bg-blue-100 text-blue-800', label: 'Maintenance' },
      error: { color: 'bg-red-100 text-red-800', label: 'Panne' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Terminée' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
      scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Planifiée' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard Client
            </h1>
            <p className="text-gray-600">Gérez vos équipements et suivez vos interventions</p>
          </div>
          <Button 
            size="lg" 
            className="flex items-center"
            onClick={() => navigate('/client/request')}
          >
            <Plus className="w-5 h-5 mr-2" />
            Demande d'Intervention
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Équipements"
            value={dashboardData.stats.equipmentCount.toString()}
            icon={Zap}
            change="Tous surveillés"
            changeType="positive"
            color="primary"
          />
          <StatsCard
            title="Interventions ce Mois"
            value={dashboardData.stats.interventionsThisMonth.toString()}
            icon={Wrench}
            change="2 préventives"
            changeType="neutral"
            color="secondary"
          />
          <StatsCard
            title="Devis en Attente"
            value={dashboardData.stats.pendingQuotesCount.toString()}
            icon={FileText}
            change={`${dashboardData.stats.pendingQuotesAmount}€ total`}
            changeType="neutral"
            color="warning"
          />
          <StatsCard
            title="Prochaine Maintenance"
            value={`${dashboardData.stats.nextMaintenanceDays} jours`}
            icon={Calendar}
            change={dashboardData.stats.nextMaintenanceEquipment}
            changeType="neutral"
            color="success"
          />
        </div>

        {/* Upcoming Intervention */}
        {dashboardData.upcomingInterventions.length > 0 && (
          <Card className="p-6 bg-primary-50 border border-primary-100">
            <h3 className="text-lg font-semibold text-primary-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary-600" />
              Prochaine Intervention
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">{dashboardData.upcomingInterventions[0].type}</h4>
                  <p className="text-gray-600">{dashboardData.upcomingInterventions[0].equipment}</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{new Date(dashboardData.upcomingInterventions[0].date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{dashboardData.upcomingInterventions[0].time}</span>
                  </div>
                </div>
                
                <div>
                  {getStatusBadge(dashboardData.upcomingInterventions[0].status)}
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <Button variant="primary" size="sm">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Contacter
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Voir détails
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-bleu rounded-lg shadow-sm">
                <img
                  src={dashboardData.upcomingInterventions[0].technician.avatar}
                  alt={dashboardData.upcomingInterventions[0].technician.name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{dashboardData.upcomingInterventions[0].technician.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">Technicien assigné</p>
                  <div className="flex items-center text-sm text-primary-600">
                    <Phone className="w-4 h-4 mr-1" />
                    <span>{dashboardData.upcomingInterventions[0].technician.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Equipment Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-primary-600" />
            État de vos Équipements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardData.equipments.map((equipment: any) => (
              <div key={equipment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{equipment.name}</h4>
                    <p className="text-sm text-gray-600">{equipment.type}</p>
                  </div>
                  {getStatusBadge(equipment.status)}
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Dernière maintenance:</span>
                    <span>{new Date(equipment.lastMaintenance).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prochaine maintenance:</span>
                    <span className={equipment.status === 'warning' ? 'text-yellow-600 font-medium' : ''}>
                      {new Date(equipment.nextMaintenance).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200">
                  <Button variant="ghost" size="sm" className="w-full">
                    <Eye className="w-4 h-4 mr-1" />
                    Voir Détails
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Interventions */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Wrench className="w-5 h-5 mr-2 text-primary-600" />
                Interventions Récentes
              </h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/client/interventions')}>
                Voir tout
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-4">
              {dashboardData.recentInterventions.map((intervention: any) => (
                <div key={intervention.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{intervention.type}</p>
                      <p className="text-sm text-gray-600">{intervention.equipment}</p>
                    </div>
                    {getStatusBadge(intervention.status)}
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Par {intervention.technician}</span>
                    <span>{new Date(intervention.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">Durée: {intervention.duration}</span>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Rapport
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Pending Quotes */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary-600" />
                Devis en Attente
              </h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/client/quotes')}>
                Voir tout
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-4">
              {dashboardData.pendingQuotes.map((quote: any) => (
                <div key={quote.id} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{quote.title}</p>
                      <p className="text-sm text-gray-600">{quote.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg text-gray-900">
                        {quote.amount.toLocaleString('fr-FR', { 
                          style: 'currency', 
                          currency: 'EUR' 
                        })}
                      </p>
                      {getStatusBadge(quote.status)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                    <span>Créé le {new Date(quote.date).toLocaleDateString('fr-FR')}</span>
                    <span>Valide jusqu'au {new Date(quote.validUntil).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="primary" size="sm" className="flex-1">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Accepter
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Discuter
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="primary" 
              className="flex flex-col items-center p-6 h-auto"
              onClick={() => navigate('/client/request')}
            >
              <Plus className="w-8 h-8 mb-2" />
              <span>Demande d'Intervention</span>
            </Button>
            <Button 
              variant="secondary" 
              className="flex flex-col items-center p-6 h-auto"
              onClick={() => navigate('/client/messages')}
            >
              <MessageSquare className="w-8 h-8 mb-2" />
              <span>Contacter Support</span>
            </Button>
            <Button 
              variant="success" 
              className="flex flex-col items-center p-6 h-auto"
              onClick={() => navigate('/client/payments')}
            >
              <CreditCard className="w-8 h-8 mb-2" />
              <span>Paiements</span>
            </Button>
            <Button 
              variant="warning" 
              className="flex flex-col items-center p-6 h-auto"
              onClick={() => navigate('/client/quotes')}
            >
              <Download className="w-8 h-8 mb-2" />
              <span>Mes Devis</span>
            </Button>
          </div>
        </Card>

        {/* Alerts */}
        {dashboardData.equipments.some((eq: any) => eq.status === 'warning') && (
          <Card className="p-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800">Maintenance Programmée</h4>
                <p className="text-yellow-700 mt-1">
                  La maintenance de votre éclairage LED parking est prévue dans 30 jours. 
                  Nous vous contacterons prochainement pour planifier l'intervention.
                </p>
                <Button variant="warning" size="sm" className="mt-3">
                  Planifier Maintenant
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ClientDashboard;