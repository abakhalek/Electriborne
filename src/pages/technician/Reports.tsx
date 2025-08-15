import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ProtectedRoute from '../../components/ProtectedRoute';
import { 
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Download,
  Send,
  Camera,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  MapPin,
  Edit
} from 'lucide-react';
import { useCrudApi } from '../../hooks/useApi';
import apiService from '../../services/apiService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Report {
  _id: string;
  mission: {
    _id: string;
    missionNumber: string;
    client: { _id: string; firstName: string; lastName: string; companyName?: string; };
    serviceType: { name: string; };
    address: string;
    anomalies: number;
    isBatutalCompliant: boolean;
    technicianId: { _id: string; firstName: string; lastName: string; };
  };
  status: 'draft' | 'pending' | 'completed' | 'sent';
  date: string;
  startTime: string;
  endTime: string;
  photos: string[];
  certificateNumber?: string;
}

const Reports: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const apiConfig = useMemo(() => ({
    getAll: async () => {
      try {
        const response = await apiService.reports.getMy();
        console.log('API Response for reports:', response);
        return { 
          items: Array.isArray(response.items) ? response.items : [], 
          total: typeof response.total === 'number' ? response.total : 0 
        };
      } catch (error) {
        console.error('Error fetching reports in useCrudApi getAll:', error);
        throw error; // Re-throw to be caught by local fetchReports
      }
    },
    getById: apiService.reports.getById,
    create: apiService.reports.create,
    update: apiService.reports.update,
    delete: apiService.reports.delete,
  }), []);

  const { 
    items: reports,
    fetchItems: fetchReportsFromHook,
  } = useCrudApi<Report, any, any>(
    apiConfig,
    {
      successMessages: {},
    }
  );

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetchReportsFromHook();
    } catch (error) {
      toast.error('Erreur lors du chargement des rapports.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchReportsFromHook]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Brouillon', icon: FileText },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'En attente', icon: Clock },
      completed: { color: 'bg-green-100 text-green-800', label: 'Terminé', icon: CheckCircle2 },
      sent: { color: 'bg-blue-100 text-blue-800', label: 'Envoyé', icon: Send }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getComplianceBadge = (isCompliant: boolean) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isCompliant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isCompliant ? (
          <>
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Conforme BATUTA
          </>
        ) : (
          <>
            <AlertTriangle className="w-3 h-3 mr-1" />
            Non conforme
          </>
        )}
      </span>
    );
  };

  const handleGeneratePdf = async (reportId: string) => {
    try {
      const response = await apiService.reports.generatePDF(reportId);
      window.open(response.pdfUrl, '_blank');
      toast.success('PDF généré avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la génération du PDF.');
    }
  };

  const handleSendReport = async (reportId: string) => {
    try {
      await apiService.reports.sendToClient(reportId);
      toast.success('Rapport envoyé avec succès !');
      fetchReports({}); // Refresh list
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du rapport.');
    }
  };

  const calculateDuration = (startTime: string, endTime: string): number => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startDate = new Date();
    startDate.setHours(startHour, startMinute, 0, 0);

    const endDate = new Date();
    endDate.setHours(endHour, endMinute, 0, 0);

    // Handle overnight cases
    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }

    const diffMs = endDate.getTime() - startDate.getTime();
    return Math.round(diffMs / (1000 * 60)); // duration in minutes
  };

  console.log('Reports component - isLoading:', isLoading);
  console.log('Reports component - reports:', reports);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="w-8 h-8 mr-3 text-primary-600" />
              Mes Rapports
            </h1>
            <p className="text-gray-600 mt-2">Gérez vos rapports d'intervention et certificats</p>
          </div>
          <Button size="lg" className="flex items-center" onClick={() => navigate('/tech/reports/add')}>
            <Plus className="w-5 h-5 mr-2" />
            Nouveau Rapport
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par client, numéro ou type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="draft">Brouillon</option>
                  <option value="pending">En attente</option>
                  <option value="completed">Terminé</option>
                  <option value="sent">Envoyé</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Reports List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? (
            <p>Chargement des rapports...</p>
          ) : (
            (reports || []).map((report) => (
              <Card key={report._id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{report.mission.missionNumber}</h3>
                      <p className="text-sm text-gray-600">Technicien: {report.mission?.technicianId ? `${report.mission.technicianId.firstName} ${report.mission.technicianId.lastName}` : 'N/A'}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {getStatusBadge(report.status)}
                    </div>
                  </div>

                  {/* Client & Type */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="font-medium">{report.mission?.client?.companyName || `${report.mission?.client?.firstName} ${report.mission?.client?.lastName}`}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FileText className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{report.mission?.serviceType?.name}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{report.mission?.address}</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <p className="font-medium">{new Date(report.date).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Durée:</span>
                        <p className="font-medium">{report.startTime && report.endTime ? `${Math.floor(calculateDuration(report.startTime, report.endTime) / 60)}h ${calculateDuration(report.startTime, report.endTime) % 60}min` : 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Photos:</span>
                        <p className="font-medium flex items-center">
                          <Camera className="w-3 h-3 mr-1" />
                          {report.photos.length}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Anomalies:</span>
                        <p className={`font-medium ${report.mission.anomalies > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                          {report.mission.anomalies}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Compliance & Certificate */}
                  <div className="space-y-2">
                    {getComplianceBadge(report.mission.isBatutalCompliant)}
                    {report.certificateNumber && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Certificat:</span> {report.certificateNumber}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/technician/reports/view/${report._id}`)}>
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleGeneratePdf(report._id)}>
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      {report.status === 'completed' && (
                        <Button variant="primary" size="sm" onClick={() => handleSendReport(report._id)}>
                          <Send className="w-4 h-4 mr-1" />
                          Envoyer
                        </Button>
                      )}
                      {report.status === 'draft' && (
                        <Button variant="secondary" size="sm" onClick={() => navigate(`/technician/technical-report/${report._id}`)}>
                          <Edit className="w-4 h-4 mr-1" />
                          Modifier
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

const ProtectedReports = () => (
  <ProtectedRoute roles={['technician']}>
    <Reports />
  </ProtectedRoute>
);

export default ProtectedReports;

