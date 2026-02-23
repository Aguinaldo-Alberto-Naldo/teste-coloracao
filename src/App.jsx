import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// Guards & Layouts
import AuthGuard from './components/auth/AuthGuard';
import AdminGuard from './components/auth/AdminGuard';
import AppLayout from './components/layout/AppLayout';
import AdminLayout from './components/layout/AdminLayout';
import GlobalError from './components/ui/GlobalError';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewSubject from './pages/NewSubject';
import SubjectDetail from './pages/SubjectDetail';
import Report from './pages/Report';
import CRM from './pages/CRM';
import AccountSettings from './pages/AccountSettings';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminClients from './pages/AdminClients';
import AdminCredits from './pages/AdminCredits';
import AdminPackages from './pages/AdminPackages';
import AdminLandingEditor from './pages/AdminLandingEditor'; // new
import AdminOrders from './pages/AdminOrders'; // new
import AdminTickets from './pages/AdminTickets';
import AdminSettings from './pages/AdminSettings';

// Store
import { useAuthStore } from './stores/authStore';
import { useConfigStore } from './stores/configStore';
import { useLandingStore } from './stores/landingStore';
import { useBillingStore } from './stores/billingStore';
import ClientStore from './pages/ClientStore'; // new
import ClientSupport from './pages/ClientSupport';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
    errorElement: <GlobalError />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  // Client Routes (Protected)
  {
    element: <AuthGuard />,
    errorElement: <GlobalError />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/subjects/new', element: <NewSubject /> },
          { path: '/subjects/:id', element: <SubjectDetail /> },
          { path: '/reports/:id', element: <Report /> },
          { path: '/crm', element: <CRM /> },
          { path: '/store', element: <ClientStore /> },
          { path: '/support', element: <ClientSupport /> },
          { path: '/settings', element: <AccountSettings /> },
        ]
      }
    ]
  },
  // Admin Routes (Protected)
  {
    path: '/admin',
    element: <AdminGuard />,
    errorElement: <GlobalError />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'clients', element: <AdminClients /> },
          { path: 'credits', element: <AdminCredits /> },
          { path: 'packages', element: <AdminPackages /> },
          { path: 'landing', element: <AdminLandingEditor /> },
          { path: 'orders', element: <AdminOrders /> },
          { path: 'tickets', element: <AdminTickets /> },
          { path: 'settings', element: <AdminSettings /> },
          { path: 'account', element: <AccountSettings /> },
        ]
      }
    ]
  },
  // Catch all
  {
    path: '*',
    element: <Navigate to="/login" replace />
  }
]);

export default function App() {
  const { initialize } = useAuthStore();
  const { loadConfig } = useConfigStore();
  const { loadContent } = useLandingStore();
  const { loadPackages } = useBillingStore();

  useEffect(() => {
    initialize();
    loadConfig();
    loadContent();
    loadPackages();
  }, [initialize, loadConfig, loadContent, loadPackages]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </>
  );
}
