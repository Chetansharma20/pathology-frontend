import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import {
    ReceiptText,
    Calendar,
    Download,
    FileText,
    Search,
    Filter,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    BarChart3,
    PieChart,
    CreditCard
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import {
    getLabBills,
    downloadBillPDF,
    getBillingReport,
    downloadBillingReport
} from '../../api/receptionist/bill.api';
import PaymentModal from './components/PaymentModal';

const BillingPage = () => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('bills'); // 'bills' or 'reports'
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Payment Modal State
    const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);

    // Report State
    const [reportType, setReportType] = useState('monthly');
    const [reportYear, setReportYear] = useState(new Date().getFullYear());
    const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
    const [reportData, setReportData] = useState([]);
    const [reportLoading, setReportLoading] = useState(false);

    // Fetch Bills
    const fetchBills = async () => {
        setLoading(true);
        try {
            const data = await getLabBills();
            setBills(Array.isArray(data) ? data : []);
        } catch (error) {
            showToast('Failed to fetch bills', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Fetch Report
    const fetchReport = async () => {
        setReportLoading(true);
        try {
            const data = await getBillingReport(reportType, reportYear, reportType === 'monthly' ? null : reportMonth);
            setReportData(Array.isArray(data) ? data : []);
        } catch (error) {
            showToast('Failed to fetch report', 'error');
        } finally {
            setReportLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'bills') {
            fetchBills();
        } else {
            fetchReport();
        }
    }, [activeTab]);

    const handlePaymentSuccess = () => {
        fetchBills();
        setSelectedBillForPayment(null);
    };

    // Handle Bill Download
    const handleDownloadBill = async (billId, billNumber) => {
        try {
            showToast(`Downloading bill ${billNumber}...`, 'info');
            await downloadBillPDF(billId);
            showToast('Download started', 'success');
        } catch (error) {
            showToast('Failed to download bill', 'error');
        }
    };

    // Handle Report Download
    const handleDownloadReport = async (format) => {
        try {
            showToast(`Downloading ${format.toUpperCase()} report...`, 'info');
            await downloadBillingReport(reportType, reportYear, reportType === 'daily' ? reportMonth : null, format);
            showToast('Download started', 'success');
        } catch (error) {
            showToast('Failed to download report', 'error');
        }
    };

    // Filtered Bills
    const filteredBills = bills.filter(bill =>
        bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.patientId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Billing & Invoices</h1>
                    <p className="text-slate-500 mt-1">Manage invoices and view financial reports</p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('bills')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'bills'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        All Bills
                    </button>
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'reports'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Financial Reports
                    </button>
                </div>
            </div>

            {activeTab === 'bills' ? (
                <div className="space-y-6">
                    {/* Search & Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by Bill # or Patient Name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                        </div>
                        <button
                            onClick={fetchBills}
                            className="px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 font-bold"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                    </div>

                    {/* Bills List */}
                    <div className="grid gap-4">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                <p className="mt-4 text-slate-500">Loading bills...</p>
                            </div>
                        ) : filteredBills.length === 0 ? (
                            <Card>
                                <div className="text-center py-12">
                                    <ReceiptText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                                    <h3 className="text-lg font-bold text-slate-700">No Bills Found</h3>
                                    <p className="text-slate-500">No invoices match your search criteria.</p>
                                </div>
                            </Card>
                        ) : (
                            filteredBills.map(bill => (
                                <div key={bill._id} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-200 transition-all shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black ${bill.status === 'PAID' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                            }`}>
                                            ₹
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">{bill.billNumber}</h3>
                                            <p className="text-sm text-slate-500">{bill.patientId?.fullName || 'Unknown Patient'}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-6 md:gap-8 w-full md:w-auto">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-400 uppercase">Date</span>
                                            <span className="text-sm font-semibold text-slate-700">
                                                {new Date(bill.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-400 uppercase">Amount</span>
                                            <span className="text-sm font-black text-slate-800">
                                                ₹{bill.totalAmount}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-400 uppercase">Status</span>
                                            <span className={`text-sm font-bold ${bill.status === 'PAID' ? 'text-emerald-600' : 'text-amber-600'
                                                }`}>
                                                {bill.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {bill.status !== 'PAID' && bill.status !== 'CANCELLED' && (
                                                <button
                                                    onClick={() => setSelectedBillForPayment(bill)}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-lg hover:shadow-indigo-200 transition-all flex items-center gap-2"
                                                >
                                                    <CreditCard size={16} />
                                                    Pay Now
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDownloadBill(bill._id, bill.billNumber)}
                                                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-2"
                                            >
                                                <Download size={16} />
                                                Invoice
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Report Controls */}
                    <Card>
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 space-y-2 w-full">
                                <label className="text-sm font-bold text-slate-700">Report Type</label>
                                <select
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    <option value="monthly">Monthly Summary (Year View)</option>
                                    <option value="daily">Daily Breakdown (Month View)</option>
                                </select>
                            </div>

                            <div className="flex-1 space-y-2 w-full">
                                <label className="text-sm font-bold text-slate-700">Year</label>
                                <select
                                    value={reportYear}
                                    onChange={(e) => setReportYear(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    {[0, 1, 2, 3, 4].map(i => {
                                        const y = new Date().getFullYear() - i;
                                        return <option key={y} value={y}>{y}</option>;
                                    })}
                                </select>
                            </div>

                            {reportType === 'daily' && (
                                <div className="flex-1 space-y-2 w-full">
                                    <label className="text-sm font-bold text-slate-700">Month</label>
                                    <select
                                        value={reportMonth}
                                        onChange={(e) => setReportMonth(e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    >
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={fetchReport}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                >
                                    <BarChart3 size={18} />
                                    Generate
                                </button>
                                <button
                                    onClick={() => handleDownloadReport('pdf')}
                                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                    title="Download PDF"
                                >
                                    <FileText size={18} />
                                </button>
                                <button
                                    onClick={() => handleDownloadReport('csv')}
                                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                    title="Download CSV"
                                >
                                    <Download size={18} />
                                </button>
                            </div>
                        </div>
                    </Card>

                    {/* Report Visualization */}
                    {reportLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                            <p className="mt-4 text-slate-500">Generating report...</p>
                        </div>
                    ) : reportData.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                            <PieChart className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                            <h3 className="text-lg font-bold text-slate-700">No Data Available</h3>
                            <p className="text-slate-500">Try changing the date range or report type.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                                    <p className="text-indigo-600 font-bold text-sm uppercase">Total Revenue</p>
                                    <h3 className="text-2xl font-black text-indigo-900 mt-1">
                                        ₹{reportData.reduce((acc, curr) => acc + curr.totalAmount, 0).toLocaleString()}
                                    </h3>
                                </div>
                                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                                    <p className="text-emerald-600 font-bold text-sm uppercase">Total Paid</p>
                                    <h3 className="text-2xl font-black text-emerald-900 mt-1">
                                        ₹{reportData.reduce((acc, curr) => acc + curr.paidAmount, 0).toLocaleString()}
                                    </h3>
                                </div>
                                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                                    <p className="text-amber-600 font-bold text-sm uppercase">Pending Amount</p>
                                    <h3 className="text-2xl font-black text-amber-900 mt-1">
                                        ₹{reportData.reduce((acc, curr) => acc + curr.pendingAmount, 0).toLocaleString()}
                                    </h3>
                                </div>
                            </div>

                            {/* Detailed Table */}
                            <Card title="Detailed Breakdown" noPadding>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                                            <tr>
                                                <th className="px-6 py-4">Period</th>
                                                <th className="px-6 py-4 text-center">Bills</th>
                                                <th className="px-6 py-4 text-right">Revenue</th>
                                                <th className="px-6 py-4 text-right">Paid</th>
                                                <th className="px-6 py-4 text-right">Pending</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {reportData.map((row, index) => (
                                                <tr key={index} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-slate-700">{row._id}</td>
                                                    <td className="px-6 py-4 text-center font-medium">{row.billCount}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-slate-800">₹{row.totalAmount.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-emerald-600">₹{row.paidAmount.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-amber-600">₹{row.pendingAmount.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            )}

            <PaymentModal
                isOpen={!!selectedBillForPayment}
                onClose={() => setSelectedBillForPayment(null)}
                bill={selectedBillForPayment}
                onSuccess={handlePaymentSuccess}
            />
        </div>
    );
};

export default BillingPage;
