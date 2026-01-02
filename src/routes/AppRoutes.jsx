
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from './guards/ProtectedRoute';

// Layout
import Sidebar from '../components/sidebar/Sidebar';
import Login from '../pages/Auth/Login';

// Admin Pages
import Dashboard from '../pages/Admin/Dashboard';
import Expenses from '../pages/Admin/Expenses';
import Tests from '../pages/Admin/Tests';
import Doctors from '../pages/Admin/Doctors';
import Settings from '../pages/Admin/Settings';

// Receptionist Pages
import PatientRegistry from '../pages/Receptionist/PatientRegistry';
import AddPatient from '../pages/Receptionist/AddPatient';
import ReceptionistDashboard from '../pages/Receptionist/ReceptionistDashboard';
import Billing from '../pages/Receptionist/Billing';
import Reports from '../pages/Receptionist/Reports';

import PendingOrders from '../pages/Receptionist/PendingOrders';

import NotFound from '../components/NotFound';
import ReportModal from '../components/ReportModal';

const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col md:flex-row text-slate-700 antialiased">
            <Sidebar />
            <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
                <div className="max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
};

const PageWithLayout = ({ component: Component, ...props }) => {
    return (
        <MainLayout>
            <Component {...props} />
        </MainLayout>
    );
};

const AppRoutes = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/login" element={
                user ? (
                    <Navigate to={user.role === 'Admin' ? '/dashboard' : '/receptionist-dashboard'} replace />
                ) : (
                    <Login />
                )
            } />

            {/* Admin Routes */}
            <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['Admin']}>
                    <PageWithLayout component={Dashboard} />
                </ProtectedRoute>
            } />
            <Route path="/expenses" element={
                <ProtectedRoute allowedRoles={['Admin']}>
                    <PageWithLayout component={Expenses} />
                </ProtectedRoute>
            } />
            <Route path="/tests" element={
                <ProtectedRoute allowedRoles={['Admin']}>
                    <PageWithLayout component={Tests} />
                </ProtectedRoute>
            } />
            <Route path="/doctors" element={
                <ProtectedRoute allowedRoles={['Admin']}>
                    <PageWithLayout component={Doctors} />
                </ProtectedRoute>
            } />
            <Route path="/settings" element={
                <ProtectedRoute allowedRoles={['Admin']}>
                    <PageWithLayout component={Settings} />
                </ProtectedRoute>
            } />


            {/* Receptionist Routes */}
            <Route path="/receptionist-dashboard" element={
                <ProtectedRoute allowedRoles={['Admin', 'Operator']}>
                    <PageWithLayout component={ReceptionistDashboard} />
                </ProtectedRoute>
            } />
            <Route path="/patients" element={
                <ProtectedRoute allowedRoles={['Admin', 'Operator']}>
                    <PageWithLayout component={PatientRegistry} />
                </ProtectedRoute>
            } />
            <Route path="/patients/add" element={
                <ProtectedRoute allowedRoles={['Admin', 'Operator']}>
                    <PageWithLayout component={AddPatient} />
                </ProtectedRoute>
            } />

            <Route path="/billing" element={
                <ProtectedRoute allowedRoles={['Operator']}>
                    <PageWithLayout component={Billing} />
                </ProtectedRoute>
            } />
            <Route path="/reports" element={
                <ProtectedRoute allowedRoles={['Operator']}>
                    <PageWithLayout component={Reports} />
                </ProtectedRoute>
            } />
            <Route path="/pending-orders" element={
                <ProtectedRoute allowedRoles={['Operator']}>
                    <PageWithLayout component={PendingOrders} />
                </ProtectedRoute>
            } />

            {/* Redirect Root */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;
