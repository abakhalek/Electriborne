import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import apiService from '../services/apiService';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationCreated: () => void;
}

interface FormData {
  recipientId: string;
  content: string;
}

const NewConversationModal: React.FC<NewConversationModalProps> = ({ isOpen, onClose, onConversationCreated }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        try {
          const response = await apiService.users.getContacts();
          setUsers(response);
        } catch (error) {
          console.error('Error fetching users:', error);
          toast.error('Erreur lors du chargement des utilisateurs.');
        }
      };
      fetchUsers();
    }
  }, [isOpen]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await apiService.messages.createConversation({
        recipients: [data.recipientId],
        content: data.content,
      });
      toast.success('Conversation créée avec succès !');
      onConversationCreated();
      reset();
      onClose();
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Erreur lors de la création de la conversation.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Nouvelle Conversation</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="recipientId" className="block text-sm font-medium text-gray-700 mb-1">Destinataire</label>
            <select
              id="recipientId"
              {...register('recipientId', { required: 'Veuillez sélectionner un destinataire' })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Sélectionner un utilisateur</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
            {errors.recipientId && <p className="text-red-500 text-sm mt-1">{errors.recipientId.message}</p>}
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              id="content"
              rows={5}
              {...register('content', { required: 'Veuillez écrire un message' })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Envoi en cours...' : 'Envoyer'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NewConversationModal;
