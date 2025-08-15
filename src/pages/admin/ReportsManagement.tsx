import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  FileBarChart, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Download,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Edit,
  User,
  Wrench,
  MapPin,
  Camera,
  Calendar
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import apiService from '../../services/apiService';

import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Report {
  _id: string;
  interventionReference: string;
  mission: {
    _id: string;
    missionNumber: string;
    serviceType: { name: string; };
    address: string;
    clientId: { _id: string; firstName: string; lastName: string; companyName?: string; };
    technicianId: { _id: string; firstName: string; lastName: string; };
  };
  status: 'draft' | 'pending' | 'completed' | 'sent';
  type: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location: {
    address: string;
    city: string;
    postalCode: string;
  };
  equipment: string;
  workPerformed: string;
  notes: string;
  photos: string[];
  batutalCompliant: boolean;
  certificateNumber?: string;
  pdfUrl?: string;
  createdBy: string;
}

const ReportsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  const [reports, setReports] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const { execute: fetchReports, isLoading } = useApi(apiService.reports.getAll);

  useEffect(() => {
    const params: any = {
      page: 1, // Add your pagination logic here
      limit: 10, // Add your pagination logic here
      search: searchTerm,
      status: statusFilter === 'all' ? undefined : statusFilter,
    };
    const fetchReportsData = async () => {
      const response = await fetchReports(params);
      console.log('Frontend - API Response:', response);
      setReports(response.items || []);
      setTotal(response.total || 0);
    };
    fetchReportsData();
  }, [searchTerm, statusFilter, fetchReports]);

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

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'Installation borne de recharge': { color: 'bg-primary-100 text-primary-800', label: 'Installation Borne' },
      'Maintenance préventive': { color: 'bg-blue-100 text-blue-800', label: 'Maintenance Préventive' },
      'Réparation d\'urgence': { color: 'bg-orange-100 text-orange-800', label: 'Réparation Urgente' },
      'Diagnostic électrique': { color: 'bg-purple-100 text-purple-800', label: 'Diagnostic Électrique' },
      'Mise aux normes': { color: 'bg-teal-100 text-teal-800', label: 'Mise aux Normes' },
      'Remplacement équipement': { color: 'bg-indigo-100 text-indigo-800', label: 'Remplacement Équipement' },
      'Autre': { color: 'bg-gray-100 text-gray-800', label: 'Autre' },
    };
    
    const config = typeConfig[type as keyof typeof typeConfig];
    if (!config) return null;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
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

  const calculateDuration = (startTime?: string, endTime?: string) => {
    if (!startTime || !endTime) return 'N/A';

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startDate = new Date();
    startDate.setHours(startHour, startMinute, 0, 0);

    const endDate = new Date();
    endDate.setHours(endHour, endMinute, 0, 0);

    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1); // Handle overnight interventions
    }

    const diffMs = endDate.getTime() - startDate.getTime();
    const diffMinutes = Math.round(diffMs / (1000 * 60));

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    return `${hours}h ${minutes}min`;
  };

  const handleDownloadPdf = async (reportId: string) => {
    try {
      const blob = await apiService.reports.downloadPdf(reportId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${reportId}.pdf`); // Or use a more descriptive name from the backend
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success('PDF téléchargé avec succès.');
    } catch (error) {
      toast.error('Erreur lors du téléchargement du PDF.');
      console.error('Error downloading PDF:', error);
    }
  };


  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileBarChart className="w-8 h-8 mr-3 text-primary-600" />
              Gestion des Rapports
            </h1>
            <p className="text-gray-600 mt-2">
              Rapports d'intervention conformes BATUTA et certificats
            </p>
          </div>
          <Button size="lg" className="flex items-center" onClick={() => navigate('/admin/reports/add')}>
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
                  placeholder="Rechercher par client, technicien ou numéro..."
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
                  <option value="validated">Validé</option>
                  <option value="completed">Terminé</option>
                </select>
              </div>
              {/* Add type filter if backend supports it */}
            </div>
          </div>
        </Card>

        {/* Stats Cards - these would need to be fetched from a dedicated stats endpoint */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Example static cards, replace with dynamic data */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Rapports</p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
              </div>
              <FileBarChart className="w-8 h-8 text-primary-600" />
            </div>
          </Card>
          {/* Other stats cards would need similar logic */}
        </div>

        {/* Reports List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? (
            <p>Chargement des rapports...</p>
          ) : (
            reports.map((report) => (
              <Card key={report._id} hover className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{report.interventionReference}</h3>
                      <p className="text-sm text-gray-600">Intervention: {report.mission.missionNumber}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {getStatusBadge(report.status)}
                      {getTypeBadge(report.mission.serviceType.name)}
                    </div>
                  </div>

                  {/* Client & Technician */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="font-medium">{report.mission?.clientId?.companyName || `${report.mission?.clientId?.firstName || ''} ${report.mission?.clientId?.lastName || ''}`}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Wrench className="w-4 h-4 mr-2 text-gray-400" />
                      <span>Technicien: {report.mission?.technicianId?.firstName || ''} {report.mission?.technicianId?.lastName || ''}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{report.mission.address}</span>
                    </div>
                  </div>

                  {/* Equipment & Details */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">{report.mission.serviceType.name}</p>
                    <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{calculateDuration(report.startTime, report.endTime)}</span>
                      </div>
                      <div className="flex items-center">
                        <Camera className="w-3 h-3 mr-1" />
                        <span>{report.photos.length} photos</span>
                      </div>
                    </div>
                  </div>

                  {/* Compliance & Date */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{new Date(report.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    {getComplianceBadge(report.batutalCompliant)}
                  </div>

                  {/* Certificate */}
                  {report.certificateNumber && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Certificat:</span> {report.certificateNumber}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end space-x-2 pt-2 border-t border-gray-200">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/reports/view/${report._id}`)}>
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDownloadPdf(report._id)}>
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Camera className="w-4 h-4 mr-1" />
                      Photos
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/reports/edit/${report._id}`)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Modifier
                    </Button>
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

export default ReportsManagement;

