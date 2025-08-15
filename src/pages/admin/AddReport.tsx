import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Clock, 
  Save, 
  Send, 
  AlertTriangle, 
  CheckCircle, 
  ChevronLeft 
} from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useApi } from '../../hooks/useApi';
import apiService from '../../services/apiService';
import toast from 'react-hot-toast';

interface Mission {
  _id: string;
  missionNumber: string;
  client: { companyName?: string; firstName?: string; lastName?: string; };
  technician: { firstName: string; lastName: string; };
  serviceType: { name: string; };
}

interface ReportFormData {
  mission: string;
  reportDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  photos: { file?: FileList | File[]; url?: string }[];
  anomalies: { description: string; isCritical: boolean }[];
  isBatutalCompliant: boolean;
  notes: string;
  certificateNumber?: string;
  type: string;
  location: {
    address: string;
    city: string;
    postalCode: string;
  };
  selectedEquipment: string[];
  selectedProducts: string[];
  workPerformed: string;
}

interface Product {
  _id: string;
  name: string;
}

const AddReport: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const isEditing = !!reportId;
  const isViewMode = location.pathname.includes('/view/');

  const { 
    register, 
    handleSubmit, 
    control, 
    watch, 
    setValue, 
    reset, 
    formState: { errors } 
  } = useForm<ReportFormData>({
    defaultValues: {
      photos: [],
      anomalies: [],
      isBatutalCompliant: true,
    }
  });

  const { fields: photoFields, append: appendPhoto, remove: removePhoto } = useFieldArray({ control, name: "photos" });
  const { fields: anomalyFields, append: appendAnomaly, remove: removeAnomaly } = useFieldArray({ control, name: "anomalies" });

  const [reportData, setReportData] = useState<any>(null);
  const { execute: fetchReport } = useApi<any, [string]>(apiService.reports.getById);
  const { execute: createReport } = useApi<any, [FormData]>(apiService.reports.create);
  const { execute: updateReport } = useApi<any, [string, FormData]>(apiService.reports.update);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await apiService.missions.getAll({}); // Fetch all missions for admin
        setMissions(response.items || []);
      } catch (error) {
        toast.error('Erreur lors du chargement des missions.');
      }
    };
    fetchMissions();
  }, []);

  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        const response = await apiService.equipments.getAll({});
        setEquipments(response.items || []);
      } catch (error) {
        toast.error('Erreur lors du chargement des équipements.');
      }
    };
    fetchEquipments();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiService.products.getAll({});
        setProducts(response.items || []);
      } catch (error) {
        toast.error('Erreur lors du chargement des produits.');
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (reportId) {
      const loadReport = async () => {
        const data = await fetchReport(reportId);
        if (data) {
          setReportData(data);
          reset({
            ...data,
            reportDate: new Date(data.date).toISOString().split('T')[0],
            photos: data.photos.map((url: string) => ({ file: undefined, url: url })), // Populate existing photos
            anomalies: data.anomalies || [],
          });
        }
      };
      loadReport();
    }
  }, [reportId, fetchReport, reset]);

  const startTime = watch('startTime');
  const endTime = watch('endTime');

  useEffect(() => {
    if (startTime && endTime) {
      const start = new Date(`1970-01-01T${startTime}`);
      const end = new Date(`1970-01-01T${endTime}`);
      const diff = (end.getTime() - start.getTime()) / (1000 * 60); // difference in minutes
      setValue('duration', diff > 0 ? diff : 0);
    }
  }, [startTime, endTime, setValue]);

  const onSubmit = async (data: ReportFormData, status: 'draft' | 'completed') => {
    console.log('Frontend - Data before FormData construction:', data);
    const formData = new FormData();

    // Append simple fields
    formData.append('mission', data.mission);
    formData.append('reportDate', data.reportDate);
    formData.append('startTime', data.startTime);
    formData.append('endTime', data.endTime);
    formData.append('duration', String(data.duration));
    formData.append('isBatutalCompliant', String(data.isBatutalCompliant));
    formData.append('notes', data.notes);
    if (data.certificateNumber) {
      formData.append('certificateNumber', data.certificateNumber);
    }
    formData.append('type', data.type);

    // Append selected equipment
    data.selectedEquipment.forEach(id => {
      formData.append('selectedEquipment[]', id);
    });

    // Append selected products
    data.selectedProducts.forEach(id => {
      formData.append('selectedProducts[]', id);
    });

    formData.append('workPerformed', data.workPerformed);

    // Append nested location object as a JSON string
    formData.append('location', JSON.stringify(data.location));

    // Append anomalies array as a JSON string
    formData.append('anomalies', JSON.stringify(data.anomalies));

    // Append photos
    data.photos.forEach((photo: { file?: FileList | File[]; url?: string }, index) => {
      if (photo.file && photo.file[0]) {
        formData.append('photos', photo.file[0] as File);
      } else if (photo.url) {
        formData.append(`existingPhotos[${index}]`, photo.url);
      }
    });

    formData.append('status', status);

    // Log FormData content
    console.log('Frontend - FormData content:');
    for (let pair of formData.entries()) {
        console.log(pair[0]+ ': ' + pair[1]);
    }

    try {
      if (isEditing) {
        await updateReport(reportId, formData);
      } else {
        await createReport(formData);
      }
      navigate('/admin/reports');
    } catch (error) {
      // Error is already handled by useCrudApi hook
    }
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/admin/reports')} className="flex items-center">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Retour aux rapports
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FileText className="w-8 h-8 mr-3 text-primary-600" />
          {isViewMode ? 'Détails du Rapport Technique' : (isEditing ? 'Modifier le Rapport Technique' : 'Nouveau Rapport Technique')}
        </h1>

        <form className="space-y-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Informations Générales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mission</label>
                {isViewMode ? (
                  <p className="text-gray-900 p-2 bg-gray-100 rounded-lg">{reportData?.mission?.missionNumber} - {reportData?.mission?.client?.companyName || `${reportData?.mission?.client?.firstName} ${reportData?.mission?.client?.lastName}`} - {reportData?.mission?.serviceType?.name}</p>
                ) : (
                  <select {...register('mission', { required: 'La mission est requise' })} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                    <option value="">Sélectionner une mission</option>
                    {missions.map(mission => (
                      <option key={mission._id} value={mission._id}>
                        {mission.missionNumber} - {mission.client ? (mission.client.companyName || `${mission.client.firstName} ${mission.client.lastName}`) : 'Client Inconnu'} ({mission.serviceType.name})
                      </option>
                    ))}
                  </select>
                )}
                {errors.mission && <p className="text-red-500 text-sm mt-1">{errors.mission.message}</p>}
              </div>
              <div>                <label className="block text-sm font-medium text-gray-700 mb-2">Date du rapport</label>                {isViewMode ? (                  <p className="text-gray-900 p-2 bg-gray-100 rounded-lg">{new Date(reportData?.reportDate || '').toLocaleDateString('fr-FR')}</p>                ) : (                  <input type="date" {...register('reportDate', { required: 'La date est requise' })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />                )}                {errors.reportDate && <p className="text-red-500 text-sm mt-1">{errors.reportDate.message}</p>}              </div>              <div>                <label className="block text-sm font-medium text-gray-700 mb-2">Type d'intervention</label>                {isViewMode ? (                  <p className="text-gray-900 p-2 bg-gray-100 rounded-lg">{reportData?.type}</p>                ) : (                  <select {...register('type', { required: 'Le type d\'intervention est requis' })} className="w-full border border-gray-300 rounded-lg px-3 py-2">                    <option value="">Sélectionner un type</option>                    <option value="Installation borne de recharge">Installation borne de recharge</option>                    <option value="Maintenance préventive">Maintenance préventive</option>                    <option value="Réparation d'urgence">Réparation d'urgence</option>                    <option value="Diagnostic électrique">Diagnostic électrique</option>                    <option value="Mise aux normes">Mise aux normes</option>                    <option value="Remplacement équipement">Remplacement équipement</option>                    <option value="Autre">Autre</option>                  </select>                )}                {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Détails de l'intervention</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                {isViewMode ? (
                  <p className="text-gray-900 p-2 bg-gray-100 rounded-lg">{reportData?.location?.address}</p>
                ) : (
                  <input type="text" {...register('location.address', { required: 'L\'adresse est requise' })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                )}
                {errors.location?.address && <p className="text-red-500 text-sm mt-1">{errors.location.address.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                {isViewMode ? (
                  <p className="text-gray-900 p-2 bg-gray-100 rounded-lg">{reportData?.location?.city}</p>
                ) : (
                  <input type="text" {...register('location.city', { required: 'La ville est requise' })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                )}
                {errors.location?.city && <p className="text-red-500 text-sm mt-1">{errors.location.city.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code Postal</label>
                {isViewMode ? (
                  <p className="text-gray-900 p-2 bg-gray-100 rounded-lg">{reportData?.location?.postalCode}</p>
                ) : (
                  <input type="text" {...register('location.postalCode', { required: 'Le code postal est requis' })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                )}
                {errors.location?.postalCode && <p className="text-red-500 text-sm mt-1">{errors.location.postalCode.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Équipement(s) utilisé(s)</label>
                {isViewMode ? (
                  <p className="text-gray-900 p-2 bg-gray-100 rounded-lg">
                    {reportData?.selectedEquipment?.map((eq: any) => eq.name).join(', ') || 'N/A'}
                  </p>
                ) : (
                  <select
                    multiple
                    {...register('selectedEquipment', { required: 'Au moins un équipement est requis' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 h-32"
                  >
                    {equipments.map(eq => (
                      <option key={eq._id} value={eq._id}>{eq.name}</option>
                    ))}
                  </select>
                )}
                {errors.selectedEquipment && <p className="text-red-500 text-sm mt-1">{errors.selectedEquipment.message}</p>}
              </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Produit(s) utilisé(s)</label>
                {isViewMode ? (
                  <p className="text-gray-900 p-2 bg-gray-100 rounded-lg">
                    {reportData?.selectedProducts?.map((prod: any) => prod.name).join(', ') || 'N/A'}
                  </p>
                ) : (
                  <select
                    multiple
                    {...register('selectedProducts')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 h-32"
                  >
                    {products.map(prod => (
                      <option key={prod._id} value={prod._id}>{prod.name}</option>
                    ))}
                  </select>
                )}
                {errors.selectedProducts && <p className="text-red-500 text-sm mt-1">{errors.selectedProducts.message}</p>}
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Travaux effectués</label>
              {isViewMode ? (
                <p className="text-gray-900 p-2 bg-gray-100 rounded-lg whitespace-pre-wrap">{reportData?.workPerformed}</p>
              ) : (
                <textarea {...register('workPerformed', { required: 'La description des travaux est requise' })} rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2"></textarea>
              )}
              {errors.workPerformed && <p className="text-red-500 text-sm mt-1">{errors.workPerformed.message}</p>}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Durée de l'intervention</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heure de début</label>
                {isViewMode ? (
                  <p className="text-gray-900 p-2 bg-gray-100 rounded-lg">{reportData?.startTime}</p>
                ) : (
                  <input type="time" {...register('startTime', { required: 'Heure de début requise' })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heure de fin</label>
                {isViewMode ? (
                  <p className="text-gray-900 p-2 bg-gray-100 rounded-lg">{reportData?.endTime}</p>
                ) : (
                  <input type="time" {...register('endTime', { required: 'Heure de fin requise' })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Durée</label>
                <div className="flex items-center h-10 px-3 bg-gray-100 rounded-lg">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{Math.floor(watch('duration') / 60) || 0}h {watch('duration') % 60 || 0}min</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Photos de l'intervention</h2>
            <div className="space-y-4">
              {isViewMode ? (
                reportData?.photos && reportData.photos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {reportData.photos.map((photo: { url: string; description?: string; timestamp?: Date; coordinates?: any }, index: number) => (
                      <img key={index} src={photo.url} alt={`Photo ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Aucune photo disponible.</p>
                )
              ) : (
                photoFields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-4">
                    <input type="file" accept="image/*" {...register(`photos.${index}.file`)} className="w-full" />
                    <Button type="button" variant="ghost" onClick={() => removePhoto(index)}><Trash2 className="w-5 h-5 text-red-500" /></Button>
                  </div>
                ))
              )}
            </div>
            {!isViewMode && (
              <Button type="button" onClick={() => appendPhoto({ file: [new File([], '')] })} className="mt-4 flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une photo
              </Button>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Anomalies et remarques</h2>
            <div className="space-y-4">
              {isViewMode ? (
                reportData?.anomalies && reportData.anomalies.length > 0 ? (
                  reportData.anomalies.map((anomaly: { description: string; isCritical: boolean }, index: number) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">{anomaly.description}</p>
                      {anomaly.isCritical && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Critique
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Aucune anomalie ou remarque.</p>
                )
              ) : (
                anomalyFields.map((field, index) => (
                  <div key={field.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-grow">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description de l'anomalie</label>
                      <textarea {...register(`anomalies.${index}.description`, { required: true })} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2"></textarea>
                    </div>
                    <div className="flex-shrink-0">
                      <label className="flex items-center space-x-2 mt-2">
                        <input type="checkbox" {...register(`anomalies.${index}.isCritical`)} className="rounded" />
                        <span className="text-sm font-medium">Critique</span>
                      </label>
                    </div>
                    <Button type="button" variant="ghost" onClick={() => removeAnomaly(index)}><Trash2 className="w-5 h-5 text-red-500" /></Button>
                  </div>
                ))
              )}
            </div>
            {!isViewMode && (
              <Button type="button" onClick={() => appendAnomaly({ description: '', isCritical: false })} className="mt-4 flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une anomalie
              </Button>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Conformité et Notes</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {isViewMode ? (
                  reportData?.isBatutalCompliant ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Conforme BATUTA
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Non conforme BATUTA
                    </span>
                  )
                ) : (
                  <>
                    <input type="checkbox" {...register('isBatutalCompliant')} id="isBatutalCompliant" className="h-4 w-4 rounded" />
                    <label htmlFor="isBatutalCompliant" className="font-medium text-gray-700">Conforme BATUTA</label>
                  </>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de certificat (si applicable)</label>
                {isViewMode ? (
                  <p className="text-gray-900 p-2 bg-gray-100 rounded-lg">{reportData?.certificateNumber || 'N/A'}</p>
                ) : (
                  <input type="text" {...register('certificateNumber')} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes générales</label>
                {isViewMode ? (
                  <p className="text-gray-900 p-2 bg-gray-100 rounded-lg whitespace-pre-wrap">{reportData?.notes || 'Aucune note.'}</p>
                ) : (
                  <textarea {...register('notes')} rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2"></textarea>
                )}
              </div>
            </div>
          </Card>

          {!isViewMode && (
            <div className="flex justify-end space-x-4">
              <Button type="button" onClick={handleSubmit(d => onSubmit(d, 'draft'))} variant="secondary" className="flex items-center">
                <Save className="w-5 h-5 mr-2" />
                Enregistrer comme brouillon
              </Button>
              <Button type="button" onClick={handleSubmit(d => onSubmit(d, 'completed'))} className="flex items-center">
                <Send className="w-5 h-5 mr-2" />
                Finaliser et envoyer
              </Button>
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
};

export default AddReport;
