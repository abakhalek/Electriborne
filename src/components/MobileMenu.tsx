import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  FileText, 
  User, 
  MessageSquare, 
  Zap,
  Calculator,
  ChevronRight
} from 'lucide-react';

interface MobileMenuProps {
  className?: string;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close menu if screen becomes larger than mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { icon: Home, label: 'ACCUEIL', path: '/' },
    { icon: FileText, label: 'NOS SERVICES', path: '/#services' },
    { icon: User, label: 'BLOG', path: '/blog' },
    { icon: Calculator, label: 'SIMULATEUR', path: '/estimateur' },
    { icon: MessageSquare, label: 'CONTACT', path: '/contact' },
    { icon: Zap, label: 'ACCÈS CRM', path: '/login' },
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Mobile menu button - More visible with better contrast */}
      <button 
        onClick={toggleMenu}
        className="p-3 rounded-xl bg-[#3295a2] text-white hover:bg-[#267681] transition-all duration-200 z-50 relative shadow-xl border-2 border-[#3295a2]/40 hover:shadow-2xl transform hover:scale-105"
        aria-label="Menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile menu overlay - Darker for better contrast */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 z-40 transition-opacity duration-300"
          onClick={toggleMenu}
        ></div>
      )}

      {/* Mobile menu panel - Lighter background and more contrast */}
      <div 
        className={`fixed top-0 left-0 w-80 h-full bg-bleu z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header of menu - Blue background for visibility */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#3295a2] to-[#1888b0]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="Logo" className="h-10" />
            </div>
            <button 
              onClick={toggleMenu}
              className="p-2 text-white hover:bg-bleu/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Navigation - White background with black text for maximum contrast */}
        <nav className="p-6 flex-1 overflow-y-auto bg-bleu">
          <ul className="space-y-3">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `flex items-center space-x-4 p-4 rounded-xl text-base font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#3295a2] text-white shadow-lg transform scale-105'
                      : 'text-gray-800 hover:bg-[#3295a2]/10 hover:text-[#3295a2] hover:shadow-md border border-gray-100 hover:border-[#3295a2]/20'
                  }`}
                  onClick={toggleMenu}
                >
                  {({ isActive }) => (
                    <>
                      <div className={`p-2 rounded-lg ${
                        isActive ? 'bg-bleu/20' : 'bg-[#3295a2]/10'
                      }`}>
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#3295a2]'}`} />
                      </div>
                      <span className="flex-1 font-medium">{item.label}</span>
                      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#3295a2]'}`} />
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer of mobile menu - Blue background with white text */}
        <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-[#3295a2] to-[#1888b0]">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-6 h-6 bg-bleu/20 rounded-full flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">ELECTRIBORNE 2024</span>
            </div>
            <p className="text-xs text-[#3295a2]/80 font-medium">Solutions de recharge pour véhicules électriques</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;