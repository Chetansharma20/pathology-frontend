import React, { useState } from 'react';
import { X, Upload, FileText, Calendar, User, Stethoscope } from 'lucide-react';
import { uploadHistoricalReport } from '../../../api/receptionist/historicalReport.api';
import { useToast } from '../../../contexts/ToastContext';

const AddHistoricalReportModal = ({ isOpen, onClose, patients, onSuccess, patient }) => {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        patientId: patient ? (patient._id || patient.id) : '',
        testName: '',
        doctorName: '',
        testDate: new Date().toISOString().split('T')[0],
        reportFile: null
    });

    React.useEffect(() => {
        if (isOpen && patient) {
            setFormData(prev => ({
                ...prev,
                patientId: patient._id || patient.id
            }));
        } else if (isOpen && !patient) {
            setFormData(prev => ({
                ...prev,
                patientId: ''
            }));
        }
    }, [isOpen, patient]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, reportFile: e.target.files[0] }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.patientId || !formData.testName || !formData.reportFile) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const data = new FormData();
            data.append('patientId', formData.patientId);
            data.append('testName', formData.testName);
            data.append('doctorName', formData.doctorName);
            data.append('testDate', formData.testDate);
            data.append('reportFileUrl', formData.reportFile); // Backend expects 'reportFileUrl' for the file

            await uploadHistoricalReport(data);
            showToast('Historical report uploaded successfully');
            onSuccess();
            onClose();
            // Reset form
            setFormData({
                patientId: '',
                testName: '',
                doctorName: '',
                testDate: new Date().toISOString().split('T')[0],
                reportFile: null
            });
        } catch (error) {
            console.error('Upload error:', error);
            showToast(error.message || 'Failed to upload report', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800">Upload Historical Report</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Patient Selection */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <User size={14} /> Patient
                        </label>
                        <select
                            name="patientId"
                            value={formData.patientId}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all ${patient ? 'opacity-70 cursor-not-allowed' : ''}`}
                            required
                            disabled={!!patient}
                        >
                            <option value="">Select Patient...</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
                            ))}
                        </select>
                    </div>

                    {/* Test Name */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <FileText size={14} /> Test Name
                        </label>
                        <input
                            type="text"
                            name="testName"
                            value={formData.testName}
                            onChange={handleChange}
                            placeholder="e.g. CBC, Lipid Profile"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                            required
                        />
                    </div>

                    {/* Doctor Name */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <Stethoscope size={14} /> Doctor Name
                        </label>
                        <input
                            type="text"
                            name="doctorName"
                            value={formData.doctorName}
                            onChange={handleChange}
                            placeholder="e.g. Dr. Smith (Optional)"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        />
                    </div>

                    {/* Test Date */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <Calendar size={14} /> Test Date
                        </label>
                        <input
                            type="date"
                            name="testDate"
                            value={formData.testDate}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                            required
                        />
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <Upload size={14} /> Report File
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>Uploading...</>
                            ) : (
                                <>
                                    <Upload size={18} />
                                    Upload Report
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddHistoricalReportModal;
