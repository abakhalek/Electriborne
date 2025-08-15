import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../../../services/apiService';
import Button from '../../../components/Button';
import Layout from '../../../components/Layout'; // Assuming it needs a layout

interface ServiceImage {
  url: string;
  description?: string;
}

interface SubServiceType {
  _id?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  file?: FileList;
  tempId?: string;
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

const EditServiceType: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors }, control } = useForm<ServiceTypeFormData>();

  const { fields: existingImageFields, remove: removeExistingImage } = useFieldArray({
    control,
    name: "existingImages",
  });

  const { fields: newImageFields, append: appendNewImage, remove: removeNewImage } = useFieldArray({
    control,
    name: "newImages",
  });

  const { fields: subTypeFields, append: appendSubType, remove: removeSubType } = useFieldArray({
    control,
    name: "subTypes",
  });

  useEffect(() => {
    const fetchServiceType = async () => {
      if (!id) {
        toast.error('Service Type ID is missing.');
        navigate('/admin/service-type-management');
        return;
      }
      try {
        const serviceType: ServiceType = await apiService.siteCustomization.getServiceTypeById(id);
        reset({
          name: serviceType.name,
          category: serviceType.category,
          description: serviceType.description,
          existingImages: serviceType.images || [],
          newImages: [],
          subTypes: serviceType.subTypes || [],
        });
      } catch (error) {
        console.error('Error fetching service type details:', error);
        toast.error('Erreur lors du chargement des détails du type de service.');
        navigate('/admin/service-type-management');
      }
    };
    fetchServiceType();
  }, [id, reset, navigate]);

  const handleEditServiceType = async (data: ServiceTypeFormData) => {
    if (!id) return;

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('category', data.category);
      if (data.description) formData.append('description', data.description);
      
      if (data.newImages) {
        data.newImages.forEach(imageField => {
          if (imageField.file && imageField.file.length > 0) {
            formData.append('images', imageField.file[0]);
          }
        });
      }

      if (data.existingImages) {
        formData.append('existingImagesData', JSON.stringify(data.existingImages));
      }

      const subTypesToSave = data.subTypes?.map(subType => {
        const idForFile = subType._id || subType.tempId || `new-${Math.random().toString(36).substring(2, 9)}`;
        if (subType.file && subType.file.length > 0) {
          formData.append(`subTypeImage_${idForFile}`, subType.file[0]);
        }
        return {
          ...subType,
          _id: subType._id,
          tempId: subType.tempId || idForFile,
          file: undefined,
        };
      }) || [];
      formData.append('subTypesData', JSON.stringify(subTypesToSave));

      await apiService.siteCustomization.updateServiceType(id, formData);
      toast.success('Type de service mis à jour avec succès');
      navigate('/admin/service-type-management');
    } catch (error) {
      console.error('Error updating service type:', error);
      toast.error('Erreur lors de la mise à jour du type de service.');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Modifier le Type de Service</h1>
        <form onSubmit={handleSubmit(handleEditServiceType)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du type *
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
              Catégorie *
            </label>
            <select
              {...register('category', { required: 'La catégorie est requise' })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Sélectionner une catégorie</option>
              <option value="installation">Installation</option>
              <option value="intervention">Intervention</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Images Existantes
            </label>
            {existingImageFields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2">
                <img src={`https://electriborne.net${field.url}`} alt="Service Type Image" className="w-16 h-16 object-cover rounded" />
                <input
                  type="text"
                  {...register(`existingImages.${index}.description`)}
                  placeholder="Description de l'image"+
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                <Button type="button" variant="ghost" onClick={() => removeExistingImage(index)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
            {existingImageFields.length === 0 && (
              <p className="text-sm text-gray-500">Aucune image existante.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ajouter de nouvelles images
            </label>
            <div className="space-y-2">
              {newImageFields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept="image/*"
                    {...register(`newImages.${index}.file` as const)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <Button type="button" variant="ghost" onClick={() => removeNewImage(index)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
            <Button 
              type="button" 
              onClick={() => appendNewImage({ file: new File([], '') as any })} 
              className="mt-2 flex items-center"
              variant="secondary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une image
            </Button>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sous-types de Service</h3>
            <div className="space-y-4">
              {subTypeFields.map((field, index) => (
                <div key={field.id} className="border p-4 rounded-md relative">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom du sous-type *</label>
                      <input
                        type="text"
                        {...register(`subTypes.${index}.name`, { required: 'Le nom du sous-type est requis' })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                      {errors.subTypes?.[index]?.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.subTypes[index]?.name?.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description du sous-type</label>
                      <textarea
                        {...register(`subTypes.${index}.description`)}
                        rows={2}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Image du sous-type</label>
                      {field.imageUrl && (
                        <div className="mb-2">
                          <img src={`http://localhost:3001${field.imageUrl}`} alt="Sub-type Preview" className="w-24 h-24 object-cover rounded" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        {...register(`subTypes.${index}.file` as const)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSubType(index)}
                    className="absolute top-2 right-2"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              onClick={() => appendSubType({ name: '', description: '', file: new File([], '') as any })} 
              className="mt-4 flex items-center"
              variant="secondary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un sous-type
            </Button>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => navigate('/admin/service-type-management')}>
              Annuler
            </Button>
            <Button type="submit">
              Enregistrer les modifications
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditServiceType;