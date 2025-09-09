
import React, { useState, useEffect, useCallback } from 'react';
import type { Patient } from '../types';
import { getShareablePatientSummary } from '../services/geminiService';

interface ShareRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
}

type ShareMethod = 'Email' | 'SMS' | 'WhatsApp';

const ShareRecordModal: React.FC<ShareRecordModalProps> = ({ isOpen, onClose, patient }) => {
    const [shareMethod, setShareMethod] = useState<ShareMethod>('Email');
    const [recipient, setRecipient] = useState('');
    const [summary, setSummary] = useState('');
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const generateSummary = useCallback(async () => {
        if (!patient) return;
        setIsLoadingSummary(true);
        try {
            const result = await getShareablePatientSummary(patient);
            setSummary(result);
        } catch (e) {
            setSummary("Could not generate patient summary.");
        } finally {
            setIsLoadingSummary(false);
        }
    }, [patient]);

    useEffect(() => {
        if (isOpen && patient) {
            // Reset state on open
            setRecipient(shareMethod === 'Email' ? '' : patient.phone || '');
            setSendStatus('idle');
            setSummary('');
            generateSummary();
        }
    }, [isOpen, patient, generateSummary, shareMethod]);

    useEffect(() => {
      if (patient) {
        setRecipient(shareMethod === 'Email' ? '' : patient.phone || '');
      }
    }, [shareMethod, patient]);

    if (!isOpen || !patient) return null;

    const handleSend = () => {
        if (!recipient) {
            alert('Please enter a recipient.');
            return;
        }
        setIsSending(true);
        setSendStatus('idle');
        console.log(`Simulating sending record to ${recipient} via ${shareMethod}`);
        console.log("Message:", summary);

        // Simulate API call
        setTimeout(() => {
            setIsSending(false);
            // Simulate random success/error
            if (Math.random() > 0.1) {
                setSendStatus('success');
                 setTimeout(() => {
                    onClose();
                }, 2000);
            } else {
                setSendStatus('error');
            }
        }, 1500);
    };

    const getRecipientInput = () => {
        switch (shareMethod) {
            case 'Email':
                return { type: 'email', placeholder: 'recipient@example.com', label: 'Recipient Email' };
            case 'SMS':
                return { type: 'tel', placeholder: '0241234567', label: 'Recipient Phone Number (SMS)' };
            case 'WhatsApp':
                return { type: 'tel', placeholder: '0241234567', label: 'Recipient Phone Number (WhatsApp)' };
            default:
                return { type: 'text', placeholder: '', label: 'Recipient' };
        }
    };
    const inputProps = getRecipientInput();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative">
                <button onClick={onClose} disabled={isSending} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <h3 className="text-xl font-bold text-dark-text mb-4">Share Record for {patient.name}</h3>
                
                {sendStatus === 'success' && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-4" role="alert">
                        <p>Record sent successfully to {recipient}!</p>
                    </div>
                )}
                {sendStatus === 'error' && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-4" role="alert">
                        <p>Failed to send record. Please try again.</p>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-2">Share via</label>
                        <div className="flex space-x-2 rounded-lg bg-light-bg p-1">
                            {(['Email', 'SMS', 'WhatsApp'] as ShareMethod[]).map(method => (
                                <button
                                    key={method}
                                    onClick={() => setShareMethod(method)}
                                    className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${shareMethod === method ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-white'}`}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="recipient" className="block text-sm font-medium text-light-text mb-1">{inputProps.label}</label>
                        <input
                            type={inputProps.type}
                            id="recipient"
                            name="recipient"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            placeholder={inputProps.placeholder}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1">Message Preview</label>
                        <div className="w-full p-3 h-40 bg-light-bg border border-gray-200 rounded-lg overflow-y-auto text-sm text-dark-text">
                            {isLoadingSummary ? 'Generating summary...' : <pre className="whitespace-pre-wrap font-sans">{summary}</pre>}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSend}
                        disabled={isSending || isLoadingSummary || !recipient}
                        className="w-full bg-success text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400 flex items-center justify-center"
                    >
                         {isSending ? (
                             <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Sending...
                            </>
                        ) : 'Send Record'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareRecordModal;
