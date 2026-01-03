import React from 'react';
import { FileText, Clock, CheckCircle, AlertCircle, Calendar, Download, Mail } from 'lucide-react';

const PatientHistoryList = ({ history, onSelectReport, onDownloadReport, onSendEmail, isLoading }) => {
    const { orders = [], reports = [] } = history || {};

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-slate-100 rounded-xl"></div>
                ))}
            </div>
        );
    }

    if (!history || (orders.length === 0 && reports.length === 0)) {
        return (
            <div className="text-center py-10 text-slate-400">
                <FileText className="mx-auto mb-3 opacity-50" size={48} />
                <p>No test history found for this patient.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Active Orders */}
            {orders.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Clock size={14} /> Active Orders
                    </h3>
                    {orders.map(order => (
                        <div key={order._id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">
                                        {order.tests?.map(t => t.testName).join(', ') || 'Unknown Test'}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                        <Calendar size={12} />
                                        {new Date(order.orderDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg capitalize">
                                    {order.overallStatus?.toLowerCase().replace('_', ' ')}
                                </span>
                            </div>
                            <div className="text-xs text-slate-500">
                                Doctor: <span className="font-medium text-slate-700">{order.doctor?.name || 'N/A'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Completed Reports */}
            {reports.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle size={14} /> Completed Reports
                    </h3>
                    {reports.map(report => (
                        <div
                            key={report._id}
                            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div
                                    onClick={() => onSelectReport(report)}
                                    className="cursor-pointer flex-1"
                                >
                                    <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors">
                                        {report.tests?.map(t => t.testName).join(', ') || 'Diagnostic Report'}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                        <Calendar size={12} />
                                        {new Date(report.orderDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-1">
                                        <CheckCircle size={12} /> Completed
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDownloadReport(report);
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Download PDF"
                                    >
                                        <Download size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSendEmail(report.patientId?._id || report.patientId);
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Send via Email"
                                    >
                                        <Mail size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="text-xs text-slate-500">
                                Doctor: <span className="font-medium text-slate-700">{report.doctor?.name || 'N/A'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PatientHistoryList;
