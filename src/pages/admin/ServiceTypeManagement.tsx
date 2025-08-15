import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';

import Button from '../../components/Button';
import DataTable, { Column } from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import { 
  Plus, 
  Trash2,
  Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCrudApi } from '../../hooks/useApi';
import apiService from '../../services/apiService';

interface ServiceImage {
  url: string;
  description?: string;
}

interface SubServiceType {
  _id?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  file?: FileList; // For new image uploads on frontend
  tempId?: string; // For new sub-types before they get an _id from backend
}

interface ServiceType {
  _id: string;
  name: string;
  category: 'installation' | 'intervention';
  description?: string;
  images?: ServiceImage[];
  subTypes?: SubServiceType[];
}

interface ServiceTypeFormData {
  name: string;
  category: 'installation' | 'intervention';
  description?: string;
  newImages?: { file: FileList }[];
  existingImages?: ServiceImage[];
  subTypes?: SubServiceType[];
}

const ServiceTypeManagement: React.FC = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { 
    items: serviceTypes, 
    total,
    isLoading,
    fetchItems: fetchServiceTypes,
    fetchItemById,
    deleteItem: deleteServiceType,
  } = useCrudApi<ServiceType, FormData, FormData>(
    {
      getAll: async (params) => {
        const response = await apiService.siteCustomization.getServiceTypes(params);
        return { 
          items: response.items, 
          total: response.total 
        };
      },
      getById: apiService.siteCustomization.getServiceTypeById,
      create: apiService.siteCustomization.createServiceType,
      update: apiService.siteCustomization.updateServiceType,
      delete: apiService.siteCustomization.deleteServiceType
    },
    {
      successMessages: {
        create: 'Type de service créé avec succès',
        update: 'Type de service mis à jour avec succès',
        delete: 'Type de service supprimé avec succès'
      }
    }
  );

  useEffect(() => {
    loadServiceTypes();
  }, [currentPage, pageSize, categoryFilter, searchTerm]);

  const loadServiceTypes = async () => {
    const params: any = {
      page: currentPage,
      limit: pageSize
    };

    if (categoryFilter !== 'all') {
      params.category = categoryFilter;
    }

    if (searchTerm) {
      params.search = searchTerm;
    }

    await fetchServiceTypes(params);
  };

  const handleDeleteServiceType = async () => {
    if (!selectedServiceTypeId) return;

    try {
      await deleteServiceType(selectedServiceTypeId);
      setIsDeleteDialogOpen(false);
      loadServiceTypes();
    } catch (error) {
      console.error('Error deleting service type:', error);
      toast.error('Erreur lors de la suppression du type de service.');
    }
  };

  const openDeleteDialog = (serviceTypeId: string) => {
    setSelectedServiceTypeId(serviceTypeId);
    setIsDeleteDialogOpen(true);
  };

  const columns: Column<ServiceType>[] = [
    {
      header: 'Images',
      accessor: 'images',
      cell: (item) => (
        <div className="flex flex-wrap gap-2">
          {item.images?.map((image, index) => (
            <div key={index} className="relative group">
              <img 
                src={`https://electriborne.net${image.url}`}
                alt={image.description || item.name}
                className="w-16 h-16 object-cover rounded"
              />
              {image.description && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b opacity-0 group-hover:opacity-100 transition-opacity">
                  {image.description}
                </div>
              )}
            </div>
          ))}
        </div>
      ),
      sortable: false
    },
    {
      header: 'Nom',
      accessor: 'name',
      sortable: true
    },
    {
      header: 'Catégorie',
      accessor: 'category',
      cell: (item) => item.category === 'installation' ? 'Installation' : 'Intervention',
      sortable: true
    },
    {
      header: 'Description',
      accessor: 'description',
      sortable: false
    },
    {
      header: 'Sous-types',
      accessor: 'subTypes',
      cell: (item) => (
        <div className="flex flex-wrap gap-2">
          {item.subTypes?.map((subType, index) => (
            <div key={index} className="flex items-center space-x-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
              {subType.imageUrl && (
                <img 
                  src={`https://electriborne.net${subType.imageUrl}`}
                  alt={subType.name}
                  className="w-6 h-6 object-cover rounded-full"
                />
              )}
              <span>{subType.name}</span>
            </div>
          ))}
        </div>
      ),
      sortable: false
    }
  ];

  return (
    <Layout>
      {console.log('Service Types received:', serviceTypes)}
      {console.log('Total service types:', total)}
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Tag className="w-8 h-8 mr-3 text-primary-600" />
              Gestion des Types de Service
            </h1>
            <p className="text-gray-600 mt-2">
              Gérez les types d'installation et d'intervention disponibles
            </p>
          </div>
          <Link 
            to="/admin/service-types/add"
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau Type
          </Link>
        </div>

        {/* Service Types Table */}
        <DataTable
          data={serviceTypes}
          columns={columns}
          keyField="_id"
          title="Liste des Types de Service"
          isLoading={isLoading}
          pagination={{
            page: currentPage,
            limit: pageSize,
            total,
            onPageChange: setCurrentPage,
            onLimitChange: setPageSize
          }}
          actions={{
            edit: (item) => `/admin/service-types/edit/${item._id}`,
            delete: (item) => openDeleteDialog(item._id),
          }}
          filters={
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Toutes les catégories</option>
              <option value="installation">Installation</option>
              <option value="intervention">Intervention</option>
            </select>
          }
          searchPlaceholder="Rechercher par nom ou description..."
          onSearch={setSearchTerm}
          emptyMessage="Aucun type de service trouvé"
        />

        

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteServiceType}
          title="Supprimer le Type de Service"
          message="Êtes-vous sûr de vouloir supprimer ce type de service ? Cette action est irréversible."
          confirmText="Supprimer"
          cancelText="Annuler"
          type="danger"
        />
      </div>
    </Layout>
  );
};

export default ServiceTypeManagement;
