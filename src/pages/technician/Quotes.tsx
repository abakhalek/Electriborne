import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ProtectedRoute from '../../components/ProtectedRoute';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit2, 
  Trash2,
  Send,
  Download,
  Clock,
  Calendar,
  Building
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCrudApi } from '../../hooks/useApi';
import apiService from '../../services/apiService';

const TechQuotes: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const api = useMemo(() => ({
    getAll: async () => {
      const quotes = await apiService.quotes.getMy();
      return { 
        items: quotes || [], 
        total: quotes?.length || 0 
      };
    },
    delete: apiService.quotes.delete,
  }), []);

  const { 
    items: quotes, 
    isLoading,
    fetchItems: fetchQuotes,
    deleteItem: deleteQuote,
  } = useCrudApi<any, any, any>(api as any);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Brouillon' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
      sent: { color: 'bg-blue-100 text-blue-800', label: 'Envoyé' },
      accepted: { color: 'bg-green-100 text-green-800', label: 'Accepté' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Refusé' },
      expired: { color: 'bg-gray-100 text-gray-800', label: 'Expiré' }
    };
    const config = statusConfig[status] || { color: 'bg-gray-200', label: 'Inconnu' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleSendQuote = async (quoteId: string) => {
    try {
      await apiService.quotes.send(quoteId);
      toast.success(`Devis ${quoteId} envoyé au client`);
      fetchQuotes();
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du devis.');
    }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    try {
      await deleteQuote(quoteId);
      toast.success(`Devis ${quoteId} supprimé`);
    } catch (error) {
      toast.error('Erreur lors de la suppression du devis.');
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const clientName = quote.clientId ? `${quote.clientId.firstName} ${quote.clientId.lastName}` : '';
    const matchesSearch = quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
              Mes Devis
            </h1>
            <p className="text-gray-600 mt-2">Gérez vos devis et suivez leur statut</p>
          </div>
          <Button size="lg" onClick={() => navigate('/tech/quotes/create')} className="flex items-center">
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
                  placeholder="Rechercher par titre, référence ou client..."
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
                  <option value="pending">En attente</option>
                  <option value="sent">Envoyé</option>
                  <option value="accepted">Accepté</option>
                  <option value="rejected">Refusé</option>
                  <option value="expired">Expiré</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          {filteredQuotes.map((quote) => (
            <Card key={quote._id} className="p-6">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-semibold text-gray-900">{quote.title}</h3>
                    </div>
                    <p className="text-gray-600">{quote.reference}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(quote.status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Client</p>
                    <p className="font-medium flex items-center">
                      <Building className="w-4 h-4 mr-1 text-gray-400" />
                      {quote.clientId.firstName} {quote.clientId.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Montant</p>
                    <p className="text-lg font-bold text-gray-900">
                      {quote.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dates</p>
                    <div className="flex items-center text-sm">
                      <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                      <span>Créé le {new Date(quote.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="w-3 h-3 mr-1 text-gray-400" />
                      <span>Valide jusqu'au {new Date(quote.validUntil).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{quote.description}</p>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/tech/quotes/view/${quote._id}`)}>
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { /* PDF generation logic */ }}>
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                  </div>

                  <div className="flex space-x-2">
                    {quote.status === 'draft' && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteQuote(quote._id)}>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Supprimer
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/tech/quotes/edit/${quote._id}`)}>
                          <Edit2 className="w-4 h-4 mr-1" />
                          Modifier
                        </Button>
                        <Button variant="primary" size="sm" onClick={() => handleSendQuote(quote._id)}>
                          <Send className="w-4 h-4 mr-1" />
                          Envoyer
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

const ProtectedTechQuotes = () => (
  <ProtectedRoute roles={['technician']}>
    <TechQuotes />
  </ProtectedRoute>
);

export default ProtectedTechQuotes;
