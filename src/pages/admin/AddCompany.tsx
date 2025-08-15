import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail,
  User,
  ArrowLeft,
  Save,
  
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface CompanyForm {
  name: string;
  type: string;
  siret: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  contact: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    position: string;
  };
  description: string;
  website: string;
  isActive: boolean;
}

const AddCompany: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<CompanyForm>({
    defaultValues: {
      isActive: true,
      address: {
        country: 'France'
      }
    }
  });

  const companyTypes = [
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'bakery', label: 'Boulangerie' },
    { value: 'retail', label: 'Commerce de détail' },
    { value: 'cafe', label: 'Café/Bar' },
    { value: 'office', label: 'Bureau/Entreprise' },
    { value: 'hotel', label: 'Hôtel' },
    { value: 'pharmacy', label: 'Pharmacie' },
    { value: 'supermarket', label: 'Supermarché' },
    { value: 'other', label: 'Autre' }
  ];

  const onSubmit = async (data: CompanyForm) => {
    setIsLoading(true);
    try {
      // Simulate API call to create company
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const companyData = {
        ...data,
        createdAt: new Date().toISOString(),
        id: `company_${Date.now()}`,
        clientsCount: 0,
        installationsCount: 0
      };

      console.log('Creating company:', companyData);
      
      toast.success('Entreprise créée avec succès !');
      navigate('/admin/companies');
    } catch (error) {
      toast.error('Erreur lors de la création de l\'entreprise');
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
            <Button variant="ghost" onClick={() => navigate('/admin/companies')}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Building2 className="w-8 h-8 mr-3 text-primary-600" />
                Nouvelle Entreprise
              </h1>
              <p className="text-gray-600 mt-2">
                Ajouter une nouvelle entreprise cliente
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Informations générales */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-primary-600" />
              Informations Générales
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'entreprise *
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Le nom est requis' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Restaurant Le Gourmet"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type d'entreprise *
                </label>
                <select
                  {...register('type', { required: 'Le type est requis' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Sélectionner un type</option>
                  {companyTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SIRET
                </label>
                <input
                  type="text"
                  {...register('siret')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="12345678901234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site web
                </label>
                <input
                  type="url"
                  {...register('website')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://www.exemple.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Description de l'entreprise et de ses activités..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('isActive')}
                    className="mr-2 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Entreprise active</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Adresse */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-primary-600" />
              Adresse
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rue *
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
            </div>
          </Card>

          {/* Contact principal */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-primary-600" />
              Contact Principal
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  {...register('contact.firstName', { required: 'Le prénom est requis' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Pierre"
                />
                {errors.contact?.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.contact.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  {...register('contact.lastName', { required: 'Le nom est requis' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Bernard"
                />
                {errors.contact?.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.contact.lastName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email *
                </label>
                <input
                  type="email"
                  {...register('contact.email', { 
                    required: 'L\'email est requis',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Email invalide'
                    }
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="pierre@legourmet.fr"
                />
                {errors.contact?.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.contact.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Téléphone *
                </label>
                <input
                  type="tel"
                  {...register('contact.phone', { required: 'Le téléphone est requis' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="01 23 45 67 89"
                />
                {errors.contact?.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.contact.phone.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fonction
                </label>
                <input
                  type="text"
                  {...register('contact.position')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Gérant, Directeur, Responsable..."
                />
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/admin/companies')}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
              Créer l'Entreprise
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddCompany;