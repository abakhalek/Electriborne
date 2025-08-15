import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
  requiredPermissions?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  roles, 
  requiredPermissions 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  console.log('ProtectedRoute: isLoading=', isLoading, 'isAuthenticated=', isAuthenticated, 'user=', user);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (roles && user && !roles.includes(user.role)) {
    console.log('ProtectedRoute: Role mismatch, redirecting to /dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Check permission-based access (for future use)
  if (requiredPermissions && user) {
    // This would check against user permissions in a real implementation
    // For now, we'll use role-based permissions
    const userPermissions = getUserPermissions(user.role);
    const hasPermission = requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );
    
    if (!hasPermission) {
      console.log('ProtectedRoute: Permission mismatch, redirecting to /dashboard');
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

// Helper function to get permissions based on role
const getUserPermissions = (role: string): string[] => {
  const permissions = {
    admin: [
      'users.create',
      'users.read',
      'users.update',
      'users.delete',
      'companies.create',
      'companies.read',
      'companies.update',
      'companies.delete',
      'requests.create',
      'requests.read',
      'requests.update',
      'requests.delete',
      'quotes.create',
      'quotes.read',
      'quotes.update',
      'quotes.delete',
      'payments.read',
      'payments.update',
      'reports.read',
      'reports.create',
      'messages.read',
      'messages.create'
    ],
    technician: [
      'requests.read',
      'requests.update',
      'quotes.read',
      'installations.read',
      'installations.update',
      'reports.create',
      'reports.read',
      'messages.read',
      'messages.create'
    ],
    client: [
      'requests.create',
      'requests.read',
      'quotes.read',
      'quotes.respond',
      'installations.read',
      'payments.read',
      'messages.read',
      'messages.create'
    ]
  };

  return permissions[role as keyof typeof permissions] || [];
};

export default ProtectedRoute;