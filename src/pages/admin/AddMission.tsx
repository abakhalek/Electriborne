import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { ClipboardList, ArrowLeft, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import apiService from '../../services/apiService';

interface MissionFormData {
  serviceType: string;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduledDate: string;
  address: string;
  details?: string;
  clientId: string;
  technicianId: string;
  quoteId: string;
  invoiceId?: string;
}

const AddMission: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<MissionFormData>({
    defaultValues: {
      status: 'pending',
      priority: 'normal',
    }
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('Loading initial data...');
        const [clientsRes, techniciansRes, quotesRes, serviceTypesRes] = await Promise.all([
          apiService.users.getClients(),
          apiService.users.getTechnicians(),
          apiService.quotes.getAll(),
          apiService.siteCustomization.getServiceTypes(),
        ]);

        console.log('Clients response:', clientsRes);
        console.log('Technicians response:', techniciansRes);
        console.log('Quotes response:', quotesRes);
        console.log('Service Types response:', serviceTypesRes);

        setClients(clientsRes || []);
        setTechnicians(techniciansRes || []);
        setQuotes(quotesRes.items || []);
        setServiceTypes(serviceTypesRes.items || []);
        console.log('Initial data loaded successfully.');
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast.error('Erreur lors du chargement des données initiales.');
      }
    };
    loadInitialData();
  }, []);

  const onSubmit = async (data: MissionFormData) => {
    setIsLoading(true);

    const missionData: Partial<MissionFormData> = { ...data };

    // Convert empty strings to null for ObjectId fields
    if (missionData.serviceType === '') missionData.serviceType = null as any;
    if (missionData.clientId === '') missionData.clientId = null as any;
    if (missionData.technicianId === '') missionData.technicianId = null as any;
    if (missionData.quoteId === '') missionData.quoteId = null as any;

    if (!missionData.invoiceId || missionData.invoiceId.trim() === '') {
      delete missionData.invoiceId;
    }

    try {
      await apiService.missions.create(missionData);
      toast.success('Mission créée avec succès !');
      navigate('/admin/missions');
    } catch (error) {
      toast.error('Erreur lors de la création de la mission');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/admin/missions')}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <ClipboardList className="w-8 h-8 mr-3 text-primary-600" />
                Nouvelle Mission
              </h1>
              <p className="text-gray-600 mt-2">
                Créer une nouvelle mission dans le système
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de Service *</label>
                <select {...register('serviceType', { required: 'Le type de service est requis' })} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="">Sélectionner un type</option>
                  {serviceTypes.map(st => <option key={st._id} value={st._id}>{st.name}</option>)}
                </select>
                {errors.serviceType && <p className="mt-1 text-sm text-red-600">{errors.serviceType.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client *</label>
                <select {...register('clientId', { required: 'Le client est requis' })} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="">Sélectionner un client</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>)}
                </select>
                {errors.clientId && <p className="mt-1 text-sm text-red-600">{errors.clientId.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Technicien *</label>
                <select {...register('technicianId', { required: 'Le technicien est requis' })} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="">Sélectionner un technicien</option>
                  {technicians.map(t => <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>)}
                </select>
                {errors.technicianId && <p className="mt-1 text-sm text-red-600">{errors.technicianId.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Devis *</label>
                <select {...register('quoteId', { required: 'Le devis est requis' })} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="">Sélectionner un devis</option>
                  {quotes.map(q => <option key={q._id} value={q._id}>{q.title}</option>)}
                </select>
                {errors.quoteId && <p className="mt-1 text-sm text-red-600">{errors.quoteId.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Planifiée *</label>
                <input
                  type="datetime-local"
                  {...register('scheduledDate', { required: 'La date est requise' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                {errors.scheduledDate && <p className="mt-1 text-sm text-red-600">{errors.scheduledDate.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut *</label>
                <select {...register('status', { required: 'Le statut est requis' })} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="pending">En attente</option>
                  <option value="accepted">Acceptée</option>
                  <option value="in-progress">En cours</option>
                  <option value="completed">Terminée</option>
                  <option value="cancelled">Annulée</option>
                </select>
                {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priorité *</label>
                <select {...register('priority', { required: 'La priorité est requise' })} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="low">Basse</option>
                  <option value="normal">Normale</option>
                  <option value="high">Haute</option>
                  <option value="urgent">Urgente</option>
                </select>
                {errors.priority && <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse *</label>
                <input
                  type="text"
                  {...register('address', { required: 'L\'adresse est requise' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Détails</label>
                <textarea
                  {...register('details')}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

               <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Facture (Optionnel)</label>
                <input
                  type="text"
                  {...register('invoiceId')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="ghost" onClick={() => navigate('/admin/missions')}>
              Annuler
            </Button>
            <Button type="submit" isLoading={isLoading} size="lg">
              <Save className="w-4 h-4 mr-2" />
              Créer la Mission
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddMission;
