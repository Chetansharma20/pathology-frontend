export const INITIAL_PATIENTS = [
  { id: 'P-1001', name: 'Rahul Sharma', phone: '9820098200', age: 73, gender: 'Male', address: '7, LKM, New Delhi' },
  { id: 'P-1002', name: 'Anjali Gupta', phone: '9810098100', age: 59, gender: 'Female', address: 'Sector 15, Gurgaon' },
];

export const INITIAL_DOCTORS = [
  { id: 'D-001', name: 'Dr. Rajesh Khanna', commission: 20, specialization: 'MD Pathologist' },
  { id: 'D-002', name: 'Dr. Sunita Williams', commission: 15, specialization: 'General Physician' },
];

export const INITIAL_INVENTORY = [
  { id: 'I-001', name: 'Hemoglobin Reagent', stock: 12, unit: 'Bottles', minStock: 15 },
  { id: 'I-002', name: 'Glucose Test Strips', stock: 500, unit: 'Pieces', minStock: 100 },
];

export const TEST_TYPES = [
  { id: 't1', name: 'Complete Blood Count (CBC)', price: 500, category: 'Hematology', ranges: { Hemoglobin: '13-17 g/dL', WBC: '4k-11k/uL' } },
  { id: 't2', name: 'HbA1c (Diabetes)', price: 450, category: 'Biochemistry', ranges: { HbA1c: '4.0-5.6 %' } },
  { id: 't3', name: 'Lipid Profile', price: 850, category: 'Biochemistry', ranges: { Cholesterol: '<200 mg/dL' } },
];

export const EXPENSE_CATEGORIES = ['Lab Reagents', 'Staff Salary', 'Rent', 'Electricity', 'Doctor Commission', 'Misc'];