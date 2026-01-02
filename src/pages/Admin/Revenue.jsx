import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import { TrendingUp, Calendar, DollarSign, Filter, Download } from 'lucide-react';
import { getRevenueStats, getMonthlyRevenue, getDailyRevenue } from '../../api/admin/revenue.api';
import { useToast } from '../../contexts/ToastContext';

const Revenue = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('monthly'); // 'monthly' or 'daily'
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalCommission: 0,
        netRevenue: 0
    });
    const [revenueData, setRevenueData] = useState([]);

    // Fetch revenue stats
    const fetchStats = async () => {
        try {
            const response = await getRevenueStats();
            if (response && response.data && response.data.stats) {
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error fetching revenue stats:', error);
        }
    };

    // Fetch revenue data based on view mode
    const fetchRevenueData = async () => {
        setLoading(true);
        try {
            let response;
            if (viewMode === 'monthly') {
                response = await getMonthlyRevenue(selectedYear);
            } else {
                response = await getDailyRevenue(selectedYear, selectedMonth);
            }

            if (response && response.data) {
                setRevenueData(Array.isArray(response.data) ? response.data : []);
            }
        } catch (error) {
            showToast('Failed to fetch revenue data', 'error');
            console.error('Error fetching revenue data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchRevenueData();
    }, [viewMode, selectedYear, selectedMonth]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount || 0);
    };

    const getMonthName = (monthNum) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[monthNum - 1] || '';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Revenue Management</h2>
                    <p className="text-slate-600 mt-1">Track and analyze laboratory revenue</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
                            <p className="text-2xl font-bold text-emerald-600 mt-1">
                                {formatCurrency(stats.totalRevenue)}
                            </p>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-lg">
                            <TrendingUp className="text-emerald-600" size={24} />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Total Commission</p>
                            <p className="text-2xl font-bold text-orange-600 mt-1">
                                {formatCurrency(stats.totalCommission)}
                            </p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                            <DollarSign className="text-orange-600" size={24} />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Net Revenue</p>
                            <p className="text-2xl font-bold text-indigo-600 mt-1">
                                {formatCurrency(stats.netRevenue)}
                            </p>
                        </div>
                        <div className="p-3 bg-indigo-50 rounded-lg">
                            <TrendingUp className="text-indigo-600" size={24} />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card title="Filters" icon={Filter}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">View Mode</label>
                        <select
                            value={viewMode}
                            onChange={(e) => setViewMode(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="monthly">Monthly</option>
                            <option value="daily">Daily</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    {viewMode === 'daily' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                    <option key={month} value={month}>{getMonthName(month)}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </Card>

            {/* Revenue Data Table */}
            <Card title={`${viewMode === 'monthly' ? 'Monthly' : 'Daily'} Revenue Breakdown`} icon={Calendar} noPadding>
                <div className="min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center pt-24">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            <p className="text-gray-500 mt-2">Loading revenue data...</p>
                        </div>
                    ) : revenueData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center pt-24 text-gray-500">
                            <Calendar size={48} className="mb-4 opacity-50" />
                            <p>No revenue data found</p>
                            <p className="text-sm text-gray-400 mt-1">
                                {viewMode === 'monthly' ? `No data for ${selectedYear}` : `No data for ${getMonthName(selectedMonth)} ${selectedYear}`}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {viewMode === 'monthly' ? 'Month' : 'Date'}
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Revenue
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Commission
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Net Revenue
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Count
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {revenueData.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {viewMode === 'monthly'
                                                    ? getMonthName(item._id)
                                                    : `${item._id.day}/${item._id.month}/${item._id.year}`
                                                }
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-emerald-600">
                                                {formatCurrency(item.totalRevenue)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-orange-600">
                                                {formatCurrency(item.totalCommission)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-indigo-600">
                                                {formatCurrency(item.netRevenue)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                                {item.count}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default Revenue;
