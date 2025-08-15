import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import DataTable, { Column } from '../../components/DataTable';
import { useCrudApi } from '../../hooks/useApi';
import apiService from '../../services/apiService';
import { FileText,
  PlusCircle,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  client: { _id: string; firstName: string; lastName: string; email: string };
  company: { _id: string; name: string };
  issueDate: string;
  dueDate: string;
  items: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
  totalAmount: number;
  status: 'pending' | 'paid' | 'cancelled' | 'overdue';
  paymentStatus: 'unpaid' | 'partially_paid' | 'paid';
  relatedQuotes?: string[];
  relatedMissions?: string[];
  paymentDetails?: { method: string; transactionId: string; paymentDate: string };
}

const InvoiceManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const invoiceApiConfig = React.useMemo(() => ({
    getAll: apiService.invoices.getAll,
    getById: apiService.invoices.getById,
    create: apiService.invoices.create,
    update: apiService.invoices.update,
    delete: apiService.invoices.delete,
  }), []);
  const { items: invoices, fetchItems, createItem, updateItem, deleteItem, isLoading, error } = useCrudApi<Invoice, any, any>(invoiceApiConfig);
  const userApiConfig = React.useMemo(() => ({
    getAll: apiService.users.getAll,
    getById: apiService.users.getById,
    create: apiService.users.create,
    update: apiService.users.update,
    delete: apiService.users.delete,
  }), []);
  const { items: clients, fetchItems: fetchClients } = useCrudApi<any, any, any>(userApiConfig);
  const companyApiConfig = React.useMemo(() => ({
    getAll: apiService.companies.getAll,
    getById: apiService.companies.getById,
    create: apiService.companies.create,
    update: apiService.companies.update,
    delete: apiService.companies.delete,
  }), []);
  const { items: companies, fetchItems: fetchCompanies } = useCrudApi<any, any, any>(companyApiConfig);

  useEffect(() => {
    fetchItems({
      page: currentPage,
      limit: pageSize,
      status: statusFilter === 'all' ? '' : statusFilter,
      search: searchTerm
    });
  }, [fetchItems, currentPage, pageSize, statusFilter, searchTerm]);

  useEffect(() => {
    fetchClients({ role: 'client' });
  }, [fetchClients]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      deleteItem(id);
    }
  };

  const handleDownloadPdf = async (invoiceId: string) => {
    try {
      const response = await apiService.invoices.downloadPdf(invoiceId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Erreur lors du téléchargement du PDF.');
    }
  };

  const columns: Column<Invoice>[] = [
    { header: 'N° Facture', accessor: 'invoiceNumber' },
    { header: 'Client', accessor: (row) => `${row.client.firstName} ${row.client.lastName}` },
    { header: 'Entreprise', accessor: (row) => row.company.name },
    { header: "Date d'émission", accessor: (row) => new Date(row.issueDate).toLocaleDateString() },
    { header: "Date d'échéance", accessor: (row) => new Date(row.dueDate).toLocaleDateString() },
    { header: 'Montant Total', accessor: (row) => `${row.totalAmount.toFixed(2)} €` },
    { header: 'Statut', accessor: 'status' },
    { header: 'Statut Paiement', accessor: 'paymentStatus' },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCurrentInvoice(row);
              setIsModalOpen(true);
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row._id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDownloadPdf(row._id)}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (error) {
    return <Layout><div className="text-center py-8 text-red-500">Erreur: {error.message}</div></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="w-8 h-8 mr-3 text-primary-600" />
            Gestion des Factures
          </h1>
          <Button onClick={() => navigate('/admin/invoices/add')}>
            <PlusCircle className="w-5 h-5 mr-2" />
            Créer Facture
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par N° facture, client ou entreprise..."
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
                  <option value="pending">En attente</option>
                  <option value="paid">Payée</option>
                  <option value="cancelled">Annulée</option>
                  <option value="overdue">En retard</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        <DataTable
          columns={columns}
          data={invoices}
          keyField="_id"
          isLoading={isLoading}
          pagination={{
            page: currentPage,
            limit: pageSize,
            total: invoices.length, // Assuming total is the length of the fetched array for now
            onPageChange: setCurrentPage,
            onLimitChange: setPageSize,
          }}
          actions={{
            view: (invoice) => navigate(`/admin/invoices/view/${invoice._id}`),
            edit: (invoice) => navigate(`/admin/invoices/edit/${invoice._id}`),
            delete: (invoice) => handleDelete(invoice._id),
            custom: [
              {
                label: 'Télécharger PDF',
                icon: <Download className="w-4 h-4" />,
                onClick: (invoice) => handleDownloadPdf(invoice._id),
              },
            ],
          }}
          onRowClick={(invoice) => navigate(`/admin/invoices/view/${invoice._id}`)}
          filters={
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="paid">Payée</option>
              <option value="cancelled">Annulée</option>
              <option value="overdue">En retard</option>
            </select>
          }
          searchPlaceholder="Rechercher par N° facture, client ou entreprise..."
          onSearch={setSearchTerm}
          emptyMessage="Aucune facture trouvée"
        />
      </div>
    </Layout>
  );
};

export default InvoiceManagement;