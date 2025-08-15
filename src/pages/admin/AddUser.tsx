import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Shield,
  ArrowLeft,
  Save,
  UserPlus
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../services/api';
import axios, { AxiosError } from 'axios';

interface UserForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'admin' | 'technician' | 'client' | 'tech';
  company: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  departement?: string; // Added departement field
  permissions: string[];
  isActive: boolean;
  password: string;
  confirmPassword: string;
}

const frenchDepartments = [
  "01 - Ain", "02 - Aisne", "03 - Allier", "04 - Alpes-de-Haute-Provence", "05 - Hautes-Alpes",
  "06 - Alpes-Maritimes", "07 - Ardèche", "08 - Ardennes", "09 - Ariège", "10 - Aube",
  "11 - Aude", "12 - Aveyron", "13 - Bouches-du-Rhône", "14 - Calvados", "15 - Cantal",
  "16 - Charente", "17 - Charente-Maritime", "18 - Cher", "19 - Corrèze", "2A - Corse-du-Sud",
  "2B - Haute-Corse", "21 - Côte-d'Or", "22 - Côtes-d'Armor", "23 - Creuse", "24 - Dordogne",
  "25 - Doubs", "26 - Drôme", "27 - Eure", "28 - Eure-et-Loir", "29 - Finistère",
  "30 - Gard", "31 - Haute-Garonne", "32 - Gers", "33 - Gironde", "34 - Hérault",
  "35 - Ille-et-Vilaine", "36 - Indre", "37 - Indre-et-Loire", "38 - Isère", "39 - Jura",
  "40 - Landes", "41 - Loir-et-Cher", "42 - Loire", "43 - Haute-Loire", "44 - Loire-Atlantique",
  "45 - Loiret", "46 - Lot", "47 - Lot-et-Garonne", "48 - Lozère", "49 - Maine-et-Loire",
  "50 - Manche", "51 - Marne", "52 - Haute-Marne", "53 - Mayenne", "54 - Meurthe-et-Moselle",
  "55 - Meuse", "56 - Morbihan", "57 - Moselle", "58 - Nièvre", "59 - Nord",
  "60 - Oise", "61 - Orne", "62 - Pas-de-Calais", "63 - Puy-de-Dôme", "64 - Pyrénées-Atlantiques",
  "65 - Hautes-Pyrénées", "66 - Pyrénées-Orientales", "67 - Bas-Rhin", "68 - Haut-Rhin", "69 - Rhône",
  "70 - Haute-Saône", "71 - Saône-et-Loire", "72 - Sarthe", "73 - Savoie", "74 - Haute-Savoie",
  "75 - Paris", "76 - Seine-Maritime", "77 - Seine-et-Marne", "78 - Yvelines", "79 - Deux-Sèvres",
  "80 - Somme", "81 - Tarn", "82 - Tarn-et-Garonne", "83 - Var", "84 - Vaucluse",
  "85 - Vendée", "86 - Vienne", "87 - Haute-Vienne", "88 - Vosges", "89 - Yonne",
  "90 - Territoire de Belfort", "91 - Essonne", "92 - Hauts-de-Seine", "93 - Seine-Saint-Denis",
  "94 - Val-de-Marne", "95 - Val-d'Oise", "971 - Guadeloupe", "972 - Martinique", "973 - Guyane",
  "974 - La Réunion", "976 - Mayotte"
];

const AddUser: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<UserForm>({
    defaultValues: {
      role: 'client',
      isActive: true,
      address: {
        country: 'France'
      },
      permissions: []
    }
  });

  const selectedRole = watch('role');

  const rolePermissions = {
    admin: [
      'users.manage',
      'companies.manage',
      'requests.manage',
      'quotes.manage',
      'payments.manage',
      'reports.manage',
      'messages.manage'
    ],
    technician: [
      'requests.read',
      'requests.update',
      'quotes.read',
      'installations.manage',
      'reports.create',
      'messages.manage'
    ],
    client: [
      'requests.create',
      'requests.read',
      'quotes.read',
      'quotes.respond',
      'installations.read',
      'payments.read',
      'messages.create'
    ],
    tech: [
      'requests.read',
      'requests.update',
      'quotes.read',
      'installations.manage',
      'reports.create',
      'messages.manage'
    ]
  };

  const onSubmit = async (data: UserForm) => {
  if (data.password !== data.confirmPassword) {
    toast.error('Les mots de passe ne correspondent pas');
    return;
  }

  setIsLoading(true);
  try {
    const userData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      phone: data.phone,
      role: data.role === 'tech' ? 'technician' : data.role,
      company: data.company,
      address: data.address,
      departement: data.departement,
      isActive: data.isActive
    };

    await api.post('/users', userData);
    
    toast.success('Utilisateur créé avec succès !');
    navigate('/admin/users');

  } catch (error: unknown) {
    console.error('Erreur détaillée:', error);
    if (axios.isAxiosError(error)) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    } else {
      toast.error('Une erreur inconnue est survenue lors de la création.');
    }
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
            <Button variant="ghost" onClick={() => navigate('/admin/users')}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <UserPlus className="w-8 h-8 mr-3 text-primary-600" />
                Nouvel Utilisateur
              </h1>
              <p className="text-gray-600 mt-2">
                Créer un nouveau compte utilisateur dans le système
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Informations personnelles */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-primary-600" />
              Informations Personnelles
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  {...register('firstName', { required: 'Le prénom est requis' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Jean"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  {...register('lastName', { required: 'Le nom est requis' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Dupont"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email *
                </label>
                <input
                  type="email"
                  {...register('email', { 
                    required: 'L\'email est requis',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Email invalide'
                    }
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="jean.dupont@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="06 12 34 56 78"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="w-4 h-4 inline mr-1" />
                  Entreprise
                </label>
                <input
                  type="text"
                  {...register('company')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Nom de l'entreprise"
                />
              </div>
            </div>
          </Card>

          {/* Rôle et permissions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-primary-600" />
              Rôle et Permissions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle *
                </label>
                <select
                  {...register('role', { required: 'Le rôle est requis' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="client">Client</option>
                  <option value="technician">Technicien</option>
                  <option value="admin">Administrateur</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              {['technician', 'client'].includes(selectedRole) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Département *
                  </label>
                  <select
                    {...register('departement', { required: 'Le département est requis pour les techniciens et les clients' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Sélectionner un département</option>
                    {frenchDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  {errors.departement && (
                    <p className="mt-1 text-sm text-red-600">{errors.departement.message}</p>
                  )}
                </div>
              )}

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
                  <span className="text-sm text-gray-700">Compte actif</span>
                </div>
              </div>
            </div>

            {/* Permissions preview */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permissions accordées
              </label>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {rolePermissions[selectedRole].map((permission) => (
                    <div key={permission} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
                      {permission.replace('.', ' - ')}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Adresse */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Adresse</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rue
                </label>
                <input
                  type="text"
                  {...register('address.street')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="123 Rue de la République"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  {...register('address.city')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Paris"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code Postal
                </label>
                <input
                  type="text"
                  {...register('address.postalCode')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="75001"
                />
              </div>
            </div>
          </Card>

          {/* Mot de passe */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Mot de Passe</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe *
                </label>
                <input
                  type="password"
                  {...register('password', { 
                    required: 'Le mot de passe est requis',
                    minLength: {
                      value: 6,
                      message: 'Le mot de passe doit contenir au moins 6 caractères'
                    }
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe *
                </label>
                <input
                  type="password"
                  {...register('confirmPassword', { required: 'Veuillez confirmer le mot de passe' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/admin/users')}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
              Créer l'Utilisateur
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddUser;