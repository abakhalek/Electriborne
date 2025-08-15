import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ProtectedRoute from '../../components/ProtectedRoute';
import { FileText, Plus, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApi } from '../../hooks/useApi';
import apiService from '../../services/apiService';

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
  equipment: string;
  workPerformed: string;
}

const SaveReport: React.FC = () => {
  const navigate = useNavigate();
  const { missionId, reportId } = useParams<{ missionId: string; reportId: string }>();
  const [missions, setMissions] = useState<Mission[]>([]); // State to store all missions
  const isEditing = !!reportId;
  const isViewMode = location.pathname.includes('/view/'); // Assuming a view mode might be added later

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
      // Initialize other fields as needed
    }
  });

  const { fields: photoFields, append: appendPhoto, remove: removePhoto } = useFieldArray({ control, name: "photos" });
  const { fields: anomalyFields, append: appendAnomaly, remove: removeAnomaly } = useFieldArray({ control, name: "anomalies" });

  const { execute: createReport } = useApi<any, [FormData]>(apiService.reports.create);
  const { execute: updateReport } = useApi<any, [string, FormData]>(apiService.reports.update);
  const [mission, setMission] = useState<Mission | null>(null);

  useEffect(() => {
    const loadData = async () => {
      console.log('SaveReport: loadData function executed.');
      if (reportId) {
        const data = await apiService.reports.getById(reportId);
        if (data) {
          reset({
            ...data,
            mission: data.mission._id, // Set mission ID for select
            reportDate: new Date(data.reportDate).toISOString().split('T')[0], // Assuming 'reportDate' field from backend
            photos: data.photos.map((url: string) => ({ file: undefined, url: url })), // Populate existing photos
            anomalies: data.anomalies || [],
            isBatutalCompliant: data.isBatutalCompliant || false, // Ensure boolean
            certificateNumber: data.certificateNumber || '',
            location: data.location || { address: '', city: '', postalCode: '' },
          });
          setMission(data.mission);
        }
      } else if (missionId) {
        const data = await apiService.missions.getById(missionId);
        if (data) {
          setMission(data);
          // Pre-fill form with mission data
          reset({
            mission: data._id,
            location: {
              address: data.address,
              city: data.city, // Assuming city and postalCode are available on mission
              postalCode: data.postalCode,
            },
            type: data.serviceType?.name, // Assuming serviceType is populated
            // Other fields can be initialized here if needed
          });
        }
      } else { // New report, no missionId in URL
        try {
          const allMissions = await apiService.missions.getAll({ status: 'pending' }); // Fetch pending missions
          setMissions(allMissions.items || []);
        } catch (error) {
          console.error('Error fetching missions for selection:', error);
          toast.error('Erreur lors du chargement des missions disponibles.');
        }
      }
    };
    loadData();
  }, [missionId, reportId, reset]);

  const onSubmit = async (data: ReportFormData) => {
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
    formData.append('equipment', data.equipment);
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
        // If it's an existing photo URL, send it back to the backend
        // The backend PUT route needs to handle existing photos
        formData.append(`existingPhotos[${index}]`, photo.url);
      }
    });

    // The status should be determined by the button clicked, not hardcoded here.
    // For now, let's assume it's always 'completed' for submission.
    // This might need to be passed as an argument to onSubmit if there are multiple submit buttons.
    formData.append('status', 'completed'); 

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
      toast.success(isEditing ? 'Rapport mis à jour avec succès' : 'Rapport créé avec succès');
      navigate('/tech/reports');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde du rapport');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newPhotos = filesArray.map(file => ({ file: [file] }));
      setValue('photos', [...(watch('photos') || []), ...newPhotos]);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="w-8 h-8 mr-3 text-primary-600" />
            {reportId ? 'Modifier le Rapport' : 'Nouveau Rapport'}
          </h1>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="mission" className="block text-sm font-medium text-gray-700">Mission</label>
              {(reportId || missionId) ? (
                <input
                  type="text"
                  id="mission"
                  {...register('mission')}
                  value={mission ? `${mission.missionNumber} - ${mission.client ? `${mission.client.firstName} ${mission.client.lastName}` : 'Client non disponible'}` : ''}
                  disabled
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              ) : (
                <select
                  id="mission"
                  {...register('mission', { required: 'La mission est requise' })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">Sélectionner une mission</option>
                  {missions.map(m => (
                    <option key={m._id} value={m._id}>
                      {m.missionNumber} - {m.client ? `${m.client.firstName} ${m.client.firstName} ${m.client.lastName}` : 'Client non disponible'}
                    </option>
                  ))}
                </select>
              )}
              {errors.mission && <p className="mt-1 text-sm text-red-600">{errors.mission.message}</p>}
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type d'intervention</label>
              <select
                id="type"
                {...register('type', { required: 'Le type d\'intervention est requis' })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Sélectionner un type</option>
                <option value="Installation borne de recharge">Installation borne de recharge</option>
                <option value="Maintenance préventive">Maintenance préventive</option>
                <option value="Réparation d'urgence">Réparation d'urgence</option>
                <option value="Diagnostic électrique">Diagnostic électrique</option>
                <option value="Mise aux normes">Mise aux normes</option>
                <option value="Remplacement équipement">Remplacement équipement</option>
                <option value="Autre">Autre</option>
              </select>
              {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="reportDate" className="block text-sm font-medium text-gray-700">Date du rapport</label>
                <input
                  type="date"
                  id="reportDate"
                  {...register('reportDate', { required: 'La date du rapport est requise' })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.reportDate && <p className="mt-1 text-sm text-red-600">{errors.reportDate.message}</p>}
              </div>
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Heure de début</label>
                <input
                  type="time"
                  id="startTime"
                  {...register('startTime', { required: 'L\'heure de début est requise' })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.startTime && <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>}
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">Heure de fin</label>
                <input
                  type="time"
                  id="endTime"
                  {...register('endTime', { required: 'L\'heure de fin est requise' })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.endTime && <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>}
              </div>
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Durée (minutes)</label>
                <input
                  type="number"
                  id="duration"
                  {...register('duration', { required: 'La durée est requise', valueAsNumber: true })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="workPerformed" className="block text-sm font-medium text-gray-700">Travaux effectués</label>
              <textarea
                id="workPerformed"
                {...register('workPerformed', { required: 'Les travaux effectués sont requis' })}
                rows={4}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              ></textarea>
              {errors.workPerformed && <p className="mt-1 text-sm text-red-600">{errors.workPerformed.message}</p>}
            </div>

            <div>
              <label htmlFor="equipment" className="block text-sm font-medium text-gray-700">Matériel utilisé</label>
              <textarea
                id="equipment"
                {...register('equipment', { required: 'Le matériel utilisé est requis' })}
                rows={2}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              ></textarea>
              {errors.equipment && <p className="mt-1 text-sm text-red-600">{errors.equipment.message}</p>}
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                id="notes"
                {...register('notes')}
                rows={2}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              ></textarea>
            </div>

            <div>
              <label htmlFor="isBatutalCompliant" className="block text-sm font-medium text-gray-700">Conforme Batutal</label>
              <input
                type="checkbox"
                id="isBatutalCompliant"
                {...register('isBatutalCompliant')}
                className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
            </div>

            <div>
              <label htmlFor="certificateNumber" className="block text-sm font-medium text-gray-700">Numéro de certificat</label>
              <input
                type="text"
                id="certificateNumber"
                {...register('certificateNumber')}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="location.address" className="block text-sm font-medium text-gray-700">Adresse</label>
              <input
                type="text"
                id="location.address"
                {...register('location.address', { required: 'L\'adresse est requise' })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              {errors.location?.address && <p className="mt-1 text-sm text-red-600">{errors.location.address.message}</p>}
            </div>

            <div>
              <label htmlFor="location.city" className="block text-sm font-medium text-gray-700">Ville</label>
              <input
                type="text"
                id="location.city"
                {...register('location.city', { required: 'La ville est requise' })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              {errors.location?.city && <p className="mt-1 text-sm text-red-600">{errors.location.city.message}</p>}
            </div>

            <div>
              <label htmlFor="location.postalCode" className="block text-sm font-medium text-gray-700">Code Postal</label>
              <input
                type="text"
                id="location.postalCode"
                {...register('location.postalCode', { required: 'Le code postal est requis' })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              {errors.location?.postalCode && <p className="mt-1 text-sm text-red-600">{errors.location.postalCode.message}</p>}
            </div>

            <div>
              <label htmlFor="photos" className="block text-sm font-medium text-gray-700">Photos</label>
              <input
                type="file"
                id="photos"
                multiple
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              <div className="mt-2 grid grid-cols-4 gap-2">
                {photoFields.map((field, index) => (
                  <div key={field.id} className="relative">
                    {field.url && <img src={field.url} alt={`Photo ${index + 1}`} className="w-full h-24 object-cover rounded-md" />}
                    {field.file && field.file[0] && <img src={URL.createObjectURL(field.file[0])} alt={`Photo ${index + 1}`} className="w-full h-24 object-cover rounded-md" />}
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Anomalies</h3>
              {anomalyFields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    {...register(`anomalies.${index}.description`, { required: 'La description de l\'anomalie est requise' })}
                    placeholder="Description de l'anomalie"
                    className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register(`anomalies.${index}.isCritical`)}
                      className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Critique</span>
                  </label>
                  <Button type="button" variant="destructive" onClick={() => removeAnomaly(index)}>
                    Supprimer
                  </Button>
                </div>
              ))}
              <Button type="button" onClick={() => appendAnomaly({ description: '', isCritical: false })}>
                Ajouter une anomalie
              </Button>
            </div>

            <div className="flex justify-end">
              <Button type="submit" size="lg">
            <Plus className="w-5 h-5 mr-2" />
            {reportId ? 'Mettre à jour le Rapport' : 'Créer le Rapport'}
          </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

const ProtectedSaveReport = () => (
  <ProtectedRoute roles={['technician']}>
    <SaveReport />
  </ProtectedRoute>
);

export default ProtectedSaveReport;