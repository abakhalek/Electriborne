import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  ClipboardList, 
  Plus, 
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  User,
  Calendar,
  MapPin,
  Wrench
} from 'lucide-react';
import { useCrudApi } from '../../hooks/useApi';
import apiService from '../../services/apiService';
import DataTable from '../../components/DataTable';
import AssignTechnicianModal from '../../components/AssignTechnicianModal';

interface Request {
  _id: string;
  title: string;
  description: string;
  type: 'installation' | 'intervention';
  serviceTypeId: { _id: string; name: string; category: string };
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled' | 'quoted';
  address: { street: string; city: string; postalCode: string; full?: string };
  estimatedBudget?: number;
  preferredDate?: string;
  notes?: string;
  attachments?: string[];
  clientId: { _id: string; firstName: string; lastName: string; company?: string; email: string };
  assignedTechnician?: { _id: string; firstName: string; lastName: string };
  createdAt: string;
}

const RequestManagement: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    items: requests,
    total,
    isLoading,
    fetchItems: fetchRequests,
  } = useCrudApi<Request, any, any>(
    apiService.requests,
    {}
  );

  useEffect(() => {
    loadRequests();
  }, [currentPage, pageSize, statusFilter, priorityFilter]);

  const loadRequests = async () => {
    const params: any = {
      page: currentPage,
      limit: pageSize,
    };

    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }

    if (priorityFilter !== 'all') {
      params.priority = priorityFilter;
    }

    await fetchRequests(params);
  };

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

  const handleAddRequest = () => {
    navigate('/admin/requests/add');
  };

  const handleEditRequest = (requestId: string) => {
    navigate(`/admin/requests/edit/${requestId}`);
  };

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const handleViewRequest = (requestId: string) => {
    navigate(`/admin/requests/view/${requestId}`);
  };

  const handleAssignRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    setIsAssignModalOpen(true);
  };

  const handleAssignmentSuccess = () => {
    setIsAssignModalOpen(false);
    setSelectedRequestId(null);
    loadRequests(); // Refresh the list
  };

  console.log('Requests data:', requests); // Debugging log

  return (
    <>
      <AssignTechnicianModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        requestId={selectedRequestId}
        onAssignmentSuccess={handleAssignmentSuccess}
      />
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ClipboardList className="w-8 h-8 mr-3 text-primary-600" />
              Gestion des Demandes
            </h1>
            <p className="text-gray-600 mt-2">
              Gérez les demandes d'intervention et de devis clients
            </p>
          </div>
          <Button size="lg" onClick={handleAddRequest} className="flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle Demande
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Demandes</p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
              </div>
              <ClipboardList className="w-8 h-8 text-primary-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Attente</p>
                <p className="text-2xl font-bold text-warning-600">{(requests || []).filter(r => r.status === 'pending').length}</p>
              </div>
              <Clock className="w-8 h-8 text-warning-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Cours</p>
                <p className="text-2xl font-bold text-primary-600">{(requests || []).filter(r => r.status === 'in-progress').length}</p>
              </div>
              <Wrench className="w-8 h-8 text-primary-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Urgentes</p>
                <p className="text-2xl font-bold text-error-600">{(requests || []).filter(r => r.priority === 'urgent').length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-error-600" />
            </div>
          </Card>
        </div>

        {/* Requests List */}
        <DataTable
          data={requests}
          columns={[
            {
              header: 'Référence',
              accessor: '_id',
              cell: (request: Request) => (
                <span className="font-semibold text-gray-900">{request._id}</span>
              ),
            },
            {
              header: 'Client',
              accessor: (request: Request) => request.clientId?.firstName,
              cell: (request: Request) => (
                <div className="flex items-center text-sm">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="font-medium">
                    {request.clientId ? 
                      (request.clientId.email)
                      : 'Client inconnu'
                    }
                  </span>
                </div>
              ),
            },
            {
              header: 'Type de Service',
              accessor: (request: Request) => request.serviceTypeId.name,
              cell: (request: Request) => (
                <div className="flex items-center text-sm text-gray-600">
                  <Wrench className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{request.serviceTypeId.name}</span>
                </div>
              ),
            },
            {
              header: 'Statut',
              accessor: 'status',
              cell: (request: Request) => getStatusBadge(request.status),
            },
            {
              header: 'Priorité',
              accessor: 'priority',
              cell: (request: Request) => getPriorityBadge(request.priority),
            },
            {
              header: 'Adresse',
              accessor: (request: Request) => request.address.street,
              cell: (request: Request) => (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{request.address.full}</span>
                </div>
              ),
            },
            {
              header: 'Date de création',
              accessor: 'createdAt',
              cell: (request: Request) => (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{new Date(request.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              ),
            },
          ]}
          keyField="_id"
          title="Liste des Demandes"
          isLoading={isLoading}
          pagination={{
            page: currentPage,
            limit: pageSize,
            total,
            onPageChange: setCurrentPage,
            onLimitChange: setPageSize,
          }}
          actions={{
            view: (request) => handleViewRequest(request._id),
            edit: (request) => handleEditRequest(request._id),
            custom: [
              {
                label: 'Assigner',
                icon: <User className="w-4 h-4" />,
                onClick: (request) => handleAssignRequest(request._id),
                color: 'text-blue-600',
              },
            ],
          }}
          onRowClick={(request) => handleViewRequest(request._id)}
          filters={
            <div className="flex space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="assigned">Assignée</option>
                <option value="in-progress">En cours</option>
                <option value="completed">Terminée</option>
                <option value="cancelled">Annulée</option>
                <option value="quoted">Devis envoyé</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">Toutes priorités</option>
                <option value="urgent">Urgente</option>
                <option value="high">Élevée</option>
                <option value="normal">Normale</option>
                <option value="low">Faible</option>
              </select>
            </div>
          }
          searchPlaceholder="Rechercher par référence, titre ou description..."
          emptyMessage="Aucune demande trouvée"
        />
      </div>
    </Layout>
  </>
  );
};

export default RequestManagement;