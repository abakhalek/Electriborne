import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import { User, Mail, Phone, Building, Calendar, UserCheck, UserX, MapPin } from 'lucide-react';
import apiService from '../../services/apiService';
import toast from 'react-hot-toast';

interface UserDetails {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'admin' | 'technician' | 'client';
  company?: string;
  isActive: boolean;
  lastLogin?: string;
  avatar?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

const ViewUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const userData = await apiService.users.getById(id);
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user details:', error);
        toast.error('Erreur lors du chargement des détails de l\'utilisateur.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <p>Chargement des détails de l'utilisateur...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <p>Utilisateur non trouvé.</p>
        </div>
      </Layout>
    );
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { color: 'bg-purple-100 text-purple-800', label: 'Administrateur' },
      technician: { color: 'bg-blue-100 text-blue-800', label: 'Technicien' },
      client: { color: 'bg-green-100 text-green-800', label: 'Client' },
    };
    
    const config = roleConfig[role as keyof typeof roleConfig];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <User className="w-8 h-8 mr-3 text-primary-600" />
          Détails de l'utilisateur: {user.firstName} {user.lastName}
        </h1>

        <Card className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-24 h-24 rounded-full object-cover border-4 border-primary-200"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.firstName} {user.lastName}</h2>
              <p className="text-gray-600">{user.email}</p>
              <div className="mt-2">
                {getRoleBadge(user.role)}
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.isActive ? 'bg-success-100 text-success-800' : 'bg-error-100 text-error-800'
                }`}>
                  {user.isActive ? (
                    <>
                      <UserCheck className="w-3 h-3 mr-1" />
                      Actif
                    </>
                  ) : (
                    <>
                      <UserX className="w-3 h-3 mr-1" />
                      Inactif
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">Informations de contact</h3>
              <p className="flex items-center text-gray-700">
                <Mail className="w-5 h-5 mr-2 text-gray-500" /> {user.email}
              </p>
              {user.phone && (
                <p className="flex items-center text-gray-700">
                  <Phone className="w-5 h-5 mr-2 text-gray-500" /> {user.phone}
                </p>
              )}
              {user.company && (
                <p className="flex items-center text-gray-700">
                  <Building className="w-5 h-5 mr-2 text-gray-500" /> {user.company}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">Détails supplémentaires</h3>
              {user.address && (
                <p className="flex items-center text-gray-700">
                  <MapPin className="w-5 h-5 mr-2 text-gray-500" /> {user.address}, {user.postalCode} {user.city}
                </p>
              )}
              {user.lastLogin && (
                <p className="flex items-center text-gray-700">
                  <Calendar className="w-5 h-5 mr-2 text-gray-500" /> Dernière connexion: {new Date(user.lastLogin).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default ViewUser;