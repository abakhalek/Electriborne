import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  ClipboardList, 
  User, 
  MapPin, 
  Wrench,
  Calendar,
  
  ArrowLeft,
  Save,
  PlusCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import apiService from '../../services/apiService';

interface RequestForm {
  clientId: string;
  serviceTypeId: string;
  title: string;
  description: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  address: {
    street: string;
    city: string;
    postalCode: string;
  };
  estimatedBudget?: number;
  preferredDate?: string;
  notes?: string;
  attachments?: string[];
}

interface ServiceType {
  _id: string;
  name: string;
  category: 'installation' | 'intervention';
}

interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  company?: string;
}

const AddRequest: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  
  const { register, handleSubmit, formState: { errors } } = useForm<RequestForm>({
    defaultValues: {
      priority: 'normal',
    }
  });

  useEffect(() => {
    const fetchServiceTypes = async () => {
      try {
        const response = await apiService.siteCustomization.getServiceTypes();
        setServiceTypes(response.items);
      } catch (error) {
        console.error('Error fetching service types:', error);
        toast.error('Erreur lors du chargement des types de service.');
      }
    };

    const fetchClients = async () => {
      try {
        const response = await apiService.users.getClients();
        setClients(response);
      } catch (error) {
        console.error('Error fetching clients:', error);
        toast.error('Erreur lors du chargement des clients.');
      }
    };

    fetchServiceTypes();
    fetchClients();
  }, []);

  const priorityLevels = [
    { value: 'low', label: 'Faible', color: 'text-blue-600' },
    { value: 'normal', label: 'Normale', color: 'text-gray-600' },
    { value: 'high', label: 'Élevée', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgente', color: 'text-red-600' }
  ];

  const onSubmit = async (data: RequestForm) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      // Append all properties of data to formData
      for (const key in data) {
        const value = (data as any)[key]; // Use 'any' for indexing
        if (value !== undefined && value !== null) {
          // Handle nested objects like 'address'
          if (typeof value === 'object' && !Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (Array.isArray(value)) {
            // Handle arrays, e.g., attachments if they were FileList/File[]
            // For now, assuming attachments are string[] and not actual files to upload
            value.forEach((item, index) => {
              formData.append(`${key}[${index}]`, String(item));
            });
          } else {
            formData.append(key, String(value));
          }
        }
      }

      await apiService.requests.create(formData); // Pass formData instead of data
      toast.success('Demande créée avec succès !');
      navigate('/admin/requests');
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Erreur lors de la création de la demande');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/admin/requests')}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <ClipboardList className="w-8 h-8 mr-3 text-primary-600" />
                Nouvelle Demande
              </h1>
              <p className="text-gray-600 mt-2">
                Créer une nouvelle demande d'intervention
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Informations client */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-primary-600" />
              Informations Client
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client *
                </label>
                <select
                  {...register('clientId', { required: 'Le client est requis' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Sélectionner un client</option>
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>
                      {client.company ? `${client.company} (${client.firstName} ${client.lastName})` : `${client.firstName} ${client.lastName}`}
                    </option>
                  ))}
                </select>
                {errors.clientId && (
                  <p className="mt-1 text-sm text-red-600">{errors.clientId.message}</p>
                )}
              </div>

              {/* Removed contactPerson as it's now handled by clientId */}
            </div>
          </Card>

          {/* Type d'intervention */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Wrench className="w-5 h-5 mr-2 text-primary-600" />
              Type d'Intervention
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type d'intervention *
                </label>
                <div className="flex items-center space-x-2">
                  <select
                    {...register('serviceTypeId', { required: 'Le type de service est requis' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Sélectionner un type</option>
                    {serviceTypes.map(type => (
                      <option key={type._id} value={type._id}>
                        {type.name} ({type.category === 'installation' ? 'Installation' : 'Intervention'})
                      </option>
                    ))}
                  </select>
                  <Button type="button" variant="secondary" size="sm" onClick={() => navigate('/admin/service-types')}>
                    <PlusCircle className="w-4 h-4" />
                  </Button>
                </div>
                {errors.serviceTypeId && (
                  <p className="mt-1 text-sm text-red-600">{errors.serviceTypeId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priorité
                </label>
                <select
                  {...register('priority')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {priorityLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de la demande *
                </label>
                <input
                  type="text"
                  {...register('title', { required: 'Le titre est requis' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: Installation borne de recharge parking"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description détaillée *
                </label>
                <textarea
                  {...register('description', { required: 'La description est requise' })}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Décrivez en détail les travaux à réaliser..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget estimé (€)
                </label>
                <input
                  type="number"
                  {...register('estimatedBudget', { valueAsNumber: true })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0"
                />
              </div>
            </div>
          </Card>

          {/* Lieu et planning */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-primary-600" />
              Lieu et Planning
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse d'intervention *
                </label>
                <input
                  type="text"
                  {...register('address.street', { required: 'L\'adresse est requise' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="15 Rue de la Paix"
                />
                {errors.address?.street && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.street.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville *
                </label>
                <input
                  type="text"
                  {...register('address.city', { required: 'La ville est requise' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Paris"
                />
                {errors.address?.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code Postal *
                </label>
                <input
                  type="text"
                  {...register('address.postalCode', { required: 'Le code postal est requis' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="75001"
                />
                {errors.address?.postalCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.postalCode.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date préférée
                </label>
                <input
                  type="date"
                  {...register('preferredDate')}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Removed Urgency and Access Instructions as they are not in the new RequestForm */}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/admin/requests')}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
              Créer la Demande
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddRequest;
