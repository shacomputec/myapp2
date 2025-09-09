
import React, { useState, useMemo, useEffect } from 'react';
import type { Invoice, InvoiceStatus, Patient, BillableItem, BankTransaction, MobileMoneyProvider } from '../types';
import { getBillExplanation } from '../services/geminiService';
import { useLanguage } from '../services/localization';
import PaymentModal from './PaymentModal';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; }> = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-light-text">{title}</p>
      <p className="text-3xl font-bold text-dark-text">{value}</p>
    </div>
    <div className="text-primary">
      {icon}
    </div>
  </div>
);

interface GenerateInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    patients: Patient[];
    billableItems: BillableItem[];
    onGenerate: (patient: Patient, itemsToBill: BillableItem[]) => void;
}

const GenerateInvoiceModal: React.FC<GenerateInvoiceModalProps> = ({ isOpen, onClose, patients, billableItems, onGenerate }) => {
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    const patientUnbilledItems = useMemo(() => {
        return billableItems.filter(item => item.patientId === selectedPatientId && item.status === 'Unbilled');
    }, [billableItems, selectedPatientId]);

    useEffect(() => {
        if (selectedPatientId) {
            setSelectedItems(new Set(patientUnbilledItems.map(item => item.id)));
        } else {
            setSelectedItems(new Set());
        }
    }, [selectedPatientId, patientUnbilledItems]);
    
    useEffect(() => {
        if (isOpen) {
            setSelectedPatientId('');
            setSelectedItems(new Set());
        }
    }, [isOpen]);

    if (!isOpen) return null;
    
    const handleToggleItem = (itemId: string) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    const handleSubmit = () => {
        const patient = patients.find(p => p.id === selectedPatientId);
        if (!patient || selectedItems.size === 0) {
            alert("Please select a patient and at least one item to bill.");
            return;
        }
        const itemsToBill = patientUnbilledItems.filter(item => selectedItems.has(item.id));
        onGenerate(patient, itemsToBill);
        onClose();
    };

    const totalAmount = useMemo(() => {
        return patientUnbilledItems
            .filter(item => selectedItems.has(item.id))
            .reduce((sum, item) => sum + item.amount, 0);
    }, [selectedItems, patientUnbilledItems]);
    
    const patientsWithUnbilledItems = useMemo(() => {
        const patientIds = new Set(billableItems.filter(i => i.status === 'Unbilled').map(i => i.patientId));
        return patients.filter(p => patientIds.has(p.id));
    }, [billableItems, patients]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 relative max-h-[90vh] flex flex-col">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-2xl font-bold text-dark-text mb-4">Generate Invoice</h3>
                
                <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1">Select Patient</label>
                        <select value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-lg">
                            <option value="">-- Select a patient with unbilled items --</option>
                            {patientsWithUnbilledItems.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    {selectedPatientId && (
                         <div className="border-t pt-4">
                            <h4 className="font-semibold text-dark-text mb-2">Unbilled Items for {patients.find(p=>p.id === selectedPatientId)?.name}</h4>
                            {patientUnbilledItems.length > 0 ? (
                                <div className="space-y-2">
                                    {patientUnbilledItems.map(item => (
                                        <label key={item.id} className="flex items-center p-3 bg-light-bg rounded-lg cursor-pointer hover:bg-gray-200">
                                            <input type="checkbox" checked={selectedItems.has(item.id)} onChange={() => handleToggleItem(item.id)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>
                                            <div className="ml-3 flex-grow flex justify-between">
                                                <span>{item.description} <span className="text-xs text-light-text">({item.date})</span></span>
                                                <span className="font-semibold">GH₵{item.amount.toFixed(2)}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            ) : <p className="text-light-text">No unbilled items for this patient.</p>}
                        </div>
                    )}
                </div>

                <div className="border-t pt-4 mt-4 flex justify-between items-center">
                    <div>
                        <span className="text-lg font-medium text-light-text">Total:</span>
                        <span className="text-2xl font-bold text-dark-text ml-2">GH₵{totalAmount.toFixed(2)}</span>
                    </div>
                    <button onClick={handleSubmit} disabled={!selectedPatientId || selectedItems.size === 0} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-semibold disabled:bg-gray-400">Generate Invoice</button>
                </div>
            </div>
        </div>
    );
};

const InvoiceDetailModal: React.FC<{ invoice: Invoice; onClose: () => void; onPay: (invoice: Invoice) => void; }> = ({ invoice, onClose, onPay }) => {
    const { t } = useLanguage();
    const [isExplaining, setIsExplaining] = useState(false);
    const [explanation, setExplanation] = useState('');

    const handleExplainCharges = async () => {
        setIsExplaining(true);
        setExplanation('');
        try {
            const result = await getBillExplanation(invoice.items);
            setExplanation(result);
        } catch (error) {
            setExplanation('Sorry, we could not generate an explanation at this time.');
            console.error(error);
        } finally {
            setIsExplaining(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 relative max-h-[90vh] flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-2xl font-bold text-dark-text mb-2">{t('billing.detail.title')} {invoice.id}</h3>
                        <p className="text-light-text">{t('billing.detail.for')}: {invoice.patientName} ({invoice.patientId})</p>
                    </div>
                    <button
                        onClick={handleExplainCharges}
                        disabled={isExplaining || explanation.length > 0}
                        className="bg-secondary text-primary-dark px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors font-semibold text-sm flex items-center disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        {isExplaining ? t('billing.detail.explaining') : t('billing.detail.explain')}
                    </button>
                </div>
                <div className="border-t pt-4 overflow-y-auto flex-grow">
                    <table className="w-full text-left">
                        <thead>
                            <tr>
                                <th className="p-2 font-semibold text-light-text">{t('billing.detail.item')}</th>
                                <th className="p-2 font-semibold text-light-text">{t('billing.detail.qty')}</th>
                                <th className="p-2 font-semibold text-light-text">{t('billing.detail.unitPrice')}</th>
                                <th className="p-2 font-semibold text-light-text text-right">{t('billing.detail.total')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map(item => (
                                <tr key={item.id} className="border-b">
                                    <td className="p-2">{item.description}</td>
                                    <td className="p-2">{item.quantity}</td>
                                    <td className="p-2">GH₵{item.unitPrice.toFixed(2)}</td>
                                    <td className="p-2 text-right">GH₵{item.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="font-bold">
                                <td colSpan={3} className="p-2 text-right">{t('billing.detail.grandTotal')}</td>
                                <td className="p-2 text-right text-xl">GH₵{invoice.totalAmount.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                     { (isExplaining || explanation) && (
                        <div className="mt-4 pt-4 border-t">
                            <h4 className="text-md font-semibold text-dark-text mb-2">{t('billing.detail.aiExplanation')}</h4>
                            {isExplaining ? (
                                <p className="text-light-text italic">{t('billing.detail.generating')}</p>
                            ) : (
                                <div className="prose prose-sm max-w-none text-gray-800 bg-light-bg p-4 rounded-lg" dangerouslySetInnerHTML={{ __html: explanation.replace(/\n/g, '<br />') }} />
                            )}
                        </div>
                    )}
                </div>
                {invoice.status !== 'Paid' && (
                    <div className="border-t mt-4 pt-4 flex justify-end">
                        <button onClick={() => onPay(invoice)} className="bg-success text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold flex items-center">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            Pay with Mobile Money
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

interface BillingProps {
    invoices: Invoice[];
    billableItems: BillableItem[];
    patients: Patient[];
    onGenerateInvoice: (patient: Patient, itemsToBill: BillableItem[]) => void;
    onUpdateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
    onAddTransaction: (transactionData: Omit<BankTransaction, 'id' | 'status'>) => void;
}

const Billing: React.FC<BillingProps> = ({ invoices, billableItems, patients, onGenerateInvoice, onUpdateInvoiceStatus, onAddTransaction }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'Unbilled' | 'Invoices'>('Unbilled');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    
    const financialSummary = useMemo(() => {
        const totalRevenue = invoices.filter(inv => inv.status === 'Paid').reduce((acc, inv) => acc + inv.totalAmount, 0);
        const outstanding = invoices.filter(inv => inv.status !== 'Paid').reduce((acc, inv) => acc + inv.totalAmount, 0);
        const unbilledAmount = billableItems.filter(item => item.status === 'Unbilled').reduce((acc, item) => acc + item.amount, 0);
        return { totalRevenue, outstanding, unbilledAmount };
    }, [invoices, billableItems]);

    const filteredInvoices = useMemo(() => 
        invoices.filter(invoice =>
            invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [invoices, searchTerm]);
    
    const unbilledItemsByPatient = useMemo(() => {
        return billableItems
            .filter(item => item.status === 'Unbilled')
            .reduce((acc, item) => {
                (acc[item.patientId] = acc[item.patientId] || []).push(item);
                return acc;
            }, {} as Record<string, BillableItem[]>);
    }, [billableItems]);
    
    const handlePaymentSuccess = (
        invoice: Invoice,
        paymentDetails: { provider: MobileMoneyProvider, phone: string, transactionId: string }
    ) => {
        // 1. Update invoice status
        onUpdateInvoiceStatus(invoice.id, 'Paid');

        // 2. Add a corresponding bank transaction
        onAddTransaction({
            date: new Date().toISOString(),
            description: `Mobile Money Payment for Invoice ${invoice.id}`,
            type: 'Mobile Money Deposit',
            amount: invoice.totalAmount,
            accountId: 'ACC-05', // Default to a MoMo-enabled account
            momoProvider: paymentDetails.provider,
            momoTransactionId: paymentDetails.transactionId,
            senderNumber: paymentDetails.phone,
            reconciliationId: invoice.id,
        });
        
        // Close the detail modal if it's open
        if(selectedInvoice?.id === invoice.id) {
            setSelectedInvoice(prev => prev ? {...prev, status: 'Paid'} : null);
        }
    };
    
    const handleOpenPaymentModal = (invoice: Invoice) => {
        setSelectedInvoice(null); // Close detail modal
        setPayingInvoice(invoice);
    };

    const statusColors: { [key in InvoiceStatus]: string } = {
        Paid: 'bg-green-100 text-green-800',
        Pending: 'bg-yellow-100 text-yellow-800',
        Overdue: 'bg-red-100 text-red-800',
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-dark-text">{t('billing.title')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title={t('billing.revenue')} value={`GH₵${financialSummary.totalRevenue.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                <StatCard title={t('billing.outstanding')} value={`GH₵${financialSummary.outstanding.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <StatCard title="Unbilled Amount" value={`GH₵${financialSummary.unbilledAmount.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                     <nav className="flex space-x-2 rounded-lg bg-light-bg p-1">
                        {(['Unbilled', 'Invoices'] as const).map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === tab ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-white'}`}>
                                {tab === 'Unbilled' ? 'Unbilled Items' : 'All Invoices'}
                            </button>
                        ))}
                    </nav>
                    <button onClick={() => setIsGenerateModalOpen(true)} className="w-full md:w-auto bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors font-semibold flex items-center justify-center">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Generate Invoice
                    </button>
                </div>
                
                {activeTab === 'Unbilled' && (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        {Object.keys(unbilledItemsByPatient).length > 0 ? Object.entries(unbilledItemsByPatient).map(([patientId, items]) => {
                            const patient = patients.find(p => p.id === patientId);
                            if (!patient) return null;
                            const total = items.reduce((sum, item) => sum + item.amount, 0);
                            return (
                                <div key={patientId} className="p-4 border rounded-lg bg-light-bg">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-bold text-dark-text">{patient.name} ({patient.id})</h4>
                                        <p className="font-semibold text-primary">Total: GH₵{total.toFixed(2)}</p>
                                    </div>
                                    <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
                                        {items.map(item => <li key={item.id} className="flex justify-between"><span>{item.description} <span className="text-xs text-light-text">({item.date})</span></span><span className="font-semibold">GH₵{item.amount.toFixed(2)}</span></li>)}
                                    </ul>
                                </div>
                            )
                        }) : <p className="text-center text-light-text p-8">No unbilled items found.</p>}
                    </div>
                )}
                
                {activeTab === 'Invoices' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-light-bg">
                                <tr>
                                    <th className="p-3 font-semibold text-light-text">{t('billing.table.id')}</th>
                                    <th className="p-3 font-semibold text-light-text">{t('billing.table.patient')}</th>
                                    <th className="p-3 font-semibold text-light-text">{t('billing.table.date')}</th>
                                    <th className="p-3 font-semibold text-light-text">{t('billing.table.amount')}</th>
                                    <th className="p-3 font-semibold text-light-text">{t('billing.table.status')}</th>
                                    <th className="p-3 font-semibold text-light-text text-center">{t('billing.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-medium text-primary">{invoice.id}</td>
                                        <td className="p-3 font-medium text-dark-text">{invoice.patientName}</td>
                                        <td className="p-3">{invoice.date}</td>
                                        <td className="p-3">GH₵{invoice.totalAmount.toFixed(2)}</td>
                                        <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[invoice.status]}`}>{invoice.status}</span></td>
                                        <td className="p-3 text-center space-x-2"><button onClick={() => setSelectedInvoice(invoice)} className="text-primary hover:underline text-sm font-medium">{t('billing.table.view')}</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>
            {selectedInvoice && <InvoiceDetailModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} onPay={handleOpenPaymentModal} />}
            {payingInvoice && <PaymentModal invoice={payingInvoice} isOpen={!!payingInvoice} onClose={() => setPayingInvoice(null)} onPaymentSuccess={handlePaymentSuccess} />}
            <GenerateInvoiceModal isOpen={isGenerateModalOpen} onClose={() => setIsGenerateModalOpen(false)} patients={patients} billableItems={billableItems} onGenerate={onGenerateInvoice} />
        </div>
    );
};

export default Billing;
