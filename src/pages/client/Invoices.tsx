import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import DataTable, { Column } from '../../components/DataTable';
import { useCrudApi } from '../../hooks/useApi';
import apiService from '../../services/apiService';
import { FileText, Download, Search, Filter, Eye } from 'lucide-react';

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

const ClientInvoices: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { items: invoices, fetchItems, isLoading, error } = useCrudApi<Invoice, any, any>(apiService.invoices);

  useEffect(() => {
    fetchItems(); // Fetch invoices for the current client (backend handles filtering by user ID)
  }, [fetchItems]);

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const response = await apiService.invoices.downloadPdf(invoiceId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Facture PDF téléchargée avec succès !');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Erreur lors du téléchargement du PDF.');
    }
  };

  const filteredInvoices = (invoices || []).filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.company.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<Invoice>[] = [
    { header: 'N° Facture', accessor: 'invoiceNumber' },
    { header: 'Entreprise', accessor: (row) => row.company.name },
    {
      header: 'Date d\'émission',
      accessor: 'issueDate',
      cell: (row: Invoice) => new Date(row.issueDate).toLocaleDateString()
    },
    {
      header: 'Date d\'échéance',
      accessor: 'dueDate',
      cell: (row: Invoice) => new Date(row.dueDate).toLocaleDateString()
    },
    {
      header: 'Montant Total',
      accessor: 'totalAmount',
      cell: (row: Invoice) => `${row.totalAmount.toFixed(2)} €`
    },
    { header: 'Statut', accessor: 'status' },
    { header: 'Statut Paiement', accessor: 'paymentStatus' },
    
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-8">Chargement des factures...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-8 text-red-500">Erreur: {error.message}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="w-8 h-8 mr-3 text-primary-600" />
            Mes Factures
          </h1>
        </div>

        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par N° facture ou entreprise..."
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
          data={filteredInvoices}
          keyField="_id"
          actions={{
            view: (invoice) => navigate(`/client/invoices/${invoice._id}`),
            custom: [
              {
                label: 'PDF',
                icon: <Download className="w-4 h-4" />,
                onClick: (invoice) => handleDownloadInvoice(invoice._id),
              },
            ],
          }}
          onRowClick={(invoice) => navigate(`/client/invoices/${invoice._id}`)}
          filters={
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
          }
          searchPlaceholder="Rechercher par N° facture ou entreprise..."
          onSearch={setSearchTerm}
          emptyMessage="Aucune facture trouvée"
        />
      </div>
    </Layout>
  );
};

export default ClientInvoices;
