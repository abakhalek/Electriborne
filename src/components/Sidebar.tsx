import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Wrench, 
  FileText, 
  Settings, 
  LogOut,
  Zap,
  ClipboardCheck,
  Calendar,
  Building2,
  CreditCard,
  MessageSquare,
  UserCheck,
  FileBarChart,
  Menu,
  X,
  Clock,
  Palette,
  Tag,
  Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from './Card';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminMenuItems = [
    { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Utilisateurs', path: '/admin/users' },
    { icon: Building2, label: 'Entreprises', path: '/admin/companies' },
    { icon: Package, label: 'Équipements', path: '/admin/equipments' },
    { icon: ClipboardCheck, label: 'Demandes', path: '/admin/requests' },
    { icon: FileText, label: 'Devis', path: '/admin/quotes' },
    { icon: Wrench, label: 'Missions', path: '/admin/missions' },
    { icon: FileText, label: 'Factures', path: '/admin/invoices' },
    { icon: CreditCard, label: 'Paiements', path: '/admin/payments' },
    { icon: FileBarChart, label: 'Rapports', path: '/admin/reports' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: Palette, label: 'Personnalisation', path: '/admin/site-customization' },
    { icon: Tag, label: 'Types de Service', path: '/admin/service-types' },
    { icon: Settings, label: 'Paramètres', path: '/profile' },
  ];

  const techMenuItems = [
    { icon: Home, label: 'Dashboard', path: '/tech/dashboard' },
    { icon: Calendar, label: 'Planning', path: '/tech/schedule' },
    { icon: UserCheck, label: 'Missions', path: '/tech/missions' },
    { icon: FileText, label: 'Devis', path: '/tech/quotes' },
    { icon: ClipboardCheck, label: 'Rapports', path: '/tech/reports' },
    { icon: MessageSquare, label: 'Messages', path: '/tech/messages' },
    { icon: Clock, label: 'Disponibilités', path: '/tech/availability' },
    { icon: Settings, label: 'Profil', path: '/profile' },
  ];

  const clientMenuItems = [
    { icon: Home, label: 'Dashboard', path: '/client/dashboard' },
    { icon: Wrench, label: 'Demande Service', path: '/client/request' },
    { icon: FileText, label: 'Mes Devis', path: '/client/quotes' },
    { icon: Zap, label: 'Interventions', path: '/client/interventions' },
    { icon: CreditCard, label: 'Paiements', path: '/client/payments' },
    { icon: FileText, label: 'Mes Factures', path: '/client/invoices' },
    { icon: MessageSquare, label: 'Messages', path: '/client/messages' },
    { icon: Settings, label: 'Profil', path: '/profile' },
  ];

  const getMenuItems = () => {
    switch (user?.role) {
      case 'admin':
        return adminMenuItems;
      case 'technician':
        return techMenuItems;
      case 'client':
        return clientMenuItems;
      default:
        return [];
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-primary-600 text-white shadow-lg"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className={`w-64 h-screen bg-gradient-to-b from-primary-900 to-primary-800 text-white fixed left-0 top-0 z-40 flex flex-col transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Logo & Brand */}
        <div className="p-6 border-b border-primary-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-bleu rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Ectriborne</h1>
              <p className="text-xs text-primary-200">CRM Solutions</p>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4">
          <Card glass className="p-4">
            <div className="flex items-center space-x-3">
              <img
                src={user?.avatar || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-white"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role === 'admin' ? 'Administrateur' : 
                   user?.role === 'technician' ? 'Technicien' : 'Client'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 pb-4 space-y-2 overflow-y-auto">
          {getMenuItems().map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-bleu/20 text-white shadow-lg backdrop-blur-sm'
                    : 'text-primary-100 hover:bg-bleu/10 hover:text-white'
                }`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-primary-700">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-primary-100 hover:bg-red-500/20 hover:text-white transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
