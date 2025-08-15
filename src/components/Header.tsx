import React, { useState } from 'react';
import { Search, MessageSquare, Settings, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import Button from './Button';
import NotificationCenter from './NotificationCenter';

const Header: React.FC = () => {
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="bg-bleu border-b border-gray-200 px-4 md:px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Search Bar - Hidden on mobile unless active */}
        <div className={`flex-1 max-w-lg ${searchOpen ? 'block' : 'hidden md:block'}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher clients, interventions, devis..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Mobile Search Toggle */}
        <div className="md:hidden flex items-center">
          {!searchOpen && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSearchOpen(true)}
              className="mr-2"
            >
              <Search className="w-5 h-5" />
            </Button>
          )}
          {searchOpen && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSearchOpen(false)}
              className="mr-2"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Messages */}
          <Button variant="ghost" size="sm" className="relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </Button>

          {/* Notifications */}
          <NotificationCenter />

          {/* Settings */}
          <Button variant="ghost" size="sm">
            <Settings className="w-5 h-5" />
          </Button>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <img
              src={user?.avatar || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
            />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;