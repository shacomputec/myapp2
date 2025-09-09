import React, { useState } from 'react';
import type { Patient, CardiologyOrder, CardiologyTestType } from '../types';

interface OrderCardiologyTestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (order: Omit<CardiologyOrder, 'id' | 'patientName' | 'orderDate' | 'status'>) => void;
    patient: Patient;
}

const ALL_CARDIOLOGY_TESTS: CardiologyTestType[] = ['ECG', 'Echocardiogram', 'Stress Test', 'Holter Monitor'];

const OrderCardiologyTestModal: React.FC<OrderCardiologyTestModalProps> = ({ isOpen, onClose, onSave, patient }) => {
    const [testName, setTestName] = useState<CardiologyTestType>('ECG');
    const [isUrgent, setIsUrgent] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!testName) {
            alert('Please select a test type.');
            return;
        }
        onSave({
            patientId: patient.id,
            testName,
            isUrgent,
        });
        setTestName('ECG');
        setIsUrgent(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-xl font-bold text-dark-text mb-4">Order Cardiology Test for {patient.name}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="testName" className="block text-sm font-medium text-light-text mb-1">Test Type</label>
                        <select
                            id="testName"
                            value={testName}
                            onChange={(e) => setTestName(e.target.value as CardiologyTestType)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        >
                            {ALL_CARDIOLOGY_TESTS.map(test => (
                                <option key={test} value={test}>{test}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isUrgent"
                            checked={isUrgent}
                            onChange={(e) => setIsUrgent(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="isUrgent" className="ml-2 text-sm font-medium text-dark-text">Mark as Urgent</label>
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

export default OrderCardiologyTestModal;