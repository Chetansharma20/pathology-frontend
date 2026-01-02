
import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { TrendingDown, History, Edit3, Trash2, Upload, Calendar, Filter, Plus, Search } from 'lucide-react';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../../api/admin/expenses.api';
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

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'LAB_MATERIALS',
        date: new Date().toISOString().split('T')[0],
        labId: user?.labId || 'LAB001',
        // Dynamic fields for LAB_MATERIALS
        quantity: '',
        unit: '',
        supplier: '',
        receipt: null
    });

    const [formErrors, setFormErrors] = useState({});

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
        category: ''
    });

    // Fetch expenses
    const fetchExpenses = async () => {
        try {
            setListLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, value]) => value !== '')
                )
            };

            const response = await getExpenses(params);
            setExpenses(response.data || response.expenses || []);
            setPagination(prev => ({
                ...prev,
                total: response.total || 0,
                totalPages: response.totalPages || 0
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

    // Form validation
    const validateForm = () => {
        const errors = {};

        if (!formData.title.trim()) errors.title = 'Title is required';
        if (!formData.amount || Number(formData.amount) < 0) errors.amount = 'Amount must be >= 0';
        if (!formData.category) errors.category = 'Category is required';
        if (!formData.date) errors.date = 'Date is required';

        // Dynamic validation for LAB_MATERIALS
        if (formData.category === 'LAB_MATERIALS') {
            if (!formData.quantity || Number(formData.quantity) <= 0) errors.quantity = 'Quantity is required and must be > 0';
            if (!formData.unit.trim()) errors.unit = 'Unit is required';
            if (!formData.supplier.trim()) errors.supplier = 'Supplier is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showToast('Please correct the form errors', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const submitData = new FormData();

            // Add basic fields
            submitData.append('title', formData.title);
            submitData.append('amount', formData.amount);
            submitData.append('category', formData.category);
            submitData.append('date', formData.date);
            submitData.append('labId', formData.labId);

            // Add dynamic fields for LAB_MATERIALS
            if (formData.category === 'LAB_MATERIALS') {
                submitData.append('quantity', formData.quantity);
                submitData.append('unit', formData.unit);
                submitData.append('supplier', formData.supplier);
            }

            // Add receipt file if exists
            if (formData.receipt) {
                submitData.append('receipt', formData.receipt);
            }

            let result;
            if (editingExpense) {
                result = await updateExpense(editingExpense._id || editingExpense.id, submitData);
                showToast('Expense updated successfully');
            } else {
                result = await createExpense(submitData);
                showToast('Expense created successfully');
            }

            // Reset form and refresh list
            resetForm();
            fetchExpenses();
        } catch (error) {
            showToast(error.message || 'Failed to save expense', 'error');
            console.error('Submit expense error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            title: '',
            amount: '',
            category: 'LAB_MATERIALS',
            date: new Date().toISOString().split('T')[0],
            labId: user?.labId || 'LAB001',
            quantity: '',
            unit: '',
            supplier: '',
            receipt: null
        });
        setFormErrors({});
        setEditingExpense(null);
        setShowForm(false);
    };

    // Handle edit
    const handleEdit = (expense) => {
        setEditingExpense(expense);
        setFormData({
            title: expense.title || '',
            amount: expense.amount?.toString() || '',
            category: expense.category || 'LAB_MATERIALS',
            date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            labId: expense.labId || user?.labId || 'LAB001',
            quantity: expense.quantity?.toString() || '',
            unit: expense.unit || '',
            supplier: expense.supplier || '',
            receipt: null
        });
        setShowForm(true);
    };

    // Handle delete
    const handleDelete = async (expenseId) => {
        if (!window.confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteExpense(expenseId);
            showToast('Expense deleted successfully');
            fetchExpenses();
        } catch (error) {
            showToast('Failed to delete expense', 'error');
            console.error('Delete expense error:', error);
        }
    };

    // Handle file upload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                showToast('Please upload a valid image (JPEG/PNG) or PDF file', 'error');
                return;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                showToast('File size must be less than 5MB', 'error');
                return;
            }

            setFormData(prev => ({ ...prev, receipt: file }));
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
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                    <Plus size={16} />
                    Add Expense
                </button>
            </div>

            {/* Filters */}
            <Card title="Filters" icon={Filter}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
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
                            onClick={() => setFilters({ startDate: '', endDate: '', category: '' })}
                            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </Card>

            {/* Expense Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-semibold">
                                {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        className={`w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.title ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter expense title"
                                    />
                                    {formErrors.title && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Amount (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                        className={`w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.amount ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="0.00"
                                    />
                                    {formErrors.amount && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.amount}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category *
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                        className={`w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.category ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    >
                                        {EXPENSE_CATEGORIES.map(category => (
                                            <option key={category} value={category}>
                                                {category.replace('_', ' ')}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.category && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                        className={`w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.date ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {formErrors.date && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>
                                    )}
                                </div>
                            </div>

                            {/* Dynamic fields for LAB_MATERIALS */}
                            {formData.category === 'LAB_MATERIALS' && (
                                <div className="border-t pt-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Lab Materials Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Quantity *
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={formData.quantity}
                                                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                                                className={`w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.quantity ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                placeholder="Enter quantity"
                                            />
                                            {formErrors.quantity && (
                                                <p className="text-red-500 text-xs mt-1">{formErrors.quantity}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Unit *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.unit}
                                                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                                                className={`w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.unit ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                placeholder="e.g., kg, liters, pieces"
                                            />
                                            {formErrors.unit && (
                                                <p className="text-red-500 text-xs mt-1">{formErrors.unit}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Supplier *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.supplier}
                                                onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                                                className={`w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.supplier ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                placeholder="Supplier name"
                                            />
                                            {formErrors.supplier && (
                                                <p className="text-red-500 text-xs mt-1">{formErrors.supplier}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Receipt Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Receipt (Optional)
                                </label>
                                <div className="flex items-center space-x-4">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,application/pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="receipt-upload"
                                    />
                                    <label
                                        htmlFor="receipt-upload"
                                        className="flex items-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                                    >
                                        <Upload size={16} className="mr-2" />
                                        {formData.receipt ? formData.receipt.name : 'Choose file'}
                                    </label>
                                    {formData.receipt && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, receipt: null }))}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Accepted formats: JPEG, PNG, PDF. Max size: 5MB
                                </p>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Saving...' : (editingExpense ? 'Update Expense' : 'Create Expense')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
        </div>
    );
};

export default ExpensesSection;
