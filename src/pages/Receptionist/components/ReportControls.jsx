
import React from 'react';
import Card from '../../../components/ui/Card';
import { UserCheck, Download, FileText } from 'lucide-react';

const ReportControls = ({
    patients,
    selectedPatientId,
    onPatientSelect,
    reportData,
    onDownloadPDF,
    isLoading
}) => {
    return (
        <div className="space-y-6">
            <Card title="Patient Selection" icon={UserCheck}>
                <div className="space-y-4">
                    <select
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        value={selectedPatientId}
                        onChange={(e) => onPatientSelect(e.target.value)}
                        disabled={isLoading}
                    >
                        <option value="">Select Patient...</option>
                        {patients.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.name} ({p.id})
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-slate-500 font-medium">
                        Choose a patient to view their diagnostic reports
                    </p>
                </div>
            </Card>

            <Card title="Report Actions" icon={FileText}>
                <div className="space-y-4">
                    <button
                        onClick={onDownloadPDF}
                        disabled={!reportData || isLoading}
                        className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all ${reportData && !isLoading
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        <Download size={18} />
                        Download PDF
                    </button>

                    {reportData && (
                        <div className="text-center">
                            <p className="text-xs text-slate-500 font-medium mb-2">Report Details</p>
                            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
                                <p><span className="font-bold">ID:</span> {reportData.id}</p>
                                <p><span className="font-bold">Date:</span> {reportData.date}</p>
                                <p><span className="font-bold">Tests:</span> {reportData.items?.length || 0}</p>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ReportControls;
