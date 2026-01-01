
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

    const [labFormData, setLabFormData] = useState({
        name: '',
        timings: '',
        contact: '',
        address: ''
    });

    useEffect(() => {
        if (labConfig) {
            setLabFormData({
                name: labConfig.name || '',
                timings: labConfig.timings || '',
                contact: labConfig.contact || '',
                address: labConfig.address || ''
            });
        }
    }, [labConfig]);

    const [adminProfile, setAdminProfile] = useState({
        name: 'ADMIN',
        email: 'admin@digitoslab.com',
        phone: '+91 98887 77777',
        address: '123 Medical Complex, City Center'
    });
    const [showProfileModal, setShowProfileModal] = useState(false);

    const handleLabConfigSubmit = async (e) => {
        e.preventDefault();
        if (updateLabSettings) {
            updateLabSettings(labFormData);
            showToast("Lab configuration updated successfully");
        } else {
            // Fallback if function not available yet
            showToast("Lab configuration updated (Local State Only)");
        }
    };

    const handleAdminProfileSubmit = (e) => {
        e.preventDefault();
        // For now, just show success - admin profile would be saved to backend
        showToast("Admin profile updated successfully");
        setShowProfileModal(false);
    };

    return (
        <div className="max-w-4xl animate-in fade-in duration-500 mx-auto space-y-8 relative">
            {/* Profile Icon positioned on the settings page */}
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
                            <label className="text-sm font-bold text-slate-600">
                                Lab Name
                            </label>
                            <input
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                value={labFormData.name}
                                onChange={e => setLabFormData({ ...labFormData, name: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <Clock size={16} /> Working Hours
                            </label>
                            <input
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                value={labFormData.timings}
                                onChange={e => setLabFormData({ ...labFormData, timings: e.target.value })}
                            />
                        </div>
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
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                            <MapPin size={16} /> Lab Address
                        </label>
                        <textarea
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                            rows={3}
                            value={labFormData.address}
                            onChange={e => setLabFormData({ ...labFormData, address: e.target.value })}
                        />
                    </div>
                    <div className="pt-4">
                        <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">
                            Save Lab Configuration
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
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                            <Phone size={16} /> Phone Number
                                        </label>
                                        <input
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                            value={adminProfile.phone}
                                            onChange={e => setAdminProfile({ ...adminProfile, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                            <MapPin size={16} /> Address
                                        </label>
                                        <input
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                            value={adminProfile.address}
                                            onChange={e => setAdminProfile({ ...adminProfile, address: e.target.value })}
                                        />
                                    </div>
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
