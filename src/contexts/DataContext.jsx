import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

// APIs
import { getPatients, getTodayPatients } from '../api/receptionist/patient.api';
import { getDoctors } from '../api/admin/doctors.api';
import { getExpenses } from '../api/admin/expenses.api';
import { getReports } from '../api/receptionist/reports.api';
import { getLabTests } from '../api/admin/labTest.api';
import { getLabDetails, updateLabDetails } from '../api/admin/lab.api';
import { getRevenueStats, getMonthlyRevenue, getDailyRevenue } from '../api/admin/revenue.api';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
    // Global Data State
    const [patients, setPatients] = useState([]);
    const [todayPatients, setTodayPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [labTests, setLabTests] = useState([]);
    const [revenueStats, setRevenueStats] = useState({ totalRevenue: 0, totalCommission: 0, netRevenue: 0 });
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [todayRevenue, setTodayRevenue] = useState(0);

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
        const currentMonthData = monthlyRevenue.find(m => m._id === currentMonth);
        const calculatedMonthlyRevenue = currentMonthData ? currentMonthData.totalRevenue : 0;

        return {
            // Today's revenue - from getDailyRevenue API
            dailyCollection: todayRevenue,
            // Total expenses - comes from expenses data
            totalExpenses: Array.isArray(expenses) ? expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0) : 0,
            // Current month revenue - from monthly breakdown API
            monthlyRevenue: calculatedMonthlyRevenue,
            // All-time total revenue - from revenue stats API
            totalRevenue: revenueStats.totalRevenue || 0,
            // Net revenue - from revenue stats API
            netRevenue: revenueStats.netRevenue || 0,
            // Commission - from revenue stats API
            totalCommission: revenueStats.totalCommission || 0
        };
    }, [expenses, revenueStats, monthlyRevenue, todayRevenue]);

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
                getMonthlyRevenue(currentYear),
                getDailyRevenue(currentYear, currentMonth)
            ]);

            const [pRes, dRes, eRes, rRes, tRes, lRes, tpRes, revStatsRes, revMonthlyRes, revDailyRes] = results.map(r => r.status === 'fulfilled' ? r.value : null);

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
                const list = Array.isArray(tpRes.data) ? tpRes.data : (tpRes.data.data || []);
                setTodayPatients(list);
            }

            // 8. Revenue Stats
            if (revStatsRes && revStatsRes.data && revStatsRes.data.stats) {
                setRevenueStats(revStatsRes.data.stats);
            }

            // 9. Monthly Revenue
            if (revMonthlyRes && revMonthlyRes.data) {
                setMonthlyRevenue(Array.isArray(revMonthlyRes.data) ? revMonthlyRes.data : []);
            }

            // 10. Today's Revenue
            if (revDailyRes && revDailyRes.data) {
                const dailyData = Array.isArray(revDailyRes.data) ? revDailyRes.data : [];
                // Find today's data from the daily breakdown
                const today = new Date().getDate();
                const todayData = dailyData.find(d => d._id?.day === today);
                setTodayRevenue(todayData ? todayData.totalRevenue : 0);
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
        <DataContext.Provider value={{
            patients, setPatients,
            todayPatients, setTodayPatients, refreshTodayPatients: fetchTodayPatients,
            doctors, setDoctors,
            expenses, setExpenses,
            labTests, setLabTests,
            labConfig, updateLabSettings,
            metrics,
            loading,
            refreshData: fetchData
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
