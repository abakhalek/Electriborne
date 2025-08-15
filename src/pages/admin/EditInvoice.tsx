import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import apiService from '../../services/apiService';
import toast from 'react-hot-toast';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  title: string;
  description: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  issueDate: string;
  dueDate: string;
  clientId: { _id: string; firstName: string; lastName: string; email: string; company?: string; };
  missionId?: string;
  quoteId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  itemType: 'service' | 'product';
  productId?: { _id: string; name: string; price: number; };
}

interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  company?: string;
}

const EditInvoice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState<Partial<Invoice>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('Invoice ID is missing.');
        setIsLoading(false);
        return;
      }
      try {
        const invoiceResponse = await apiService.invoices.getById(id);
        setInvoice(invoiceResponse);
        setFormData({
          title: invoiceResponse.title,
          description: invoiceResponse.description,
          status: invoiceResponse.status,
          issueDate: invoiceResponse.issueDate ? new Date(invoiceResponse.issueDate).toISOString().split('T')[0] : '',
          dueDate: invoiceResponse.dueDate ? new Date(invoiceResponse.dueDate).toISOString().split('T')[0] : '',
          clientId: invoiceResponse.clientId,
          notes: invoiceResponse.notes,
          items: invoiceResponse.items,
        });

        const clientsResponse = await apiService.users.getAll({ role: 'client' });
        setClients(clientsResponse.items);

      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load invoice details or related data.');
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
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newItems = [...(formData.items || [])];
    const item = newItems[index];
    (item as any)[name] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsSaving(true);
    setError(null);
    try {
      await apiService.invoices.update(id, formData);
      toast.success('Facture mise à jour avec succès !');
      navigate(`/admin/invoices/view/${id}`);
    } catch (err) {
      console.error('Failed to update invoice:', err);
      setError('Failed to update invoice. Please try again.');
      toast.error('Erreur lors de la mise à jour de la facture.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600">Chargement des détails de la facture...</p>
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

  if (!invoice || !formData) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600">Facture non trouvée ou données manquantes.</p>
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
              Retour aux Factures
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="w-8 h-8 mr-3 text-primary-600" />
              Modifier la Facture: {invoice.invoiceNumber}
            </h1>
            <p className="text-gray-600 mt-2">
              Mettez à jour les informations de la facture #{invoice.invoiceNumber}
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
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Titre</label>
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title || ''}
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
                <option value="paid">Payée</option>
                <option value="overdue">En retard</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>
            <div>
              <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700">Date d'émission</label>
              <input
                type="date"
                name="issueDate"
                id="issueDate"
                value={formData.issueDate || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Date d'échéance</label>
              <input
                type="date"
                name="dueDate"
                id="dueDate"
                value={formData.dueDate || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
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
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                id="description"
                rows={4}
                value={formData.description || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              ></textarea>
            </div>
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

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Articles de la facture</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Description</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Type</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Quantité</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Prix Unitaire</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(formData.items || []).map((item, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="px-4 py-2 text-sm text-gray-900">
                        <input
                          type="text"
                          name="description"
                          value={item.description || ''}
                          onChange={(e) => handleItemChange(index, e)}
                          className="w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 capitalize">
                        <select
                          name="itemType"
                          value={item.itemType || ''}
                          onChange={(e) => handleItemChange(index, e)}
                          className="w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="service">Service</option>
                          <option value="product">Produit</option>
                        </select>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">
                        <input
                          type="number"
                          name="quantity"
                          value={item.quantity || ''}
                          onChange={(e) => handleItemChange(index, e)}
                          className="w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-right"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">
                        <input
                          type="number"
                          name="unitPrice"
                          value={item.unitPrice || ''}
                          onChange={(e) => handleItemChange(index, e)}
                          className="w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-right"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">
                        {((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

export default EditInvoice;
