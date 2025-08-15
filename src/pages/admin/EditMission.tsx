import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import { ArrowLeft, Save, ClipboardList } from 'lucide-react';
import apiService from '../../services/apiService';
import toast from 'react-hot-toast';

interface Mission {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  startDate: string;
  endDate?: string;
  clientId: { _id: string; firstName: string; lastName: string; email: string; company?: string; };
  technicianId: { _id: string; firstName: string; lastName: string; email: string; };
  requestId?: string;
  quoteId?: string;
  address: { street: string; city: string; postalCode: string; full?: string };
  estimatedCost?: number;
  actualCost?: number;
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

interface Technician {
  _id: string;
  firstName: string;
  lastName: string;
}

const EditMission: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mission, setMission] = useState<Mission | null>(null);
  const [formData, setFormData] = useState<Partial<Mission>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('Mission ID is missing.');
        setIsLoading(false);
        return;
      }
      try {
        const missionResponse = await apiService.missions.getById(id);
        setMission(missionResponse);
        setFormData({
          title: missionResponse.title,
          description: missionResponse.description,
          status: missionResponse.status,
          priority: missionResponse.priority,
          startDate: missionResponse.startDate ? new Date(missionResponse.startDate).toISOString().split('T')[0] : '',
          endDate: missionResponse.endDate ? new Date(missionResponse.endDate).toISOString().split('T')[0] : '',
          clientId: missionResponse.clientId,
          technicianId: missionResponse.technicianId,
          address: missionResponse.address,
          estimatedCost: missionResponse.estimatedCost,
          actualCost: missionResponse.actualCost,
          notes: missionResponse.notes,
        });

        const clientsResponse = await apiService.users.getAll({ role: 'client' });
        setClients(clientsResponse.items);

        const techniciansResponse = await apiService.users.getAll({ role: 'technician' });
        setTechnicians(techniciansResponse.items);

      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load mission details or related data.');
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
    } else if (name === 'technicianId') {
      const selectedTechnician = technicians.find(t => t._id === value);
      setFormData({ ...formData, technicianId: selectedTechnician || undefined });
    } else if (name === 'street' || name === 'city' || name === 'postalCode') {
      setFormData({
        ...formData,
        address: { ...formData.address, [name]: value } as any,
      });
    } else if (name === 'estimatedCost' || name === 'actualCost') {
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
      await apiService.missions.update(id, formData);
      toast.success('Mission mise à jour avec succès !');
      navigate(`/admin/missions/view/${id}`);
    } catch (err) {
      console.error('Failed to update mission:', err);
      setError('Failed to update mission. Please try again.');
      toast.error('Erreur lors de la mise à jour de la mission.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600">Chargement des détails de la mission...</p>
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

  if (!mission || !formData) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600">Mission non trouvée ou données manquantes.</p>
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
              Retour aux Missions
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ClipboardList className="w-8 h-8 mr-3 text-primary-600" />
              Modifier la Mission: {mission.title}
            </h1>
            <p className="text-gray-600 mt-2">
              Mettez à jour les informations de la mission #{mission._id}
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
                <option value="in-progress">En cours</option>
                <option value="completed">Terminée</option>
                <option value="cancelled">Annulée</option>
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
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Date de début</label>
              <input
                type="date"
                name="startDate"
                id="startDate"
                value={formData.startDate || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Date de fin (Optionnel)</label>
              <input
                type="date"
                name="endDate"
                id="endDate"
                value={formData.endDate || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
            <div>
              <label htmlFor="technicianId" className="block text-sm font-medium text-gray-700">Technicien</label>
              <select
                name="technicianId"
                id="technicianId"
                value={formData.technicianId?._id || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Sélectionner un technicien</option>
                {technicians.map((technician) => (
                  <option key={technician._id} value={technician._id}>
                    {technician.firstName} {technician.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="estimatedCost" className="block text-sm font-medium text-gray-700">Coût Estimé (€)</label>
              <input
                type="number"
                name="estimatedCost"
                id="estimatedCost"
                value={formData.estimatedCost || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label htmlFor="actualCost" className="block text-sm font-medium text-gray-700">Coût Réel (€) (Optionnel)</label>
              <input
                type="number"
                name="actualCost"
                id="actualCost"
                value={formData.actualCost || ''}
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

export default EditMission;
