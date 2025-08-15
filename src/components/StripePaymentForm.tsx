import React, { useState } from 'react';
import { CardElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Button from './Button';
import { CreditCard, Lock, Shield } from 'lucide-react';

// Charger Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  description: string;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError: (error: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  clientSecret,
  amount,
  description,
  onPaymentSuccess,
  onPaymentError
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setCardError(null);

    const cardElement = elements.getElement(CardElement);
    
    if (!cardElement) {
      setCardError('Une erreur est survenue avec le formulaire de paiement');
      setIsProcessing(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Client Ectriborne',
          },
        },
      });

      if (error) {
        setCardError(error.message || 'Une erreur est survenue lors du paiement');
        onPaymentError(error.message || 'Une erreur est survenue lors du paiement');
      } else if (paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent.id);
      } else {
        setCardError(`Paiement ${paymentIntent.status}. Veuillez réessayer.`);
        onPaymentError(`Paiement ${paymentIntent.status}. Veuillez réessayer.`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur inconnue est survenue';
      setCardError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-primary-600" />
            Paiement sécurisé
          </h3>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Montant à payer:</span>
              <span className="text-xl font-bold text-primary-600">
                {amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">{description}</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Informations de carte
              </label>
              <div className="border border-gray-300 rounded-lg p-4 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500">
                <CardElement options={cardElementOptions} />
              </div>
              {cardError && (
                <p className="mt-2 text-sm text-red-600">{cardError}</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-blue-800">Paiement sécurisé</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Vos informations de paiement sont protégées par le chiffrement SSL et traitées par Stripe.
                    Nous ne stockons jamais vos données de carte bancaire.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={!stripe || isProcessing}
          isLoading={isProcessing}
        >
          <Lock className="w-4 h-4 mr-2" />
          Payer {amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
        </Button>
      </div>
    </form>
  );
};

interface StripePaymentFormProps {
  clientSecret: string;
  amount: number;
  description: string;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError: (error: string) => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default StripePaymentForm;