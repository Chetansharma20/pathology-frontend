import React from 'react';
import Card from '../../../components/ui/Card';
import { UserCheck, Download, FileText, Mail } from 'lucide-react';

const ReportControls = ({
    patients,
    selectedPatientId,
    onPatientSelect,
    reportData,
    onDownloadPDF,
    onSendEmail,
    isLoading
}) => {
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredPatients = patients.filter(p =>
        (p.fullName || p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.phone || p.mobile || '').includes(searchTerm) ||
        (p._id || p.id || '').includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <Card title="Patient Selection" icon={UserCheck} className="h-[500px] flex flex-col">
                <div className="space-y-4 flex-1 flex flex-col min-h-0">
                    {/* Search Input */}
                    <div>
                        <input
                            type="text"
                            placeholder="Search patients..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Patient List */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {filteredPatients.length > 0 ? (
                            filteredPatients.map(p => (
                                <div
                                    key={p._id || p.id}
                                    onClick={() => !isLoading && onPatientSelect(p._id || p.id)}
                                    className={`p-3 rounded-xl cursor-pointer transition-all border ${selectedPatientId === (p._id || p.id)
                                        ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                                        : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className={`font-bold text-sm ${selectedPatientId === (p._id || p.id) ? 'text-indigo-700' : 'text-slate-700'
                                                }`}>
                                                {p.fullName || p.name}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {p.phone || p.mobile || 'No phone'}
                                            </p>
                                        </div>
                                        {selectedPatientId === (p._id || p.id) && (
                                            <div className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5"></div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-400 text-sm">
                                No patients found
                            </div>
                        )}
                    </div>
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

                    <button
                        onClick={onSendEmail}
                        disabled={!reportData || isLoading}
                        className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all ${reportData && !isLoading
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg hover:shadow-xl'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        <Mail size={18} />
                        Send Via Email
                    </button>

                    {reportData && (
                        <div className="text-center">
                            <p className="text-xs text-slate-500 font-medium mb-2">Report Details</p>
                            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
                                <p><span className="font-bold">ID:</span> {reportData._id?.slice(-8) || reportData.id || '-'}</p>
                                <p><span className="font-bold">Date:</span> {reportData.orderDate ? new Date(reportData.orderDate).toLocaleDateString() : '-'}</p>
                                <p><span className="font-bold">Tests:</span> {reportData.tests?.length || 0}</p>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ReportControls;
