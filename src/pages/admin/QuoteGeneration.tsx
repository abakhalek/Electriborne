import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ConfirmDialog from '../../components/ConfirmDialog';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Send, 
  Download,
  Eye,
  Edit2,
  Trash2,
  Mail,
  User,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../../services/apiService';

// Interfaces (keep them as they are)
interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  serviceTypeId?: string;
}

interface Quote {
  _id: string;
  reference: string;
  title: string;
  description: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  items: QuoteItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  validUntil: string;
  sentDate?: string;
  respondedDate?: string;
  notes?: string;
  terms?: string;
  clientId: { _id: string; firstName: string; lastName: string; email: string; };
  technicianId?: { _id: string; firstName: string; lastName: string; };
  requestId?: string;
  createdAt: string;
  updatedAt: string;
}

const QuoteGeneration: React.FC = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);

  const fetchQuotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiService.quotes.getAll({ 
        page: 1, 
        limit: 50, // Fetch more items
        status: statusFilter === 'all' ? '' : statusFilter,
        search: searchTerm 
      });
      setQuotes(data.items || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast.error('Erreur lors du chargement des devis.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const openDeleteDialog = (quoteId: string) => {
    setSelectedQuoteId(quoteId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteQuote = async () => {
    if (!selectedQuoteId) return;
    try {
      await apiService.quotes.delete(selectedQuoteId);
      toast.success('Devis supprimé avec succès');
      fetchQuotes(); // Refresh the list
    } catch (error) {
      console.error('Error deleting quote:', error);
      toast.error('Erreur lors de la suppression du devis');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedQuoteId(null);
    }
  };

  const handleDownloadPdf = async (quoteId: string) => {
    try {
      const response = await apiService.quotes.downloadPdf(quoteId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `devis-${quoteId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Erreur lors du téléchargement du PDF.');
    }
  };
  
  const sendQuoteByEmail = async (quoteId: string) => {
    try {
      await apiService.quotes.send(quoteId);
      toast.success('Devis envoyé par email !');
      fetchQuotes(); // Refresh the list
    } catch (error) {
      console.error('Error sending quote by email:', error);
      toast.error("Erreur lors de l'envoi du devis par email");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Brouillon' },
      sent: { color: 'bg-blue-100 text-blue-800', label: 'Envoyé' },
      accepted: { color: 'bg-green-100 text-green-800', label: 'Accepté' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Refusé' },
      expired: { color: 'bg-gray-200 text-gray-800', label: 'Expiré' },
    };
    const config = statusConfig[status] || { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return <Layout><div>Chargement des devis...</div></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="w-8 h-8 mr-3 text-primary-600" />
              Génération de Devis
            </h1>
            <p className="text-gray-600 mt-2">
              Créez et gérez vos devis avec envoi automatique par email
            </p>
          </div>
          <Button size="lg" onClick={() => navigate('/admin/quotes/add')} className="flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Nouveau Devis
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par client ou numéro..."
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
                  <option value="draft">Brouillon</option>
                  <option value="sent">Envoyé</option>
                  <option value="accepted">Accepté</option>
                  <option value="rejected">Refusé</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {quotes.map((quote) => (
            <Card key={quote._id} hover className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{quote.reference}</h3>
                    <p className="text-sm text-gray-600">{quote.title}</p>
                  </div>
                  {getStatusBadge(quote.status)}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium">{quote.clientId ? `${quote.clientId.firstName} ${quote.clientId.lastName}` : 'Client non assigné'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{quote.clientId?.email || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center text-sm">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span className="font-semibold text-lg text-gray-900">
                      {quote.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{new Date(quote.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleDownloadPdf(quote._id)}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => sendQuoteByEmail(quote._id)}>
                      <Send className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/quotes/view/${quote._id}`)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/quotes/edit/${quote._id}`)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(quote._id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteQuote}
          title="Supprimer le devis"
          message="Êtes-vous sûr de vouloir supprimer ce devis ? Cette action est irréversible."
          type="danger"
        />
      </div>
    </Layout>
  );
};

export default QuoteGeneration;
