
import {
    LayoutDashboard, TrendingDown, Microscope, Stethoscope,
    Database, CreditCard, ClipboardList, Settings2
} from 'lucide-react';

export const NAV_MENU = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin'], path: '/dashboard' },
    { id: 'receptionist-dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Operator'], path: '/receptionist-dashboard' },
    { id: 'expenses', label: 'Expenses', icon: TrendingDown, roles: ['Admin'], path: '/expenses' },
    { id: 'tests', label: 'Tests', icon: Microscope, roles: ['Admin'], path: '/tests' },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope, roles: ['Admin'], path: '/doctors' },
    { id: 'patients', label: 'Patients', icon: Database, roles: ['Admin', 'Operator'], path: '/patients' },

    { id: 'pending-orders', label: 'Pending Orders', icon: ClipboardList, roles: ['Operator'], path: '/pending-orders' },
    { id: 'billing', label: 'Billing', icon: CreditCard, roles: ['Operator'], path: '/billing' },
    { id: 'reports', label: 'Reports', icon: ClipboardList, roles: ['Operator'], path: '/reports' },
    { id: 'settings', label: 'Settings', icon: Settings2, roles: ['Admin'], path: '/settings' },
];
