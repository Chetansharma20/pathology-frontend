
import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { IndianRupee, Users, Bell, TrendingUp, BarChart4, Microscope, Activity, Plus, FileText, TestTube } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Contexts
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

// Reusable Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, isLoading, subtitle }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow h-32 flex flex-col justify-between">
        <div className="flex items-start justify-between">
            <div className={`p-2.5 rounded-lg ${color}`}>
                <Icon size={20} />
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title.split(' ')[0]}</span>
        </div>
        <div className="space-y-1">
            {isLoading ? (
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
            ) : (
                <>
                    <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
                    <p className="text-sm text-gray-600 font-medium">{subtitle || title.split(' ').slice(1).join(' ')}</p>
                </>
            )}
        </div>
    </div>
);

// Reusable Quick Action Card Component
const QuickActionCard = ({ title, description, icon: Icon, color, onClick }) => (
    <button
        onClick={onClick}
        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 text-left group"
    >
        <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${color} group-hover:scale-110 transition-transform duration-200`}>
                <Icon size={24} />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
            </div>
        </div>
    </button>
);

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Use Global Data Context instead of passed props
    const {
        patients = [],
        doctors = [],
        metrics = { dailyCollection: 0, totalExpenses: 0, monthlyRevenue: 0 }
    } = useData();

    // Use mock data from props instead of API calls
    const systemOverview = {
        totalPatients: patients.length || 0,
        totalTests: 3, // Mock test count
        totalRevenue: 0, // Revenue data not available yet
        totalExpenses: metrics.totalExpenses || 0
    };

    // Mock recent data
    const recentExpenses = [
        {
            _id: 'E-001',
            title: 'Lab Reagents',
            amount: 2500,
            category: 'LAB_MATERIALS',
            date: new Date().toISOString().split('T')[0]
        },
        {
            _id: 'E-002',
            title: 'Staff Salary',
            amount: 15000,
            category: 'SALARY',
            date: new Date().toISOString().split('T')[0]
        }
    ];

    const receptionists = [
        {
            _id: 'R-001',
            name: 'Priya Sharma',
            mobile: '9876543210',
            status: 'Active',
            createdAt: new Date().toISOString()
        },
        {
            _id: 'R-002',
            name: 'Rajesh Kumar',
            mobile: '9876543211',
            status: 'Active',
            createdAt: new Date().toISOString()
        }
    ];

    // Quick Actions based on user role
    const getQuickActions = () => {
        // If user is null for some reason, return empty
        if (!user) return [];

        const actions = [];

        if (user.role === 'Operator') {
            // Receptionist actions
            actions.push(
                {
                    title: 'Add Patient',
                    description: 'Register a new patient in the system',
                    icon: Plus,
                    color: 'text-blue-600 bg-blue-50',
                    action: () => navigate('/patients') // Navigate to patient registry
                },
                {
                    title: 'Generate Report',
                    description: 'Create and send patient reports',
                    icon: FileText,
                    color: 'text-green-600 bg-green-50',
                    action: () => navigate('/reports') // Navigate to reports
                }
            );
        } else if (user.role === 'Admin') {
            // Admin actions
            actions.push(
                {
                    title: 'Add Test',
                    description: 'Create new laboratory test types',
                    icon: TestTube,
                    color: 'text-purple-600 bg-purple-50',
                    action: () => navigate('/tests') // Navigate to tests section
                },
                {
                    title: 'Add Expense',
                    description: 'Record laboratory expenses',
                    icon: Bell,
                    color: 'text-orange-600 bg-orange-50',
                    action: () => navigate('/expenses') // Navigate to expenses section
                }
            );
        }

        return actions;
    };

    const formatCurrency = (amount) => {
        return `₹${(amount || 0).toLocaleString()}`;
    };

    return (
        <div className="space-y-8">
            {/* Daily Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Today's Revenue", val: formatCurrency(metrics.dailyCollection), color: "text-emerald-700 bg-emerald-50", icon: IndianRupee },
                    { label: "Total Patients", val: patients.length, color: "text-blue-700 bg-blue-50", icon: Users },
                    { label: "Monthly Expenses", val: formatCurrency(metrics.totalExpenses), color: "text-orange-700 bg-orange-50", icon: Bell },
                    { label: "Monthly Revenue", val: metrics.monthlyRevenue ? formatCurrency(metrics.monthlyRevenue) : "₹ 0", color: "text-purple-700 bg-purple-50", icon: TrendingUp },
                ].map((m, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow h-32 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                            <div className={`p-2.5 rounded-lg ${m.color}`}>
                                <m.icon size={20} />
                            </div>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{m.label.split(' ')[0]}</span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-bold text-gray-900 leading-none">{m.val}</p>
                            <p className="text-sm text-gray-600 font-medium">{m.label.split(' ').slice(1).join(' ')}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* System Overview Section */}
            <Card title="System Overview" icon={Activity}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Patients"
                        value={(systemOverview.totalPatients || 0).toLocaleString()}
                        icon={Users}
                        color="text-blue-700 bg-blue-50"
                        subtitle="Registered patients"
                    />
                    <StatCard
                        title="Total Tests"
                        value={(systemOverview.totalTests || 0).toLocaleString()}
                        icon={Microscope}
                        color="text-green-700 bg-green-50"
                        subtitle="Available test types"
                    />
                    <StatCard
                        title="Total Revenue"
                        value={formatCurrency(systemOverview.totalRevenue)}
                        icon={TrendingUp}
                        color="text-emerald-700 bg-emerald-50"
                        subtitle="All-time revenue"
                    />
                    <StatCard
                        title="Total Expenses"
                        value={formatCurrency(systemOverview.totalExpenses)}
                        icon={Bell}
                        color="text-orange-700 bg-orange-50"
                        subtitle="All-time expenses"
                    />
                </div>
            </Card>

            {/* Quick Actions Section */}
            {getQuickActions().length > 0 && (
                <Card title="Quick Actions" icon={Plus}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {getQuickActions().map((action, index) => (
                            <QuickActionCard
                                key={index}
                                title={action.title}
                                description={action.description}
                                icon={action.icon}
                                color={action.color}
                                onClick={action.action}
                            />
                        ))}
                    </div>
                </Card>
            )}

            {/* Receptionist Management & Recent Expenses (Admin Only) */}
            {user && user.role === 'Admin' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Receptionist Management */}
                    <Card title="Receptionist Management" icon={Users} noPadding>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {receptionists.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                                                No receptionists found
                                            </td>
                                        </tr>
                                    ) : (
                                        receptionists.slice(0, 5).map((receptionist) => (
                                            <tr key={receptionist._id || receptionist.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {receptionist.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {receptionist.mobile}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${receptionist.status === 'Active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {receptionist.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                    {receptionist.createdAt ? new Date(receptionist.createdAt).toLocaleDateString() : '-'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-4 py-3 border-t bg-gray-50">
                            <button
                                onClick={() => navigate('/receptionists')}
                                className="w-full text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                                View All Receptionists →
                            </button>
                        </div>
                    </Card>

                    {/* Recent Expenses */}
                    <Card title="Recent Expenses" icon={Bell} noPadding>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Title
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recentExpenses.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                                                No expenses found
                                            </td>
                                        </tr>
                                    ) : (
                                        recentExpenses.slice(0, 5).map((expense) => (
                                            <tr key={expense._id || expense.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {expense.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {expense.date ? new Date(expense.date).toLocaleDateString() : ''}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                                        {expense.category?.replace('_', ' ') || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium text-red-600">
                                                    {formatCurrency(expense.amount)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-4 py-3 border-t bg-gray-50">
                            <button
                                onClick={() => navigate('/expenses')}
                                className="w-full text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                                View All Expenses →
                            </button>
                        </div>
                    </Card>
                </div>
            )}

            {/* System Status */}
            <div className="grid grid-cols-1 gap-8">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <BarChart4 size={20} className="text-purple-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">System Status</h3>
                            <p className="text-sm text-gray-500">Management Dashboard</p>
                        </div>
                    </div>
                    <div className="text-center space-y-4">
                        <p className="text-xl font-bold text-gray-900">DIGITOS Pathology Lab</p>
                        <p className="text-gray-600">Streamlining healthcare operations with precision and care</p>
                        <div className="pt-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-lg">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-indigo-700">System Online</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
