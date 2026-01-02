import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { DollarSign, Filter, Calendar, TrendingUp, Eye } from 'lucide-react';
import { getRevenueStats } from '../../api/admin/revenue.api';
import { useToast } from '../../contexts/ToastContext';

const RevenueList = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [revenues, setRevenues] = useState([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalCommission: 0,
        netRevenue: 0,
        count: 0
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        totalRecords: 0,
        limit: 10
    });
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: ''
    });

    // Fetch revenue list
    const fetchRevenues = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.currentPage,
                limit: pagination.limit,
                startDate: filters.startDate,
                endDate: filters.endDate
            };

            const response = await getRevenueStats(params);

            if (response && response.data) {
                setStats(response.data.stats || stats);
                setRevenues(response.data.data || []);
                setPagination(prev => ({
                    ...prev,
                    totalPages: response.data.pagination?.totalPages || 0,
                    totalRecords: response.data.pagination?.totalRecords || 0
                }));
            }
        } catch (error) {
            showToast('Failed to fetch revenue list', 'error');
            console.error('Error fetching revenues:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRevenues();
    }, [pagination.currentPage, filters]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, currentPage: newPage }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
    };

    const clearFilters = () => {
        setFilters({ startDate: '', endDate: '' });
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Revenue Records</h2>
                    <p className="text-slate-600 mt-1">Detailed list of all revenue transactions</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
                            <p className="text-xl font-bold text-emerald-600 mt-1">
                                {formatCurrency(stats.totalRevenue)}
                            </p>
                        </div>
                        <div className="p-2 bg-emerald-50 rounded-lg">
                            <TrendingUp className="text-emerald-600" size={20} />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Commission</p>
                            <p className="text-xl font-bold text-orange-600 mt-1">
                                {formatCurrency(stats.totalCommission)}
                            </p>
                        </div>
                        <div className="p-2 bg-orange-50 rounded-lg">
                            <DollarSign className="text-orange-600" size={20} />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Net Revenue</p>
                            <p className="text-xl font-bold text-indigo-600 mt-1">
                                {formatCurrency(stats.netRevenue)}
                            </p>
                        </div>
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <TrendingUp className="text-indigo-600" size={20} />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Total Records</p>
                            <p className="text-xl font-bold text-blue-600 mt-1">
                                {stats.count || 0}
                            </p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Eye className="text-blue-600" size={20} />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card title="Filters" icon={Filter}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={clearFilters}
                            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </Card>

            {/* Revenue Table */}
            <Card title="Revenue Transactions" icon={DollarSign} noPadding>
                <div className="min-h-[450px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center pt-24">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            <p className="text-gray-500 mt-2">Loading revenues...</p>
                        </div>
                    ) : revenues.length === 0 ? (
                        <div className="flex flex-col items-center justify-center pt-24 text-gray-500">
                            <DollarSign size={48} className="mb-4 opacity-50" />
                            <p>No revenue records found</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Revenue records will appear here once bills are paid
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date & Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Bill ID
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Amount
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Commission
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Net Revenue
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {revenues.map((revenue) => (
                                        <tr key={revenue._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div>{formatDate(revenue.createdAt)}</div>
                                                <div className="text-xs text-gray-500">{formatTime(revenue.createdAt)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {revenue.billId?._id?.substring(0, 8) || 'N/A'}...
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-emerald-600">
                                                {formatCurrency(revenue.totalAmount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-orange-600">
                                                {formatCurrency(revenue.commissionAmount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-indigo-600">
                                                {formatCurrency(revenue.netRevenue)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                            {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} of{' '}
                            {pagination.totalRecords} results
                        </div>
                        <div className="flex space-x-1">
                            <button
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`px-3 py-1 text-sm border rounded-md ${pagination.currentPage === pageNum
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage === pagination.totalPages}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default RevenueList;
