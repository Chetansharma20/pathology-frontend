
import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { TrendingDown, History, Edit3, Trash2, Upload, Calendar, Filter, Plus, Search, Layers } from 'lucide-react';
import { getExpenses, createExpense, updateExpense, deleteExpense, createBatchExpenses } from '../../api/admin/expenses.api';
import BatchExpenseModal from '../../components/expenses/BatchExpenseModal';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

const EXPENSE_CATEGORIES = [
    'LAB_MATERIALS',
    'SALARY',
    'COMMISSION',
    'UTILITY',
    'RENT',
    'MISCELLANEOUS'
];

const ExpensesSection = () => {
    const { showToast } = useToast();
    const { user } = useAuth();

    // Modal State
    // 'daily', 'monthly', or null (closed)
    const [modalMode, setModalMode] = useState(null);

    // Edit state (if needed for list editing later, currently simplistic)
    const [editingExpense, setEditingExpense] = useState(null);

    // Loading states
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // List state
    const [expenses, setExpenses] = useState([]);
    const [listLoading, setListLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    // Filters
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        month: '', // New filter
        category: ''
    });

    // Fetch expenses
    const fetchExpenses = async () => {
        try {
            setListLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                category: filters.category,
                // If month is selected, ignore date range
                month: filters.month,
                startDate: filters.month ? '' : filters.startDate,
                endDate: filters.month ? '' : filters.endDate
            };

            const response = await getExpenses(params);
            setExpenses(response.data || response.expenses || []);
            setPagination(prev => ({
                ...prev,
                total: response.pagination?.totalRecords || response.total || 0,
                totalPages: response.pagination?.totalPages || response.totalPages || 0
            }));
        } catch (error) {
            showToast('Failed to fetch expenses', 'error');
            console.error('Fetch expenses error:', error);
        } finally {
            setListLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [pagination.page, filters]);

    // Handle batch submit (from Unified Modal)
    const handleBatchSubmit = async (payload) => {
        setSubmitting(true);
        try {
            await createBatchExpenses(payload);
            showToast('Expenses added successfully', 'success');
            setModalMode(null);
            fetchExpenses(); // Refresh list
        } catch (error) {
            showToast(error.message || 'Failed to add expenses', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">Expense Management</h2>
                    <p className="text-slate-600 mt-1">Track and manage lab expenses with detailed categorization</p>
                </div>
                <div className="flex gap-3">
                    {/* <button
                        onClick={() => setModalMode('monthly')}
                        className="bg-white text-indigo-600 border border-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2 font-medium"
                    >
                        <Layers size={16} />
                        Month Wise Adding
                    </button> */}
                    <button
                        onClick={() => setModalMode('daily')}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium shadow-sm shadow-indigo-200"
                    >
                        <Plus size={16} />
                        Add Expenses
                    </button>
                </div>
            </div>

            {/* Unified Batch Modal */}
            {
                modalMode && (
                    <BatchExpenseModal
                        onClose={() => setModalMode(null)}
                        onSubmit={handleBatchSubmit}
                        submitting={submitting}
                        initialMode={modalMode} // Pass the default mode
                    />
                )
            }

            {/* Filters */}
            <Card title="Filters" icon={Filter}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Month</label>
                        <input
                            type="month"
                            value={filters.month}
                            onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value, startDate: '', endDate: '' }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value, month: '' }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={!!filters.month}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value, month: '' }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={!!filters.month}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            value={filters.category}
                            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">All Categories</option>
                            {EXPENSE_CATEGORIES.map(category => (
                                <option key={category} value={category}>
                                    {category.replace('_', ' ')}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => setFilters({ startDate: '', endDate: '', category: '', month: '' })}
                            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </Card>



            {/* Expenses Table */}
            <Card title="Expenses" icon={History} noPadding>
                {listLoading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="text-gray-500 mt-2">Loading expenses...</p>
                    </div>
                ) : expenses.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <History size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No expenses found</p>
                        <p className="text-sm text-gray-400 mt-1">
                            Add your first expense to get started
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Title
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Details
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {expenses.map((expense) => (
                                        <tr key={expense._id || expense.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(expense.date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {expense.title}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                                    {expense.category.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {expense.category === 'LAB_MATERIALS' ? (
                                                    <div className="text-xs">
                                                        <div>Qty: {expense.quantity} {expense.unit}</div>
                                                        <div>Supplier: {expense.supplier}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-red-600">
                                                {formatCurrency(expense.amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(expense)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(expense._id || expense.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="px-6 py-3 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                                        {pagination.total} results
                                    </div>
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                            disabled={pagination.page === 1}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Previous
                                        </button>
                                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                            const pageNum = i + 1;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                                                    className={`px-3 py-1 text-sm border rounded-md ${pagination.page === pageNum
                                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                                        : 'border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        <button
                                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                            disabled={pagination.page === pagination.totalPages}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Card>
        </div >
    );
};

export default ExpensesSection;
