import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import FormModal from '../../components/FormModal';
import { 
  FileText, 
  Download, 
  CheckCircle2, 
  XCircle,
  ArrowLeft,
  MessageSquare,
  CreditCard,
  Calendar,
  
  User,
  Building,
  Phone,
  Mail,
  AlertTriangle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import apiService from '../../services/apiService';

interface QuoteItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface Quote {
  id: string;
  reference: string;
  title: string;
  description: string;
  status: string;
  client: {
    name: string;
    contact: string;
    email: string;
    phone: string;
  };
  technician: {
    name: string;
    email: string;
    phone: string;
  };
  items: QuoteItem[];
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  createdDate: string;
  validUntil: string;
  paymentTerms: string;
  warranty: string;
  isComplementary: boolean;
  originalQuote?: string;
  relatedIntervention?: string;
}

interface RejectFormData {
  reason: string;
}

const QuoteDetails: React.FC = () => {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RejectFormData>();

  useEffect(() => {
    fetchQuote();
  }, [quoteId]);

  const fetchQuote = async () => {
    try {
      setIsLoading(true);
      
      if (!quoteId) {
        toast.error('ID de devis manquant');
        navigate('/client/quotes');
        return;
      }
      
      const quoteData = await apiService.quotes.getById(quoteId);
      setQuote(quoteData);
    } catch (error) {
      toast.error('Erreur lors du chargement du devis');
      navigate('/client/quotes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptQuote = async () => {
    if (!quote) return;
    
    try {
      setIsAccepting(true);
      
      await apiService.quotes.respond(quote.id, true);
      
      // Mettre à jour l'état local
      setQuote(prev => prev ? { ...prev, status: 'accepted' } : null);
      
      // Rediriger vers la page de paiement
      setTimeout(() => {
        navigate(`/client/payment/${quoteId}`);
      }, 1500);
      
    } catch (error) {
      toast.error('Erreur lors de l\'acceptation du devis');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRejectQuote = async (data: RejectFormData) => {
    if (!quote) return;
    
    try {
      setIsRejecting(true);
      
      await apiService.quotes.respond(quote.id, false, data.reason);
      
      // Mettre à jour l'état local
      setQuote(prev => prev ? { ...prev, status: 'rejected' } : null);
      
      // Fermer la modal
      setShowRejectModal(false);
      
    } catch (error) {
      toast.error('Erreur lors du refus du devis');
    } finally {
      setIsRejecting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Brouillon' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
      sent: { color: 'bg-blue-100 text-blue-800', label: 'Envoyé' },
      accepted: { color: 'bg-green-100 text-green-800', label: 'Accepté' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Refusé' },
      expired: { color: 'bg-gray-100 text-gray-800', label: 'Expiré' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const downloadQuotePDF = async () => {
    try {
      // Logique pour télécharger le PDF
      toast.success('Téléchargement du PDF en cours...');
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
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

  if (!quote) {
    return (
      <Layout>
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Devis non trouvé</h2>
          <p className="text-gray-600">Le devis demandé n'existe pas ou n'est plus accessible.</p>
          <Button className="mt-6" onClick={() => navigate('/client/quotes')}>
            Retour aux devis
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/client/quotes')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="w-8 h-8 mr-3 text-primary-600" />
              Détail du Devis
            </h1>
            <p className="text-gray-600 mt-2">
              {quote.reference} - {quote.title}
            </p>
          </div>
        </div>

        {/* Status Card */}
        <Card className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Statut du devis</h3>
              <div className="flex items-center mt-2">
                {getStatusBadge(quote.status)}
                <span className="ml-2 text-sm text-gray-600">
                  {quote.status === 'pending' && 'En attente de votre réponse'}
                  {quote.status === 'accepted' && 'Vous avez accepté ce devis'}
                  {quote.status === 'rejected' && 'Vous avez refusé ce devis'}
                  {quote.status === 'expired' && 'Ce devis a expiré'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-600">
                <Calendar className="w-4 h-4 inline mr-1" />
                Valide jusqu'au {new Date(quote.validUntil).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
        </Card>

        {/* Quote Content */}
        <Card className="p-6">
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700">{quote.description}</p>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Client</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Building className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium">{quote.client.name}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{quote.client.contact}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{quote.client.phone}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{quote.client.email}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Technicien</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium">{quote.technician.name}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{quote.technician.phone}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{quote.technician.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Détail des prestations</h3>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Description</th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Qté</th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Unité</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Prix unitaire</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.items.map((item, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="px-4 py-2 text-sm text-gray-900">{item.description}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-center">{item.quantity}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-center">{item.unit}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right">{item.unitPrice.toFixed(2)}€</td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">{item.total.toFixed(2)}€</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-primary-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Sous-total HT:</span>
                <span className="font-medium">{quote.subtotal.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">TVA (20%):</span>
                <span className="font-medium">{quote.vatAmount.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold border-t border-primary-200 pt-2">
                <span>Total TTC:</span>
                <span className="text-primary-600">{quote.totalAmount.toFixed(2)}€</span>
              </div>
            </div>

            {/* Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-900 mb-1">Conditions de paiement</p>
                <p className="text-gray-600">{quote.paymentTerms}</p>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Garantie</p>
                <p className="text-gray-600">{quote.warranty}</p>
              </div>
            </div>

            {/* Complementary Info */}
            {quote.isComplementary && quote.originalQuote && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-medium text-blue-800">Devis complémentaire</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Ce devis est complémentaire au devis {quote.originalQuote} et concerne l'intervention {quote.relatedIntervention}.
                      Des travaux supplémentaires ont été identifiés lors de l'intervention.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-3">
            <Button variant="ghost" onClick={downloadQuotePDF}>
              <Download className="w-4 h-4 mr-2" />
              Télécharger PDF
            </Button>
            <Button 
              variant="ghost"
              onClick={() => navigate('/client/messages')}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Contacter
            </Button>
          </div>

          {quote.status === 'pending' && (
            <div className="flex space-x-3">
              <Button 
                variant="ghost" 
                onClick={() => setShowRejectModal(true)}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Refuser
              </Button>
              <Button 
                variant="primary"
                onClick={handleAcceptQuote}
                isLoading={isAccepting}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Accepter et payer
              </Button>
            </div>
          )}

          {quote.status === 'accepted' && (
            <Button 
              variant="primary"
              onClick={() => navigate(`/client/payment/${quoteId}`)}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Payer
            </Button>
          )}
        </div>

        {/* Reject Modal */}
        <FormModal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          title="Refuser le devis"
          footer={
            <div className="flex justify-end space-x-3">
              <Button
                variant="ghost"
                onClick={() => setShowRejectModal(false)}
                disabled={isRejecting}
              >
                Annuler
              </Button>
              <Button
                variant="error"
                onClick={handleSubmit(handleRejectQuote)}
                isLoading={isRejecting}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Confirmer le refus
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Veuillez indiquer la raison pour laquelle vous refusez ce devis. 
              Cela nous aidera à améliorer nos services.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison du refus *
              </label>
              <textarea
                {...register('reason', { required: 'La raison est requise' })}
                rows={4}
                placeholder="Expliquez pourquoi vous refusez ce devis..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.reason && (
                <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
              )}
            </div>
          </div>
        </FormModal>
      </div>
    </Layout>
  );
};

export default QuoteDetails;