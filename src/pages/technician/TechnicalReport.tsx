import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ProtectedRoute from '../../components/ProtectedRoute';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Clock, 
  Save, 
  Send, 
  ChevronLeft 
} from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useCrudApi } from '../../hooks/useApi';
import apiService from '../../services/apiService';
import toast from 'react-hot-toast';

interface Mission {
  _id: string;
  missionNumber: string;
  client: { companyName: string; };
  serviceType: { name: string; };
}

interface ReportFormData {
  missionId: string;
  reportDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  photos: { file: File }[];
  anomalies: { description: string; isCritical: boolean }[];
  isBatutalCompliant: boolean;
  notes: string;
  certificateNumber?: string;
}

const TechnicalReport: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const [missions, setMissions] = useState<Mission[]>([]);
  const isEditing = !!reportId;

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

  const reportApiConfig = {
    getById: apiService.reports.getById,
    create: apiService.reports.create,
    update: apiService.reports.update,
    getAll: async () => ({ items: [], total: 0 }), // Dummy getAll
    delete: async () => true, // Dummy delete
  };

  const { 
    fetchItemById: fetchReport, 
    createItem: createReport, 
    updateItem: updateReport 
  } = useCrudApi<any, any, any>(reportApiConfig);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await apiService.missions.getAll({ status: 'in_progress' }); // Fetch missions technician is assigned to
        setMissions(response.items || []);
      } catch (error) {
        toast.error('Erreur lors du chargement des missions.');
      }
    };
    fetchMissions();
  }, []);

  useEffect(() => {
    if (isEditing) {
      fetchReport(reportId).then(data => {
        if (data) {
          reset({
            ...data,
            reportDate: new Date(data.reportDate).toISOString().split('T')[0],
            // photos and anomalies will be handled separately if they are pre-signed URLs
          });
        }
      });
    }
  }, [isEditing, reportId, fetchReport, reset]);

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
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'photos' || key === 'anomalies') return;
      formData.append(key, String(value));
    });

    data.photos.forEach((photo, index) => {
      if (photo.file) {
        formData.append(`photos[${index}]`, photo.file);
      }
    });

    data.anomalies.forEach((anomaly, index) => {
      formData.append(`anomalies[${index}][description]`, anomaly.description);
      formData.append(`anomalies[${index}][isCritical]`, String(anomaly.isCritical));
    });

    formData.append('status', status);

    try {
      if (isEditing) {
        await updateReport(reportId, formData as any);
      } else {
        await createReport(formData as any);
      }
      navigate('/technician/reports');
    } catch (error) {
      // Error is already handled by useCrudApi hook
    }
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/technician/reports')} className="flex items-center">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Retour aux rapports
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FileText className="w-8 h-8 mr-3 text-primary-600" />
          {isEditing ? 'Modifier le Rapport Technique' : 'Nouveau Rapport Technique'}
        </h1>

        <form className="space-y-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Informations Générales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mission</label>
                <select {...register('missionId', { required: 'La mission est requise' })} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="">Sélectionner une mission</option>
                  {missions.map(mission => (
                    <option key={mission._id} value={mission._id}>
                      {mission.missionNumber} - {mission.client.companyName} ({mission.serviceType.name})
                    </option>
                  ))}
                </select>
                {errors.missionId && <p className="text-red-500 text-sm mt-1">{errors.missionId.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date du rapport</label>
                <input type="date" {...register('reportDate', { required: 'La date est requise' })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                {errors.reportDate && <p className="text-red-500 text-sm mt-1">{errors.reportDate.message}</p>}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Durée de l'intervention</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heure de début</label>
                <input type="time" {...register('startTime', { required: 'Heure de début requise' })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heure de fin</label>
                <input type="time" {...register('endTime', { required: 'Heure de fin requise' })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
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
              {photoFields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-4">
                  <input type="file" accept="image/*" {...register(`photos.${index}.file`)} className="w-full" />
                  <Button type="button" variant="ghost" onClick={() => removePhoto(index)}><Trash2 className="w-5 h-5 text-red-500" /></Button>
                </div>
              ))}
            </div>
            <Button type="button" onClick={() => appendPhoto({ file: new File([], '') })} className="mt-4 flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une photo
            </Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Anomalies et remarques</h2>
            <div className="space-y-4">
              {anomalyFields.map((field, index) => (
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
              ))}
            </div>
            <Button type="button" onClick={() => appendAnomaly({ description: '', isCritical: false })} className="mt-4 flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une anomalie
            </Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Conformité et Notes</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <input type="checkbox" {...register('isBatutalCompliant')} id="isBatutalCompliant" className="h-4 w-4 rounded" />
                <label htmlFor="isBatutalCompliant" className="font-medium text-gray-700">Conforme BATUTA</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de certificat (si applicable)</label>
                <input type="text" {...register('certificateNumber')} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes générales</label>
                <textarea {...register('notes')} rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2"></textarea>
              </div>
            </div>
          </Card>

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
        </form>
      </div>
    </Layout>
  );
};

const ProtectedTechnicalReport = () => (
  <ProtectedRoute roles={['technician']}>
    <TechnicalReport />
  </ProtectedRoute>
);

export default ProtectedTechnicalReport;
