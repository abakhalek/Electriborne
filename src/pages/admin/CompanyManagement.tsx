import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import DataTable, { Column } from '../../components/DataTable';
import FormModal from '../../components/FormModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { 
  Building2, 
  Plus, 
   
 
   
   
  
  MapPin,
  Phone,
  Mail,
  Users,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';

import { useCrudApi } from '../../hooks/useApi';
import apiService from '../../services/apiService';

interface Company {
  id?: string;
  name: string;
  type: string;
  siret?: string;
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
    position?: string;
  };
  description?: string;
  website?: string;
  isActive: boolean;
  clientsCount: number;
  installationsCount: number;
  totalRevenue: number;
  lastInterventionDate?: string;
}

interface CompanyFormData {
  name: string;
  type: string;
  siret?: string;
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
    position?: string;
  };
  description?: string;
  website?: string;
  isActive: boolean;
}

const CompanyManagement: React.FC = () => {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { 
    items: companies, 
    total,
    isLoading,
    fetchItems: fetchCompanies,
    fetchItemById,
    createItem: createCompany,
    updateItem: updateCompany,
    deleteItem: deleteCompany,
    
    
  } = useCrudApi<Company, CompanyFormData, Partial<CompanyFormData>>(
    {
      getAll: async (params) => {
        const response = await apiService.companies.getAll(params);
        return { 
          items: response.items, 
          total: response.total 
        };
      },
      getById: apiService.companies.getById,
      create: apiService.companies.create,
      update: apiService.companies.update,
      delete: apiService.companies.delete
    },
    {
      successMessages: {
        create: 'Entreprise créée avec succès',
        update: 'Entreprise mise à jour avec succès',
        delete: 'Entreprise supprimée avec succès'
      }
    }
  );

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CompanyFormData>({
    defaultValues: {
      address: {
        country: 'France'
      },
      isActive: true
    }
  });

  useEffect(() => {
    loadCompanies();
  }, [currentPage, pageSize, typeFilter, searchTerm]);

  const loadCompanies = async () => {
    const params: any = {
      page: currentPage,
      limit: pageSize
    };

    if (typeFilter !== 'all') {
      params.type = typeFilter;
    }

    if (searchTerm) {
      params.search = searchTerm;
    }

    await fetchCompanies(params);
  };

  const handleCreateCompany = async (data: CompanyFormData) => {
    try {
      await createCompany(data);
      setIsCreateModalOpen(false);
      reset();
      loadCompanies();
    } catch (error) {
      console.error('Error creating company:', error);
    }
  };

  const handleEditCompany = async (data: CompanyFormData) => {
    if (!selectedCompanyId) return;

    try {
      await updateCompany(selectedCompanyId, data);
      setIsEditModalOpen(false);
      reset();
      loadCompanies();
    } catch (error) {
      console.error('Error updating company:', error);
    }
  };

  const handleDeleteCompany = async () => {
    if (!selectedCompanyId) return;

    try {
      await deleteCompany(selectedCompanyId);
      setIsDeleteDialogOpen(false);
      loadCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
    }
  };

  const handleToggleStatus = async (companyId: string) => {
    try {
      await apiService.companies.toggleStatus(companyId);
      loadCompanies();
    } catch (error) {
      console.error('Error toggling company status:', error);
    }
  };

  const openEditModal = async (companyId: string) => {
    try {
      const company = await fetchItemById(companyId);
      setSelectedCompanyId(companyId);
      
      // Préremplir le formulaire avec les données de l'entreprise
      reset({
        name: company.name,
        type: company.type,
        siret: company.siret,
        address: company.address,
        contact: company.contact,
        description: company.description,
        website: company.website,
        isActive: company.isActive
      });
      
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('Error fetching company details:', error);
    }
  };

  const openDeleteDialog = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setIsDeleteDialogOpen(true);
  };

  const getTypeBadge = (type: string) => {
    const typeConfig: Record<string, { color: string, label: string }> = {
      restaurant: { color: 'bg-orange-100 text-orange-800', label: 'Restaurant' },
      bakery: { color: 'bg-yellow-100 text-yellow-800', label: 'Boulangerie' },
      retail: { color: 'bg-blue-100 text-blue-800', label: 'Commerce' },
      cafe: { color: 'bg-brown-100 text-brown-800', label: 'Café' },
      office: { color: 'bg-gray-100 text-gray-800', label: 'Bureau' },
      hotel: { color: 'bg-purple-100 text-purple-800', label: 'Hôtel' },
      pharmacy: { color: 'bg-green-100 text-green-800', label: 'Pharmacie' },
      supermarket: { color: 'bg-blue-100 text-blue-800', label: 'Supermarché' },
      other: { color: 'bg-gray-100 text-gray-800', label: 'Autre' }
    };
    
    const config = typeConfig[type] || typeConfig.other;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const columns: Column<Company>[] = [
    {
      header: 'Entreprise',
      accessor: (company: Company) => (
        <div>
          <div className="font-medium text-gray-900">{company.name}</div>
          {company.siret && <div className="text-xs text-gray-500">SIRET: {company.siret}</div>}
          <div className="mt-1">{getTypeBadge(company.type)}</div>
        </div>
      ),
      sortable: false
    },
    {
      header: 'Contact',
      accessor: (company: Company) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm">
            <Users className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-medium">{company.contact.firstName} {company.contact.lastName}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2 text-gray-400" />
            <span>{company.contact.phone}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-2 text-gray-400" />
            <span>{company.contact.email}</span>
          </div>
        </div>
      ),
      sortable: false
    },
    {
      header: 'Adresse',
      accessor: (company: Company) => (
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
          <span>{company.address.street}, {company.address.postalCode} {company.address.city}</span>
        </div>
      ),
      sortable: false
    },
    {
      header: 'Statut',
      accessor: 'isActive',
      cell: (company: Company) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          company.isActive ? 'bg-success-100 text-success-800' : 'bg-error-100 text-error-800'
        }`}>
          {company.isActive ? (
            <>
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Actif
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3 mr-1" />
              Inactif
            </>
          )}
        </span>
      ),
      sortable: true
    },
    {
      header: 'Statistiques',
      accessor: (company: Company) => (
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Clients:</span>
            <span className="ml-1 font-medium">{company.clientsCount}</span>
          </div>
          <div>
            <span className="text-gray-500">Installations:</span>
            <span className="ml-1 font-medium">{company.installationsCount}</span>
          </div>
        </div>
      ),
      sortable: false
    }
  ];

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

  // Statistiques des entreprises
  const stats = {
    totalCompanies: total,
    activeCompanies: companies.filter(c => c.isActive).length,
    totalInstallations: companies.reduce((sum, company) => sum + company.installationsCount, 0),
    totalRevenue: companies.reduce((sum, company) => sum + company.totalRevenue, 0),
    newCompanies: companies.filter(c => {
      const createdDate = new Date(c.lastInterventionDate || '');
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return createdDate > oneMonthAgo;
    }).length
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Building2 className="w-8 h-8 mr-3 text-primary-600" />
              Gestion des Entreprises
            </h1>
            <p className="text-gray-600 mt-2">
              Gérez les entreprises clientes et leurs informations
            </p>
          </div>
          <Button 
            size="lg" 
            onClick={() => {
              reset();
              setIsCreateModalOpen(true);
            }}
            className="flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle Entreprise
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Entreprises</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCompanies}</p>
              </div>
              <Building2 className="w-8 h-8 text-primary-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actives</p>
                <p className="text-2xl font-bold text-success-600">{stats.activeCompanies}</p>
              </div>
              <Building2 className="w-8 h-8 text-success-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Installations</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalInstallations}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nouveaux ce mois</p>
                <p className="text-2xl font-bold text-warning-600">{stats.newCompanies}</p>
              </div>
              <Plus className="w-8 h-8 text-warning-600" />
            </div>
          </Card>
        </div>

        {/* Companies Table */}
        <DataTable
          data={companies.map((company, index) => ({ ...company, id: company.id || `temp-id-${index}` }))}
          columns={columns}
          keyField="id"
          title="Liste des entreprises"
          isLoading={isLoading}
          pagination={{
            page: currentPage,
            limit: pageSize,
            total,
            onPageChange: setCurrentPage,
            onLimitChange: setPageSize
          }}
          actions={{
            view: (company) => navigate(`/admin/companies/view/${company.id}`),
            edit: (company) => openEditModal(company.id),
            delete: (company) => openDeleteDialog(company.id),
            custom: [
              {
                label: 'Statut',
                icon: <CheckCircle2 className="w-4 h-4" />,
                onClick: (company) => handleToggleStatus(company.id),
                color: 'text-blue-600'
              }
            ]
          }}
          filters={
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Tous les types</option>
              {companyTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          }
          searchPlaceholder="Rechercher par nom, contact ou adresse..."
          onSearch={setSearchTerm}
          emptyMessage="Aucune entreprise trouvée"
        />

        {/* Create Company Modal */}
        <FormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Nouvelle Entreprise"
          size="lg"
          footer={
            <div className="flex justify-end space-x-3">
              <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" form="createCompanyForm">
                Créer l'entreprise
              </Button>
            </div>
          }
        >
          <form id="createCompanyForm" onSubmit={handleSubmit(handleCreateCompany)} className="space-y-6">
            {/* Informations générales */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations Générales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'entreprise *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Le nom est requis' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                    {...register('siret', {
                      pattern: {
                        value: /^\d{14}$/,
                        message: 'SIRET invalide (14 chiffres requis)'
                      }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {errors.siret && (
                    <p className="mt-1 text-sm text-red-600">{errors.siret.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site web
                  </label>
                  <input
                    type="url"
                    {...register('website', {
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message: 'URL de site web invalide'
                      }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {errors.website && (
                    <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
            </div>

            {/* Adresse */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Adresse</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rue *
                  </label>
                  <input
                    type="text"
                    {...register('address.street', { required: 'L\'adresse est requise' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                    {...register('address.postalCode', { 
                      required: 'Le code postal est requis',
                      pattern: {
                        value: /^\d{5}$/,
                        message: 'Code postal invalide (5 chiffres requis)'
                      }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {errors.address?.postalCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.postalCode.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact principal */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Principal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    {...register('contact.firstName', { required: 'Le prénom est requis' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                  />
                  {errors.contact?.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.contact.lastName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  />
                  {errors.contact?.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.contact.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    {...register('contact.phone', { required: 'Le téléphone est requis' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                  />
                </div>
              </div>
            </div>
          </form>
        </FormModal>

        {/* Edit Company Modal */}
        <FormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Modifier l'Entreprise"
          size="lg"
          footer={
            <div className="flex justify-end space-x-3">
              <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" form="editCompanyForm">
                Enregistrer les modifications
              </Button>
            </div>
          }
        >
          <form id="editCompanyForm" onSubmit={handleSubmit(handleEditCompany)} className="space-y-6">
            {/* Informations générales */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations Générales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'entreprise *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Le nom est requis' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                    {...register('siret', {
                      pattern: {
                        value: /^\d{14}$/,
                        message: 'SIRET invalide (14 chiffres requis)'
                      }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {errors.siret && (
                    <p className="mt-1 text-sm text-red-600">{errors.siret.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site web
                  </label>
                  <input
                    type="url"
                    {...register('website', {
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message: 'URL de site web invalide'
                      }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {errors.website && (
                    <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
            </div>

            {/* Adresse */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Adresse</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rue *
                  </label>
                  <input
                    type="text"
                    {...register('address.street', { required: 'L\'adresse est requise' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                    {...register('address.postalCode', { 
                      required: 'Le code postal est requis',
                      pattern: {
                        value: /^\d{5}$/,
                        message: 'Code postal invalide (5 chiffres requis)'
                      }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {errors.address?.postalCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.postalCode.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact principal */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Principal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    {...register('contact.firstName', { required: 'Le prénom est requis' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                  />
                  {errors.contact?.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.contact.lastName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  />
                  {errors.contact?.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.contact.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    {...register('contact.phone', { required: 'Le téléphone est requis' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                  />
                </div>
              </div>
            </div>
          </form>
        </FormModal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteCompany}
          title="Supprimer l'entreprise"
          message="Êtes-vous sûr de vouloir supprimer cette entreprise ? Cette action est irréversible et supprimera toutes les données associées."
          confirmText="Supprimer"
          cancelText="Annuler"
          type="danger"
        />
      </div>
    </Layout>
  );
};

export default CompanyManagement;