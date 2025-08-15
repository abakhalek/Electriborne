import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  ArrowLeft, 
  ClipboardList, 
  User, 
  Wrench, 
  MapPin, 
  DollarSign, 
  Paperclip, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Edit2 
} from 'lucide-react';
import apiService from '../../services/apiService';

interface Request {
  _id: string;
  title: string;
  description: string;
  type: 'installation' | 'intervention';
  serviceTypeId: { _id: string; name: string; category: string };
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled' | 'quoted';
  address: { street: string; city: string; postalCode: string };
  estimatedBudget?: number;
  preferredDate?: string;
  notes?: string;
  attachments?: string[];
  clientId: { _id: string; firstName: string; lastName: string; company?: string };
  assignedTechnician?: { _id: string; firstName: string; lastName: string };
  createdAt: string;
}

const ViewRequest: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<Request | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequest = async () => {
      if (!id) {
        setError('Request ID is missing.');
        setIsLoading(false);
        return;
      }
      try {
        const response = await apiService.requests.getById(id);
        setRequest(response);
      } catch (err) {
        console.error('Failed to fetch request:', err);
        setError('Failed to load request details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-warning-100 text-warning-800', label: 'En attente', icon: Clock },
      assigned: { color: 'bg-blue-100 text-blue-800', label: 'Assignée', icon: User },
      'in-progress': { color: 'bg-primary-100 text-primary-800', label: 'En cours', icon: Wrench },
      completed: { color: 'bg-success-100 text-success-800', label: 'Terminée', icon: CheckCircle2 },
      cancelled: { color: 'bg-error-100 text-error-800', label: 'Annulée', icon: XCircle },
      quoted: { color: 'bg-purple-100 text-purple-800', label: 'Devis envoyé', icon: ClipboardList },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: 'bg-gray-100 text-gray-800', label: 'Faible' },
      normal: { color: 'bg-blue-100 text-blue-800', label: 'Normale' },
      high: { color: 'bg-orange-100 text-orange-800', label: 'Élevée' },
      urgent: { color: 'bg-red-100 text-red-800', label: 'Urgente' },
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600">Chargement des détails de la demande...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-error-600">Erreur: {error}</p>
        </div>
      </Layout>
    );
  }

  if (!request) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600">Demande non trouvée.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 flex items-center text-primary-600">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour aux Demandes
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ClipboardList className="w-8 h-8 mr-3 text-primary-600" />
              Détails de la Demande: {request.title}
            </h1>
            <p className="text-gray-600 mt-2">
              Informations détaillées sur la demande de service #{request._id}
            </p>
          </div>
          <Button onClick={() => navigate(`/admin/requests/edit/${request._id}`)} className="flex items-center">
            <Edit2 className="w-5 h-5 mr-2" />
            Modifier la Demande
          </Button>
        </div>

        {/* Request Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Informations Générales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Titre</p>
                <p className="text-gray-900 font-semibold">{request.title}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Type de Demande</p>
                <p className="text-gray-900 capitalize">{request.type === 'installation' ? 'Installation' : 'Intervention'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Service</p>
                <p className="text-gray-900">{request.serviceTypeId?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Client</p>
                <p className="text-gray-900">
                  {request.clientId ? 
                    `${request.clientId.firstName} ${request.clientId.lastName} ${request.clientId.company ? `(${request.clientId.company})` : ''}`
                    : 'Client inconnu'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Technicien Assigné</p>
                <p className="text-gray-900">
                  {request.assignedTechnician ? 
                    `${request.assignedTechnician.firstName} ${request.assignedTechnician.lastName}`
                    : 'Non assigné'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Date Préférée</p>
                <p className="text-gray-900">{request.preferredDate ? new Date(request.preferredDate).toLocaleDateString('fr-FR') : 'Non spécifiée'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Description</p>
              <p className="text-gray-900 leading-relaxed">{request.description}</p>
            </div>

            {request.notes && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Notes Additionnelles</p>
                <p className="text-gray-900 leading-relaxed">{request.notes}</p>
              </div>
            )}

            {request.attachments && request.attachments.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Pièces Jointes</p>
                <div className="flex flex-wrap gap-2">
                  {request.attachments.map((attachment, index) => (
                    <a 
                      key={index} 
                      href={attachment} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-primary-600 hover:bg-gray-50"
                    >
                      <Paperclip className="w-4 h-4 mr-2" />
                      Fichier {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Statut & Priorité</h2>
              <div>
                <p className="text-sm font-medium text-gray-600">Statut Actuel</p>
                {getStatusBadge(request.status)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Priorité</p>
                {getPriorityBadge(request.priority)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Date de Création</p>
                <p className="text-gray-900">{new Date(request.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Détails Financiers & Adresse</h2>
              <div>
                <p className="text-sm font-medium text-gray-600">Budget Estimé</p>
                <p className="text-gray-900 flex items-center">
                  <DollarSign className="w-4 h-4 mr-1 text-gray-500" />
                  {request.estimatedBudget ? `${request.estimatedBudget.toLocaleString('fr-FR')} €` : 'Non spécifié'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Adresse</p>
                <p className="text-gray-900 flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                  {`${request.address.street}, ${request.address.postalCode} ${request.address.city}`}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ViewRequest;
