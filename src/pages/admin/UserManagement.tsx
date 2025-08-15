import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import DataTable, { Column } from '../../components/DataTable';
import FormModal from '../../components/FormModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { 
  Users, 
  Plus, 
  UserCheck,
  UserX,
  Mail,
  Phone,
  Building,
  Shield,
  Wrench as WrenchIcon
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useCrudApi } from '../../hooks/useApi';
import apiService from '../../services/apiService';

interface User {
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
}

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'admin' | 'technician' | 'client';
  company?: string;
  password?: string;
  confirmPassword?: string;
  departement?: string;
  availability?: {
    status: 'available' | 'unavailable';
    nextDayOff?: string;
  };
}

const userApiConfig = {
  getAll: async (params: any) => {
    const response = await apiService.users.getAll(params);
    console.log('Response from apiService.users.getAll in UserManagement:', response);
    return { 
          items: response.items, 
          total: response.total 
        };
      },
  getById: apiService.users.getById,
  create: apiService.users.create,
  update: apiService.users.update,
  delete: apiService.users.delete
};

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const frenchDepartments = [
    { code: '01', name: 'Ain' },
    { code: '02', name: 'Aisne' },
    { code: '03', name: 'Allier' },
    { code: '04', name: 'Alpes-de-Haute-Provence' },
    { code: '05', name: 'Hautes-Alpes' },
    { code: '06', name: 'Alpes-Maritimes' },
    { code: '07', name: 'Ardèche' },
    { code: '08', name: 'Ardennes' },
    { code: '09', name: 'Ariège' },
    { code: '10', name: 'Aube' },
    { code: '11', name: 'Aude' },
    { code: '12', name: 'Aveyron' },
    { code: '13', name: 'Bouches-du-Rhône' },
    { code: '14', name: 'Calvados' },
    { code: '15', name: 'Cantal' },
    { code: '16', name: 'Charente' },
    { code: '17', name: 'Charente-Maritime' },
    { code: '18', name: 'Cher' },
    { code: '19', name: 'Corrèze' },
    { code: '2A', name: 'Corse-du-Sud' },
    { code: '2B', name: 'Haute-Corse' },
    { code: '21', name: 'Côte-d\'Or' },
    { code: '22', name: 'Côtes-d\'Armor' },
    { code: '23', name: 'Creuse' },
    { code: '24', name: 'Dordogne' },
    { code: '25', name: 'Doubs' },
    { code: '26', name: 'Drôme' },
    { code: '27', name: 'Eure' },
    { code: '28', name: 'Eure-et-Loir' },
    { code: '29', name: 'Finistère' },
    { code: '30', name: 'Gard' },
    { code: '31', name: 'Haute-Garonne' },
    { code: '32', name: 'Gers' },
    { code: '33', name: 'Gironde' },
    { code: '34', name: 'Hérault' },
    { code: '35', name: 'Ille-et-Vilaine' },
    { code: '36', name: 'Indre' },
    { code: '37', name: 'Indre-et-Loire' },
    { code: '38', name: 'Isère' },
    { code: '39', name: 'Jura' },
    { code: '40', name: 'Landes' },
    { code: '41', name: 'Loir-et-Cher' },
    { code: '42', name: 'Loire' },
    { code: '43', name: 'Haute-Loire' },
    { code: '44', name: 'Loire-Atlantique' },
    { code: '45', name: 'Loiret' },
    { code: '46', name: 'Lot' },
    { code: '47', name: 'Lot-et-Garonne' },
    { code: '48', name: 'Lozère' },
    { code: '49', name: 'Maine-et-Loire' },
    { code: '50', name: 'Manche' },
    { code: '51', name: 'Marne' },
    { code: '52', name: 'Haute-Marne' },
    { code: '53', name: 'Mayenne' },
    { code: '54', name: 'Meurthe-et-Moselle' },
    { code: '55', name: 'Meuse' },
    { code: '56', name: 'Morbihan' },
    { code: '57', name: 'Moselle' },
    { code: '58', name: 'Nièvre' },
    { code: '59', name: 'Nord' },
    { code: '60', name: 'Oise' },
    { code: '61', name: 'Orne' },
    { code: '62', name: 'Pas-de-Calais' },
    { code: '63', name: 'Puy-de-Dôme' },
    { code: '64', name: 'Pyrénées-Atlantiques' },
    { code: '65', name: 'Hautes-Pyrénées' },
    { code: '66', name: 'Pyrénées-Orientales' },
    { code: '67', name: 'Bas-Rhin' },
    { code: '68', name: 'Haut-Rhin' },
    { code: '69', name: 'Rhône' },
    { code: '70', name: 'Haute-Saône' },
    { code: '71', name: 'Saône-et-Loire' },
    { code: '72', name: 'Sarthe' },
    { code: '73', name: 'Savoie' },
    { code: '74', name: 'Haute-Savoie' },
    { code: '75', name: 'Paris' },
    { code: '76', name: 'Seine-Maritime' },
    { code: '77', name: 'Seine-et-Marne' },
    { code: '78', name: 'Yvelines' },
    { code: '79', name: 'Deux-Sèvres' },
    { code: '80', name: 'Somme' },
    { code: '81', name: 'Tarn' },
    { code: '82', name: 'Tarn-et-Garonne' },
    { code: '83', name: 'Var' },
    { code: '84', name: 'Vaucluse' },
    { code: '85', name: 'Vendée' },
    { code: '86', name: 'Vienne' },
    { code: '87', name: 'Haute-Vienne' },
    { code: '88', name: 'Vosges' },
    { code: '89', name: 'Yonne' },
    { code: '90', name: 'Territoire de Belfort' },
    { code: '91', name: 'Essonne' },
    { code: '92', name: 'Hauts-de-Seine' },
    { code: '93', name: 'Seine-Saint-Denis' },
    { code: '94', name: 'Val-de-Marne' },
    { code: '95', name: 'Val-d\'Oise' },
    { code: '971', name: 'Guadeloupe' },
    { code: '972', name: 'Martinique' },
    { code: '973', name: 'Guyane' },
    { code: '974', name: 'La Réunion' },
    { code: '976', name: 'Mayotte' },
  ];

  const crudApiOptions = React.useMemo(() => ({
    successMessages: {
      create: 'Utilisateur créé avec succès',
      update: 'Utilisateur mis à jour avec succès',
      delete: 'Utilisateur supprimé avec succès'
    }
  }), []);

  const { 
    items: users, 
    total,
    isLoading,
    fetchItems: fetchUsers,
    fetchItemById,
    createItem: createUser,
    updateItem: updateUser,
    deleteItem: deleteUser,
    
    
  } = useCrudApi<User, UserFormData, Partial<UserFormData>>(
    userApiConfig,
    crudApiOptions
  );

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserFormData>();

  useEffect(() => {
    loadUsers();
  }, [currentPage, pageSize, roleFilter, searchTerm]);

  const loadUsers = async () => {
    const params: any = {
      page: currentPage,
      limit: pageSize
    };

    if (roleFilter !== 'all') {
      params.role = roleFilter;
    }

    if (searchTerm) {
      params.search = searchTerm;
    }

    await fetchUsers(params);
  };

  const handleCreateUser = async (data: UserFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      await createUser(data);
      setIsCreateModalOpen(false);
      reset();
      loadUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      if (error.response) {
        console.log('Full error response:', error.response);
      }
    }
  };

  const handleEditUser = async (data: UserFormData) => {
    if (!selectedUserId) return;

    // Si les champs de mot de passe sont remplis, vérifier qu'ils correspondent
    if (data.password && data.password !== data.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    // Supprimer les champs de mot de passe si vides
    if (!data.password) {
      delete data.password;
      delete data.confirmPassword;
    }

    try {
      await updateUser(selectedUserId, data);
      setIsEditModalOpen(false);
      reset();
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUserId) return;

    try {
      await deleteUser(selectedUserId);
      setIsDeleteDialogOpen(false);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      await apiService.users.toggleStatus(userId);
      loadUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const openEditModal = async (userId: string) => {
    try {
      const user = await fetchItemById(userId);
      setSelectedUserId(userId);
      
      // Préremplir le formulaire avec les données de l'utilisateur
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        company: user.company
      });
      
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const openDeleteDialog = (userId: string) => {
    setSelectedUserId(userId);
    setIsDeleteDialogOpen(true);
  };

  const columns: Column<User>[] = [
    {
      header: 'Utilisateur',
      accessor: (user: User) => (
        <div className="flex items-center">
          <img
            src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`}
            alt={`${user.firstName} ${user.lastName}`}
            className="w-10 h-10 rounded-full object-cover mr-4"
          />
          <div>
            <div className="font-medium text-white-900">{user.firstName} {user.lastName}</div>
            <div className="text-sm text-white-500">{user.company || ''}</div>
          </div>
        </div>
      ),
      sortable: false
    },
    {
      header: 'Contact',
      accessor: (user: User) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm">
            <Mail className="w-4 h-4 mr-2 text-white-400" />
            {user.email}
          </div>
          {user.phone && (
            <div className="flex items-center text-sm text-white-500">
              <Phone className="w-4 h-4 mr-2 text-white-400" />
              {user.phone}
            </div>
          )}
        </div>
      ),
      sortable: false
    },
    {
      header: 'Rôle',
      accessor: 'role',
      cell: (user: User) => {
        const roleConfig = {
          admin: { color: 'bg-purple-100 text-purple-800', label: 'Administrateur' },
          technician: { color: 'bg-blue-100 text-blue-800', label: 'Technicien' },
          client: { color: 'bg-green-100 text-green-800', label: 'Client' },
        };
        
        const config = roleConfig[user.role];
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
        );
      },
      sortable: true
    },
    {
      header: 'Statut',
      accessor: 'isActive',
      cell: (user: User) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
      ),
      sortable: true
    },
    {
      header: 'Dernière connexion',
      accessor: 'lastLogin',
      cell: (user: User) => (
        <span className="text-sm text-white-500">
          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : 'Jamais'}
        </span>
      ),
      sortable: true
    }
  ];

  // Statistiques des utilisateurs
  const stats = {
    totalUsers: total,
    activeUsers: (users || []).filter(u => u.isActive).length,
    adminCount: (users || []).filter(u => u.role === 'admin').length,
    techCount: (users || []).filter(u => u.role === 'technician').length,
    clientCount: (users || []).filter(u => u.role === 'client').length
  };

  console.log('Users data passed to DataTable:', users);
  console.log('Total users passed to DataTable:', total);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white-900 flex items-center">
              <Users className="w-8 h-8 mr-3 text-primary-600" />
              Gestion des Utilisateurs
            </h1>
            <p className="text-white-600 mt-2">
              Gérez les comptes utilisateurs, techniciens et clients
            </p>
          </div>
          <Button 
            size="lg" 
            onClick={() => navigate('/admin/users/add')}
            className="flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvel Utilisateur
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white-600">Total Utilisateurs</p>
                <p className="text-2xl font-bold text-white-900">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-primary-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white-600">Actifs</p>
                <p className="text-2xl font-bold text-success-600">{stats.activeUsers}</p>
              </div>
              <UserCheck className="w-8 h-8 text-success-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white-600">Administrateurs</p>
                <p className="text-2xl font-bold text-purple-600">{stats.adminCount}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white-600">Techniciens</p>
                <p className="text-2xl font-bold text-blue-600">{stats.techCount}</p>
              </div>
              <WrenchIcon className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white-600">Clients</p>
                <p className="text-2xl font-bold text-green-600">{stats.clientCount}</p>
              </div>
              <Building className="w-8 h-8 text-green-600" />
            </div>
          </Card>
        </div>

        {/* Users Table */}
        <DataTable
          data={users}
          columns={columns}
          keyField="_id"
          title="Liste des utilisateurs"
          isLoading={isLoading}
          pagination={{
            page: currentPage,
            limit: pageSize,
            total,
            onPageChange: setCurrentPage,
            onLimitChange: setPageSize
          }}
          actions={{
            view: (user) => {
              console.log('Navigating to user view for:', user);
              navigate(`/admin/users/view/${user._id}`);
            },
            edit: (user) => openEditModal(user._id),
            delete: (user) => openDeleteDialog(user._id),
            custom: [
              {
                label: 'Statut',
                icon: <UserCheck className="w-4 h-4" />,
                onClick: (user) => handleToggleStatus(user._id),
                color: 'text-blue-600'
              }
            ]
          }}
          filters={
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-white-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Administrateurs</option>
              <option value="tech">Techniciens</option>
              <option value="client">Clients</option>
            </select>
          }
          searchPlaceholder="Rechercher par nom, email ou entreprise..."
          onSearch={setSearchTerm}
          emptyMessage="Aucun utilisateur trouvé"
        />

        

        {/* Edit User Modal */}
        <FormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Modifier l'Utilisateur"
          footer={
            <div className="flex justify-end space-x-4">
              <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" form="editUserForm">
                Enregistrer les modifications
              </Button>
            </div>
          }
        >
          <form id="editUserForm" onSubmit={handleSubmit(handleEditUser)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white-700 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  {...register('firstName', { required: 'Le prénom est requis' })}
                  className="w-full border border-balck-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  {...register('lastName', { required: 'Le nom est requis' })}
                  className="w-full border border-balck-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  {...register('email', { 
                    required: 'L\'email est requis',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Email invalide'
                    }
                  })}
                  className="w-full border border-white-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  className="w-full border border-white-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white-700 mb-2">
                  Rôle *
                </label>
                <select
                  {...register('role', { required: 'Le rôle est requis' })}
                  className="w-full border border-white-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="client">Client</option>
                  <option value="technician">Technicien</option>
                  <option value="admin">Administrateur</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white-700 mb-2">
                  Entreprise
                </label>
                <input
                  type="text"
                  {...register('company')}
                  className="w-full border border-white-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white-700 mb-2">
                  Nouveau mot de passe (laisser vide pour ne pas changer)
                </label>
                <input
                  type="password"
                  {...register('password')}
                  className="w-full border border-white-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white-700 mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  {...register('confirmPassword')}
                  className="w-full border border-white-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          </form>
        </FormModal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteUser}
          title="Supprimer l'utilisateur"
          message="Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible."
          confirmText="Supprimer"
          cancelText="Annuler"
          type="danger"
        />
      </div>
    </Layout>
  );
};

export default UserManagement;