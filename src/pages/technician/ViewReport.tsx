import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ProtectedRoute from '../../components/ProtectedRoute';
import {
  FileText,
  Download,
  Send,
  User,
  MapPin,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import apiService from '../../services/apiService';
import toast from 'react-hot-toast';

interface Report {
  _id: string;
  reportNumber: string;
  mission: {
    _id: string;
    missionNumber: string;
    client: { _id: string; firstName: string; lastName: string; companyName?: string; };
    technician: { _id: string; firstName: string; lastName: string; };
    serviceType: { name: string; };
    address: string;
  };
  status: 'draft' | 'pending' | 'completed' | 'sent';
  reportDate: string;
  duration: number; // in minutes
  photos: string[];
  isBatutalCompliant: boolean;
  certificateNumber?: string;
  anomalies: number;
  workPerformed: string;
  notes: string;
}

const ViewReport: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const { execute: fetchReport, isLoading } = useApi(apiService.reports.getById);

  useEffect(() => {
    if (id) {
      fetchReport(id)
        .then(setReport)
        .catch(() => toast.error('Erreur lors de la récupération du rapport.'));
    }
  }, [id, fetchReport]);

  const handleGeneratePdf = async () => {
    if (!id) return;
    try {
      const response = await apiService.reports.generatePDF(id);
      window.open(response.pdfUrl, '_blank');
      toast.success('PDF généré avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la génération du PDF.');
    }
  };

  const handleSendToClient = async () => {
    if (!id) return;
    try {
      await apiService.reports.sendToClient(id);
      toast.success('Rapport envoyé au client avec succès !');
      if (report) {
        setReport({ ...report, status: 'sent' });
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du rapport au client.');
    }
  };

  if (isLoading) {
    return <Layout><p>Chargement du rapport...</p></Layout>;
  }

  if (!report) {
    return <Layout><p>Rapport non trouvé.</p></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="w-8 h-8 mr-3 text-primary-600" />
              Rapport d'intervention
            </h1>
            <p className="text-gray-600 mt-2">Détails du rapport {report.reportNumber}</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="secondary" onClick={handleGeneratePdf}>
              <Download className="w-4 h-4 mr-2" />
              Télécharger le PDF
            </Button>
            {report.status !== 'sent' && (
              <Button variant="primary" onClick={handleSendToClient}>
                <Send className="w-4 h-4 mr-2" />
                Envoyer au client
              </Button>
            )}
          </div>
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <h3 className="text-xl font-semibold">Détails de l'intervention</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">N° de mission</p>
                  <p>{report.mission.missionNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p>{new Date(report.reportDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Durée</p>
                  <p>{Math.floor(report.duration / 60)}h {report.duration % 60}min</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type de service</p>
                  <p>{report.mission.serviceType.name}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Travaux effectués</p>
                <p>{report.workPerformed}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Notes</p>
                <p>{report.notes || 'Aucune note'}</p>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Informations générales</h3>
              <div>
                <p className="text-sm text-gray-500 flex items-center"><User className="w-4 h-4 mr-2" /> Client</p>
                <p>{report.mission.client.companyName || `${report.mission.client.firstName} ${report.mission.client.lastName}`}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center"><User className="w-4 h-4 mr-2" /> Technicien</p>
                <p>{report.mission.technician.firstName} {report.mission.technician.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center"><MapPin className="w-4 h-4 mr-2" /> Adresse</p>
                <p>{report.mission.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <p>{report.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Conformité BATUTA</p>
                <p className={`flex items-center ${report.isBatutalCompliant ? 'text-green-600' : 'text-red-600'}`}>
                  {report.isBatutalCompliant ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <AlertTriangle className="w-4 h-4 mr-2" />}
                  {report.isBatutalCompliant ? 'Conforme' : 'Non conforme'}
                </p>
              </div>
              {report.certificateNumber && (
                <div>
                  <p className="text-sm text-gray-500">N° de certificat</p>
                  <p>{report.certificateNumber}</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <div>
          <h3 className="text-xl font-semibold mb-4">Photos</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {report.photos.map((photo, index) => (
              <img key={index} src={photo} alt={`Photo ${index + 1}`} className="w-full h-auto rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

const ProtectedViewReport = () => (
  <ProtectedRoute roles={['technician', 'admin']}>
    <ViewReport />
  </ProtectedRoute>
);

export default ProtectedViewReport;

