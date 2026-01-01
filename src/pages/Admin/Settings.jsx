
import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { User, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

const SettingsSection = () => {
    const { labConfig, updateLabSettings } = useData();
    const { showToast } = useToast();
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);

    const [labFormData, setLabFormData] = useState({
        labName: '',
        contact: '',
        address: '',
        licenseNumber: '',
        gstNumber: '',
        panNumber: '',
        email: '',
        website: '',
        bankDetails: {
            bankName: '',
            accountNumber: '',
            ifscCode: '',
            accountName: ''
        }
    });

    useEffect(() => {
        if (labConfig) {
            setLabFormData({
                labName: labConfig.labName || '',
                contact: labConfig.contact || '',
                address: labConfig.address || '',
                licenseNumber: labConfig.licenseNumber || '',
                gstNumber: labConfig.gstNumber || '',
                panNumber: labConfig.panNumber || '',
                email: labConfig.email || '',
                website: labConfig.website || '',
                bankDetails: {
                    bankName: labConfig.bankDetails?.bankName || '',
                    accountNumber: labConfig.bankDetails?.accountNumber || '',
                    ifscCode: labConfig.bankDetails?.ifscCode || '',
                    accountName: labConfig.bankDetails?.accountName || ''
                }
            });
        }
    }, [labConfig]);

    const [adminProfile, setAdminProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '', // User model might not have phone yet, leaving for extension
        address: ''
    });

    useEffect(() => {
        if (user) {
            setAdminProfile(prev => ({
                ...prev,
                name: user.name,
                email: user.email
            }));
        }
    }, [user]);

    const [showProfileModal, setShowProfileModal] = useState(false);

    const handleLabConfigSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const result = await updateLabSettings(labFormData);
            if (result.success) {
                showToast("Lab configuration updated successfully", "success");
            } else {
                showToast(result.message || "Failed to update lab settings", "error");
            }
        } catch (error) {
            showToast("An error occurred while saving lab settings", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAdminProfileSubmit = (e) => {
        e.preventDefault();
        showToast("Admin profile updated successfully", "success");
        setShowProfileModal(false);
    };

    return (
        <div className="max-w-4xl animate-in fade-in duration-500 mx-auto space-y-8 relative">
            {/* Profile Icon */}
            <div className="absolute top-4 right-4 z-10">
                <button
                    onClick={() => setShowProfileModal(true)}
                    className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors"
                    title="Edit Admin Profile"
                >
                    <User size={20} />
                </button>
            </div>

            <Card title="Laboratory Configuration">
                <form className="space-y-6" onSubmit={handleLabConfigSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">Lab Name</label>
                            <input
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                value={labFormData.labName}
                                onChange={e => setLabFormData({ ...labFormData, labName: e.target.value.toUpperCase() })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <Phone size={16} /> Contact Number
                            </label>
                            <input
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                value={labFormData.contact}
                                onChange={e => setLabFormData({ ...labFormData, contact: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">License Number</label>
                            <input
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                value={labFormData.licenseNumber}
                                onChange={e => setLabFormData({ ...labFormData, licenseNumber: e.target.value })}
                            />
                        </div>
                        {/* <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">GST Number</label>
                            <input
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                value={labFormData.gstNumber}
                                onChange={e => setLabFormData({ ...labFormData, gstNumber: e.target.value })}
                            />
                        </div> */}
                        {/* <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">PAN Number</label>
                            <input
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                value={labFormData.panNumber}
                                onChange={e => setLabFormData({ ...labFormData, panNumber: e.target.value })}
                            />
                        </div> */}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                            <MapPin size={16} /> Lab Address
                        </label>
                        <textarea
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                            rows={2}
                            value={labFormData.address}
                            onChange={e => setLabFormData({ ...labFormData, address: e.target.value })}
                        />
                    </div>

                    <hr className="border-slate-100" />
                    <h3 className="text-md font-bold text-slate-800">Bank Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            placeholder="Bank Name"
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                            value={labFormData.bankDetails.bankName}
                            onChange={e => setLabFormData({
                                ...labFormData,
                                bankDetails: { ...labFormData.bankDetails, bankName: e.target.value }
                            })}
                        />
                        <input
                            placeholder="Account Number"
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                            value={labFormData.bankDetails.accountNumber}
                            onChange={e => setLabFormData({
                                ...labFormData,
                                bankDetails: { ...labFormData.bankDetails, accountNumber: e.target.value }
                            })}
                        />
                        <input
                            placeholder="IFSC Code"
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                            value={labFormData.bankDetails.ifscCode}
                            onChange={e => setLabFormData({
                                ...labFormData,
                                bankDetails: { ...labFormData.bankDetails, ifscCode: e.target.value }
                            })}
                        />
                        <input
                            placeholder="Account Holder Name"
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                            value={labFormData.bankDetails.accountName}
                            onChange={e => setLabFormData({
                                ...labFormData,
                                bankDetails: { ...labFormData.bankDetails, accountName: e.target.value }
                            })}
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold disabled:opacity-50"
                        >
                            {isSaving ? "Saving..." : "Save Lab Configuration"}
                        </button>
                    </div>
                </form>
            </Card>

            {/* Admin Profile Modal */}
            {showProfileModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-8">
                    <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black text-slate-800">Edit Admin Profile</h2>
                                <button
                                    onClick={() => setShowProfileModal(false)}
                                    className="w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center hover:bg-slate-200"
                                >
                                    ×
                                </button>
                            </div>

                            <form className="space-y-6" onSubmit={handleAdminProfileSubmit}>
                                <div className="text-center mb-8">
                                    <div className="w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                                        <User size={32} />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800">Lab Administrator</h3>
                                    <p className="text-slate-500 text-sm">System Administrator</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                            <User size={16} /> Full Name
                                        </label>
                                        <input
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                            value={adminProfile.name}
                                            onChange={e => setAdminProfile({ ...adminProfile, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                            <Mail size={16} /> Email Address
                                        </label>
                                        <input
                                            type="email"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                            value={adminProfile.email}
                                            onChange={e => setAdminProfile({ ...adminProfile, email: e.target.value })}
                                            disabled
                                        />
                                    </div>
                                    {/* Add more fields if needed */}
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold">
                                        Update Profile
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowProfileModal(false)}
                                        className="px-6 bg-slate-200 text-slate-700 py-3 rounded-xl font-bold"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsSection;
