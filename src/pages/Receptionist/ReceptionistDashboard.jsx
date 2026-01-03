import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import { Calendar, Users, UserPlus, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { getDailyPatient } from '../../api/receptionist/patient.api';
import { useToast } from '../../contexts/ToastContext';

const ReceptionistDashboard = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const today = new Date();
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1); // 1-indexed
    const [dailyData, setDailyData] = useState([]);
    const [loading, setLoading] = useState(true);

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Fetch daily patient data
    const fetchDailyData = async () => {
        try {
            setLoading(true);
            const data = await getDailyPatient(selectedYear, selectedMonth);
            setDailyData(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching daily data:', error);
            showToast('Failed to fetch daily data', 'error');
            setDailyData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDailyData();
    }, [selectedYear, selectedMonth]);

    // Calculate today's patients
    const todayDay = today.getDate();
    const todayPatients = dailyData.find(d => d._id?.day === todayDay)?.totalPatients || 0;

    // Calculate total patients for the month
    const totalMonthPatients = dailyData.reduce((sum, d) => sum + (d.totalPatients || 0), 0);

    // Navigation handlers
    const handlePrevMonth = () => {
        if (selectedMonth === 1) {
            setSelectedMonth(12);
            setSelectedYear(selectedYear - 1);
        } else {
            setSelectedMonth(selectedMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (selectedMonth === 12) {
            setSelectedMonth(1);
            setSelectedYear(selectedYear + 1);
        } else {
            setSelectedMonth(selectedMonth + 1);
        }
    };

    // Generate calendar grid
    const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month - 1, 1).getDay();

    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);

    const calendarDays = [];
    // Empty cells for days before the first day
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null);
    }
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const patientCount = dailyData.find(d => d._id?.day === day)?.totalPatients || 0;
        calendarDays.push({ day, count: patientCount });
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                        Receptionist Dashboard
                    </h2>
                    <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                        Overview of patient visits and activity
                    </p>
                </div>
                <button
                    onClick={() => navigate('/patients/add')}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-colors"
                    style={{ backgroundColor: 'var(--accent-indigo)', color: 'var(--text-inverse)' }}
                >
                    <UserPlus size={18} />
                    Add New Patient
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card noPadding>
                    <div className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
                            <Users size={28} className="text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                Today's Patients
                            </p>
                            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                {loading ? '...' : todayPatients}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card noPadding>
                    <div className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                            <Calendar size={28} className="text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                This Month
                            </p>
                            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                {loading ? '...' : totalMonthPatients}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card noPadding>
                    <div className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                            <FileText size={28} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                Days with Visits
                            </p>
                            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                {loading ? '...' : dailyData.length}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Calendar View */}
            <Card title="Daily Patient Visits" icon={Calendar}>
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {monthNames[selectedMonth - 1]} {selectedYear}
                    </h3>
                    <button
                        onClick={handleNextMonth}
                        className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="text-gray-500 mt-2">Loading data...</p>
                    </div>
                ) : (
                    <>
                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-2">
                            {/* Day Headers */}
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                                    {day}
                                </div>
                            ))}

                            {/* Calendar Days */}
                            {calendarDays.map((dayData, index) => (
                                <div
                                    key={index}
                                    className={`p-2 min-h-[60px] rounded-lg border transition-all ${dayData === null
                                            ? 'border-transparent'
                                            : dayData.day === todayDay && selectedMonth === (today.getMonth() + 1) && selectedYear === today.getFullYear()
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    {dayData && (
                                        <>
                                            <div className={`text-sm font-medium ${dayData.day === todayDay && selectedMonth === (today.getMonth() + 1) && selectedYear === today.getFullYear()
                                                    ? 'text-indigo-600'
                                                    : 'text-gray-700'
                                                }`}>
                                                {dayData.day}
                                            </div>
                                            {dayData.count > 0 && (
                                                <div className="mt-1">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                        {dayData.count} {dayData.count === 1 ? 'patient' : 'patients'}
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => navigate('/patients')}
                    className="p-4 rounded-xl border transition-all hover:shadow-md text-left"
                    style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-card)' }}
                >
                    <Users size={24} className="text-indigo-600 mb-2" />
                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>View All Patients</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Browse and manage patient records
                    </p>
                </button>

                <button
                    onClick={() => navigate('/patients/add')}
                    className="p-4 rounded-xl border transition-all hover:shadow-md text-left"
                    style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-card)' }}
                >
                    <UserPlus size={24} className="text-emerald-600 mb-2" />
                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Register New Patient</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Add a new patient to the system
                    </p>
                </button>
            </div>
        </div>
    );
};

export default ReceptionistDashboard;
