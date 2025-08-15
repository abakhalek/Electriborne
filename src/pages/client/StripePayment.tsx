import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StripePaymentForm from '../../components/StripePaymentForm';
import { 
   
  Shield, 
  CheckCircle2, 
  AlertTriangle,
  ArrowLeft,
  FileText,
  
  
  Percent
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../../services/apiService';

interface Quote {
  id: string;
  reference: string;
  title: string;
  description: string;
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  createdDate: string;
  validUntil: string;
}

const StripePayment: React.FC = () => {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [paymentType, setPaymentType] = useState<'partial' | 'full'>('partial');
  const [isLoading, setIsLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

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
      
      // Créer l'intention de paiement
      createPaymentIntent(quoteData, 'partial');
    } catch (error) {
      toast.error('Erreur lors du chargement du devis');
      navigate('/client/quotes');
    } finally {
      setIsLoading(false);
    }
  };

  const createPaymentIntent = async (quoteData: Quote, type: 'partial' | 'full') => {
    try {
      const amount = type === 'partial' 
        ? quoteData.subtotal * 0.5  // 50% HT
        : quoteData.totalAmount;    // Total TTC
      
      // Appel API pour créer l'intention de paiement
      const response = await apiService.payments.createPaymentIntent(quoteData.id, type, amount);
      
      setClientSecret(response.clientSecret);
    } catch (error) {
      toast.error('Erreur lors de la création du paiement');
    }
  };

  const handlePaymentTypeChange = (type: 'partial' | 'full') => {
    setPaymentType(type);
    if (quote) {
      createPaymentIntent(quote, type);
    }
  };

  const handlePaymentSuccess = (paymentId: string) => {
    setPaymentId(paymentId);
    setPaymentSuccess(true);
    toast.success('Paiement effectué avec succès !');
    
    // Confirmer le paiement côté serveur
    apiService.payments.confirmPayment(paymentId)
      .catch(error => console.error('Erreur lors de la confirmation du paiement:', error));
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Erreur de paiement : ${error}`);
  };

  const getPaymentAmount = () => {
    if (!quote) return 0;
    return paymentType === 'partial' 
      ? quote.subtotal * 0.5  // 50% HT
      : quote.totalAmount;    // Total TTC
  };

  const getPaymentDescription = () => {
    if (!quote) return '';
    return paymentType === 'partial'
      ? `Acompte 50% pour ${quote.title} (${quote.reference})`
      : `Paiement intégral pour ${quote.title} (${quote.reference})`;
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

  if (paymentSuccess) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Paiement effectué avec succès !
            </h2>
            <p className="text-gray-600 mb-8">
              Votre paiement de {getPaymentAmount().toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} 
              a bien été enregistré. Un reçu vous a été envoyé par email.
            </p>
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="font-semibold text-gray-900 mb-2">Référence de paiement</h3>
              <p className="text-xl font-bold text-primary-600">{paymentId || 'PAY-2024-001'}</p>
              <p className="text-sm text-gray-500 mt-2">Conservez cette référence pour vos archives</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/client/payments')}>
                Voir mes paiements
              </Button>
              <Button variant="ghost" onClick={() => navigate('/client/dashboard')}>
                Retour au dashboard
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  const partialAmount = quote.subtotal * 0.5;
  const fullAmount = quote.totalAmount;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Paiement Sécurisé
            </h1>
            <p className="text-gray-600">
              Devis {quote.reference} - {quote.title}
            </p>
          </div>
        </div>

        {/* Quote Summary */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-primary-600" />
            Récapitulatif du devis
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Sous-total HT:</span>
              <span className="font-medium">{quote.subtotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">TVA (20%):</span>
              <span className="font-medium">{quote.vatAmount.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-3">
              <span>Total TTC:</span>
              <span>{quote.totalAmount.toFixed(2)} €</span>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Date de création:</span>
              <p className="font-medium">{new Date(quote.createdDate).toLocaleDateString('fr-FR')}</p>
            </div>
            <div>
              <span className="text-gray-500">Valide jusqu'au:</span>
              <p className="font-medium">{new Date(quote.validUntil).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </Card>

        {/* Payment Type Selection */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Percent className="w-5 h-5 mr-2 text-primary-600" />
            Type de paiement
          </h3>
          <div className="space-y-4">
            <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
              paymentType === 'partial' 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="paymentType"
                value="partial"
                checked={paymentType === 'partial'}
                onChange={() => handlePaymentTypeChange('partial')}
                className="sr-only"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Acompte 50% HT</h4>
                    <p className="text-sm text-gray-600">Paiement partiel pour commencer les travaux</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">{partialAmount.toFixed(2)} €</p>
                    <p className="text-sm text-gray-500">50% du montant HT</p>
                  </div>
                </div>
              </div>
              {paymentType === 'partial' && (
                <CheckCircle2 className="w-5 h-5 text-primary-600 ml-3" />
              )}
            </label>

            <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
              paymentType === 'full' 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="paymentType"
                value="full"
                checked={paymentType === 'full'}
                onChange={() => handlePaymentTypeChange('full')}
                className="sr-only"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Paiement intégral</h4>
                    <p className="text-sm text-gray-600">Paiement complet du devis TTC</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">{fullAmount.toFixed(2)} €</p>
                    <p className="text-sm text-gray-500">Montant total TTC</p>
                  </div>
                </div>
              </div>
              {paymentType === 'full' && (
                <CheckCircle2 className="w-5 h-5 text-primary-600 ml-3" />
              )}
            </label>
          </div>
        </Card>

        {/* Payment Form */}
        <Card className="p-6">
          {clientSecret ? (
            <StripePaymentForm
              clientSecret={clientSecret}
              amount={getPaymentAmount()}
              description={getPaymentDescription()}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          ) : (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          )}
        </Card>

        {/* Security Notice */}
        <Card className="p-4 bg-gray-50">
          <div className="flex items-center text-sm text-gray-600">
            <Shield className="w-4 h-4 mr-2" />
            <span>
              Paiement sécurisé par Stripe. Vos données bancaires ne sont jamais stockées sur nos serveurs.
            </span>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default StripePayment;