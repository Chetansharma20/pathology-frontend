import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

// APIs
import { getPatients, getTodayPatients, getTotalPatientCount } from '../api/receptionist/patient.api';
import { getDoctors } from '../api/admin/doctors.api';
import { getExpenses, getExpenseStats } from '../api/admin/expenses.api';
import { getReports } from '../api/receptionist/reports.api';
import { getLabTests } from '../api/admin/labTest.api';
import { getLabDetails, updateLabDetails } from '../api/admin/lab.api';
import { getRevenueStats, getRevenueAnalytics } from '../api/admin/revenue.api';

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
    // Global Data State
    const [patients, setPatients] = useState([]);
    const [totalPatients, setTotalPatients] = useState(0);
    const [todayPatients, setTodayPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [totalDoctors, setTotalDoctors] = useState(0);
    const [expenses, setExpenses] = useState([]);
    const [reports, setReports] = useState([]);
    const [labTests, setLabTests] = useState([]);
    const [revenueStats, setRevenueStats] = useState({ totalRevenue: 0, totalCommission: 0, netRevenue: 0 });
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [todayRevenue, setTodayRevenue] = useState(0);
    const [expenseStats, setExpenseStats] = useState({ monthlyTotal: 0, yearlyTotal: 0, allTimeTotal: 0 });

    // Lab Configuration with default fallback
    const [labConfig, setLabConfig] = useState({
        labName: "DIGITOS PATHOLOGY",
        address: "CHHATRAPATI SAMBHAJINAGAR, MAHARASHTRA",
        contact: "98888 77777",
        timings: "08:00 AM - 09:00 PM"
    });

    // Loading States
    const [loading, setLoading] = useState(false);

    // Derived Metrics
    const todayDate = new Date().toLocaleDateString();

    const metrics = useMemo(() => {
        // All metrics now come from backend APIs - no frontend calculations
        // This is more efficient and keeps business logic in the backend

        // Get current month's revenue from monthly breakdown
        const currentMonth = new Date().getMonth() + 1;
        const currentMonthData = monthlyRevenue.find(m => m.month === currentMonth); // Changed from m._id to m.month
        const calculatedMonthlyRevenue = currentMonthData ? currentMonthData.totalRevenue : 0;

        return {
            // Today's revenue - from getDailyRevenue API
            dailyCollection: todayRevenue,
            // Monthly expenses - from backend expense stats
            monthlyExpenses: expenseStats.monthlyTotal || 0,
            // Total expenses - from backend expense stats (all-time)
            totalExpenses: expenseStats.allTimeTotal || 0,
            // Yearly expenses - optional but available
            yearlyExpenses: expenseStats.yearlyTotal || 0,
            // Current month revenue - from monthly breakdown API
            monthlyRevenue: calculatedMonthlyRevenue,
            // All-time total revenue - from revenue stats API
            totalRevenue: revenueStats.totalRevenue || 0,
            // Net revenue - from revenue stats API
            netRevenue: revenueStats.netRevenue || 0,
            // Commission - from revenue stats API
            totalCommission: revenueStats.totalCommission || 0
        };
    }, [revenueStats, monthlyRevenue, todayRevenue, expenseStats]);

    // Fetch Today's Patients
    const fetchTodayPatients = useCallback(async () => {
        try {
            const response = await getTodayPatients();
            if (response && response.data) {
                // Backend might return direct array or { data: [] }
                const list = Array.isArray(response.data) ? response.data : (response.data.data || []);
                setTodayPatients(list);
            }
        } catch (err) {
            console.error("Failed to fetch today's patients", err);
        }
    }, []);

    // Initial Data Fetch
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch all initial data using Promise.allSettled to prevent one failure from blocking others
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth() + 1;
            const results = await Promise.allSettled([
                getPatients(),
                getDoctors(),
                getExpenses(),
                getReports(),
                getLabTests(),
                getLabDetails(),
                getTodayPatients(),
                getRevenueStats(),
                getRevenueAnalytics(currentYear, currentMonth),
                getExpenseStats(),
                getTotalPatientCount()
            ]);

            const [pRes, dRes, eRes, rRes, tRes, lRes, tpRes, revStatsRes, analyticsRes, expStatsRes, totalPatientsRes] = results.map(r => r.status === 'fulfilled' ? r.value : null);

            // 1. Patients
            if (pRes && pRes.data) {
                const list = pRes.data.patients || pRes.data.data || pRes.data || [];
                setPatients(Array.isArray(list) ? list : []);
            }

            // 2. Doctors
            if (dRes && dRes.data) {
                const list = Array.isArray(dRes.data) ? dRes.data : (dRes.data.data || []);
                setDoctors(list);
            }

            // 3. Expenses
            if (eRes && eRes.data) {
                // Backend returns { data: [], pagination: {} }
                const list = eRes.data.data || eRes.data || [];
                setExpenses(Array.isArray(list) ? list : []);
            }

            // 4. Reports
            if (rRes && rRes.data) {
                const list = rRes.data.data || rRes.data || [];
                setReports(Array.isArray(list) ? list : []);
            }

            // 5. Lab Tests
            if (tRes && tRes.data) {
                const list = tRes.data.data || tRes.data || [];
                setLabTests(Array.isArray(list) ? list : []);
            }

            // 6. Lab Details
            if (lRes && lRes.data) {
                setLabConfig(prev => ({ ...prev, ...lRes.data }));
            }

            // 7. Today's Patients
            if (tpRes && tpRes.data) {
                // Handle nested structure: tpRes.data.data contains the array
                const list = tpRes.data.data || tpRes.data || [];
                setTodayPatients(Array.isArray(list) ? list : []);
            }

            // 8. Revenue Stats
            if (revStatsRes && revStatsRes.data && revStatsRes.data.stats) {
                setRevenueStats(revStatsRes.data.stats);
            }

            // 9 & 10. Unified Revenue Analytics
            if (analyticsRes && (analyticsRes.data || analyticsRes.monthly)) {
                console.log('AdminContext - Revenue Analytics Response:', analyticsRes);

                // Handle nested structure: response.data contains { monthly: [], daily: [], yearlyTotal: {} }
                const data = analyticsRes.data || analyticsRes;
                const { monthly, daily } = data;

                // Set Monthly Breakdown
                setMonthlyRevenue(Array.isArray(monthly) ? monthly : []);

                // Set Today's Revenue (Daily)
                if (daily && Array.isArray(daily)) {
                    // Find today's entry (e.g., day matches today's date)
                    // The backend returns daily stats for the current month
                    const today = new Date().getDate();
                    const todayStat = daily.find(d => d.day === today);

                    setTodayRevenue((todayStat?.totalRevenue || 0));

                    // Also useful to store the whole daily array
                    // setDailyRevenueStats(daily); // If needed
                }
            }
            // 11. Expense Stats
            if (expStatsRes && expStatsRes.data) {
                // If backend returns { monthlyTotal, yearlyTotal } directly or nested
                const stats = expStatsRes.data;
                setExpenseStats({
                    monthlyTotal: stats.monthlyTotal || 0,
                    yearlyTotal: stats.yearlyTotal || 0,
                    allTimeTotal: stats.allTimeTotal || 0
                });
            }

            // 12. Total Patients Count
            if (totalPatientsRes && totalPatientsRes.data) {
                console.log('AdminContext - Total Patients Response:', totalPatientsRes);
                // Handle nested structure: totalPatientsRes.data.data.totalPatients or totalPatientsRes.data.totalPatients
                const count = totalPatientsRes.data.data?.totalPatients ||
                    totalPatientsRes.data.totalPatients ||
                    totalPatientsRes.data.data?.count || 0;
                console.log('AdminContext - Setting total patients to:', count);
                setTotalPatients(count);
            }

        } catch (err) {
            console.error("Critical error during initial data fetch", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (localStorage.getItem('accessToken')) {
            fetchData();
        }
    }, [fetchData]);

    const updateLabSettings = async (newSettings) => {
        try {
            const response = await updateLabDetails(newSettings);
            if (response && response.data) {
                setLabConfig(prev => ({ ...prev, ...response.data }));
                return { success: true };
            }
            return { success: false, message: response?.message || "Update failed" };
        } catch (error) {
            console.error("Failed to update lab settings", error);
            throw error;
        }
    };

    return (
        <AdminContext.Provider value={{
            patients, setPatients,
            todayPatients, setTodayPatients, refreshTodayPatients: fetchTodayPatients,
            doctors, setDoctors,
            expenses, setExpenses,
            reports, setReports,
            labTests, setLabTests,
            labConfig, updateLabSettings,
            metrics: { ...metrics, totalPatients }, // Include totalPatients in metrics
            loading,
            refreshData: fetchData
        }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};
