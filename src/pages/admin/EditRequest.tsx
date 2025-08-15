import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import { ArrowLeft, Save, ClipboardList } from 'lucide-react';
import apiService from '../../services/apiService';

interface Request {
  _id: string;
  title: string;
  description: string;
  type: 'installation' | 'intervention';
  serviceTypeId: { _id: string; name: string; category: string };
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled' | 'quoted';
  address: { street: string; city: string; postalCode: string };
  estimatedBudget?: number;
  preferredDate?: string;
  notes?: string;
  attachments?: string[];
  clientId: { _id: string; firstName: string; lastName: string; company?: string } | null;
  assignedTechnician?: { _id: string; firstName: string; lastName: string };
  createdAt: string;
}

interface ServiceType {
  _id: string;
  name: string;
  category: string;
}

interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  company?: string;
}

const EditRequest: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<Request | null>(null);
  const [formData, setFormData] = useState<Partial<Request>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('Request ID is missing.');
        setIsLoading(false);
        return;
      }
      try {
        const requestResponse = await apiService.requests.getById(id);
        setRequest(requestResponse);
        setFormData({
          title: requestResponse.title,
          description: requestResponse.description,
          type: requestResponse.type,
          serviceTypeId: requestResponse.serviceTypeId,
          priority: requestResponse.priority,
          status: requestResponse.status,
          address: requestResponse.address,
          estimatedBudget: requestResponse.estimatedBudget,
          preferredDate: requestResponse.preferredDate ? new Date(requestResponse.preferredDate).toISOString().split('T')[0] : '',
          notes: requestResponse.notes,
          attachments: requestResponse.attachments,
          clientId: requestResponse.clientId,
        });

        const serviceTypesResponse = await apiService.siteCustomization.getServiceTypes();
        setServiceTypes(serviceTypesResponse.items);

        const clientsResponse = await apiService.users.getAll({ role: 'client' });
        setClients(clientsResponse.items);

      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load request details or related data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'serviceTypeId') {
      const selectedServiceType = serviceTypes.find(st => st._id === value);
      setFormData({ ...formData, serviceTypeId: selectedServiceType || undefined });
    } else if (name === 'clientId') {
      const selectedClient = clients.find(c => c._id === value);
      setFormData({ ...formData, clientId: selectedClient || null });
    } else if (name === 'street' || name === 'city' || name === 'postalCode') {
      setFormData({
        ...formData,
        address: { ...formData.address, [name]: value } as any,
      });
    } else if (name === 'estimatedBudget') {
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
      await apiService.requests.update(id, formData);
      navigate(`/admin/requests/view/${id}`);
    } catch (err) {
      console.error('Failed to update request:', err);
      setError('Failed to update request. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600">Chargement des détails de la demande...</p>
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

  if (!request || !formData) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600">Demande non trouvée ou données manquantes.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 flex items-center text-primary-600">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour aux Détails de la Demande
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ClipboardList className="w-8 h-8 mr-3 text-primary-600" />
              Modifier la Demande: {request.title}
            </h1>
            <p className="text-gray-600 mt-2">
              Mettez à jour les informations de la demande de service #{request._id}
            </p>
          </div>
          <Button onClick={handleSubmit} disabled={isSaving} className="flex items-center">
            <Save className="w-5 h-5 mr-2" />
            {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </div>

        {/* Edit Form */}
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
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type de Demande</label>
              <select
                name="type"
                id="type"
                value={formData.type || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Sélectionner un type</option>
                <option value="installation">Installation</option>
                <option value="intervention">Intervention</option>
              </select>
            </div>
            <div>
              <label htmlFor="serviceTypeId" className="block text-sm font-medium text-gray-700">Service</label>
              <select
                name="serviceTypeId"
                id="serviceTypeId"
                value={formData.serviceTypeId?._id || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Sélectionner un service</option>
                {serviceTypes.map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.name}
                  </option>
                ))}
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
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priorité</label>
              <select
                name="priority"
                id="priority"
                value={formData.priority || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Sélectionner une priorité</option>
                <option value="low">Faible</option>
                <option value="normal">Normale</option>
                <option value="high">Élevée</option>
                <option value="urgent">Urgente</option>
              </select>
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
                <option value="assigned">Assignée</option>
                <option value="in-progress">En cours</option>
                <option value="completed">Terminée</option>
                <option value="cancelled">Annulée</option>
                <option value="quoted">Devis envoyé</option>
              </select>
            </div>
            <div>
              <label htmlFor="estimatedBudget" className="block text-sm font-medium text-gray-700">Budget Estimé (€)</label>
              <input
                type="number"
                name="estimatedBudget"
                id="estimatedBudget"
                value={formData.estimatedBudget || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700">Date Préférée</label>
              <input
                type="date"
                name="preferredDate"
                id="preferredDate"
                value={formData.preferredDate || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="street" className="block text-sm font-medium text-gray-700">Rue</label>
              <input
                type="text"
                name="street"
                id="street"
                value={formData.address?.street || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">Ville</label>
              <input
                type="text"
                name="city"
                id="city"
                value={formData.address?.city || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Code Postal</label>
              <input
                type="text"
                name="postalCode"
                id="postalCode"
                value={formData.address?.postalCode || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
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

export default EditRequest;
