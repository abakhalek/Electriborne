import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import DataTable, { Column } from '../../components/DataTable';
import { useCrudApi } from '../../hooks/useApi';
import apiService from '../../services/apiService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  CreditCard,
  Search,
  Filter,
  Eye,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  DollarSign,
  FileText,
  Receipt,
  Edit2,
  Trash2
} from 'lucide-react';

interface Payment {
  _id: string;
  paymentNumber: string;
  amount: number;
  currency: string;
  paymentDate: string;
  method: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  clientId: { _id: string; firstName: string; lastName: string; email: string; company?: string; };
  invoiceId?: { _id: string; invoiceNumber: string; };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const ClientPayments: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const paymentApiConfig = useMemo(() => ({
    getAll: apiService.payments.getMy,
    delete: apiService.payments.delete,
  }), []);

  const { 
    items: payments, 
    total,
    isLoading,
    fetchItems: fetchPayments,
    deleteItem: deletePayment,
  } = useCrudApi<Payment, any, any>(paymentApiConfig);

  useEffect(() => {
    fetchPayments({
      status: statusFilter === 'all' ? '' : statusFilter,
      search: searchTerm,
    });
  }, [fetchPayments, statusFilter, searchTerm]);

  const downloadInvoice = async (invoiceId: string) => {
    try {
      const response = await apiService.payments.getInvoice(invoiceId);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Facture PDF téléchargée avec succès !');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Erreur lors du téléchargement de la facture.');
    }
  };

  const downloadReceipt = async (paymentId: string) => {
    try {
      const response = await apiService.payments.getReceipt(paymentId);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reçu-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Reçu PDF téléchargé avec succès !');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Erreur lors du téléchargement du reçu.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', label: 'Payé', icon: CheckCircle2 },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'En attente', icon: Clock },
      overdue: { color: 'bg-red-100 text-red-800', label: 'En retard', icon: AlertTriangle },
      failed: { color: 'bg-red-100 text-red-800', label: 'Échec', icon: AlertTriangle },
      refunded: { color: 'bg-gray-100 text-gray-800', label: 'Remboursé', icon: AlertTriangle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const columns: Column<Payment>[] = [
    {
      header: 'N° Paiement',
      accessor: 'paymentNumber',
      cell: (payment: Payment) => (
        <span className="font-semibold text-gray-900">{payment.paymentNumber}</span>
      ),
    },
    {
      header: 'Montant',
      accessor: 'amount',
      cell: (payment: Payment) => (
        <span className="font-medium">
          {payment.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
        </span>
      ),
    },
    {
      header: 'Date',
      accessor: 'paymentDate',
      cell: (payment: Payment) => (
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          <span>{new Date(payment.paymentDate).toLocaleDateString('fr-FR')}</span>
        </div>
      ),
    },
    {
      header: 'Statut',
      accessor: 'status',
      cell: (payment: Payment) => getStatusBadge(payment.status),
    },
    {
      header: 'Facture Liée',
      accessor: (payment: Payment) => payment.invoiceId?.invoiceNumber || 'N/A',
      cell: (payment: Payment) => (
        <div className="flex items-center text-sm text-gray-600">
          <FileText className="w-4 h-4 mr-2 text-gray-400" />
          <span>{payment.invoiceId?.invoiceNumber || 'N/A'}</span>
        </div>
      ),
    },
  ];

  const totalPaid = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter(p => p.status === 'pending' || p.status === 'overdue')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <CreditCard className="w-8 h-8 mr-3 text-primary-600" />
            Mes Paiements
          </h1>
          <p className="text-gray-600 mt-2">Gérez vos factures et paiements</p>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par description, référence ou facture..."
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
                  <option value="overdue">En retard</option>
                  <option value="failed">Échec</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payé</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalPaid.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Attente</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {totalPending.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Factures</p>
                <p className="text-2xl font-bold text-blue-600">8</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Méthode</p>
                <p className="text-lg font-bold text-gray-900">Carte</p>
              </div>
              <CreditCard className="w-8 h-8 text-gray-600" />
            </div>
          </Card>
        </div>

        {/* Payments List */}
        <DataTable
          columns={columns}
          data={payments}
          keyField="_id"
          title="Mes Paiements"
          isLoading={isLoading}
          pagination={{
            page: 1, // Client payments might not need full pagination control
            limit: payments.length, // Show all for now
            total,
            onPageChange: () => {},
          }}
          actions={{
            view: (payment) => navigate(`/client/payments/${payment._id}`),
            custom: [
              {
                label: 'Facture PDF',
                icon: <Download className="w-4 h-4" />,
                onClick: (payment) => payment.invoiceId ? downloadInvoice(payment.invoiceId._id) : toast.error('Facture non disponible'),
              },
              {
                label: 'Reçu PDF',
                icon: <Receipt className="w-4 h-4" />,
                onClick: (payment) => downloadReceipt(payment._id),
              },
            ],
          }}
          onRowClick={(payment) => navigate(`/client/payments/${payment._id}`)}
          filters={
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
                <option value="overdue">En retard</option>
                <option value="failed">Échec</option>
                <option value="refunded">Remboursé</option>
              </select>
            </div>
          }
          searchPlaceholder="Rechercher par N° paiement, client ou facture..."
          onSearch={setSearchTerm}
          emptyMessage="Aucun paiement trouvé"
        />

        {/* Payment Methods */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Méthodes de paiement</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center p-4 border border-gray-200 rounded-lg">
              <CreditCard className="w-8 h-8 text-blue-600 mr-4" />
              <div>
                <p className="font-medium text-gray-900">Carte bancaire</p>
                <p className="text-sm text-gray-600">Paiement sécurisé par Stripe</p>
              </div>
            </div>
            <div className="flex items-center p-4 border border-gray-200 rounded-lg opacity-50">
              <DollarSign className="w-8 h-8 text-gray-400 mr-4" />
              <div>
                <p className="font-medium text-gray-500">Virement bancaire</p>
                <p className="text-sm text-gray-400">Bientôt disponible</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Payment Security */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-6 h-6 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">Paiements sécurisés</h4>
              <p className="text-sm text-blue-700 mt-1">
                Tous vos paiements sont traités de manière sécurisée par Stripe. 
                Vos informations bancaires ne sont jamais stockées sur nos serveurs.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default ClientPayments;