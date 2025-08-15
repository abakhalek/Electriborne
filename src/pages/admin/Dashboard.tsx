import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import StatsCard from '../../components/StatsCard';
import Card from '../../components/Card';
import { 
  Users, 
  Wrench, 
  FileText, 
  Clock, 
  DollarSign,
} from 'lucide-react';
import apiService from '../../services/apiService';
import toast from 'react-hot-toast';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminCount: number;
  techCount: number;
  clientCount: number;
  newUsersThisMonth: number;
}

interface MissionStats {
  totalMissions: number;
  inProgressMissions: number;
  recentMissions: {
    missionNumber: string;
    clientName: string;
    technicianName: string;
    serviceTypeName: string;
    scheduledDate: string;
  }[];
}

interface QuoteStats {
  totalQuotes: number;
  pendingQuotes: number;
  quotesThisMonth: number;
  quotesLastMonth: number;
}

interface PaymentStats {
  totalRevenue: number;
  monthlyRevenue: number;
  lastMonthlyRevenue: number;
}

interface RequestStats {
  totalRequests: number;
  pendingRequests: number;
  assignedRequests: number;
  inProgressRequests: number;
  completedRequests: number;
  urgentRequests: number;
  newRequestsThisMonth: number;
  avgProcessingTime: number;
  typeDistribution: { _id: string; count: number }[];
}

const AdminDashboard: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [missionStats, setMissionStats] = useState<MissionStats | null>(null);
  const [quoteStats, setQuoteStats] = useState<QuoteStats | null>(null);
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  const [requestStats, setRequestStats] = useState<RequestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, missionsRes, quotesRes, paymentsRes, requestsRes] = await Promise.all([
          apiService.users.getStats(),
          apiService.missions.getStatsOverview(),
          apiService.quotes.getStatsOverview(),
          apiService.payments.getStats(),
          apiService.requests.getStats(),
        ]);

        setUserStats(usersRes);
        setMissionStats(missionsRes);
        setQuoteStats(quotesRes);
        setPaymentStats(paymentsRes);
        setRequestStats(requestsRes);
        console.log('Request Stats fetched:', requestsRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Erreur lors du chargement des données du tableau de bord.");
        toast.error("Erreur lors du chargement des données du tableau de bord.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <p>Chargement du tableau de bord...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen text-red-500">
          <p>{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Administrateur
          </h1>
          <p className="text-gray-600">Vue d'overview de l'activité Ectriborne</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Clients Actifs"
            value={userStats?.clientCount.toString() || 'N/A'}
            icon={Users}
            change={`+${userStats?.newUsersThisMonth || 0}% ce mois`}
            changeType="positive"
            color="primary"
          />
          <StatsCard
            title="Interventions"
            value={missionStats?.totalMissions.toString() || 'N/A'}
            icon={Wrench}
            change={`${missionStats?.inProgressMissions || 0} en cours`}
            changeType="neutral"
            color="secondary"
          />
          <StatsCard
            title="Devis en Attente"
            value={quoteStats?.pendingQuotes.toString() || 'N/A'}
            icon={FileText}
            change={`${quoteStats && quoteStats.quotesThisMonth > quoteStats.quotesLastMonth ? '+' : '-'}${Math.abs((quoteStats?.quotesThisMonth || 0) - (quoteStats?.quotesLastMonth || 0))} depuis hier`}
            changeType={quoteStats && quoteStats.quotesThisMonth > quoteStats.quotesLastMonth ? 'positive' : 'negative'}
            color="warning"
          />
          <StatsCard
            title="Demandes en Attente"
            value={requestStats?.pendingRequests.toString() || 'N/A'}
            icon={Clock}
            change={`Total: ${requestStats?.totalRequests || 0}`}
            changeType="neutral"
            color="warning"
          />
          <StatsCard
            title="CA du Mois"
            value={`${paymentStats?.monthlyRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) || 'N/A'}`}
            icon={DollarSign}
            change={`${paymentStats && paymentStats.monthlyRevenue > paymentStats.lastMonthlyRevenue ? '+' : '-'}${Math.abs((paymentStats?.monthlyRevenue || 0) - (paymentStats?.lastMonthlyRevenue || 0)).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} vs mois dernier`}
            changeType={paymentStats && paymentStats.monthlyRevenue > paymentStats.lastMonthlyRevenue ? 'positive' : 'negative'}
            color="success"
          />
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Interventions Récentes</h3>
            <div className="space-y-4">
              {missionStats?.recentMissions.length === 0 ? (
                <p className="text-gray-500">Aucune intervention récente.</p>
              ) : (
                missionStats?.recentMissions.map((mission, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full bg-gray-400`}></div> {/* Status not available in missionStats.recentMissions */}
                      <div>
                        <p className="font-medium text-gray-900">{mission.clientName}</p>
                        <p className="text-sm text-gray-500">{mission.serviceTypeName}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{/* Duration not available in missionStats.recentMissions */}</span>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Planning Aujourd'hui</h3>
            <div className="space-y-4">
              {missionStats?.recentMissions.length === 0 ? (
                <p className="text-gray-500">Aucun planning pour aujourd'hui.</p>
              ) : (
                missionStats?.recentMissions.map((mission, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{mission.clientName}</p>
                        <p className="text-sm text-gray-500">{mission.technicianName}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-primary-600">{new Date(mission.scheduledDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;