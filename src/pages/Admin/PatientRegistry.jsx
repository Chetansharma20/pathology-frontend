import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { Database, Edit3, UserPlus, Filter } from 'lucide-react';
import { getPatients, createPatient, updatePatient } from '../../api/receptionist/patient.api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const PatientRegistry = () => {
    const { user } = useAuth();
    const { showToast } = useToast();

    // List state
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        gender: '',
        reportStatus: ''
    });

    // Form State (Moved locally)
    const [patientForm, setPatientForm] = useState({
        id: null,
        name: '',
        phone: '',
        age: '',
        gender: 'Male',
        address: '',
        email: '',
        dateOfBirth: ''
    });

    const [submitting, setSubmitting] = useState(false);

    // Fetch patients
    const fetchPatients = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, value]) => value !== '')
                )
            };

            // In a real app, strict mode might double invoke, check api logs if needed
            const response = await getPatients(params);

            if (response.data) {
                setPatients(response.data.patients || []);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.pagination?.totalRecords || 0,
                    totalPages: response.data.pagination?.totalPages || 0
                }));
            } else {
                setPatients([]);
            }
        } catch (error) {
            showToast('Failed to fetch patients', 'error');
            console.error('Fetch patients error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, [pagination.page, filters]);

    // Handle Form Submit
    const handlePatientCRUD = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!patientForm.name || !patientForm.phone || !patientForm.age || !patientForm.gender || !patientForm.address) {
            showToast("Please fill all required fields", "warning");
            return;
        }

        setSubmitting(true);
        try {
            if (patientForm.id) {
                // Update
                await updatePatient(patientForm.id, patientForm);
                showToast("Patient updated successfully", "success");
            } else {
                // Create
                await createPatient(patientForm);
                showToast("Patient registered successfully", "success");
            }

            // Reset and Refresh
            setPatientForm({ id: null, name: '', phone: '', age: '', gender: 'Male', address: '', email: '', dateOfBirth: '' });
            fetchPatients();

        } catch (err) {
            console.error("CRUD Error", err);
            showToast(err.message || "Failed to save patient", "error");
        } finally {
            setSubmitting(false);
        }
    };

    // Handle local form operations (populate form for edit)
    const handleLocalEdit = (patient) => {
        setPatientForm({
            id: patient._id || patient.id,
            name: patient.fullName || patient.name || '',
            phone: patient.phone || '',
            age: patient.age || '',
            gender: patient.gender || 'Male',
            address: patient.address?.street ? `${patient.address.street}, ${patient.address.city || ''}` : patient.address || '',
            email: patient.email || '',
            dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : ''
        });
        // Scroll to top to see form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-IN');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2
                        className="text-2xl font-black"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Patient Registry
                    </h2>
                    <p
                        className="mt-1"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        Manage patient records and information
                    </p>
                </div>
                <div
                    className="rounded-lg px-4 py-2"
                    style={{
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-primary)'
                    }}
                >
                    <div
                        className="text-sm font-medium"
                        style={{ color: 'var(--accent-indigo)' }}
                    >
                        Total Patients
                    </div>
                    <div
                        className="text-lg font-bold"
                        style={{ color: 'var(--accent-indigo)' }}
                    >
                        {pagination.total}
                    </div>
                </div>
            </div>

            {/* Add Patient Form (Receptionist Only) */}
            {user && (user.role === 'Operator' || user.role === 'Admin') && (
                <Card title={patientForm.id ? "Edit Patient" : "Add New Patient"} icon={patientForm.id ? Edit3 : UserPlus}>
                    <form className="space-y-4" onSubmit={handlePatientCRUD}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                placeholder="Full Name"
                                value={patientForm.name}
                                onChange={e => setPatientForm({ ...patientForm, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-2xl outline-none transition-all"
                                style={{
                                    backgroundColor: 'var(--input-bg)',
                                    border: '1px solid var(--input-border)',
                                    color: 'var(--input-text)'
                                }}
                                required
                            />
                            <input
                                placeholder="Phone Number"
                                value={patientForm.phone}
                                onChange={e => setPatientForm({ ...patientForm, phone: e.target.value })}
                                className="w-full px-4 py-3 rounded-2xl outline-none transition-all"
                                style={{
                                    backgroundColor: 'var(--input-bg)',
                                    border: '1px solid var(--input-border)',
                                    color: 'var(--input-text)'
                                }}
                                required
                            />
                        </div>

                        <input
                            placeholder="Email (Optional)"
                            type="email"
                            value={patientForm.email || ''}
                            onChange={e => setPatientForm({ ...patientForm, email: e.target.value })}
                            className="w-full px-4 py-3 rounded-2xl outline-none transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                border: '1px solid var(--input-border)',
                                color: 'var(--input-text)'
                            }}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                placeholder="Age"
                                type="number"
                                min="0"
                                step="1"
                                value={patientForm.age}
                                onChange={e => {
                                    const value = e.target.value;
                                    if (value === '' || /^\d+$/.test(value)) {
                                        setPatientForm({ ...patientForm, age: value });
                                    }
                                }}
                                onBlur={e => {
                                    const value = parseInt(e.target.value) || 0;
                                    setPatientForm({ ...patientForm, age: Math.max(0, value) });
                                }}
                                className="w-full px-4 py-3 rounded-2xl outline-none transition-all"
                                style={{
                                    backgroundColor: 'var(--input-bg)',
                                    border: '1px solid var(--input-border)',
                                    color: 'var(--input-text)'
                                }}
                                required
                            />
                            <select
                                value={patientForm.gender}
                                onChange={e => setPatientForm({ ...patientForm, gender: e.target.value })}
                                className="px-4 py-3 rounded-2xl font-medium text-sm outline-none transition-all"
                                style={{
                                    backgroundColor: 'var(--input-bg)',
                                    border: '1px solid var(--input-border)',
                                    color: 'var(--input-text)'
                                }}
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            <input
                                type="date"
                                value={patientForm.dateOfBirth || ''}
                                onChange={e => setPatientForm({ ...patientForm, dateOfBirth: e.target.value })}
                                className="w-full px-4 py-3 rounded-2xl outline-none transition-all"
                                style={{
                                    backgroundColor: 'var(--input-bg)',
                                    border: '1px solid var(--input-border)',
                                    color: 'var(--input-text)'
                                }}
                            />
                        </div>

                        <textarea
                            placeholder="Address"
                            value={patientForm.address}
                            onChange={e => setPatientForm({ ...patientForm, address: e.target.value })}
                            className="w-full px-4 py-3 rounded-2xl outline-none transition-all resize-none"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                border: '1px solid var(--input-border)',
                                color: 'var(--input-text)'
                            }}
                            rows="3"
                            required
                        />

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors"
                                style={{
                                    backgroundColor: 'var(--accent-indigo)',
                                    color: 'var(--text-inverse)'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--button-primary-hover)'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--accent-indigo)'}
                            >
                                {submitting ? 'Saving...' : (patientForm.id ? 'Update Patient' : 'Register Patient')}
                            </button>
                            {patientForm.id && (
                                <button
                                    type="button"
                                    onClick={() => setPatientForm({ id: null, name: '', phone: '', age: '', gender: 'Male', address: '', email: '', dateOfBirth: '' })}
                                    className="px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
                                    style={{
                                        backgroundColor: 'var(--button-secondary)',
                                        color: 'var(--text-primary)'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--button-secondary-hover)'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--button-secondary)'}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </Card>
            )}

            {/* Filters */}
            <Card title="Filters" icon={Filter}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label
                            className="block text-sm font-medium mb-1"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="w-full px-3 py-2 rounded-md transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                border: '1px solid var(--input-border)',
                                color: 'var(--input-text)'
                            }}
                        />
                    </div>
                    <div>
                        <label
                            className="block text-sm font-medium mb-1"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Gender
                        </label>
                        <select
                            value={filters.gender}
                            onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
                            className="w-full px-3 py-2 rounded-md transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                border: '1px solid var(--input-border)',
                                color: 'var(--input-text)'
                            }}
                        >
                            <option value="">All Genders</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label
                            className="block text-sm font-medium mb-1"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Report Status
                        </label>
                        <select
                            value={filters.reportStatus}
                            onChange={(e) => setFilters(prev => ({ ...prev, reportStatus: e.target.value }))}
                            className="w-full px-3 py-2 rounded-md transition-all"
                            style={{
                                backgroundColor: 'var(--input-bg)',
                                border: '1px solid var(--input-border)',
                                color: 'var(--input-text)'
                            }}
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="generated">Generated</option>
                            <option value="sent">Sent</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => setFilters({ search: '', gender: '', reportStatus: '' })}
                            className="w-full px-4 py-2 rounded-md transition-colors"
                            style={{
                                backgroundColor: 'var(--button-secondary)',
                                color: 'var(--text-primary)'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--button-secondary-hover)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--button-secondary)'}
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </Card>

            {/* Patient List */}
            <Card title="Patient Records" icon={Database} noPadding>
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="text-gray-500 mt-2">Loading patients...</p>
                    </div>
                ) : patients.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <Database size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No patients found</p>
                        <p className="text-sm text-gray-400 mt-1">
                            {Object.values(filters).some(v => v !== '') ? 'Try adjusting your filters' : 'Patient records will appear here'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Patient ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Patient Info
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Report Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Last Updated
                                        </th>
                                        {user && user.role === 'Operator' && (
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {patients.map((patient) => (
                                        <tr key={patient._id || patient.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                                                {patient._id ? patient._id.slice(-8) : (patient.id || 'N/A')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {patient.fullName || patient.name || 'Unknown'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {patient.age ? `${patient.age} years` : ''} • {patient.gender || 'N/A'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div>{patient.phone || '-'}</div>
                                                {patient.email && (
                                                    <div className="text-xs text-gray-400">{patient.email}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${patient.reportStatus === 'generated' ? 'bg-green-100 text-green-800' :
                                                    patient.reportStatus === 'sent' ? 'bg-blue-100 text-blue-800' :
                                                        patient.reportStatus === 'failed' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {patient.reportStatus || 'pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(patient.updatedAt || patient.createdAt)}
                                            </td>
                                            {user && user.role === 'Operator' && (
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={() => handleLocalEdit(patient)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                            title="Edit Patient"
                                                        >
                                                            <Edit3 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="px-6 py-3 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                                        {pagination.total} results
                                    </div>
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                            disabled={pagination.page === 1}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Previous
                                        </button>
                                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                            const pageNum = i + Math.max(1, pagination.page - 2);
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                                                    className={`px-3 py-1 text-sm border rounded-md ${pagination.page === pageNum
                                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                                        : 'border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        <button
                                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                            disabled={pagination.page === pagination.totalPages}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Card>
        </div>
    );
};

export default PatientRegistry;
