import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  User as UserIcon,
  Settings, 
  Bell, 
  Mail, 
  Smartphone, 
  Globe, 
  Clock, 
  Shield,
  Camera,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  FileText,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import apiService from '../../services/apiService';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  avatar?: string;
}

interface Notification {
  _id: string;
  recipient: string;
  sender?: { _id: string; firstName: string; lastName: string; email: string; };
  message: string;
  type: 'mission_assigned' | 'status_update' | 'new_message' | 'system' | 'quote_response';
  isRead: boolean;
  relatedEntity?: {
    id: string;
    type: 'Mission' | 'Quote' | 'Request' | 'Report';
  };
  createdAt: string;
}

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  preferences: {
    language: string;
    timezone: string;
    dateFormat: string;
    currency: string;
  };
}

interface NotificationSettings {
  channels: {
    email: boolean;
    push: boolean;
    sms: boolean;
    system: boolean;
  };
  types: {
    maintenancePlanned: boolean;
    interventionValidated: boolean;
    quoteReceived: boolean;
    quoteAccepted: boolean;
    paymentPending: boolean;
    paymentReceived: boolean;
    systemUpdates: boolean;
    securityAlerts: boolean;
  };
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    channels: {
      email: true,
      push: true,
      sms: false,
      system: true
    },
    types: {
      maintenancePlanned: true,
      interventionValidated: true,
      quoteReceived: true,
      quoteAccepted: true,
      paymentPending: true,
      paymentReceived: false,
      systemUpdates: false,
      securityAlerts: true
    }
  });
  const [userNotifications, setUserNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'notifications') {
      const fetchUserNotifications = async () => {
        setNotificationsLoading(true);
        try {
          const response = await apiService.notifications.getMy();
          setUserNotifications(response.data.notifications);
        } catch (error) {
          console.error('Error fetching user notifications:', error);
          toast.error('Erreur lors du chargement des notifications.');
        } finally {
          setNotificationsLoading(false);
        }
      };
      fetchUserNotifications();
    }

    if (socket) {
      const handleNewNotification = (notification: Notification) => {
        // Only add if the notification is for the current user
        if (user && notification.recipient === user.id) {
          setUserNotifications(prev => [notification, ...prev]);
        }
      };

      socket.on('newNotification', handleNewNotification);

      return () => {
        socket.off('newNotification', handleNewNotification);
      };
    }
  }, [activeTab, socket, user]);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      company: (user as User)?.company || '',
      address: {
        street: '',
        city: '',
        postalCode: '',
        country: 'France'
      },
      preferences: {
        language: 'fr',
        timezone: 'Europe/Paris',
        dateFormat: 'DD/MM/YYYY',
        currency: 'EUR'
      }
    }
  });

  const onSubmitProfile = async (data: ProfileForm) => {
    try {
      await apiService.users.update(user?.id!, data);
      toast.success('Profil mis à jour avec succès !');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    }
  };

  const handleMarkNotificationRead = async (notificationId: string) => {
    try {
      await apiService.notifications.markAsRead(notificationId);
      setUserNotifications(prev =>
        prev.map(notif => (notif._id === notificationId ? { ...notif, isRead: true } : notif))
      );
      toast.success('Notification marquée comme lue.');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Erreur lors du marquage de la notification.');
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await apiService.notifications.markAllRead();
      setUserNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      toast.success('Toutes les notifications ont été marquées comme lues.');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Erreur lors du marquage de toutes les notifications.');
    }
  };

  const updateNotificationChannel = (channel: keyof NotificationSettings['channels'], value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: value
      }
    }));
  };

  const updateNotificationType = (type: keyof NotificationSettings['types'], value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: value
      }
    }));
  };

  const onSubmitNotifications = async () => {
    try {
      await apiService.users.updateNotificationSettings(notifications);
      toast.success('Préférences de notification mises à jour avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour des préférences de notification');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: UserIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'preferences', label: 'Préférences', icon: Settings }
  ];

  const notificationTypes = [
    {
      key: 'maintenancePlanned' as const,
      label: 'Maintenance planifiée',
      description: 'Notifications pour les maintenances programmées',
      icon: Wrench,
      color: 'text-blue-600'
    },
    {
      key: 'interventionValidated' as const,
      label: 'Intervention validée',
      description: 'Confirmation des interventions acceptées',
      icon: CheckCircle2,
      color: 'text-green-600'
    },
    {
      key: 'quoteReceived' as const,
      label: 'Devis reçu',
      description: 'Nouveaux devis disponibles',
      icon: FileText,
      color: 'text-purple-600'
    },
    {
      key: 'quoteAccepted' as const,
      label: 'Devis accepté',
      description: 'Confirmation d\'acceptation de devis',
      icon: CheckCircle2,
      color: 'text-green-600'
    },
    {
      key: 'paymentPending' as const,
      label: 'Paiement en attente',
      description: 'Rappels de paiements dus',
      icon: CreditCard,
      color: 'text-orange-600'
    },
    {
      key: 'paymentReceived' as const,
      label: 'Paiement reçu',
      description: 'Confirmations de paiements',
      icon: CreditCard,
      color: 'text-green-600'
    },
    {
      key: 'systemUpdates' as const,
      label: 'Mises à jour système',
      description: 'Nouvelles fonctionnalités et améliorations',
      icon: Settings,
      color: 'text-gray-600'
    },
    {
      key: 'securityAlerts' as const,
      label: 'Alertes de sécurité',
      description: 'Notifications de sécurité importantes',
      icon: AlertTriangle,
      color: 'text-red-600'
    }
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profil Utilisateur</h1>
          <p className="text-gray-600">Gérez vos informations personnelles et préférences</p>
        </div>

        {/* Tabs */}
        <Card className="p-1">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Informations Personnelles</h3>
              
              {/* Avatar */}
              <div className="flex items-center space-x-6 mb-6">
                <img
                  src={user?.avatar || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                />
                <div>
                  <Button variant="secondary" size="sm">
                    <Camera className="w-4 h-4 mr-2" />
                    Changer la photo
                  </Button>
                  <p className="text-sm text-gray-500 mt-1">JPG, PNG max 5MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    {...register('firstName', { required: 'Le prénom est requis' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    {...register('lastName', { required: 'Le nom est requis' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    {...register('email', { required: 'L\'email est requis' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    {...register('phone')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entreprise
                  </label>
                  <input
                    type="text"
                    {...register('company')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Adresse</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rue
                  </label>
                  <input
                    type="text"
                    {...register('address.street')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    {...register('address.city')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code Postal
                  </label>
                  <input
                    type="text"
                    {...register('address.postalCode')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" size="lg">
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          </form>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Vos Notifications</h3>
              {notificationsLoading ? (
                <p>Chargement des notifications...</p>
              ) : userNotifications.length === 0 ? (
                <p className="text-gray-600">Aucune notification pour le moment.</p>
              ) : (
                <div className="space-y-4">
                  {userNotifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-4 border border-gray-200 rounded-lg ${notification.isRead ? 'bg-gray-50 text-gray-500' : 'bg-blue-50 text-gray-900 font-medium'}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p>{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkNotificationRead(notification._id)}
                          >
                            Marquer comme lu
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end mt-4">
                    <Button onClick={handleMarkAllNotificationsRead} variant="secondary">
                      Marquer tout comme lu
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Canaux de Notification</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-500">Notifications par email</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.channels.email}
                      onChange={(e) => updateNotificationChannel('email', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-bleu after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Push</p>
                      <p className="text-sm text-gray-500">Notifications push dans l'application</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.channels.push}
                      onChange={(e) => updateNotificationChannel('push', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-bleu after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">SMS</p>
                      <p className="text-sm text-gray-500">Notifications par SMS</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.channels.sms}
                      onChange={(e) => updateNotificationChannel('sms', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-bleu after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Système</p>
                      <p className="text-sm text-gray-500">Notifications dans l'interface</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.channels.system}
                      onChange={(e) => updateNotificationChannel('system', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-bleu after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Types de Notifications</h3>
              <div className="space-y-4">
                {notificationTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div key={type.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-5 h-5 ${type.color}`} />
                        <div>
                          <p className="font-medium text-gray-900">{type.label}</p>
                          <p className="text-sm text-gray-500">{type.description}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.types[type.key]}
                          onChange={(e) => updateNotificationType(type.key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-bleu after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </Card>

            <div className="flex justify-end">
              <Button onClick={onSubmitNotifications} size="lg">
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder les Préférences
              </Button>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Préférences Générales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="w-4 h-4 inline mr-1" />
                    Langue
                  </label>
                  <select
                    {...register('preferences.language')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Fuseau Horaire
                  </label>
                  <select
                    {...register('preferences.timezone')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                    <option value="Europe/London">Europe/London (UTC+0)</option>
                    <option value="America/New_York">America/New_York (UTC-5)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Format de Date
                  </label>
                  <select
                    {...register('preferences.dateFormat')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Devise
                  </label>
                  <select
                    {...register('preferences.currency')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">Dollar US ($)</option>
                    <option value="GBP">Livre Sterling (£)</option>
                  </select>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Sécurité du Compte</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <Button variant="primary">
                  Changer le mot de passe
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Sessions Actives</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Session actuelle</p>
                    <p className="text-sm text-gray-500">Chrome sur Windows • Paris, France</p>
                    <p className="text-sm text-gray-500">Dernière activité: maintenant</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Actuelle
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
