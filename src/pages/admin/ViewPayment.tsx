import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import apiService from '../../services/apiService';
import toast from 'react-hot-toast';
import { ArrowLeft, DollarSign, User, Calendar, FileText, Edit2, Mail, Building } from 'lucide-react';

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

const ViewPayment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayment = async () => {
      if (!id) {
        setError('Payment ID is missing.');
        setIsLoading(false);
        return;
      }
      try {
        const fetchedPayment = await apiService.payments.getById(id);
        setPayment(fetchedPayment);
      } catch (err) {
        console.error('Failed to fetch payment:', err);
        setError('Erreur lors du chargement du paiement.');
        toast.error('Erreur lors du chargement du paiement.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayment();
  }, [id]);

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Terminé' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Échoué' },
      refunded: { color: 'bg-gray-100 text-gray-800', label: 'Remboursé' },
    };
    const config = statusConfig[status] || { color: 'bg-gray-200', label: 'Inconnu' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return <Layout><div className="text-center py-8">Chargement du paiement...</div></Layout>;
  }

  if (error) {
    return <Layout><div className="text-center py-8 text-red-600">{error}</div></Layout>;
  }

  if (!payment) {
    return <Layout><div className="text-center py-8">Paiement non trouvé.</div></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <DollarSign className="w-8 h-8 mr-3 text-primary-600" />
            Détails du Paiement #{payment.paymentNumber}
          </h1>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour
          </Button>
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations Générales</h2>
              <div className="space-y-2">
                <p className="flex items-center text-gray-700">
                  <DollarSign className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="font-medium">Montant:</span> {payment.amount.toFixed(2)} {payment.currency}
                </p>
                <p className="flex items-center text-gray-700">
                  <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="font-medium">Date de paiement:</span> {new Date(payment.paymentDate).toLocaleDateString()}
                </p>
                <p className="flex items-center text-gray-700">
                  <FileText className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="font-medium">Méthode:</span> {payment.method}
                </p>
                <p className="flex items-center text-gray-700">
                  <DollarSign className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="font-medium">Statut:</span> {getStatusBadge(payment.status)}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Détails Client</h2>
              <div className="space-y-2">
                <p className="flex items-center text-gray-700">
                  <User className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="font-medium">Nom:</span> {payment.clientId.firstName} {payment.clientId.lastName}
                </p>
                <p className="flex items-center text-gray-700">
                  <Mail className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="font-medium">Email:</span> {payment.clientId.email}
                </p>
                {payment.clientId.company && (
                  <p className="flex items-center text-gray-700">
                    <Building className="w-5 h-5 mr-2 text-gray-500" />
                    <span className="font-medium">Entreprise:</span> {payment.clientId.company}
                  </p>
                )}
              </div>
            </div>
          </div>

          {payment.invoiceId && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Facture Liée</h2>
              <p className="text-gray-700 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-500" />
                <span className="font-medium">Numéro de Facture:</span> {payment.invoiceId.invoiceNumber}
              </p>
              <Button variant="link" onClick={() => navigate(`/admin/invoices/view/${payment.invoiceId?._id}`)}>
                Voir la Facture
              </Button>
            </div>
          )}

          {payment.notes && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-md">{payment.notes}</p>
            </div>
          )}

          <div className="flex justify-end mt-8 space-x-3">
            <Button variant="secondary" onClick={() => navigate(`/admin/payments/edit/${payment._id}`)}>
              <Edit2 className="w-5 h-5 mr-2" />
              Modifier le Paiement
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default ViewPayment;
