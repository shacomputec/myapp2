
import React, { useState, useEffect } from 'react';
import type { Patient, Prescription, PrescriptionItem, DrugInteractionResult } from '../types';
import { MOCK_MEDICATIONS } from '../constants';
import { getDrugInteractionAnalysis } from '../services/geminiService';

interface CreatePrescriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (prescription: Omit<Prescription, 'id' | 'patientName' | 'doctor' | 'date' | 'status'>) => void;
    patient: Patient;
    allPrescriptions: Prescription[];
}

const severityStyles: Record<DrugInteractionResult['severity'], { bg: string, text: string, border: string }> = {
    'Severe': { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-800 dark:text-red-300', border: 'border-red-500' },
    'Moderate': { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-800 dark:text-yellow-300', border: 'border-yellow-500' },
    'Minor': { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-800 dark:text-blue-300', border: 'border-blue-500' },
};

const CreatePrescriptionModal: React.FC<CreatePrescriptionModalProps> = ({ isOpen, onClose, onSave, patient, allPrescriptions }) => {
    const [items, setItems] = useState<Partial<PrescriptionItem>[]>([{ medicationId: '', dosage: '', quantity: 1 }]);
    const [interactions, setInteractions] = useState<DrugInteractionResult[]>([]);
    const [isChecking, setIsChecking] = useState(false);
    const [checkError, setCheckError] = useState('');
    const [severeAcknowledged, setSevereAcknowledged] = useState(false);
    
    // Effect to reset state when the modal is closed
    useEffect(() => {
        if (!isOpen) {
            setItems([{ medicationId: '', dosage: '', quantity: 1 }]);
            setInteractions([]);
            setIsChecking(false);
            setCheckError('');
            setSevereAcknowledged(false);
        }
    }, [isOpen]);

    // Effect for debounced drug interaction check
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const newMedicationIds = items.map(item => item?.medicationId).filter((id): id is string => !!id);
        
        if (newMedicationIds.length === 0) {
            setInteractions([]);
            setCheckError('');
            return;
        }

        const handler = setTimeout(() => {
            const existingMedicationIds = allPrescriptions
                .filter(p => p.status !== 'Cancelled')
                .flatMap(p => p.items)
                .map(item => item.medicationId);
            
            const allMedicationIds = [...new Set([...existingMedicationIds, ...newMedicationIds])];

            const allDrugNames = allMedicationIds
                .map(id => MOCK_MEDICATIONS.find(m => m.id === id)?.name)
                .filter((name): name is string => !!name);

            if ([...new Set(allDrugNames)].length < 2) {
                setInteractions([]);
                setCheckError('');
                return;
            }

            const check = async () => {
                setIsChecking(true);
                setCheckError('');
                setInteractions([]);
                setSevereAcknowledged(false);

                try {
                    const results = await getDrugInteractionAnalysis(allDrugNames);
                    setInteractions(results);
                } catch (e) {
                    setCheckError('Could not check for interactions at this time.');
                    console.error(e);
                } finally {
                    setIsChecking(false);
                }
            };

            check();
        }, 1000);

        return () => clearTimeout(handler);
    }, [items, allPrescriptions, isOpen]);


    const handleItemChange = (index: number, field: keyof PrescriptionItem, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { medicationId: '', dosage: '', quantity: 1 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalItems = items.filter(
            item => item.medicationId && item.dosage && item.quantity && item.quantity > 0
        ) as PrescriptionItem[];

        if (finalItems.length === 0) {
            alert('Please add at least one valid medication to the prescription.');
            return;
        }

        onSave({
            patientId: patient.id,
            items: finalItems,
        });
        
        onClose();
    };

    const hasSevereInteraction = interactions.some(i => i.severity === 'Severe');
    const canSubmit = !isChecking && (!hasSevereInteraction || severeAcknowledged);

    const renderInteractionCheck = () => {
        const newMedicationIds = items.map(item => item?.medicationId).filter(Boolean);
        if (newMedicationIds.length === 0) return null;

        return (
            <div className="mt-4 border-t pt-4 space-y-2 dark:border-slate-700">
                <h4 className="font-semibold text-dark-text mb-2 dark:text-slate-200">Interaction Check</h4>
                {isChecking && <p className="text-sm text-light-text italic dark:text-slate-400">Checking for potential drug interactions...</p>}
                {checkError && <p className="text-sm text-red-500">{checkError}</p>}
                {!isChecking && interactions.length === 0 && !checkError && <p className="text-sm text-green-600 dark:text-green-400">No potential interactions found.</p>}
                {interactions.map((result, index) => {
                    const styles = severityStyles[result.severity];
                    return (
                        <div key={index} className={`p-3 rounded-lg border-l-4 ${styles.bg} ${styles.border}`}>
                            <div className="flex justify-between items-center">
                                <h5 className="font-bold text-dark-text dark:text-slate-200">{result.drugsInvolved.join(' + ')}</h5>
                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${styles.bg} ${styles.text}`}>{result.severity}</span>
                            </div>
                            <p className="mt-1 text-sm text-dark-text dark:text-slate-300">{result.explanation}</p>
                        </div>
                    );
                })}
                {hasSevereInteraction && (
                    <label className="flex items-center mt-2 p-2 bg-red-100 rounded-md dark:bg-red-900/20">
                        <input
                            type="checkbox"
                            checked={severeAcknowledged}
                            onChange={(e) => setSevereAcknowledged(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                        />
                        <span className="ml-2 text-sm font-medium text-red-800 dark:text-red-300">I acknowledge the severe interaction warning and wish to proceed.</span>
                    </label>
                )}
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 relative max-h-[90vh] flex flex-col dark:bg-slate-800">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-xl font-bold text-dark-text mb-4 dark:text-slate-200">Create Prescription for {patient.name}</h3>
                
                <form id="prescription-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2 space-y-4">
                    <h4 className="font-semibold text-dark-text mb-2 dark:text-slate-200">Medications</h4>
                    {items.map((item, index) => (
                         <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-center">
                            <select value={item.medicationId || ''} onChange={e => handleItemChange(index, 'medicationId', e.target.value)} className="col-span-5 p-2 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                                <option value="">Select Medication</option>
                                {MOCK_MEDICATIONS.map(med => <option key={med.id} value={med.id}>{med.name}</option>)}
                            </select>
                            <input type="text" placeholder="Dosage (e.g., 500mg)" value={item.dosage || ''} onChange={e => handleItemChange(index, 'dosage', e.target.value)} className="col-span-4 p-2 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required/>
                            <input type="number" placeholder="Qty" value={item.quantity || 1} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} className="col-span-2 p-2 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" min="1" required/>
                            <button type="button" onClick={() => removeItem(index)} className="col-span-1 text-red-500 hover:text-red-700 disabled:opacity-50" disabled={items.length === 1}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={addItem} className="text-sm font-semibold text-primary hover:underline mt-2">+ Add Another Medication</button>
                    {renderInteractionCheck()}
                </form>
                <div className="border-t pt-4 mt-4 flex justify-end dark:border-slate-700">
                    <button type="submit" form="prescription-form" disabled={!canSubmit} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {isChecking ? 'Analyzing...' : 'Create Prescription'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePrescriptionModal;
