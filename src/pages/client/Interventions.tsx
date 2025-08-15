import React, { useState, useEffect } from 'react';
import { useCrudApi } from '../../hooks/useApi';
import apiService from '../../services/apiService';

interface Request {
  _id: string;
  reference: string;
  title: string;
  description: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assignedTechnician: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar?: string;
  } | null;
  scheduledDate: string;
  completedDate?: string;
  estimatedDuration?: string;
  actualDuration?: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  equipment?: string;
  photos?: number;
  reportAvailable?: boolean;
  certificateNumber?: string;
  rating?: number;
  cost?: number;
  estimatedBudget?: number;
  serviceTypeId: {
    _id: string;
    name: string;
    category: string;
  };
}
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  Wrench,
  Search,
  Filter,
  Eye,
  Download,
  Star,
  Calendar,
  Clock,
  
  MapPin,
  Phone,
  CheckCircle2,
  AlertTriangle,
  FileText,
  MessageSquare,

} from 'lucide-react';

const ClientInterventions: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRatingModal, setShowRatingModal] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const { items: interventions, fetchItems, isLoading, error } = useCrudApi<Request, any, any>(apiService.requests);

  useEffect(() => {
    fetchItems({ type: 'client' }); // Fetch requests for the client
  }, [fetchItems]);

  if (isLoading) {
    return <Layout><div className="text-center py-8">Chargement des demandes...</div></Layout>;
  }

  if (error) {
    return <Layout><div className="text-center py-8 text-red-500">Erreur: {error.message}</div></Layout>;
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Planifiée', icon: Calendar },
      'in-progress': { color: 'bg-yellow-100 text-yellow-800', label: 'En cours', icon: Clock },
      completed: { color: 'bg-green-100 text-green-800', label: 'Terminée', icon: CheckCircle2 },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Annulée', icon: AlertTriangle }
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
      urgent: { color: 'bg-red-100 text-red-800', label: 'Urgente' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const submitRating = (interventionId: string) => {
    // Logic to submit rating
    console.log('Submitting rating:', { interventionId, rating, comment });
    setShowRatingModal(null);
    setRating(0);
    setComment('');
  };

  const filteredInterventions = (interventions || []).filter(intervention => {
    const matchesSearch = (intervention.serviceTypeId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         intervention.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (intervention.assignedTechnician && `${intervention.assignedTechnician.firstName} ${intervention.assignedTechnician.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesStatus = statusFilter === 'all' || intervention.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Wrench className="w-8 h-8 mr-3 text-primary-600" />
            Mes Interventions
          </h1>
          <p className="text-gray-600 mt-2">Suivez l'avancement de vos interventions</p>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par type, référence ou technicien..."
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
                  <option value="scheduled">Planifiée</option>
                  <option value="in-progress">En cours</option>
                  <option value="completed">Terminée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Demandes</p>
                <p className="text-2xl font-bold text-gray-900">{(interventions || []).length}</p>
              </div>
              <Wrench className="w-8 h-8 text-primary-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Cours</p>
                <p className="text-2xl font-bold text-yellow-600">{(interventions || []).filter(req => req.status === 'in-progress' || req.status === 'assigned').length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Terminées</p>
                <p className="text-2xl font-bold text-green-600">{(interventions || []).filter(req => req.status === 'completed').length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                <p className="text-2xl font-bold text-orange-600">N/A</p>
              </div>
              <Star className="w-8 h-8 text-orange-600" />
            </div>
          </Card>
        </div>

        {/* Interventions List */}
        <div className="space-y-6">
          {filteredInterventions.map((intervention) => (
            <Card key={intervention._id} className="p-6">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{intervention.serviceTypeId?.name}</h3>
                    <p className="text-gray-600">{intervention.reference}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(intervention.status)}
                    {getPriorityBadge(intervention.priority)}
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700">{intervention.description}</p>

                {/* Technician Info */}
                {intervention.assignedTechnician && (
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={intervention.assignedTechnician.avatar || 'https://via.placeholder.com/150'}
                      alt={intervention.assignedTechnician.firstName + ' ' + intervention.assignedTechnician.lastName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{intervention.assignedTechnician.firstName} {intervention.assignedTechnician.lastName}</p>
                      <p className="text-sm text-gray-600">Technicien assigné</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Phone className="w-4 h-4 mr-1" />
                      {intervention.assignedTechnician.phone}
                    </Button>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Date planifiée</p>
                    <p className="font-medium">{new Date(intervention.scheduledDate).toLocaleDateString('fr-FR')}</p>
                    <p className="text-sm text-gray-600">{new Date(intervention.scheduledDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Durée estimée</p>
                    <p className="font-medium">{intervention.estimatedDuration || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="font-medium">{intervention.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Budget estimé</p>
                    <p className="font-medium">{intervention.estimatedBudget !== undefined ? `${intervention.estimatedBudget.toFixed(2)}€` : 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                  <span>{intervention.address.street}, {intervention.address.postalCode} {intervention.address.city}</span>
                </div>

                {/* Completion Info */}
                {intervention.completedDate && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">Intervention terminée</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Terminée le {new Date(intervention.completedDate).toLocaleDateString('fr-FR')} à {new Date(intervention.completedDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {(intervention.photos !== undefined && intervention.photos > 0) && (
                      <p className="text-sm text-green-700 mt-1">
                        {intervention.photos} photos disponibles dans le rapport
                      </p>
                    )}
                  </div>
                )}

                {/* Certificate */}
                {intervention.certificateNumber && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800">Certificat de conformité</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      Numéro: {intervention.certificateNumber}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Voir détail
                    </Button>
                    {intervention.reportAvailable && (
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Rapport
                      </Button>
                    )}
                    {/* Assuming photos are part of the report or a separate field, adjust as needed */}
                    {/* {intervention.photos > 0 && (
                      <Button variant="ghost" size="sm">
                        <Camera className="w-4 h-4 mr-1" />
                        Photos ({intervention.photos})
                      </Button>
                    )} */}
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Contacter
                    </Button>
                  </div>

                  <div className="flex space-x-2">
                    {intervention.status === 'completed' && !intervention.rating && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setShowRatingModal(intervention._id)}
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Évaluer
                      </Button>
                    )}
                    
                    {intervention.rating && (
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < intervention.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-1">({intervention.rating}/5)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Rating Modal */}
        {showRatingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Évaluer l'intervention</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note globale
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commentaire (optionnel)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder="Partagez votre expérience..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setShowRatingModal(null)}
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => submitRating(showRatingModal)}
                  disabled={rating === 0}
                >
                  Envoyer l'évaluation
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ClientInterventions;