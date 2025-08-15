import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ProtectedRoute from '../../components/ProtectedRoute';
import { 
  ClipboardList, 
  MapPin,
  User,
  Wrench,
  Calendar,
  CheckCircle2,
  XCircle,
  PlayCircle,
  AlertTriangle,
  FileText,
  Mail,
  Phone
} from 'lucide-react';
import apiService from '../../services/apiService';
import toast from 'react-hot-toast';

interface MissionDetails {
  _id: string;
  missionNumber: string;
  type: 'installation' | 'intervention';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  address: string;
  details?: string;
  clientId: { _id: string; firstName: string; lastName: string; email: string; phone: string; address: string; city: string; postalCode: string; };
  technicianId: { _id: string; firstName: string; lastName: string; email: string; phone: string; };
  quoteId: { _id: string; title: string; description: string; };
}

const ViewMission: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [mission, setMission] = useState<MissionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<MissionDetails['status'] | ''>('');

  useEffect(() => {
    const fetchMission = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const missionData = await apiService.missions.getById(id);
        setMission(missionData);
        setNewStatus(missionData.status);
      } catch (error) {
        console.error('Error fetching mission details:', error);
        toast.error('Erreur lors du chargement des détails de la mission.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMission();
  }, [id]);

  const handleStatusChange = async () => {
    if (!mission || !newStatus || newStatus === mission.status) return;

    try {
      await apiService.missions.update(mission._id, { status: newStatus });
      setMission(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success('Statut de la mission mis à jour avec succès !');
    } catch (error) {
      console.error('Error updating mission status:', error);
      toast.error('Erreur lors de la mise à jour du statut de la mission.');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <p>Chargement des détails de la mission...</p>
        </div>
      </Layout>
    );
  }

  if (!mission) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <p>Mission non trouvée.</p>
        </div>
      </Layout>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string, label: string, icon: React.ReactNode }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'En attente', icon: <AlertTriangle className="w-3 h-3 mr-1" /> },
      in_progress: { color: 'bg-blue-100 text-blue-800', label: 'En cours', icon: <PlayCircle className="w-3 h-3 mr-1" /> },
      completed: { color: 'bg-green-100 text-green-800', label: 'Terminée', icon: <CheckCircle2 className="w-3 h-3 mr-1" /> },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Annulée', icon: <XCircle className="w-3 h-3 mr-1" /> },
    };
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: 'Inconnu', icon: <></> };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}{config.label}
      </span>
    );
  };

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <ClipboardList className="w-8 h-8 mr-3 text-primary-600" />
          Détails de la Mission: {mission.missionNumber}
        </h1>

        <Card className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mission Info */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">Informations sur la mission</h3>
              <p className="flex items-center text-gray-700">
                <Wrench className="w-5 h-5 mr-2 text-gray-500" /> Type: {mission.type === 'installation' ? 'Installation' : 'Intervention'}
              </p>
              <p className="flex items-center text-gray-700">
                <Calendar className="w-5 h-5 mr-2 text-gray-500" /> Date prévue: {new Date(mission.scheduledDate).toLocaleString()}
              </p>
              <p className="flex items-center text-gray-700">
                <MapPin className="w-5 h-5 mr-2 text-gray-500" /> Adresse: {mission.address}
              </p>
              {mission.details && (
                <p className="flex items-start text-gray-700">
                  <FileText className="w-5 h-5 mr-2 text-gray-500" /> Détails: {mission.details}
                </p>
              )}
              <div className="flex items-center text-gray-700">
                Statut: {getStatusBadge(mission.status)}
              </div>
            </div>

            {/* Client Info */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">Informations Client</h3>
              <p className="flex items-center text-gray-700">
                <User className="w-5 h-5 mr-2 text-gray-500" /> {mission.clientId.firstName} {mission.clientId.lastName}
              </p>
              <p className="flex items-center text-gray-700">
                <Mail className="w-5 h-5 mr-2 text-gray-500" /> {mission.clientId.email}
              </p>
              <p className="flex items-center text-gray-700">
                <Phone className="w-5 h-5 mr-2 text-gray-500" /> {mission.clientId.phone}
              </p>
              <p className="flex items-center text-gray-700">
                <MapPin className="w-5 h-5 mr-2 text-gray-500" /> {mission.clientId.address.street}, {mission.clientId.postalCode} {mission.clientId.city}
              </p>
            </div>

            {/* Technician Info */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">Informations Technicien</h3>
              <p className="flex items-center text-gray-700">
                <User className="w-5 h-5 mr-2 text-gray-500" /> {mission.technicianId.firstName} {mission.technicianId.lastName}
              </p>
              <p className="flex items-center text-gray-700">
                <Mail className="w-5 h-5 mr-2 text-gray-500" /> {mission.technicianId.email}
              </p>
              <p className="flex items-center text-gray-700">
                <Phone className="w-5 h-5 mr-2 text-gray-500" /> {mission.technicianId.phone}
              </p>
            </div>

            {/* Quote Info */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">Informations Devis</h3>
              <p className="flex items-center text-gray-700">
                <FileText className="w-5 h-5 mr-2 text-gray-500" /> Titre: {mission.quoteId.title}
              </p>
              <p className="flex items-start text-gray-700">
                <FileText className="w-5 h-5 mr-2 text-gray-500" /> Description: {mission.quoteId.description}
              </p>
            </div>
          </div>

          {/* Status Update Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Mettre à jour le statut de la mission</h3>
            <div className="flex items-center space-x-4">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as MissionDetails['status'])}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="pending">En attente</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminée</option>
                <option value="cancelled">Annulée</option>
              </select>
              <Button onClick={handleStatusChange} disabled={newStatus === mission.status}>
                Mettre à jour le statut
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

const ProtectedViewMission = () => (
  <ProtectedRoute roles={['technician']}>
    <ViewMission />
  </ProtectedRoute>
);

export default ProtectedViewMission;
