import React, { useState, useEffect } from 'react';
import FormModal from './FormModal';
import Button from './Button';
import { useCrudApi } from '../hooks/useApi';
import apiService from '../services/apiService';


interface AssignTechnicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string | null;
  onAssignmentSuccess: () => void;
}

interface Technician {
  _id: string;
  firstName: string;
  lastName: string;
}

const AssignTechnicianModal: React.FC<AssignTechnicianModalProps> = ({
  isOpen,
  onClose,
  requestId,
  onAssignmentSuccess,
}) => {
  const [selectedTechnician, setSelectedTechnician] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    items: technicians,
    isLoading: isLoadingTechnicians,
    fetchItems: fetchTechnicians,
  } = useCrudApi<Technician, any, any>(apiService.users);

  useEffect(() => {
    if (isOpen) {
      fetchTechnicians({});
      setSelectedTechnician('');
      setError(null);
    }
  }, [isOpen, fetchTechnicians]);

  const handleAssign = async () => {
    if (!requestId || !selectedTechnician) {
      setError('Veuillez sélectionner un technicien.');
      return;
    }

    setIsAssigning(true);
    setError(null);
    try {
      await apiService.requests.update(requestId, { assignedTechnician: selectedTechnician, status: 'assigned' });
      onAssignmentSuccess();
    } catch (err) {
      console.error('Failed to assign technician:', err);
      setError('Échec de l\'assignation du technicien. Veuillez réessayer.');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Assigner un Technicien"
      size="sm"
      footer={
        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={onClose} disabled={isAssigning}>
            Annuler
          </Button>
          <Button onClick={handleAssign} disabled={isAssigning || !selectedTechnician}>
            {isAssigning ? 'Assignation en cours...' : 'Assigner'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-gray-700">Sélectionnez un technicien à assigner à cette demande.</p>
        {isLoadingTechnicians ? (
          <p>Chargement des techniciens...</p>
        ) : (
          <select
            value={selectedTechnician}
            onChange={(e) => setSelectedTechnician(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value="">-- Sélectionner un technicien --</option>
            {technicians.map((tech) => (
              <option key={tech._id} value={tech._id}>
                {tech.firstName} {tech.lastName}
              </option>
            ))}
          </select>
        )}
        {error && <p className="text-error-600 text-sm">{error}</p>}
      </div>
    </FormModal>
  );
};

export default AssignTechnicianModal;