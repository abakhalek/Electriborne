import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import DataTable, { Column } from '../../components/DataTable';

import ConfirmDialog from '../../components/ConfirmDialog';
import { 
  ClipboardList, 
  Plus, 
  CheckCircle2,
  XCircle,
  PlayCircle,
  AlertTriangle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import apiService from '../../services/apiService';

interface Mission {
  _id: string;
  missionNumber: string;
  serviceType: { _id: string; name: string; };
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  address: string;
  clientId: { _id: string; firstName: string; lastName: string; };
  technicianId: { _id: string; firstName: string; lastName: string; };
  quoteId: { _id: string; title: string; };
}

interface MissionFormData {
  serviceType: string;
  scheduledDate: string;
  address: string;
  clientId: string;
  technicianId: string;
  quoteId: string;
  details?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

const MissionManagement: React.FC = () => {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [missions, setMissions] = useState<Mission[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const missionStats = {
    total: total,
    pending: missions.filter(m => m.status === 'pending').length,
    inProgress: missions.filter(m => m.status === 'in_progress').length,
    completed: missions.filter(m => m.status === 'completed').length,
  };

  const { handleSubmit } = useForm<MissionFormData>();

  useEffect(() => {
    loadMissions();
  }, [currentPage, pageSize, statusFilter, searchTerm]);

  const loadMissions = async () => {
    setIsLoading(true);
    const params: any = {
      page: currentPage,
      limit: pageSize,
      status: statusFilter === 'all' ? '' : statusFilter,
      search: searchTerm
    };
    try {
      const response = await apiService.missions.getAll(params);
      setMissions(response.items || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Error loading missions:', error);
    }
    setIsLoading(false);
  };

  const handleDeleteMission = async () => {
    if (!selectedMissionId) return;
    try {
      await apiService.missions.delete(selectedMissionId);
      setIsDeleteDialogOpen(false);
      loadMissions();
    } catch (error) {
      console.error('Error deleting mission:', error);
    }
  };

  const openDeleteDialog = (missionId: string) => {
    setSelectedMissionId(missionId);
    setIsDeleteDialogOpen(true);
  };

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

  const columns: Column<Mission>[] = [
    { header: 'N° Mission', accessor: 'missionNumber', sortable: true },
    { header: 'Type de Service', accessor: (mission) => mission.serviceType.name, sortable: true },
    { header: 'Client', accessor: (mission) => `${mission.clientId.firstName} ${mission.clientId.lastName}`, sortable: true },
    { header: 'Technicien', accessor: (mission) => `${mission.technicianId.firstName} ${mission.technicianId.lastName}`, sortable: true },
    { header: 'Date', accessor: 'scheduledDate', cell: (mission) => new Date(mission.scheduledDate).toLocaleDateString(), sortable: true },
    { header: 'Adresse', accessor: 'address' },
    { header: 'Statut', accessor: 'status', cell: (mission) => getStatusBadge(mission.status), sortable: true },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ClipboardList className="w-8 h-8 mr-3 text-primary-600" />
              Gestion des Missions
            </h1>
            <p className="text-gray-600 mt-2">Créez, gérez et assignez des missions aux techniciens.</p>
          </div>
          <Button size="lg" onClick={() => navigate('/admin/add-mission')} className="flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle Mission
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Missions</p>
                <p className="text-2xl font-bold text-gray-900">{missionStats.total}</p>
              </div>
              <ClipboardList className="w-8 h-8 text-primary-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{missionStats.pending}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En cours</p>
                <p className="text-2xl font-bold text-blue-600">{missionStats.inProgress}</p>
              </div>
              <PlayCircle className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Terminées</p>
                <p className="text-2xl font-bold text-green-600">{missionStats.completed}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </Card>
        </div>

        <DataTable
          data={missions}
          columns={columns}
          keyField="_id"
          title="Liste des missions"
          isLoading={isLoading}
          pagination={{ page: currentPage, limit: pageSize, total, onPageChange: setCurrentPage, onLimitChange: setPageSize }}
          actions={{
            view: (mission) => navigate(`/admin/missions/view/${mission._id}`),
            edit: (mission) => navigate(`/admin/missions/edit/${mission._id}`),
            delete: (mission) => openDeleteDialog(mission._id),
          }}
          onRowClick={(mission) => navigate(`/admin/missions/view/${mission._id}`)}
          filters={
            <select onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2">
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminée</option>
              <option value="cancelled">Annulée</option>
            </select>
          }
          searchPlaceholder="Rechercher par N°, client, technicien..."
          onSearch={setSearchTerm}
          emptyMessage="Aucune mission trouvée"
        />

        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteMission}
          title="Supprimer la mission"
          message="Êtes-vous sûr de vouloir supprimer cette mission ?"
          type="danger"
        />
      </div>
    </Layout>
  );
};

export default MissionManagement;