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
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  Calendar,
  User,
  FileText,
  AlertTriangle,
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

const PaymentManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const paymentApiConfig = useMemo(() => ({
    getAll: apiService.payments.getAll,
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
      page: currentPage,
      limit: pageSize,
      status: statusFilter === 'all' ? '' : statusFilter,
      search: searchTerm,
    });
  }, [fetchPayments, currentPage, pageSize, statusFilter, searchTerm]);

  const handleDownloadPdf = async (paymentId: string) => {
    try {
      // Assuming there's a downloadPdf method in apiService.payments
      // You might need to implement this in your apiService
      const response = await apiService.payments.downloadPdf(paymentId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `paiement-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF téléchargé avec succès !');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Erreur lors du téléchargement du PDF.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'bg-success-100 text-success-800', label: 'Terminé', icon: CheckCircle2 },
      pending: { color: 'bg-warning-100 text-warning-800', label: 'En attente', icon: Clock },
      failed: { color: 'bg-error-100 text-error-800', label: 'Échoué', icon: XCircle },
      refunded: { color: 'bg-gray-100 text-gray-800', label: 'Remboursé', icon: AlertTriangle },
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
      header: 'Client',
      accessor: (payment: Payment) => payment.clientId?.firstName,
      cell: (payment: Payment) => (
        <div className="flex items-center text-sm">
          <User className="w-4 h-4 mr-2 text-gray-400" />
          <span className="font-medium">
            {payment.clientId ?
              `${payment.clientId.firstName} ${payment.clientId.lastName}`
              : 'Client inconnu'
            }
          </span>
        </div>
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

  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);


  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <CreditCard className="w-8 h-8 mr-3 text-primary-600" />
              Gestion des Paiements
            </h1>
            <p className="text-gray-600 mt-2">
              Suivez les paiements, factures et transactions Stripe
            </p>
          </div>
          <Button size="lg" onClick={() => navigate('/admin/payments/add')} className="flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Nouveau Paiement
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par client, numéro ou facture..."
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
              
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenus Total</p>
                <p className="text-2xl font-bold text-success-600">
                  {totalRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-success-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Attente</p>
                <p className="text-2xl font-bold text-warning-600">
                  {pendingAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
              <Clock className="w-8 h-8 text-warning-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-primary-600">156</p>
              </div>
              <CreditCard className="w-8 h-8 text-primary-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taux de Réussite</p>
                <p className="text-2xl font-bold text-gray-900">94.2%</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-success-600" />
            </div>
          </Card>
        </div>

        {/* Payments Table */}
        <DataTable
          columns={columns}
          data={payments}
          keyField="_id"
          title="Liste des Paiements"
          isLoading={isLoading}
          pagination={{
            page: currentPage,
            limit: pageSize,
            total,
            onPageChange: setCurrentPage,
            onLimitChange: setPageSize,
          }}
          actions={{
            view: (payment) => navigate(`/admin/payments/view/${payment._id}`),
            edit: (payment) => navigate(`/admin/payments/edit/${payment._id}`),
            delete: (payment) => deletePayment(payment._id),
            custom: [
              {
                label: 'Télécharger PDF',
                icon: <Download className="w-4 h-4" />,
                onClick: (payment) => handleDownloadPdf(payment._id),
              },
            ],
          }}
          onRowClick={(payment) => navigate(`/admin/payments/view/${payment._id}`)}
          filters={
            <div className="flex space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="completed">Terminé</option>
                <option value="pending">En attente</option>
                <option value="failed">Échoué</option>
                <option value="refunded">Remboursé</option>
              </select>
            </div>
          }
          searchPlaceholder="Rechercher par N° paiement, client ou facture..."
          onSearch={setSearchTerm}
          emptyMessage="Aucun paiement trouvé"
        />
      </div>
    </Layout>
  );
};

export default PaymentManagement;