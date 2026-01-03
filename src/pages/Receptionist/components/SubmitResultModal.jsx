import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Upload, AlertCircle } from 'lucide-react';
import { submitTestResult, getPatientReports } from '../../../api/receptionist/testorder.api';
import { useToast } from '../../../contexts/ToastContext';

const SubmitResultModal = ({ isOpen, onClose, orderId, testItem, patientId, onSuccess }) => {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [reportFile, setReportFile] = useState(null);

    // Initialize results from test item parameters
    useEffect(() => {
        if (testItem && testItem.results) {
            setResults(testItem.results.map(param => ({
                parameterName: param.parameterName,
                value: param.value || '',
                unit: param.unit,
                referenceRange: param.referenceRange
            })));
        }
    }, [testItem]);

    if (!isOpen || !testItem) return null;

    const handleResultChange = (index, value) => {
        const newResults = [...results];
        newResults[index].value = value;
        setResults(newResults);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setReportFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate that at least one result is entered or a file is uploaded
        const hasResults = results.some(r => r.value.trim() !== '');
        if (!hasResults && !reportFile) {
            showToast('Please enter at least one result value or upload a report file', 'error');
            return;
        }

        setIsLoading(true);
        try {
            // Prepare payload
            // Note: If file upload is needed, we might need to use FormData
            // Based on user request, the controller accepts { results, reportFileUrl } in body
            // If the backend expects a file upload, we usually need FormData. 
            // However, the user's controller code: const { results, reportFileUrl } = req.body || {};
            // This suggests it might expect a URL string (already uploaded) OR the user simplified the code.
            // Given the previous task used FormData for file upload, I will assume we might need to handle file upload separately 
            // or send FormData if the backend supports it on this route.
            // The route is /test/result/:orderId/:testItemId

            // Let's try sending JSON first as per the controller signature, 
            // but if reportFile is present, we might need a different approach.
            // For now, I'll send the results array. If file upload is strictly required to be a file object, 
            // the backend controller would need to use multer. The user's provided controller doesn't show multer usage explicitly 
            // in the snippet (unlike the previous one which had `upload.single`).
            // So I will assume for now we are just sending the results array.

            const payload = {
                results: results.filter(r => r.value.trim() !== ''),
            };

            const response = await submitTestResult(orderId, testItem._id || testItem.testId, payload);

            // Check if order is completed and fetch reports if so
            if (response.overallStatus === 'COMPLETED' && patientId) {
                try {
                    await getPatientReports(patientId);
                    showToast('Test results submitted and Report Generated');
                } catch (reportError) {
                    console.error('Error fetching reports:', reportError);
                    showToast('Results submitted, but failed to fetch report', 'warning');
                }
            } else {
                showToast('Test results submitted successfully');
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Submit error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to submit results';
            showToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">Enter Test Results</h3>
                        <p className="text-sm text-slate-500">{testItem.testName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Parameters Input */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-sm text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <FileText size={16} /> Test Parameters
                        </h4>

                        {results.length === 0 ? (
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-sm flex items-center gap-2">
                                <AlertCircle size={18} />
                                No parameters defined for this test. You can upload a report file instead.
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {results.map((param, index) => (
                                    <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="sm:col-span-4">
                                            <label className="text-sm font-bold text-slate-700 block">
                                                {param.parameterName}
                                            </label>
                                            <span className="text-xs text-slate-500">
                                                Ref: {
                                                    typeof param.referenceRange === 'object' && param.referenceRange !== null
                                                        ? `${param.referenceRange.min || ''} - ${param.referenceRange.max || ''}`
                                                        : param.referenceRange || 'N/A'
                                                }
                                            </span>
                                        </div>
                                        <div className="sm:col-span-6">
                                            <input
                                                type="text"
                                                value={param.value}
                                                onChange={(e) => handleResultChange(index, e.target.value)}
                                                placeholder={`Enter value`}
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="sm:col-span-2 text-xs font-bold text-slate-500">
                                            {param.unit}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* File Upload (Optional) */}
                    {/* 
                    <div className="space-y-2 pt-4 border-t border-slate-100">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <Upload size={16} /> Attach Report File (Optional)
                        </label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all"
                        />
                        <p className="text-xs text-slate-400">
                            Upload a PDF or image of the report if available.
                        </p>
                    </div>
                    */}

                </form>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>Saving...</>
                        ) : (
                            <>
                                <Save size={18} />
                                Submit Results
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubmitResultModal;
