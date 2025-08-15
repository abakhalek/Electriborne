import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 px-4">
      <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1')] bg-cover bg-center opacity-10"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/logo.png" alt="Electriborne Logo" className="h-16" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Ectriborne CRM</h1>
          <p className="text-primary-200">Solutions de mobilité électrique</p>
        </div>

        <Card glass className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Button
                type="submit"
                size="lg"
                isLoading={isLoading}
                className="w-full"
              >
                Se connecter
              </Button>

              <Link to="/" className="block">
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="w-full bg-bleu text-primary-600 hover:bg-gray-700 border border-primary-200"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Retour à l'accueil
                </Button>
              </Link>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/register"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Pas encore de compte ? S'inscrire
            </Link>
          </div>

          {/* Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-4">Comptes de démonstration :</p>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Admin:</span>
                <span>admin@ectriborne.com / password</span>
              </div>
              <div className="flex justify-between">
                <span>Technicien:</span>
                <span>tech@ectriborne.com / password</span>
              </div>
              <div className="flex justify-between">
                <span>Client:</span>
                <span>client@entreprise.com / password</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;