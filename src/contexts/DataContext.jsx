
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

// APIs - We will implement these properly later
import { getPatients, getTodayPatients } from '../api/receptionist/patient.api';
import { getDoctors } from '../api/admin/doctors.api';
import { getExpenses } from '../api/admin/expenses.api';
import { getReports } from '../api/receptionist/reports.api';
import { getLabTests } from '../api/admin/labTest.api';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
    // Global Data State
    const [patients, setPatients] = useState([]);
    const [totalPatients, setTotalPatients] = useState(0);
    const [todayPatients, setTodayPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [totalDoctors, setTotalDoctors] = useState(0);
    const [expenses, setExpenses] = useState([]);
    const [bills, setBills] = useState([]);
    const [reports, setReports] = useState([]);
    const [sampleQueue, setSampleQueue] = useState([]);
    const [labTests, setLabTests] = useState([]);

    // Lab Configuration
    const [labConfig, setLabConfig] = useState({
        name: "DIGITOS PATHOLOGY",
        address: "CHHATRAPATI SAMBHAJINAGAR, MAHARASHTRA",
        contact: "98888 77777",
        timings: "08:00 AM - 09:00 PM"
    });

    // Loading States
    const [loading, setLoading] = useState(false);

    // Derived Metrics
    const todayDate = new Date().toLocaleDateString();

    const metrics = useMemo(() => {
        const dailyCollection = bills.filter(b => b.date === todayDate).reduce((acc, b) => acc + b.finalAmount, 0);
        const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

        const docRanking = doctors.map(d => ({
            ...d,
            billCount: bills.filter(b => b.doctorId === d.id).length,
            revenue: bills.filter(b => b.doctorId === d.id).reduce((acc, b) => acc + b.finalAmount, 0)
        })).sort((a, b) => b.revenue - a.revenue);

        return { dailyCollection, totalExpenses, docRanking };
    }, [bills, expenses, doctors, todayDate]);


    // Initial Data Fetch
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch all initial data
                const [pResponse, dResponse, eData, rData, tData] = await Promise.all([
                    getPatients().catch(err => { console.error("Patients fetch failed", err); return null; }),
                    getDoctors().catch(err => { console.error("Doctors fetch failed", err); return null; }),
                    getExpenses().catch(err => { console.error("Expenses fetch failed", err); return []; }),
                    getReports().catch(err => { console.error("Reports fetch failed", err); return []; }),
                    getLabTests().catch(err => { console.error("Lab Tests fetch failed", err); return []; })
                ]);

                // Handle Patients (Deeply nested due to pagination wrapper)
                if (pResponse && pResponse.data) {
                    const patientsList = pResponse.data?.patients || pResponse.data || [];
                    setPatients(Array.isArray(patientsList) ? patientsList : []);
                    setTotalPatients(pResponse.data?.pagination?.totalRecords || (Array.isArray(patientsList) ? patientsList.length : 0));
                }

                // Handle Doctors (Now paginated)
                if (dResponse && dResponse.data) {
                    const doctorsList = dResponse.data?.doctors || dResponse.data || [];
                    setDoctors(Array.isArray(doctorsList) ? doctorsList : []);
                    setTotalDoctors(dResponse.data?.pagination?.totalRecords || (Array.isArray(doctorsList) ? doctorsList.length : 0));
                }

                if (eData && (eData.data || Array.isArray(eData))) setExpenses(eData.data || eData);
                if (rData && (rData.data || Array.isArray(rData))) setReports(rData.data || rData);
                if (tData && (tData.data || Array.isArray(tData))) setLabTests(tData.data || tData);

            } catch (err) {
                console.error("Failed to fetch initial data", err);
            } finally {
                setLoading(false);
            }
        };

        const fetchTodayPatients = async () => {
            try {
                const response = await getTodayPatients();
                if (response.data) {
                    setTodayPatients(response.data);
                }
            } catch (err) {
                console.error("Failed to fetch today's patients", err);
            }
        };

        // Only fetch if authenticated (checking token presence locally is a quick check)
        if (localStorage.getItem('accessToken')) {
            fetchData();
            fetchTodayPatients();
        }
    }, []);

    const refreshTodayPatients = async () => {
        try {
            const response = await getTodayPatients();
            if (response.data) {
                setTodayPatients(response.data);
            }
        } catch (err) {
            console.error("Failed to refresh today's patients", err);
        }
    };

    const updateLabSettings = (newSettings) => {
        setLabConfig(prev => ({ ...prev, ...newSettings }));
    };

    return (
        <DataContext.Provider value={{
            patients, setPatients, totalPatients,
            todayPatients, setTodayPatients, refreshTodayPatients,
            doctors, setDoctors, totalDoctors,
            expenses, setExpenses,
            bills, setBills,
            reports, setReports,
            sampleQueue, setSampleQueue,
            labTests, setLabTests,
            labConfig, updateLabSettings,
            metrics,
            loading
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
