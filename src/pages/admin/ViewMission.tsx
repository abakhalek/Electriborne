import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import apiService from '../../services/apiService';
import toast from 'react-hot-toast';
import { ArrowLeft, ClipboardList, User, Calendar, MapPin, DollarSign, Wrench, CheckCircle2, XCircle, Edit2, FileText, Clock, Mail } from 'lucide-react';

interface Mission {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  startDate: string;
  endDate?: string;
  clientId: { _id: string; firstName: string; lastName: string; email: string; company?: string; };
  technicianId: { _id: string; firstName: string; lastName: string; email: string; };
  requestId?: string;
  quoteId?: string;
  address: { street: string; city: string; postalCode: string; full?: string };
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const ViewMission: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mission, setMission] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMission = async () => {
      if (!id) {
        setError('Mission ID is missing.');
        setIsLoading(false);
        return;
      }
      try {
        const fetchedMission = await apiService.missions.getById(id);
        setMission(fetchedMission);
      } catch (err) {
        console.error('Failed to fetch mission:', err);
        setError('Erreur lors du chargement de la mission.');
        toast.error('Erreur lors du chargement de la mission.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMission();
  }, [id]);

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'En attente', icon: Clock },
      'in-progress': { color: 'bg-blue-100 text-blue-800', label: 'En cours', icon: Wrench },
      completed: { color: 'bg-green-100 text-green-800', label: 'Terminée', icon: CheckCircle2 },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Annulée', icon: XCircle },
    };
    const config = statusConfig[status] || { color: 'bg-gray-200', label: 'Inconnu', icon: Clock };
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: any = {
      low: { color: 'bg-gray-100 text-gray-800', label: 'Faible' },
      normal: { color: 'bg-blue-100 text-blue-800', label: 'Normale' },
      high: { color: 'bg-orange-100 text-orange-800', label: 'Élevée' },
      urgent: { color: 'bg-red-100 text-red-800', label: 'Urgente' },
    };
    const config = priorityConfig[priority] || { color: 'bg-gray-200', label: 'Inconnu' };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return <Layout><div className="text-center py-8">Chargement de la mission...</div></Layout>;
  }

  if (error) {
    return <Layout><div className="text-center py-8 text-red-600">{error}</div></Layout>;
  }

  if (!mission) {
    return <Layout><div className="text-center py-8">Mission non trouvée.</div></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <ClipboardList className="w-8 h-8 mr-3 text-primary-600" />
            Détails de la Mission: {mission.title}
          </h1>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour
          </Button>
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations Générales</h2>
              <div className="space-y-2">
                <p className="flex items-center text-gray-700">
                  <FileText className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="font-medium">Titre:</span> {mission.title}
                </p>
                <p className="flex items-center text-gray-700">
                  <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="font-medium">Date de début:</span> {new Date(mission.startDate).toLocaleDateString()}
                </p>
                {mission.endDate && (
                  <p className="flex items-center text-gray-700">
                    <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                    <span className="font-medium">Date de fin:</span> {new Date(mission.endDate).toLocaleDateString()}
                  </p>
                )}
                <p className="flex items-center text-gray-700">
                  <DollarSign className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="font-medium">Statut:</span> {getStatusBadge(mission.status)}
                </p>
                <p className="flex items-center text-gray-700">
                  <Wrench className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="font-medium">Priorité:</span> {getPriorityBadge(mission.priority)}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Détails Client & Technicien</h2>
              <div className="space-y-2">
                <p className="flex items-center text-gray-700">
                  <User className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="font-medium">Client:</span> {mission.clientId.firstName} {mission.clientId.lastName} {mission.clientId.company ? `(${mission.clientId.company})` : ''}
                </p>
                <p className="flex items-center text-gray-700">
                  <Mail className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="font-medium">Email Client:</span> {mission.clientId.email}
                </p>
                <p className="flex items-center text-gray-700">
                  <User className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="font-medium">Technicien:</span> {mission.technicianId.firstName} {mission.technicianId.lastName}
                </p>
                <p className="flex items-center text-gray-700">
                  <Mail className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="font-medium">Email Technicien:</span> {mission.technicianId.email}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-md">{mission.description}</p>
          </div>

          {mission.notes && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-md">{mission.notes}</p>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Adresse</h2>
            <p className="text-gray-700 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-gray-500" />
              {`${mission.address.street}, ${mission.address.postalCode} ${mission.address.city}`}
            </p>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => navigate(`/admin/missions/edit/${mission._id}`)}>
              <Edit2 className="w-5 h-5 mr-2" />
              Modifier la Mission
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default ViewMission;
