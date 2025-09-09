

import React, { useState } from 'react';
import type { Patient, LabOrder } from '../types';

interface OrderLabTestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (order: Omit<LabOrder, 'id' | 'patientName' | 'orderDate' | 'status'>) => void;
    patient: Patient;
}

const OrderLabTestModal: React.FC<OrderLabTestModalProps> = ({ isOpen, onClose, onSave, patient }) => {
    const [testName, setTestName] = useState('');
    const [isCritical, setIsCritical] = useState(false);
    const [icd10Code, setIcd10Code] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!testName) {
            alert('Please enter a test name.');
            return;
        }
        onSave({
            patientId: patient.id,
            testName,
            isCritical,
            icd10Code,
        });
        setTestName('');
        setIsCritical(false);
        setIcd10Code('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative dark:bg-slate-800">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-xl font-bold text-dark-text mb-4 dark:text-slate-200">Order Lab Test for {patient.name}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="testName" className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Test Name</label>
                        <input
                            type="text"
                            id="testName"
                            value={testName}
                            onChange={(e) => setTestName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                            placeholder="e.g., Full Blood Count, Malaria RDT"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="icd10Code" className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">ICD-10 Code (Optional)</label>
                        <input
                            type="text"
                            id="icd10Code"
                            value={icd10Code}
                            onChange={(e) => setIcd10Code(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                            placeholder="e.g., E11.9, J45.909"
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isCritical"
                            checked={isCritical}
                            onChange={(e) => setIsCritical(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="isCritical" className="ml-2 text-sm font-medium text-dark-text dark:text-slate-200">Mark as Critical</label>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-semibold">
                            Submit Order
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrderLabTestModal;
