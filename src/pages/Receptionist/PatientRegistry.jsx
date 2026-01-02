
import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { Database, Edit3, UserPlus, Filter, Trash2, Eye, X, Microscope } from 'lucide-react';
import { getPatients, createPatient, updatePatient, deletePatient, getPatientById } from '../../api/receptionist/patient.api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useData } from '../../contexts/DataContext';
import { useNavigate } from 'react-router-dom';

const PatientRegistry = () => {
    const { user } = useAuth();
    const { showToast, showConfirm } = useToast();
    const { refreshTodayPatients } = useData();
    const navigate = useNavigate();

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
    const [showForm, setShowForm] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedPatientDetail, setSelectedPatientDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

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
                refreshTodayPatients();
            }

            // Reset and Refresh
            setPatientForm({ id: null, name: '', phone: '', age: '', gender: 'Male', address: '', email: '', dateOfBirth: '' });
            setShowForm(false);
            fetchPatients();

        } catch (err) {
            console.error("CRUD Error", err);
            showToast(err.message || "Failed to save patient", "error");
        } finally {
            setSubmitting(false);
        }
    };

    // Handle delete
    const handleDelete = (id) => {
        showConfirm('Are you sure you want to delete this patient record?', async () => {
            try {
                await deletePatient(id);
                showToast('Patient deleted successfully', 'success');
                refreshTodayPatients();
                fetchPatients();
            } catch (error) {
                console.error('Delete error', error);
                showToast(error.message || 'Failed to delete patient', 'error');
            }
        });
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
        setShowForm(true);
        // Scroll to top to see form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-IN');
    };

    // Handle view detail
    const handleViewDetail = async (id) => {
        try {
            setDetailLoading(true);
            setShowDetailModal(true);
            const response = await getPatientById(id);
            if (response.data) {
                setSelectedPatientDetail(response.data);
            }
        } catch (error) {
            showToast('Failed to fetch patient details', 'error');
            setShowDetailModal(false);
        } finally {
            setDetailLoading(false);
        }
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
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setPatientForm({ id: null, name: '', phone: '', age: '', gender: 'Male', address: '', email: '', dateOfBirth: '' });
                            setShowForm(!showForm);
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                        style={{
                            backgroundColor: showForm && !patientForm.id ? 'var(--button-secondary)' : 'var(--accent-indigo)',
                            color: showForm && !patientForm.id ? 'var(--text-primary)' : 'var(--text-inverse)',
                            border: showForm && !patientForm.id ? '1px solid var(--border-primary)' : 'none'
                        }}
                    >
                        <UserPlus size={18} />
                        {showForm && !patientForm.id ? 'Hide Form' : 'Register Patient'}
                    </button>
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
            </div>

            {/* Add Patient Form (Receptionist Only) */}
            {user && (user.role === 'Operator' || user.role === 'Admin') && showForm && (
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
                            <button
                                type="button"
                                onClick={() => {
                                    setPatientForm({ id: null, name: '', phone: '', age: '', gender: 'Male', address: '', email: '', dateOfBirth: '' });
                                    setShowForm(false);
                                }}
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
                        </div>
                    </form>
                </Card>
            )}

            {/* Filters */}
            {/* Patient Detail Modal */}
            {showDetailModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl">
                        <div className="p-6 border-b bg-indigo-600 text-white flex justify-between items-center">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Database size={24} />
                                Patient Details
                            </h3>
                            <button onClick={() => { setShowDetailModal(false); setSelectedPatientDetail(null); }} className="hover:bg-indigo-700 p-1 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                            {detailLoading ? (
                                <div className="py-12 text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                                    <p className="text-gray-500 mt-4">Retrieving patient record...</p>
                                </div>
                            ) : selectedPatientDetail ? (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-indigo-100 p-4 rounded-full text-indigo-600">
                                            <UserPlus size={32} />
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-bold text-gray-900">{selectedPatientDetail.fullName}</h4>
                                            <p className="text-indigo-600 font-medium">Patient ID: {selectedPatientDetail._id}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Age</p>
                                            <p className="text-xl font-bold text-gray-900">{selectedPatientDetail.age} Years</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Gender</p>
                                            <p className="text-xl font-bold text-gray-900">{selectedPatientDetail.gender}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${selectedPatientDetail.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {selectedPatientDetail.isActive ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Phone Number</p>
                                            <p className="text-gray-900 font-medium font-mono">{selectedPatientDetail.phone || 'N/A'}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Email Address</p>
                                            <p className="text-gray-900 font-medium break-all">{selectedPatientDetail.email || 'No email registered'}</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Residential Address</p>
                                        <p className="text-gray-700 leading-relaxed">
                                            {selectedPatientDetail.address?.street}
                                            {selectedPatientDetail.address?.city && `, ${selectedPatientDetail.address.city}`}
                                            {selectedPatientDetail.address?.state && `, ${selectedPatientDetail.address.state}`}
                                            {selectedPatientDetail.address?.pincode && ` - ${selectedPatientDetail.address.pincode}`}
                                            {!selectedPatientDetail.address?.street && (selectedPatientDetail.address || 'Address not provided')}
                                        </p>
                                    </div>

                                    {selectedPatientDetail.dateOfBirth && (
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Date of Birth</p>
                                            <p className="text-gray-900 font-medium">{new Date(selectedPatientDetail.dateOfBirth).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                    )}

                                    <div className="border-t pt-4 grid grid-cols-2 gap-4">
                                        <div className="text-xs text-gray-400">
                                            <p className="font-semibold text-gray-500 mb-1">Registered At</p>
                                            <p>{new Date(selectedPatientDetail.createdAt).toLocaleString()}</p>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            <p className="font-semibold text-gray-500 mb-1">Last Updated</p>
                                            <p>{new Date(selectedPatientDetail.updatedAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 italic">
                                    Patient information is unavailable at the moment.
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-gray-50 border-t flex justify-end">
                            <button
                                onClick={() => { setShowDetailModal(false); setSelectedPatientDetail(null); }}
                                className="px-8 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-bold tracking-wide"
                            >
                                CLOSE
                            </button>
                        </div>
                    </div>
                </div>
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
                    {/* <div>
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
                    </div> */}
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
                                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Report Status
                                        </th> */}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Last Updated
                                        </th>
                                        {user && (user.role === 'Operator' || user.role === 'Admin') && (
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
                                            {/* <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${patient.reportStatus === 'generated' ? 'bg-green-100 text-green-800' :
                                                    patient.reportStatus === 'sent' ? 'bg-blue-100 text-blue-800' :
                                                        patient.reportStatus === 'failed' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {patient.reportStatus || 'pending'}
                                                </span>
                                            </td> */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(patient.updatedAt || patient.createdAt)}
                                            </td>
                                            {user && (user.role === 'Operator' || user.role === 'Admin') && (
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-3">
                                                        {user.role === 'Operator' && (
                                                            <button
                                                                onClick={() => navigate('/assign-tests', { state: { patientId: patient._id || patient.id } })}
                                                                className="text-emerald-600 hover:text-emerald-900 transition-colors"
                                                                title="Assign New Tests"
                                                            >
                                                                <Microscope size={18} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleViewDetail(patient._id || patient.id)}
                                                            className="text-blue-600 hover:text-blue-900 transition-colors"
                                                            title="View Patient Details"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleLocalEdit(patient)}
                                                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                                            title="Edit Patient"
                                                        >
                                                            <Edit3 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(patient._id || patient.id)}
                                                            className="text-red-500 hover:text-red-700 transition-colors"
                                                            title="Delete Patient"
                                                        >
                                                            <Trash2 size={18} />
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
        </div >
    );
};

export default PatientRegistry;
