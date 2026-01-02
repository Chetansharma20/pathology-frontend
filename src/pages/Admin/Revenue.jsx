import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import { TrendingUp, Calendar, DollarSign, Filter, Download } from 'lucide-react';
import { getRevenueStats, getRevenueAnalytics } from '../../api/admin/revenue.api';
import { getBillById } from '../../api/admin/billing.api';
import { useToast } from '../../contexts/ToastContext';
import { X, FileText, User, CreditCard } from 'lucide-react';

const BillDetailModal = ({ bill, onClose }) => {
    if (!bill) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <FileText className="text-indigo-600" size={24} />
                            Bill Details
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Invoice #{bill.billNumber}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Patient & Doctor Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-gray-900 font-semibold">
                                <User size={18} className="text-blue-600" />
                                Patient Information
                            </div>
                            <div className="text-sm space-y-1 text-gray-600 pl-6">
                                <p><span className="font-medium text-gray-700">Name:</span> {bill.patientId?.fullName || "N/A"}</p>
                                <p><span className="font-medium text-gray-700">Phone:</span> {bill.patientId?.phone || "N/A"}</p>
                                <p><span className="font-medium text-gray-700">Age/Gender:</span> {bill.patientId?.age} / {bill.patientId?.gender}</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-gray-900 font-semibold">
                                <User size={18} className="text-purple-600" />
                                Doctor Information
                            </div>
                            <div className="text-sm space-y-1 text-gray-600 pl-6">
                                <p><span className="font-medium text-gray-700">Ref. By:</span> {bill.testOrderId?.doctor?.name || "Self"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Test Items */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Test Items</h4>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-gray-500">Test Name</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-500">Price</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {bill.items?.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-3 text-gray-900">{item.testName || item.name}</td>
                                            <td className="px-4 py-3 text-right text-gray-600">₹{item.price}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50 font-semibold">
                                    <tr>
                                        <td className="px-4 py-3 text-gray-900">Total Amount</td>
                                        <td className="px-4 py-3 text-right text-indigo-600">₹{bill.totalAmount}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Payment Status */}
                    <div className="flex items-center justify-between p-4 border border-green-100 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <CreditCard className="text-green-600" size={24} />
                            <div>
                                <p className="font-semibold text-green-900">Payment Status</p>
                                <p className="text-sm text-green-700 capitalize">
                                    {bill.status || "Paid"}
                                    {bill.paymentId?.paymentMethod && ` via ${bill.paymentId.paymentMethod}`}
                                </p>
                                <p className="text-xs text-green-600 mt-0.5">
                                    {new Date(bill.createdAt).toLocaleDateString()} at {new Date(bill.createdAt).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-green-700">₹{bill.totalAmount}</span>
                            {bill.paymentId?.transactionId && (
                                <p className="text-xs text-green-600 mt-1">Txn: {bill.paymentId.transactionId}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BillListModal = ({ date, bills, onClose, onViewBill, pagination, onPageChange, isLoading }) => {
    // If we're loading initially and have no bills, show a loader or just the modal shell
    // But usually we prefer showing the modal with a spinner inside
    if (!bills && !isLoading) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Bills for {date}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {pagination?.totalRecords || 0} bills found
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="overflow-y-auto p-4 flex-1 relative">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    )}
                    <div className="space-y-3">
                        {bills.map((item, index) => {
                            // Provide fallback if item is a Revenue doc with populated billId or just a raw bill
                            const bill = item.billId || item;
                            console.log('Bill item:', bill); // Debug log

                            return (
                                <div
                                    key={bill._id || index}
                                    onClick={() => {
                                        console.log('Clicking bill with ID:', bill._id);
                                        onViewBill(bill._id);
                                    }}
                                    className="p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-900">{bill.billNumber}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${bill.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {bill.status || 'PAID'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                                                <User size={14} />
                                                {bill.patientId?.fullName || "Unknown Patient"}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-indigo-600">₹{bill.totalAmount || bill.amount}</p>
                                            <p className="text-xs text-indigo-600 group-hover:underline mt-1">View Details →</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        {bills.length === 0 && !isLoading && (
                            <p className="text-center text-gray-500 py-4">No bills found for this page.</p>
                        )}
                    </div>
                </div>

                {/* Pagination Controls */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                        <button
                            disabled={pagination.currentPage === 1 || isLoading}
                            onClick={() => onPageChange(pagination.currentPage - 1)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-600">
                            Page {pagination.currentPage} of {pagination.totalPages}
                        </span>
                        <button
                            disabled={pagination.currentPage === pagination.totalPages || isLoading}
                            onClick={() => onPageChange(pagination.currentPage + 1)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

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

    // Modal states
    const [selectedDateBills, setSelectedDateBills] = useState([]);
    const [selectedDateLabel, setSelectedDateLabel] = useState("");
    const [openListModal, setOpenListModal] = useState(false);

    // Pagination state for modal
    const [listLoading, setListLoading] = useState(false);
    const [listPagination, setListPagination] = useState({ currentPage: 1, totalPages: 1 });
    const [currentSelectedDate, setCurrentSelectedDate] = useState(null); // format: YYYY-MM-DD

    const [selectedBill, setSelectedBill] = useState(null);
    const [loadingBill, setLoadingBill] = useState(false);

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
            const response = await getRevenueAnalytics(selectedYear, viewMode === 'daily' ? selectedMonth : undefined);

            if (response && response.data) {
                // The new analytics API returns { yearlyTotal, monthly, daily }
                // Select the appropriate array based on viewMode
                const data = viewMode === 'monthly' ? response.data.monthly : response.data.daily;
                setRevenueData(Array.isArray(data) ? data : []);
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

    const fetchDailyBills = async (dateStr, page = 1) => {
        setListLoading(true);
        try {
            // dateStr is YYYY-MM-DD
            const response = await getRevenueStats({
                startDate: dateStr,
                endDate: dateStr,
                page,
                limit: 10
            });

            if (response && response.data && response.data.data) {
                // response.data.data is the array of revenues with populated billId
                setSelectedDateBills(response.data.data || []);
                setListPagination({
                    currentPage: response.data.pagination?.currentPage || 1,
                    totalPages: response.data.pagination?.totalPages || 1,
                    totalRecords: response.data.pagination?.totalRecords || 0
                });
            }
        } catch (error) {
            showToast("Failed to fetch bills", "error");
            console.error(error);
        } finally {
            setListLoading(false);
        }
    };

    const handleRowClick = (item) => {
        if (viewMode === 'daily') {
            const dateStr = `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`;
            const label = `${item._id.day}/${item._id.month}/${item._id.year}`;

            setSelectedDateLabel(label);
            setCurrentSelectedDate(dateStr);
            setOpenListModal(true);

            // Allow state to update first, but here we can just pass dateStr directly
            fetchDailyBills(dateStr, 1);
        }
    };

    const handlePageChange = (newPage) => {
        if (currentSelectedDate) {
            fetchDailyBills(currentSelectedDate, newPage);
        }
    };

    const handleViewBill = async (billId) => {
        setLoadingBill(true);
        try {
            // Note: billId could be the actual bill object or ID strings depending on where it comes from
            const id = typeof billId === 'object' ? billId._id : billId;
            const response = await getBillById(id);
            if (response && response.data) {
                setSelectedBill(response.data);
            }
        } catch (error) {
            showToast("Failed to fetch bill details", "error");
        } finally {
            setLoadingBill(false);
        }
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
                                        <tr
                                            key={index}
                                            onClick={() => handleRowClick(item)}
                                            className={`hover:bg-gray-50 transition-colors ${viewMode === 'daily' ? 'cursor-pointer' : ''}`}
                                        >
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
            {/* Modals */}
            {openListModal && (
                <BillListModal
                    date={selectedDateLabel}
                    bills={selectedDateBills}
                    onClose={() => setOpenListModal(false)}
                    onViewBill={handleViewBill}
                    pagination={listPagination}
                    onPageChange={handlePageChange}
                    isLoading={listLoading}
                />
            )}

            <BillDetailModal
                bill={selectedBill}
                onClose={() => setSelectedBill(null)}
            />
        </div>
    );
};

export default Revenue;
