
import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import { UserCheck, Microscope, Trash2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';

const TestAssignment = () => {
    const { patients = [], labTests = [], sampleQueue = [], setSampleQueue } = useData();
    const { showToast } = useToast();

    const [selectedPatient, setSelectedPatient] = useState('');
    const [assignedTests, setAssignedTests] = useState([]);

    // Use labTests from context, fallback if empty
    const availableTests = labTests.length > 0 ? labTests : [];

    const handleAssignTest = (test) => {
        if (!assignedTests.find(t => t.id === test._id || t.id === test.id)) {
            setAssignedTests([...assignedTests, { ...test, id: test._id || test.id }]);
        }
    };

    const handleRemoveTest = (testId) => {
        setAssignedTests(assignedTests.filter(t => t.id !== testId));
    };

    const handleSubmit = () => {
        if (!selectedPatient) {
            showToast('Please select a patient', 'error');
            return;
        }
        if (assignedTests.length === 0) {
            showToast('Please assign at least one test', 'error');
            return;
        }

        const patient = patients.find(p => (p._id || p.id) === selectedPatient);

        if (!patient) {
            showToast('Patient not found', 'error');
            return;
        }

        const sampleId = `S-${Date.now()}`;

        const newSample = {
            id: sampleId,
            patientId: selectedPatient,
            patientName: patient.fullName || patient.name,
            tests: assignedTests,
            status: 'pending',
            assignedDate: new Date().toLocaleDateString(),
            sampleId: sampleId
        };

        setSampleQueue([...sampleQueue, newSample]);
        showToast(`Tests assigned to ${patient.fullName || patient.name}`, 'success');

        // Reset form
        setSelectedPatient('');
        setAssignedTests([]);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
            <div className="lg:col-span-2 space-y-6">
                <Card title="Patient Selection" icon={UserCheck}>
                    {patients.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">No patients available. Add a patient first.</div>
                    ) : (
                        <select
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                            value={selectedPatient}
                            onChange={e => setSelectedPatient(e.target.value)}
                        >
                            <option value="">Choose Patient...</option>
                            {patients.map(p => (
                                <option key={p._id || p.id} value={p._id || p.id}>
                                    {p.fullName || p.name} ({p._id ? p._id.slice(-6) : p.id})
                                </option>
                            ))}
                        </select>
                    )}
                </Card>

                <Card title="Available Tests" icon={Microscope} noPadding>
                    {availableTests.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">Loading tests or no tests available...</div>
                    ) : (
                        <div className="p-6 max-h-96 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {availableTests.map(t => {
                                const tId = t._id || t.id;
                                const isAssigned = assignedTests.find(at => at.id === tId);
                                return (
                                    <button
                                        key={tId}
                                        onClick={() => handleAssignTest(t)}
                                        disabled={isAssigned}
                                        className={`p-4 border-2 rounded-2xl text-left flex justify-between items-center transition-all ${isAssigned
                                            ? 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed'
                                            : 'bg-white hover:border-indigo-400'
                                            }`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black uppercase tracking-widest truncate">{t.name}</p>
                                            <p className="text-[8px] text-slate-500 font-bold mt-1">{t.category}</p>
                                        </div>
                                        <p className="font-black text-sm ml-2">₹{t.price}</p>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </Card>
            </div>

            <Card title="Assigned Tests" icon={Microscope} className="h-fit">
                <div className="space-y-4">
                    {assignedTests.map(test => (
                        <div key={test.id} className="flex justify-between items-center bg-white p-4 rounded-2xl border">
                            <div>
                                <p className="font-black text-sm uppercase tracking-tight">{test.name}</p>
                                <p className="text-[10px] text-slate-500 font-bold">{test.category}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-indigo-600">₹{test.price}</span>
                                <button
                                    onClick={() => handleRemoveTest(test.id)}
                                    className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {assignedTests.length === 0 && (
                        <div className="text-center text-slate-400 italic py-8">
                            No tests assigned yet
                        </div>
                    )}

                    {assignedTests.length > 0 && (
                        <div className="pt-4 border-t">
                            <div className="flex justify-between text-sm font-bold mb-4">
                                <span>Total Tests:</span>
                                <span>{assignedTests.length}</span>
                            </div>
                            <div className="flex justify-between text-lg font-black mb-6">
                                <span>Total Amount:</span>
                                <span className="text-indigo-600 break-all">₹{assignedTests.reduce((sum, test) => sum + test.price, 0).toLocaleString()}</span>
                            </div>
                            <button
                                onClick={handleSubmit}
                                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold"
                            >
                                Assign Tests
                            </button>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default TestAssignment;
