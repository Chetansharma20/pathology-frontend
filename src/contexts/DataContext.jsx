
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

// APIs - We will implement these properly later
import { getPatients } from '../api/receptionist/patient.api';
import { getDoctors } from '../api/admin/doctors.api';
import { getExpenses } from '../api/admin/expenses.api';
import { getLabTests } from '../api/admin/labTest.api';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
    // Global Data State
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [bills, setBills] = useState([]);
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
                const [pData, dData, eData, rData, tData] = await Promise.all([
                    getPatients().catch(err => { console.error("Patients fetch failed", err); return []; }),
                    getDoctors().catch(err => { console.error("Doctors fetch failed", err); return []; }),
                    getExpenses().catch(err => { console.error("Expenses fetch failed", err); return []; }),
                    getLabTests().catch(err => { console.error("Lab Tests fetch failed", err); return []; })
                ]);

                if (pData && (pData.data || Array.isArray(pData))) setPatients(pData.data || pData);
                if (dData && (dData.data || Array.isArray(dData))) setDoctors(dData.data || dData);
                if (eData && (eData.data || Array.isArray(eData))) setExpenses(eData.data || eData);
                if (tData && (tData.data || Array.isArray(tData))) setLabTests(tData.data || tData);

            } catch (err) {
                console.error("Failed to fetch initial data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const updateLabSettings = (newSettings) => {
        setLabConfig(prev => ({ ...prev, ...newSettings }));
    };

    return (
        <DataContext.Provider value={{
            patients, setPatients,
            doctors, setDoctors,
            expenses, setExpenses,
            bills, setBills,
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
