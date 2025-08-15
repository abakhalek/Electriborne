import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import DataTable, { Column } from '../../components/DataTable';
import Card from '../../components/Card';
import ProtectedRoute from '../../components/ProtectedRoute';
import { 
  ClipboardList, 
  CheckCircle2,
  XCircle,
  PlayCircle,
  AlertTriangle,
  MapPin
} from 'lucide-react';

import apiService from '../../services/apiService';

interface Mission {
  _id: string; // MongoDB _id
  missionNumber: string;
  serviceType: { _id: string; name: string; }; // Populated ServiceType
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduledDate: string; // Date string
  address: string;
  details?: string;
  clientId: { _id: string; firstName: string; lastName: string; email: string; }; // Populated User
  technicianId: { _id: string; firstName: string; lastName: string; email: string; }; // Populated User
  quoteId: string; // Just the ID, not populated in this context
  invoiceId?: string; // Just the ID
  createdAt: string;
  updatedAt: string;
}

const TechnicianMissions: React.FC = () => {
  const navigate = useNavigate();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const missionStats = {
    total: total,
    pending: missions.filter(m => m.status === 'pending').length,
    inProgress: missions.filter(m => m.status === 'in_progress').length,
    completed: missions.filter(m => m.status === 'completed').length,
  };

  useEffect(() => {
    loadMissions();
  }, [currentPage, pageSize, statusFilter, searchTerm]);

  const loadMissions = async () => {
    setIsLoading(true);
    const params: any = {
      page: currentPage,
      limit: pageSize,
      status: statusFilter === 'all' ? undefined : statusFilter, // Send undefined if 'all'
      search: searchTerm
    };
    try {
      const response = await apiService.missions.getAll(params); // Use getAll
      setMissions(response.items); // Use response.items
      setTotal(response.total); // Use response.total
    } catch (error) {
      console.error('Error loading missions:', error);
    }
    setIsLoading(false);
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
    { header: 'Type', accessor: 'serviceType', cell: (mission) => mission.serviceType?.name || 'N/A', sortable: true }, // Use serviceType.name
    { header: 'Client', accessor: (mission) => mission.clientId?.firstName + ' ' + mission.clientId?.lastName, sortable: true }, // Use clientId.firstName/lastName
    { header: 'Technicien', accessor: (mission) => mission.technicianId?.firstName + ' ' + mission.technicianId?.lastName, sortable: true }, // Use technicianId.firstName/lastName
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
              Mes Missions
            </h1>
            <p className="text-gray-600 mt-2">Consultez la liste de vos missions assignées.</p>
          </div>
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
          title="Liste de vos missions"
          isLoading={isLoading}
          pagination={{ page: currentPage, limit: pageSize, total, onPageChange: setCurrentPage, onLimitChange: setPageSize }}
          actions={{
            view: (mission) => navigate(`/tech/missions/${mission._id}`),
            custom: [
              {
                label: 'Voir sur la carte',
                icon: <MapPin className="w-4 h-4" />,
                onClick: (mission) => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mission.address)}`, '_blank'),
                color: 'text-blue-600'
              }
            ]
          }}
          filters={
            <select onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2">
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminée</option>
            </select>
          }
          searchPlaceholder="Rechercher par N°, client..."
          onSearch={setSearchTerm}
          emptyMessage="Aucune mission trouvée"
        />
      </div>
    </Layout>
  );
};

const ProtectedTechnicianMissions = () => (
  <ProtectedRoute roles={['technician']}>
    <TechnicianMissions />
  </ProtectedRoute>
);

export default ProtectedTechnicianMissions;
