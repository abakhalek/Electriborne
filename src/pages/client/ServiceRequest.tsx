import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  Wrench,
  MapPin,
  Calendar,
  Clock,
  Camera,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Upload,
  ArrowRight,
  Info,
  Loader
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import apiService from '../../services/apiService';
import axios, { AxiosError } from 'axios';

interface ServiceRequestForm {
  serviceTypeId: string;
  priority: string;
  title: string;
  description: string;
  preferredDate: string;
  preferredTime: string;
  address: string;
  contactPhone: string;
  equipment: string;
  symptoms: string[];
  accessInstructions: string;
}

interface ServiceType {
  _id: string;
  name: string;
  // Add other properties from your ServiceType model if needed, e.g., icon
}

const ServiceRequest: React.FC = () => {
  const navigate = useNavigate();
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reference, setReference] = useState('');
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ServiceRequestForm>();

  useEffect(() => {
    const fetchServiceTypes = async () => {
      try {
        setIsLoadingTypes(true);
        const response = await apiService.siteCustomization.getServiceTypes();
        setServiceTypes(response.items || []);
        console.log('Service Types fetched:', response.items);
        console.log('isLoadingTypes after fetch:', false);
      } catch (error) {
        toast.error('Erreur lors du chargement des types de service.');
      } finally {
        setIsLoadingTypes(false);
      }
    };
    fetchServiceTypes();
  }, []);

  const priorityLevels = [
    { value: 'low', label: 'Faible', color: 'text-blue-600', description: 'Peut attendre quelques jours' },
    { value: 'normal', label: 'Normale', color: 'text-gray-600', description: 'Dans la semaine' },
    { value: 'high', label: 'Élevée', color: 'text-orange-600', description: 'Dans les 24-48h' },
    { value: 'urgent', label: 'Urgente', color: 'text-red-600', description: 'Intervention immédiate' },
  ];

  const commonSymptoms = [
    'Panne électrique totale',
    'Disjoncteur qui saute',
    'Éclairage défaillant',
    'Prise électrique ne fonctionne pas',
    'Tableau électrique qui chauffe',
    'Odeur de brûlé',
    'Étincelles',
    'Bruit anormal',
    'Borne de recharge en panne',
    'Problème de charge véhicule',
  ];

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles) => {
      setUploadedFiles(prev => [...prev, ...acceptedFiles]);
    },
  });

  const removeFile = (index: number) => {
    setUploadedFiles(files => files.filter((_, i) => i !== index));
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const onSubmit = async (data: ServiceRequestForm) => {
    setIsSubmitting(true);
    try {
      const requestFormData = new FormData();

      console.log('Address from form data:', data.address);
      // Append all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'address') {
          requestFormData.append('address.full', value as string);
        } else if (value) {
          requestFormData.append(key, value as string);
        }
      });

      // Append symptoms
      requestFormData.append('symptoms', JSON.stringify(selectedSymptoms));

      // Append files
      uploadedFiles.forEach(file => {
        requestFormData.append('attachments', file);
      });

      // Log FormData content for debugging
      for (let pair of requestFormData.entries()) {
        console.log(pair[0]+ ', ' + pair[1]); 
      }

      // Send to API
      const response = await apiService.requests.create(requestFormData);

      // Set reference for confirmation screen
      setReference(response.reference || `REQ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`);

      setIsSubmitted(true);
      toast.success('Demande d\'intervention envoyée avec succès !');
    } catch (error: unknown) {      console.error('Error submitting request:', error);      if (axios.isAxiosError(error)) {        console.error('Error response data:', error.response?.data);        console.error('Error response status:', error.response?.status);      }      toast.error('Erreur lors de l\'envoi de la demande');    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedServiceTypeId = watch('serviceTypeId');
  const selectedPriority = watch('priority');

  if (isSubmitted) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Demande envoyée avec succès !
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Votre demande d'intervention a bien été enregistrée. Un technicien vous contactera 
              dans les plus brefs délais pour planifier l'intervention.
            </p>
            <div className="bg-gray-50 p-6 rounded-lg mb-8 max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 mb-2">Référence de votre demande</h3>
              <p className="text-xl font-bold text-primary-600">{reference}</p>
              <p className="text-sm text-gray-500 mt-2">Conservez cette référence pour le suivi</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => setIsSubmitted(false)}>
                Nouvelle demande
              </Button>
              <Button variant="ghost" onClick={() => navigate('/client/dashboard')}>
                Retour au dashboard
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Wrench className="w-8 h-8 mr-3 text-primary-600" />
            Demande d'Intervention
          </h1>
          <p className="text-gray-600 mt-2">
            Décrivez votre problème et nous vous mettrons en relation avec un technicien qualifié
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Service Type */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Type d'Intervention</h3>
            {isLoadingTypes ? (
              <div className="flex justify-center items-center h-24">
                <Loader className="animate-spin text-primary-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {serviceTypes.map((type) => (
                  <label
                    key={type._id}
                    className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedServiceTypeId === type._id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value={type._id}
                      {...register('serviceTypeId', { required: 'Veuillez sélectionner un type d\'intervention' })}
                      className="sr-only"
                    />
                    <Wrench className={`w-8 h-8 mb-2 ${
                      selectedServiceTypeId === type._id ? 'text-primary-600' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      selectedServiceTypeId === type._id ? 'text-primary-900' : 'text-gray-700'
                    }`}>
                      {type.name}
                    </span>
                  </label>
                ))}
              </div>
            )}
            {errors.serviceTypeId && (
              <p className="mt-2 text-sm text-red-600">{errors.serviceTypeId.message}</p>
            )}
          </Card>

          {/* Priority Level */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Niveau de Priorité</h3>
            <div className="space-y-3">
              {priorityLevels.map((priority) => (
                <label
                  key={priority.value}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedPriority === priority.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    value={priority.value}
                    {...register('priority', { required: 'Veuillez sélectionner une priorité' })}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${priority.color}`}>
                        {priority.label}
                      </span>
                      <span className="text-sm text-gray-500">
                        {priority.description}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors.priority && (
              <p className="mt-2 text-sm text-red-600">{errors.priority.message}</p>
            )}
          </Card>

          {/* Problem Description */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Description du Problème</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de la demande
                </label>
                <input
                  type="text"
                  {...register('title', { required: 'Le titre est requis' })}
                  placeholder="Ex: Panne électrique dans la cuisine"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description détaillée
                </label>
                <textarea
                  {...register('description', { required: 'La description est requise' })}
                  rows={4}
                  placeholder="Décrivez le problème en détail, quand il est survenu, les circonstances..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Équipement concerné
                </label>
                <input
                  type="text"
                  {...register('equipment')}
                  placeholder="Ex: Tableau électrique principal, Borne de recharge..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Symptoms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symptômes observés (optionnel)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {commonSymptoms.map((symptom) => (
                    <label
                      key={symptom}
                      className="flex items-center p-2 rounded border hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSymptoms.includes(symptom)}
                        onChange={() => toggleSymptom(symptom)}
                        className="mr-2 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{symptom}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Location & Schedule */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lieu et Planning</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Adresse d'intervention
                </label>
                <textarea
                  {...register('address', { required: 'L\'adresse est requise' })}
                  rows={3}
                  placeholder="Adresse complète avec code postal et ville"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>

              <div className="space-y-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Créneau préféré
                  </label>
                  <select
                    {...register('preferredTime')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Pas de préférence</option>
                    <option value="morning">Matin (8h-12h)</option>
                    <option value="afternoon">Après-midi (14h-18h)</option>
                    <option value="evening">Soirée (18h-20h)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions d'accès
              </label>
              <textarea
                {...register('accessInstructions')}
                rows={2}
                placeholder="Code d'accès, étage, instructions particulières..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </Card>

          {/* Contact Info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone de contact
              </label>
              <input
                type="tel"
                {...register('contactPhone', { required: 'Le téléphone est requis' })}
                placeholder="06 12 34 56 78"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.contactPhone && (
                <p className="mt-1 text-sm text-red-600">{errors.contactPhone.message}</p>
              )}
            </div>
          </Card>

          {/* File Upload */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <Camera className="w-5 h-5 inline mr-2" />
              Photos et Documents (optionnel)
            </h3>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Glissez vos fichiers ici ou cliquez pour sélectionner
              </p>
              <p className="text-sm text-gray-500">
                Photos du problème, schémas, documents (max 5 fichiers, 10MB chacun)
              </p>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-gray-900">Fichiers sélectionnés:</h4>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      Supprimer
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Information */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex items-start space-x-3">
              <Info className="w-6 h-6 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">Informations importantes</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Votre demande sera traitée dans les plus brefs délais. Un technicien vous contactera 
                  pour confirmer le rendez-vous et vous fournir un devis si nécessaire.
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  En cas d'urgence, vous pouvez également nous contacter directement au 01 42 33 44 55.
                </p>
              </div>
            </div>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="ghost" size="lg" onClick={() => navigate('/client/dashboard')}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              size="lg"
              isLoading={isSubmitting}
            >
              Envoyer la Demande
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ServiceRequest; // Added default export