
import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import { UserCheck, Microscope, ReceiptText, Trash2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';

const BillingPanel = () => {
    const { patients = [], doctors = [], labTests = [], setBills, bills = [] } = useData();
    const { showToast } = useToast();

    // Local State
    const [billingTargetP, setBillingTargetP] = useState('');
    const [billingRefDoc, setBillingRefDoc] = useState('');
    const [billingBasket, setBillingBasket] = useState([]);
    const [billingAdjustment, setBillingAdjustment] = useState({ type: 'flat', val: 0 });

    // Use labTests from context, fallback if empty
    const availableTests = labTests.length > 0 ? labTests : [];

    const confirmBill = () => {
        if (!billingTargetP) {
            showToast("Please select a patient", "error");
            return;
        }
        if (billingBasket.length === 0) {
            showToast("Cart is empty", "error");
            return;
        }

        const subtotal = billingBasket.reduce((a, b) => a + b.price, 0);
        const discountAmount = billingAdjustment.type === 'percent'
            ? subtotal * (billingAdjustment.val / 100)
            : billingAdjustment.val;
        const finalAmount = Math.round(subtotal - discountAmount); // Tax removed strictly for now? Or keep 5%?
        // Note: The previous code had * 1.05 tax logic in the render but not clear in confirm. 
        // I will simplify tax logic: Subtotal - Discount. 
        // If tax is needed, we should add it explicitly.
        // Preserving the previous tax logic for consistency:
        const taxAmount = Math.round(subtotal * 0.05);
        const totalWithTax = subtotal + taxAmount;
        const finalPayable = Math.round(totalWithTax - discountAmount);


        const newBill = {
            id: `INV-${Date.now()}`,
            patientId: billingTargetP,
            doctorId: billingRefDoc,
            items: billingBasket,
            subtotal,
            tax: taxAmount,
            discount: discountAmount,
            finalAmount: finalPayable,
            date: new Date().toLocaleDateString(),
            status: 'Paid'
        };

        setBills([...bills, newBill]);
        showToast(`Invoice ${newBill.id} generated! Amount: ₹${finalPayable}`, "success");

        // Reset
        setBillingBasket([]);
        setBillingAdjustment({ type: 'flat', val: 0 });
        setBillingTargetP('');
        setBillingRefDoc('');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
            <div className="lg:col-span-2 space-y-6">
                <Card title="Assignment" icon={UserCheck}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <select
                            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                            value={billingTargetP}
                            onChange={e => setBillingTargetP(e.target.value)}
                        >
                            <option value="">Choose Patient...</option>
                            {patients.map(p => <option key={p._id || p.id} value={p._id || p.id}>{p.fullName || p.name}</option>)}
                        </select>
                        <select
                            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                            value={billingRefDoc}
                            onChange={e => setBillingRefDoc(e.target.value)}
                        >
                            <option value="">No Referral (Self)</option>
                            {doctors.map(d => <option key={d._id || d.id} value={d._id || d.id}>{d.name}</option>)}
                        </select>
                    </div>
                </Card>

                <Card title="Test Menu" icon={Microscope} noPadding>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {availableTests.length === 0 ? (
                            <div className="col-span-2 text-center text-gray-400">Loading tests...</div>
                        ) : (
                            availableTests.map(t => {
                                const tId = t._id || t.id;
                                const inBasket = billingBasket.find(c => (c._id || c.id) === tId);
                                return (
                                    <button
                                        key={tId}
                                        onClick={() => !inBasket && setBillingBasket([...billingBasket, t])}
                                        className={`p-6 border-2 rounded-3xl text-left flex justify-between items-center transition-all ${inBasket
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                                            : 'bg-white hover:border-indigo-400'
                                            }`}
                                    >
                                        <p className="text-[11px] font-black uppercase tracking-widest truncate pr-2 flex-1" title={t.name}>{t.name}</p>
                                        <p className="font-black text-sm flex-shrink-0">₹{t.price}</p>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </Card>
            </div>

            <Card title="Terminal" icon={ReceiptText} className="h-fit bg-slate-50/50 shadow-2xl">
                <div className="space-y-6">
                    {billingBasket.map(i => (
                        <div key={i._id || i.id} className="flex justify-between items-center bg-white p-4 rounded-2xl border text-[10px] font-black uppercase shadow-sm">
                            <span className="truncate pr-4 flex-1 max-w-[70%]" title={i.name}>{i.name}</span>
                            <button
                                onClick={() => setBillingBasket(billingBasket.filter(c => (c._id || c.id) !== (i._id || i.id)))}
                                className="flex-shrink-0 ml-2 p-1 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Remove test"
                            >
                                <Trash2 size={14} className="text-rose-400" />
                            </button>
                        </div>
                    ))}

                    <div className="bg-white rounded-2xl p-6 space-y-6 shadow-sm border border-gray-200">
                        {/* Subtotal */}
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">Subtotal</span>
                            <span className="text-lg font-bold text-gray-900">₹{billingBasket.reduce((a, b) => a + b.price, 0).toLocaleString()}</span>
                        </div>

                        {/* Discount Section */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700">Discount</label>
                            <div className="flex gap-3">
                                <select
                                    className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                    value={billingAdjustment.type}
                                    onChange={e => setBillingAdjustment({ ...billingAdjustment, type: e.target.value })}
                                >
                                    <option value="flat">Flat Amount</option>
                                    <option value="percent">Percentage</option>
                                </select>
                                <input
                                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium text-right focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                    type="number"
                                    placeholder="0"
                                    min="0"
                                    max={billingAdjustment.type === 'percent' ? '100' : '1000000'}
                                    step={billingAdjustment.type === 'percent' ? '1' : '1'}
                                    value={billingAdjustment.val || ''}
                                    onChange={e => {
                                        const value = parseFloat(e.target.value) || 0;
                                        setBillingAdjustment({ ...billingAdjustment, val: value });
                                    }}
                                />
                            </div>
                        </div>

                        {/* Payable Amount */}
                        <div className="flex justify-between items-center py-4 border-t border-gray-200">
                            <span className="text-lg font-semibold text-gray-900">Total Payable</span>
                            <span className="text-2xl font-bold text-indigo-600">
                                ₹{(() => {
                                    const subtotal = billingBasket.reduce((a, b) => a + b.price, 0);
                                    const tax = subtotal * 0.05;
                                    const discount = billingAdjustment.type === 'percent'
                                        ? subtotal * (billingAdjustment.val / 100)
                                        : billingAdjustment.val;
                                    return Math.max(0, Math.round(subtotal + tax - discount)).toLocaleString();
                                })()}
                            </span>
                        </div>

                        {/* Confirm Button */}
                        <button
                            disabled={!billingTargetP || billingBasket.length === 0}
                            className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium text-sm hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            onClick={confirmBill}
                        >
                            Confirm & Print Invoice
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default BillingPanel;
