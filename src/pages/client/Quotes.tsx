import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  FileText,
  Search,
  Filter,
  Eye,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  MessageSquare,
  CreditCard,
  AlertTriangle,
  Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../../services/apiService';

interface QuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
  itemType: 'service' | 'equipment';
  equipmentId?: string;
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

const ClientQuotes: React.FC = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchQuotes = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.quotes.getMy();
      setQuotes(response || []);
    } catch (error) {
      console.error('Error fetching client quotes:', error);
      toast.error('Erreur lors du chargement de vos devis.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'En attente', icon: Clock },
      sent: { color: 'bg-blue-100 text-blue-800', label: 'Envoyé', icon: Send },
      accepted: { color: 'bg-green-100 text-green-800', label: 'Accepté', icon: CheckCircle2 },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Refusé', icon: XCircle },
      expired: { color: 'bg-gray-100 text-gray-800', label: 'Expiré', icon: AlertTriangle }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-200', label: 'Inconnu', icon: AlertTriangle };
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const acceptQuote = async (quoteId: string) => {
    try {
      await apiService.quotes.respond(quoteId, true);
      toast.success('Devis accepté avec succès !');
      fetchQuotes();
    } catch (error) {
      console.error('Error accepting quote:', error);
      toast.error('Erreur lors de l\'acceptation du devis.');
    }
  };

  const rejectQuote = async (quoteId: string) => {
    try {
      await apiService.quotes.respond(quoteId, false);
      toast.success('Devis refusé avec succès !');
      fetchQuotes();
    } catch (error) {
      console.error('Error rejecting quote:', error);
      toast.error('Erreur lors du refus du devis.');
    }
  };

  const payQuote = (quoteId: string) => {
    navigate(`/client/payment/${quoteId}`);
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <Layout><div>Chargement de vos devis...</div></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="w-8 h-8 mr-3 text-primary-600" />
            Mes Devis
          </h1>
          <p className="text-gray-600 mt-2">Consultez et gérez vos devis reçus</p>
        </div>

        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par titre, référence ou description..."
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
                  <option value="accepted">Accepté</option>
                  <option value="rejected">Refusé</option>
                  <option value="expired">Expiré</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Devis</p>
                <p className="text-2xl font-bold text-gray-900">{quotes.length}</p>
              </div>
              <FileText className="w-8 h-8 text-primary-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Attente</p>
                <p className="text-2xl font-bold text-yellow-600">{quotes.filter(q => q.status === 'sent').length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Acceptés</p>
                <p className="text-2xl font-bold text-green-600">{quotes.filter(q => q.status === 'accepted').length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Montant Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  {quotes.reduce((sum, q) => sum + q.total, 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {filteredQuotes.map((quote) => (
            <Card key={quote._id} className="p-6">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{quote.title}</h3>
                    <p className="text-gray-600">{quote.reference}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(quote.status)}
                  </div>
                </div>

                <p className="text-gray-700">{quote.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Technicien</p>
                    <p className="font-medium">{quote.technicianId ? `${quote.technicianId.firstName} ${quote.technicianId.lastName}` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Montant</p>
                    <p className="text-lg font-bold text-gray-900">
                      {quote.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date de création</p>
                    <p className="font-medium">{new Date(quote.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Valide jusqu'au</p>
                    <p className={`font-medium ${
                      new Date(quote.validUntil) < new Date() ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {new Date(quote.validUntil).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Détail des prestations</h4>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Description</th>
                          <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Qté</th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Prix unitaire</th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quote.items.map((item, index) => (
                          <tr key={index} className="border-t border-gray-200">
                            <td className="px-4 py-2 text-sm text-gray-900">{item.description}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-center">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right">{item.unitPrice.toFixed(2)}€</td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">{(item.quantity * item.unitPrice).toFixed(2)}€</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-primary-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Sous-total HT:</span>
                    <span className="font-medium">{quote.subtotal.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">TVA ({quote.taxRate}%):</span>
                    <span className="font-medium">{quote.taxAmount.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold border-t border-primary-200 pt-2">
                    <span>Total TTC:</span>
                    <span className="text-primary-600">{quote.total.toFixed(2)}€</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {quote.notes && (
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Notes</p>
                      <p className="text-gray-600">{quote.notes}</p>
                    </div>
                  )}
                  {quote.terms && (
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Termes et Conditions</p>
                      <p className="text-gray-600">{quote.terms}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/client/quotes/${quote._id}`)}>
                      <Eye className="w-4 h-4 mr-1" />
                      Voir détail
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { /* PDF download logic */ }}>
                      <Download className="w-4 h-4 mr-1" />
                      Télécharger PDF
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { /* Message logic */ }}>
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Discuter
                    </Button>
                  </div>

                  <div className="flex space-x-2">
                    {quote.status === 'sent' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => rejectQuote(quote._id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Refuser
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => acceptQuote(quote._id)}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Accepter
                        </Button>
                      </>
                    )}
                    
                    {quote.status === 'accepted' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => payQuote(quote._id)}
                      >
                        <CreditCard className="w-4 h-4 mr-1" />
                        Payer
                      </Button>
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

export default ClientQuotes;
