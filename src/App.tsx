import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages

import AproposPage from './pages/public/AproposPage';
import DevisPage from './pages/public/DevisPage';
import ContactPage from './pages/public/ContactPage';

import ElectribornePage from './pages/public/ElectribornePage';
import ElectriborneSimulator from './pages/ElectriborneSimulator';
import ServicesPage from './pages/public/ServicesPage';
import BlogPage from './pages/public/BlogPage';
import BlogPostPage from './pages/public/BlogPostPage';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import AddUser from './pages/admin/AddUser';
import CompanyManagement from './pages/admin/CompanyManagement';
import AddCompany from './pages/admin/AddCompany';
import RequestManagement from './pages/admin/RequestManagement';
import ViewRequest from './pages/admin/ViewRequest';
import EditRequest from './pages/admin/EditRequest';
import AddRequest from './pages/admin/AddRequest';
import QuoteGeneration from './pages/admin/QuoteGeneration';
import AddQuote from './pages/admin/AddQuote';
import ViewQuote from './pages/admin/ViewQuote';
import PaymentManagement from './pages/admin/PaymentManagement';
import PaymentDashboard from './pages/admin/PaymentDashboard';
import ViewPayment from './pages/admin/ViewPayment';
import EditPayment from './pages/admin/EditPayment';
import AddPayment from './pages/admin/AddPayment';
import ReportsManagement from './pages/admin/ReportsManagement';
import SiteCustomization from './pages/admin/SiteCustomization';
import MissionManagement from './pages/admin/MissionManagement';
import AddMission from './pages/admin/AddMission';
import ViewMission from './pages/admin/ViewMission';
import EditMission from './pages/admin/EditMission';
import ViewUser from './pages/admin/ViewUser';
import ServiceTypeManagement from './pages/admin/ServiceTypeManagement';
import AddServiceType from './pages/admin/AddServiceType';
import EditServiceType from './pages/admin/EditServiceType';
import AddReport from './pages/admin/AddReport';
import EquipmentManagement from './pages/admin/EquipmentManagement';
import AddEquipment from './pages/admin/AddEquipment';
import InvoiceManagement from './pages/admin/InvoiceManagement';
import AddInvoice from './pages/admin/AddInvoice';
import ViewInvoice from './pages/admin/ViewInvoice';
import EditInvoice from './pages/admin/EditInvoice';

// Technician Pages
import TechDashboard from './pages/technician/Dashboard';
import TechSchedule from './pages/technician/Schedule';
import TechMissions from './pages/technician/Missions';

import TechReports from './pages/technician/Reports';
import TechMessaging from './pages/technician/Messaging';
import TechnicalReport from './pages/technician/TechnicalReport';
import SaveReport from './pages/technician/SaveReport';
import TechQuotes from './pages/technician/Quotes';
import CreateQuote from './pages/technician/CreateQuote';
import TechAvailability from './pages/technician/Availability';

import ViewReport from './pages/technician/ViewReport';

// Client Pages
import ClientDashboard from './pages/client/Dashboard';
import ServiceRequest from './pages/client/ServiceRequest';
import ClientQuotes from './pages/client/Quotes';
import ClientInterventions from './pages/client/Interventions';
import ClientInvoices from './pages/client/Invoices';
import ClientPayments from './pages/client/Payments';
import ClientMessaging from './pages/client/Messaging';
import StripePayment from './pages/client/StripePayment';
import QuoteDetails from './pages/client/QuoteDetails';


// Shared Pages
import Profile from './pages/shared/Profile';
import Messages from './pages/shared/Messages';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
        <div class="min-h-screen bg-gray-50">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<ElectribornePage />} />
            <Route path="/a-propos" element={<AproposPage />} />
            <Route path="/devis" element={<DevisPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/estimateur" element={<ElectriborneSimulator />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:postId" element={<BlogPostPage />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute roles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/add"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AddUser />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/view/:id"
              element={
                <ProtectedRoute roles={['admin']}>
                  <ViewUser />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/companies"
              element={
                <ProtectedRoute roles={['admin']}>
                  <CompanyManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/companies/add"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AddCompany />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/requests"
              element={
                <ProtectedRoute roles={['admin']}>
                  <RequestManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/requests/add"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AddRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/requests/view/:id"
              element={
                <ProtectedRoute roles={['admin']}>
                  <ViewRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/requests/edit/:id"
              element={
                <ProtectedRoute roles={['admin']}>
                  <EditRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/quotes"
              element={
                <ProtectedRoute roles={['admin']}>
                  <QuoteGeneration />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/quotes/add"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AddQuote />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/quotes/edit/:id"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AddQuote />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/quotes/view/:id"
              element={
                <ProtectedRoute roles={['admin']}>
                  <ViewQuote />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <ProtectedRoute roles={['admin']}>
                  <PaymentManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payments/add"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AddPayment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payments/view/:id"
              element={
                <ProtectedRoute roles={['admin']}>
                  <ViewPayment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payments/edit/:id"
              element={
                <ProtectedRoute roles={['admin']}>
                  <EditPayment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payment-dashboard"
              element={
                <ProtectedRoute roles={['admin']}>
                  <PaymentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute roles={['admin']}>
                  <ReportsManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports/add"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AddReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports/edit/:reportId"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AddReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports/view/:reportId"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AddReport /> {/* Reusing AddReport for view, can create a dedicated ViewReport if needed */}
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/site-customization"
              element={
                <ProtectedRoute roles={['admin']}>
                  <SiteCustomization />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/service-types"
              element={
                <ProtectedRoute roles={['admin']}>
                  <ServiceTypeManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/service-types/add"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AddServiceType />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/service-types/edit/:id"
              element={
                <ProtectedRoute roles={['admin']}>
                  <EditServiceType />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/missions"
              element={
                <ProtectedRoute roles={['admin']}>
                  <MissionManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/add-mission"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AddMission />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/missions/view/:id"
              element={
                <ProtectedRoute roles={['admin']}>
                  <ViewMission />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/missions/edit/:id"
              element={
                <ProtectedRoute roles={['admin']}>
                  <EditMission />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/equipments/add"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AddEquipment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/equipments"
              element={
                <ProtectedRoute roles={['admin']}>
                  <EquipmentManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/invoices/add"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AddInvoice />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/invoices"
              element={
                <ProtectedRoute roles={['admin']}>
                  <InvoiceManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/invoices/view/:id"
              element={
                <ProtectedRoute roles={['admin']}>
                  <ViewInvoice />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/invoices/edit/:id"
              element={
                <ProtectedRoute roles={['admin']}>
                  <EditInvoice />
                </ProtectedRoute>
              }
            />
            {/* Technician Routes */}
            <Route
              path="/tech/dashboard"
              element={
                <ProtectedRoute roles={['technician']}>
                  <TechDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tech/schedule"
              element={
                <ProtectedRoute roles={['technician']}>
                  <TechSchedule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tech/missions"
              element={
                <ProtectedRoute roles={['technician']}>
                  <TechMissions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tech/missions/:id"
              element={
                <ProtectedRoute roles={['technician']}>
                  <ViewMission />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tech/reports"
              element={
                <ProtectedRoute roles={['technician']}>
                  <TechReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tech/reports/add"
              element={
                <ProtectedRoute roles={['technician']}>
                  <SaveReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tech/reports/new"
              element={
                <ProtectedRoute roles={['technician']}>
                  <SaveReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tech/reports/edit/:reportId"
              element={
                <ProtectedRoute roles={['technician']}>
                  <SaveReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tech/technical-report/:reportId"
              element={
                <ProtectedRoute roles={['technician']}>
                  <TechnicalReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tech/reports/view/:id"
              element={
                <ProtectedRoute roles={['technician']}>
                  <ViewReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tech/messages"
              element={
                <ProtectedRoute roles={['technician']}>
                  <TechMessaging />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tech/quotes"
              element={
                <ProtectedRoute roles={['technician']}>
                  <TechQuotes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tech/quotes/create"
              element={
                <ProtectedRoute roles={['technician']}>
                  <CreateQuote />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tech/quotes/create/:interventionId"
              element={
                <ProtectedRoute roles={['technician']}>
                  <CreateQuote />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tech/availability"
              element={
                <ProtectedRoute roles={['technician']}>
                  <TechAvailability />
                </ProtectedRoute>
              }
            />

            {/* Client Routes */}
            <Route
              path="/client/dashboard"
              element={
                <ProtectedRoute roles={['client']}>
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/request"
              element={
                <ProtectedRoute roles={['client']}>
                  <ServiceRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/quotes"
              element={
                <ProtectedRoute roles={['client']}>
                  <ClientQuotes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/quotes/:quoteId"
              element={
                <ProtectedRoute roles={['client']}>
                  <QuoteDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/interventions"
              element={
                <ProtectedRoute roles={['client']}>
                  <ClientInterventions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/Invoices"
              element={
                <ProtectedRoute roles={['client']}>
                  <ClientInvoices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/payments"
              element={
                <ProtectedRoute roles={['client']}>
                  <ClientPayments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/payment/:quoteId"
              element={
                <ProtectedRoute roles={['client']}>
                  <StripePayment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/messages"
              element={
                <ProtectedRoute roles={['client']}>
                  <ClientMessaging />
                </ProtectedRoute>
              }
            />

            {/* Shared Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />

            {/* Default Redirects */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </SocketProvider>
    </AuthProvider>
  );
}

// Component to redirect to role-specific dashboard
const DashboardRedirect: React.FC = () => {
  const { user } = useAuth();
  console.log('DashboardRedirect: user role=', user?.role);
  
  if (user?.role === 'admin') {
    console.log('DashboardRedirect: Redirecting to /admin/dashboard');
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user?.role === 'technician') {
    console.log('DashboardRedirect: Redirecting to /tech/dashboard');
    return <Navigate to="/tech/dashboard" replace />;
  } else if (user?.role === 'client') {
    console.log('DashboardRedirect: Redirecting to /client/dashboard');
    return <Navigate to="/client/dashboard" replace />;
  }
  
  console.log('DashboardRedirect: No role matched, redirecting to /login');
  return <Navigate to="/login" replace />;
};

export default App;
