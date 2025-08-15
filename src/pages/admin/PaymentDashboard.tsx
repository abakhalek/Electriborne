import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  CreditCard, 
  TrendingUp, 
  
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  
  Download,
  RefreshCw,
  Filter,
  Search,
  Eye,
  MoreVertical
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface PaymentStats {
  totalRevenue: number;
  pendingAmount: number;
  completedCount: number;
  pendingCount: number;
  failedCount: number;
  refundedCount: number;
  averagePaymentAmount: number;
  conversionRate: number;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  type: string;
  createdAt: string;
  paidAt?: string;
  client: {
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
  };
  quote: {
    reference: string;
    totalAmount: number;
  };
  paymentMethod: string;
  currency: string;
}

const PaymentDashboard: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, typeFilter, dateRange]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (dateRange !== 'all') {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(dateRange));
        params.append('startDate', startDate.toISOString());
      }

      const response = await api.get(`/payments?${params.toString()}`);
      setPayments(response.data.data.payments);
      setStats(response.data.data.stats);
    } catch (error) {
      toast.error('Erreur lors du chargement des paiements');
      console.error('Payments fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', label: 'Payé', icon: CheckCircle2 },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'En attente', icon: Clock },
      failed: { color: 'bg-red-100 text-red-800', label: 'Échec', icon: XCircle },
      canceled: { color: 'bg-gray-100 text-gray-800', label: 'Annulé', icon: XCircle },
      refunded: { color: 'bg-purple-100 text-purple-800', label: 'Remboursé', icon: RefreshCw },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;
    
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      partial: { color: 'bg-blue-100 text-blue-800', label: 'Acompte 50%' },
      full: { color: 'bg-green-100 text-green-800', label: 'Intégral' },
    };
    
    const config = typeConfig[type as keyof typeof typeConfig];
    if (!config) return null;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.quote.reference.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Chart data
  const revenueData = payments
    .filter(p => p.status === 'completed')
    .reduce((acc, payment) => {
      const date = new Date(payment.paidAt || payment.createdAt).toLocaleDateString('fr-FR');
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.amount += payment.amount;
      } else {
        acc.push({ date, amount: payment.amount });
      }
      return acc;
    }, [] as Array<{ date: string; amount: number }>)
    .slice(-7); // Last 7 days

  const statusData = [
    { name: 'Payés', value: stats?.completedCount || 0, color: '#10B981' },
    { name: 'En attente', value: stats?.pendingCount || 0, color: '#F59E0B' },
    { name: 'Échecs', value: stats?.failedCount || 0, color: '#EF4444' },
    { name: 'Remboursés', value: stats?.refundedCount || 0, color: '#8B5CF6' },
  ];

  
    

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
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <CreditCard className="w-8 h-8 mr-3 text-primary-600" />
              Dashboard Paiements
            </h1>
            <p className="text-gray-600 mt-2">
              Suivi des paiements Stripe et statistiques financières
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="secondary" onClick={fetchPayments}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenus Total</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.totalRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) || '0 €'}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+12.5% ce mois</span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Attente</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats?.pendingAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) || '0 €'}
                </p>
                <div className="flex items-center mt-2">
                  <Clock className="w-4 h-4 text-yellow-600 mr-1" />
                  <span className="text-sm text-yellow-600">{stats?.pendingCount || 0} paiements</span>
                </div>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taux de Réussite</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats ? Math.round((stats.completedCount / (stats.completedCount + stats.failedCount)) * 100) : 0}%
                </p>
                <div className="flex items-center mt-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mr-1" />
                  <span className="text-sm text-blue-600">{stats?.completedCount || 0} réussis</span>
                </div>
              </div>
              <CheckCircle2 className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Panier Moyen</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats?.averagePaymentAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) || '0 €'}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-purple-600 mr-1" />
                  <span className="text-sm text-purple-600">+5.2% vs mois dernier</span>
                </div>
              </div>
              <CreditCard className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des Revenus (7 derniers jours)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} €`, 'Revenus']} />
                <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Status Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par Statut</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par client ou référence..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="completed">Payé</option>
                  <option value="pending">En attente</option>
                  <option value="failed">Échec</option>
                  <option value="refunded">Remboursé</option>
                </select>
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">Tous les types</option>
                <option value="partial">Acomptes</option>
                <option value="full">Intégraux</option>
              </select>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="7">7 derniers jours</option>
                <option value="30">30 derniers jours</option>
                <option value="90">90 derniers jours</option>
                <option value="all">Toutes les dates</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Payments Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Devis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-bleu divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.client.firstName} {payment.client.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{payment.client.email}</div>
                        {payment.client.company && (
                          <div className="text-sm text-gray-500">{payment.client.company}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.quote.reference}</div>
                      <div className="text-sm text-gray-500">
                        Total: {payment.quote.totalAmount.toFixed(2)} €
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.amount.toFixed(2)} €
                      </div>
                      <div className="text-sm text-gray-500">{payment.currency.toUpperCase()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(payment.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString('fr-FR')}
                      {payment.paidAt && (
                        <div className="text-xs text-green-600">
                          Payé le {new Date(payment.paidAt).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default PaymentDashboard;
