
import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import ReportControls from './components/ReportControls';
import ReportPreview from './components/ReportPreview';
import { Loader2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';

// Mock API function - in a real app this would call the backend
const fetchPatientReport = async (patientId, reports, patients) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Find the patient by ID
    const patient = patients.find(p => p._id === patientId || p.id === patientId);
    if (!patient) {
        throw new Error('Patient not found');
    }

    // Find reports for this patient by matching patient name (or ID if available)
    const patientReports = reports.filter(r => r.patientName === (patient.fullName || patient.name));

    if (patientReports.length === 0) {
        return null; // Return null for empty data instead of throwing error
    }

    // Return the most recent report
    return patientReports.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
};

const ReportsPage = () => {
    const { patients = [], reports = [], labConfig } = useData();
    const { showToast } = useToast();

    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handlePatientSelect = async (patientId) => {
        if (!patientId) {
            setReportData(null);
            setError(null);
            return;
        }

        setSelectedPatientId(patientId);
        setIsLoading(true);
        setError(null);

        try {
            // In a real app we'd fetch from API: await getReport(patientId)
            // Here we filter the global 'reports' state from Context
            const report = await fetchPatientReport(patientId, reports, patients);
            setReportData(report);
            if (report) {
                showToast('Report loaded successfully');
            } else {
                showToast('No reports found for this patient', 'info');
            }
        } catch (err) {
            setError(err.message);
            setReportData(null);
            showToast(err.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPDF = () => {
        if (!reportData) return;

        // For now, we'll use window.print() as in the existing ReportModal
        // In a real implementation, you'd use jsPDF or html2canvas
        const printContent = document.getElementById('report-preview');
        if (printContent) {
            const originalContent = document.body.innerHTML;
            document.body.innerHTML = printContent.innerHTML;
            window.print();
            document.body.innerHTML = originalContent;
            window.location.reload(); // Refresh to restore the app
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in min-h-[600px]">
            {/* Sidebar - Report Controls */}
            <div className="lg:col-span-1">
                <ReportControls
                    patients={patients}
                    selectedPatientId={selectedPatientId}
                    onPatientSelect={handlePatientSelect}
                    reportData={reportData}
                    onDownloadPDF={handleDownloadPDF}
                    isLoading={isLoading}
                />
            </div>

            {/* Main Content - Report Preview */}
            <div className="lg:col-span-2">
                {isLoading ? (
                    <Card title="Loading Report" icon={Loader2} className="h-fit">
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="animate-spin text-indigo-600" size={48} />
                            <span className="ml-4 text-lg font-bold text-slate-600">Loading report...</span>
                        </div>
                    </Card>
                ) : (
                    <ReportPreview
                        reportData={reportData}
                        error={error}
                        labConfig={labConfig}
                    />
                )}
            </div>
        </div>
    );
};

export default ReportsPage;
