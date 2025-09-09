
import React, { useState } from 'react';
import type { Invoice, MobileMoneyProvider } from '../types';

interface PaymentModalProps {
    invoice: Invoice;
    isOpen: boolean;
    onClose: () => void;
    onPaymentSuccess: (invoice: Invoice, paymentDetails: { provider: MobileMoneyProvider, phone: string, transactionId: string }) => void;
}

const ALL_PROVIDERS: MobileMoneyProvider[] = ['MTN Mobile Money', 'Vodafone Cash', 'AirtelTigo Money'];

const PaymentModal: React.FC<PaymentModalProps> = ({ invoice, isOpen, onClose, onPaymentSuccess }) => {
    const [provider, setProvider] = useState<MobileMoneyProvider>('MTN Mobile Money');
    const [phone, setPhone] = useState('');
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    if (!isOpen) return null;

    const handlePayment = async () => {
        if (!phone) {
            setErrorMessage('Please enter a valid phone number.');
            return;
        }
        setStatus('processing');
        setErrorMessage('');
        
        // Simulate API call to payment gateway
        await new Promise(resolve => setTimeout(resolve, 2500));

        // Simulate success
        setStatus('success');
        const transactionId = `MM${Date.now()}`;
        
        setTimeout(() => {
            onPaymentSuccess(invoice, { provider, phone, transactionId });
            onClose();
            setStatus('idle');
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 relative">
                 <button onClick={onClose} disabled={status === 'processing'} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-xl font-bold text-dark-text mb-2">Pay Invoice {invoice.id}</h3>
                <p className="text-2xl font-bold text-primary mb-4">GH₵{invoice.totalAmount.toFixed(2)}</p>

                {status === 'processing' && (
                    <div className="text-center p-8">
                         <svg className="animate-spin mx-auto h-12 w-12 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="font-semibold text-dark-text">Awaiting Authorization</p>
                        <p className="text-sm text-light-text">Please approve the payment on phone number {phone}.</p>
                    </div>
                )}
                
                {status === 'success' && (
                     <div className="text-center p-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-success" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className="font-semibold text-dark-text mt-2">Payment Successful!</p>
                        <p className="text-sm text-light-text">Updating records...</p>
                    </div>
                )}

                {status === 'idle' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-light-text mb-1">Provider</label>
                            <select value={provider} onChange={e => setProvider(e.target.value as MobileMoneyProvider)} className="w-full p-2 border border-gray-300 rounded-lg">
                                {ALL_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-light-text mb-1">Phone Number</label>
                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="024 XXX XXXX" className="w-full p-2 border border-gray-300 rounded-lg" />
                        </div>
                        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
                        <button onClick={handlePayment} className="w-full bg-success text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                            Pay GH₵{invoice.totalAmount.toFixed(2)}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;
