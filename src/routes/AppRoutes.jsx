
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
import RevenueList from '../pages/Admin/RevenueList';

// Receptionist Pages
import PatientRegistry from '../pages/Receptionist/PatientRegistry';
import Billing from '../pages/Receptionist/Billing';
import Reports from '../pages/Receptionist/Reports';
import TestAssignment from '../pages/Receptionist/TestAssignment';

import NotFound from '../components/NotFound';
import ReportModal from '../components/ReportModal';

// Contexts
// We might need access to other contexts if pages depend on them, 
// but ideally pages should consume contexts themselves.




const MainLayout = ({ children }) => {
    // This layout wrapper allows us to have the Sidebar present for authenticated routes
    return (
        <div className="min-h-screen flex flex-col md:flex-row text-slate-700 antialiased">
            <Sidebar />
            <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
                <div className="max-w-7xl">
                    {children}
                </div>
            </main>
            {/* Global Modals could go here if managed by context, 
               but currently ReportModal is local state in App.js which we need to fix.
               For now, we'll omit it until we fix the modal state. 
           */}
        </div>
    );
};

// Wrapper for pages to include Layout
const PageWithLayout = ({ component: Component, ...props }) => {
    return (
        <MainLayout>
            <Component {...props} />
        </MainLayout>
    );
};

const AppRoutes = () => {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/login" element={
                !user ? <Login /> : <Navigate to={user.role === 'Admin' ? '/dashboard' : '/patients'} replace />
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
            <Route path="/revenue" element={
                <ProtectedRoute allowedRoles={['Admin']}>
                    <PageWithLayout component={RevenueList} />
                </ProtectedRoute>
            } />
            <Route path="/settings" element={
                <ProtectedRoute allowedRoles={['Admin']}>
                    <PageWithLayout component={Settings} />
                </ProtectedRoute>
            } />

            {/* Receptionist Routes */}
            <Route path="/patients" element={
                <ProtectedRoute allowedRoles={['Admin', 'Operator']}>
                    <PageWithLayout component={PatientRegistry} />
                </ProtectedRoute>
            } />
            <Route path="/assign-tests" element={
                <ProtectedRoute allowedRoles={['Operator']}>
                    <PageWithLayout component={TestAssignment} />
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

            {/* Redirect Root */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;
