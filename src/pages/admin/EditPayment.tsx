import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import { ArrowLeft, Save, DollarSign } from 'lucide-react';
import apiService from '../../services/apiService';
import toast from 'react-hot-toast';

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

interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  company?: string;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
}

const EditPayment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState<Partial<Payment>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('Payment ID is missing.');
        setIsLoading(false);
        return;
      }
      try {
        const paymentResponse = await apiService.payments.getById(id);
        setPayment(paymentResponse);
        setFormData({
          paymentNumber: paymentResponse.paymentNumber,
          amount: paymentResponse.amount,
          currency: paymentResponse.currency,
          paymentDate: paymentResponse.paymentDate ? new Date(paymentResponse.paymentDate).toISOString().split('T')[0] : '',
          method: paymentResponse.method,
          status: paymentResponse.status,
          clientId: paymentResponse.clientId,
          invoiceId: paymentResponse.invoiceId,
          notes: paymentResponse.notes,
        });

        const clientsResponse = await apiService.users.getAll({ role: 'client' });
        setClients(clientsResponse.items);

        const invoicesResponse = await apiService.invoices.getAll(); // Assuming getAll returns all invoices
        setInvoices(invoicesResponse.items);

      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load payment details or related data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'clientId') {
      const selectedClient = clients.find(c => c._id === value);
      setFormData({ ...formData, clientId: selectedClient || undefined });
    } else if (name === 'invoiceId') {
      const selectedInvoice = invoices.find(inv => inv._id === value);
      setFormData({ ...formData, invoiceId: selectedInvoice || undefined });
    } else if (name === 'amount') {
      setFormData({ ...formData, [name]: parseFloat(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsSaving(true);
    setError(null);
    try {
      await apiService.payments.update(id, formData);
      toast.success('Paiement mis à jour avec succès !');
      navigate(`/admin/payments/view/${id}`);
    } catch (err) {
      console.error('Failed to update payment:', err);
      setError('Failed to update payment. Please try again.');
      toast.error('Erreur lors de la mise à jour du paiement.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600">Chargement des détails du paiement...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-error-600">Erreur: {error}</p>
        </div>
      </Layout>
    );
  }

  if (!payment || !formData) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600">Paiement non trouvé ou données manquantes.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 flex items-center text-primary-600">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour aux Paiements
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <DollarSign className="w-8 h-8 mr-3 text-primary-600" />
              Modifier le Paiement: {payment.paymentNumber}
            </h1>
            <p className="text-gray-600 mt-2">
              Mettez à jour les informations du paiement #{payment.paymentNumber}
            </p>
          </div>
          <Button onClick={handleSubmit} disabled={isSaving} className="flex items-center">
            <Save className="w-5 h-5 mr-2" />
            {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="paymentNumber" className="block text-sm font-medium text-gray-700">N° Paiement</label>
              <input
                type="text"
                name="paymentNumber"
                id="paymentNumber"
                value={formData.paymentNumber || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Montant</label>
              <input
                type="number"
                name="amount"
                id="amount"
                value={formData.amount || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Devise</label>
              <input
                type="text"
                name="currency"
                id="currency"
                value={formData.currency || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700">Date de Paiement</label>
              <input
                type="date"
                name="paymentDate"
                id="paymentDate"
                value={formData.paymentDate || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label htmlFor="method" className="block text-sm font-medium text-gray-700">Méthode</label>
              <input
                type="text"
                name="method"
                id="method"
                value={formData.method || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Statut</label>
              <select
                name="status"
                id="status"
                value={formData.status || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Sélectionner un statut</option>
                <option value="pending">En attente</option>
                <option value="completed">Terminé</option>
                <option value="failed">Échoué</option>
                <option value="refunded">Remboursé</option>
              </select>
            </div>
            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">Client</label>
              <select
                name="clientId"
                id="clientId"
                value={formData.clientId?._id || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Sélectionner un client</option>
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.firstName} {client.lastName} {client.company ? `(${client.company})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="invoiceId" className="block text-sm font-medium text-gray-700">Facture Liée (Optionnel)</label>
              <select
                name="invoiceId"
                id="invoiceId"
                value={formData.invoiceId?._id || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Sélectionner une facture</option>
                {invoices.map((invoice) => (
                  <option key={invoice._id} value={invoice._id}>
                    {invoice.invoiceNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes Additionnelles</label>
              <textarea
                name="notes"
                id="notes"
                rows={3}
                value={formData.notes || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              ></textarea>
            </div>
          </div>

          {error && <p className="text-error-600 text-sm mt-4">{error}</p>}

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSaving}>
              <Save className="w-5 h-5 mr-2" />
              {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditPayment;
