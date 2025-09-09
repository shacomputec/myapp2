

import React, { useState, useMemo } from 'react';
import { MOCK_MEDICATIONS, MOCK_PATIENTS } from '../constants';
import type { Prescription, PrescriptionStatus, Patient, Medication, BillableItem, DrugInteractionResult, PillIdentificationResult } from '../types';
import { getPrescriptionReview, getDrugInteractionAnalysis, identifyPillFromImage } from '../services/geminiService';
import { useAuth } from '../services/auth';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; }> = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between dark:bg-slate-800 dark:border dark:border-slate-700">
    <div>
      <p className="text-sm font-medium text-light-text dark:text-slate-400">{title}</p>
      <p className="text-3xl font-bold text-dark-text dark:text-slate-200">{value}</p>
    </div>
    <div className="text-primary">
      {icon}
    </div>
  </div>
);

interface DispenseModalProps {
    prescription: Prescription;
    onClose: () => void;
    onDispense: (prescriptionId: string) => void;
    onUpdatePrescription: (updatedPrescription: Prescription) => void;
    patient: Patient | undefined;
    allPrescriptions: Prescription[];
}

const DispenseModal: React.FC<DispenseModalProps> = ({ prescription, onClose, onDispense, onUpdatePrescription, patient, allPrescriptions }) => {
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    const [aiError, setAiError] = useState('');
    const { hasPermission } = useAuth();
    const [expandedMedId, setExpandedMedId] = useState<string | null>(null);
    const [interactionResult, setInteractionResult] = useState<DrugInteractionResult[] | null>(null);
    const [isCheckingInteractions, setIsCheckingInteractions] = useState(false);

    
    const highlightDrugNames = (text: string, drugNames: string[]) => {
        if (drugNames.length === 0) return text;
        const regex = new RegExp(`\\b(${drugNames.join('|')})\\b`, 'gi');
        return text.replace(regex, (match) => `<strong class="font-bold text-primary dark:text-secondary">${match}</strong>`);
    };
    
    const prescriptionDrugNames = useMemo(() => 
        prescription.items
            .map(item => MOCK_MEDICATIONS.find(m => m.id === item.medicationId)?.name)
            .filter((name): name is string => !!name),
    [prescription.items]);

    const handleDispense = () => {
        onDispense(prescription.id);
        onClose();
    };

    const handleGetAiReview = async () => {
        if (!patient) {
            setAiError("Patient context is required for AI review.");
            return;
        }
        setIsLoadingAi(true);
        setAiError('');

        try {
            const currentPrescriptionItems = prescription.items.map(item => {
                const med = MOCK_MEDICATIONS.find(m => m.id === item.medicationId);
                return { name: med?.name || 'Unknown', dosage: item.dosage, quantity: item.quantity };
            });

            const existingPrescriptions = allPrescriptions
                .filter(p => p.id !== prescription.id && p.status !== 'Cancelled')
                .flatMap(p => p.items)
                .map(item => {
                    const med = MOCK_MEDICATIONS.find(m => m.id === item.medicationId);
                    return { name: med?.name || 'Unknown', dosage: item.dosage };
                });

            const review = await getPrescriptionReview(patient, currentPrescriptionItems, existingPrescriptions);
            onUpdatePrescription({ ...prescription, aiReview: review });
        } catch (error) {
            setAiError(error instanceof Error ? error.message : "An unknown error occurred.");
            console.error(error);
        } finally {
            setIsLoadingAi(false);
        }
    };
    
    const handleCheckInteractions = async () => {
        setIsCheckingInteractions(true);
        setInteractionResult(null);
        
        const allMedicationNames = allPrescriptions
            .filter(p => p.status !== 'Cancelled')
            .flatMap(p => p.items)
            .map(item => MOCK_MEDICATIONS.find(m => m.id === item.medicationId)?.name)
            .filter((name): name is string => !!name);
        
        const uniqueNames = [...new Set(allMedicationNames)];

        if (uniqueNames.length < 2) {
            setInteractionResult([]);
            setIsCheckingInteractions(false);
            return;
        }

        try {
            const result = await getDrugInteractionAnalysis(uniqueNames);
            setInteractionResult(result);
        } catch (e) {
            console.error(e);
        } finally {
            setIsCheckingInteractions(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 relative dark:bg-slate-800">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-2xl font-bold text-dark-text mb-2 dark:text-slate-200">Prescription Details ({prescription.id})</h3>
                <p className="text-light-text mb-1 dark:text-slate-400">Patient: {prescription.patientName}</p>
                <p className="text-light-text mb-4 dark:text-slate-400">Prescribed by: {prescription.doctor} on {prescription.date}</p>
                
                <div className="border-t pt-4 dark:border-slate-700">
                    <h4 className="font-semibold text-dark-text mb-2 dark:text-slate-200">Medications</h4>
                    <ul className="space-y-3">
                        {prescription.items.map((item, index) => {
                            const medication = MOCK_MEDICATIONS.find(m => m.id === item.medicationId);
                            if (!medication) return null;
                            const isLowStock = medication.stockLevel < medication.lowStockThreshold;

                            return (
                                <li key={index} className={`bg-light-bg rounded-lg dark:bg-slate-700 transition-all ${isLowStock ? 'ring-2 ring-accent/70' : ''}`}>
                                    <button 
                                        type="button" 
                                        onClick={() => setExpandedMedId(prev => prev === medication.id ? null : medication.id)} 
                                        className="w-full p-3 flex items-center justify-between text-left group"
                                        aria-expanded={expandedMedId === medication.id}
                                        aria-controls={`med-details-${medication.id}`}
                                    >
                                        <div className="flex-grow">
                                            <p className="font-bold text-dark-text dark:text-slate-200 group-hover:text-primary dark:group-hover:text-secondary transition-colors flex items-center">
                                                {medication.name}
                                                {isLowStock && (
                                                    <span title="Low Stock Warning">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent inline-block ml-2" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-sm text-light-text dark:text-slate-400">Dosage: {item.dosage} | Quantity: {item.quantity}</p>
                                        </div>
                                        <div className="flex items-center flex-shrink-0">
                                            <div className={`text-sm text-center font-semibold p-2 rounded-md mx-4 ${isLowStock ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'}`}>
                                                <div>Stock: {medication.stockLevel}</div>
                                                <div className="text-xs">{medication.unit}</div>
                                                {isLowStock && <div className="text-xs font-bold">(Low)</div>}
                                            </div>
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-400 transition-transform duration-300 transform ${expandedMedId === medication.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </button>
                                    <div 
                                        id={`med-details-${medication.id}`}
                                        className={`transition-all duration-500 ease-in-out overflow-hidden ${expandedMedId === medication.id ? 'max-h-96' : 'max-h-0'}`}
                                    >
                                        <div className="text-sm text-dark-text dark:text-slate-300 space-y-2 p-3 border-t border-gray-200 dark:border-slate-600">
                                            <div>
                                                <strong className="text-light-text dark:text-slate-400 block">Description:</strong>
                                                <p>{medication.description}</p>
                                            </div>
                                                <div>
                                                <strong className="text-light-text dark:text-slate-400 block">Manufacturer:</strong>
                                                <p>{medication.manufacturer}</p>
                                            </div>
                                                <div>
                                                <strong className="text-light-text dark:text-slate-400 block">Common Side Effects:</strong>
                                                <p>{medication.sideEffects.join(', ')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                
                 <div className="mt-4 pt-4 border-t dark:border-slate-700 space-y-2">
                    <button onClick={handleCheckInteractions} disabled={isCheckingInteractions} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200 text-sm font-semibold flex items-center dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/80 disabled:opacity-50">
                        {isCheckingInteractions ? 'Checking...' : 'Check All Patient Meds for Interactions'}
                    </button>
                    {interactionResult && interactionResult.length === 0 && <p className="text-sm text-green-600">No interactions found among the patient's active medications.</p>}
                    {interactionResult && interactionResult.map((res, i) => (
                         <div key={i} className={`p-3 rounded-md border-l-4 border-${res.severity.toLowerCase()}-500 bg-${res.severity.toLowerCase()}-50`}>
                             <p className="font-bold text-sm">{res.severity} Interaction: {res.drugsInvolved.join(' + ')}</p>
                             <p className="text-xs">{res.explanation}</p>
                         </div>
                    ))}
                 </div>

                <div className="mt-4 pt-4 border-t dark:border-slate-700">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-dark-text dark:text-slate-200">AI Review Assistant</h4>
                        {!prescription.aiReview && hasPermission('admin:ai_assistant') && (
                            <button
                                onClick={handleGetAiReview}
                                disabled={isLoadingAi}
                                className="bg-secondary text-primary-dark px-3 py-1 rounded-lg hover:bg-yellow-400 text-sm font-semibold flex items-center disabled:bg-gray-300 dark:disabled:bg-slate-600"
                            >
                                {isLoadingAi ? 'Analyzing...' : 'Get AI Review'}
                            </button>
                        )}
                    </div>
                    
                    {isLoadingAi && <p className="text-sm text-light-text italic mt-2 dark:text-slate-400">AI is reviewing this prescription...</p>}
                    {aiError && <p className="text-sm text-red-600 mt-2">{aiError}</p>}
                    
                    {prescription.aiReview && (
                        <div className="mt-2 space-y-3">
                            <div className="bg-blue-50 p-3 rounded-md dark:bg-blue-900/20">
                                <p className="font-semibold text-blue-800 text-sm dark:text-blue-300">Overall Assessment</p>
                                <p className="text-sm text-blue-700 italic dark:text-blue-200">"{prescription.aiReview.overallAssessment}"</p>
                            </div>
                            
                            {prescription.aiReview.dosageWarnings.length > 0 && (
                                <div className="bg-red-50 p-3 rounded-md dark:bg-red-900/20">
                                    <p className="font-semibold text-red-800 text-sm dark:text-red-300">Dosage Warnings</p>
                                    <ul className="list-disc pl-5 text-sm text-red-700 dark:text-red-200">
                                        {prescription.aiReview.dosageWarnings.map((warn, i) => <li key={i} dangerouslySetInnerHTML={{ __html: highlightDrugNames(warn, prescriptionDrugNames) }} />)}
                                    </ul>
                                </div>
                            )}
                            
                            {prescription.aiReview.redundancyAlerts.length > 0 && (
                                <div className="bg-yellow-50 p-3 rounded-md dark:bg-yellow-900/20">
                                    <p className="font-semibold text-yellow-800 text-sm dark:text-yellow-300">Redundancy Alerts</p>
                                    <ul className="list-disc pl-5 text-sm text-yellow-700 dark:text-yellow-200">
                                        {prescription.aiReview.redundancyAlerts.map((alert, i) => <li key={i} dangerouslySetInnerHTML={{ __html: highlightDrugNames(alert, prescriptionDrugNames) }} />)}
                                    </ul>
                                </div>
                            )}
                            
                            {prescription.aiReview.alternativeSuggestions.length > 0 && (
                                <div className="bg-teal-50 p-4 rounded-lg border-l-4 border-teal-500 dark:bg-teal-900/20 dark:border-teal-400">
                                    <div className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-600 dark:text-teal-300" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <p className="font-semibold text-teal-800 text-sm dark:text-teal-200">Alternative Suggestions</p>
                                    </div>
                                    <ul className="mt-2 space-y-2 text-sm text-teal-700 dark:text-teal-200">
                                        {prescription.aiReview.alternativeSuggestions.map((sugg, i) => (
                                            <li key={i} className="pl-2">
                                                <span dangerouslySetInnerHTML={{ __html: highlightDrugNames(sugg.original, prescriptionDrugNames) }} />
                                                <span className="mx-2 text-gray-400 dark:text-gray-500">&rarr;</span>
                                                <strong dangerouslySetInnerHTML={{ __html: highlightDrugNames(sugg.suggested, prescriptionDrugNames) }} />
                                                <p className="pl-5 text-xs italic text-gray-500 dark:text-gray-400">({sugg.reason})</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                             {prescription.aiReview.clarityFlags.length > 0 && (
                                <div className="bg-purple-50 p-3 rounded-md dark:bg-purple-900/20">
                                    <p className="font-semibold text-purple-800 text-sm dark:text-purple-300">Clarity Flags</p>
                                    <ul className="list-disc pl-5 text-sm text-purple-700 dark:text-purple-200">
                                        {prescription.aiReview.clarityFlags.map((flag, i) => <li key={i}>{flag}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end">
                    <button onClick={handleDispense} className="bg-success text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold">
                        Dispense Medication
                    </button>
                </div>
            </div>
        </div>
    );
};

interface PharmacyProps {
  onSelectPatient: (patient: Patient) => void;
  prescriptions: Prescription[];
  setPrescriptions: React.Dispatch<React.SetStateAction<Prescription[]>>;
  onAddBillableItem: (itemData: Omit<BillableItem, 'id' | 'patientName' | 'status' | 'date'>) => void;
}

const Pharmacy: React.FC<PharmacyProps> = ({ onSelectPatient, prescriptions, setPrescriptions, onAddBillableItem }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
    const [pillImage, setPillImage] = useState<File | null>(null);
    const [pillImagePreview, setPillImagePreview] = useState<string | null>(null);
    const [pillIdResult, setPillIdResult] = useState<PillIdentificationResult | null>(null);
    const [isIdentifying, setIsIdentifying] = useState(false);
    const [pillIdError, setPillIdError] = useState('');

    const filteredPrescriptions = useMemo(() => 
        prescriptions.filter(p =>
            p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [prescriptions, searchTerm]);

    const pharmacySummary = useMemo(() => {
        const pending = prescriptions.filter(p => p.status === 'Pending').length;
        const dispensedToday = prescriptions.filter(p => p.status === 'Dispensed' && p.date === new Date().toISOString().split('T')[0]).length;
        const lowStock = MOCK_MEDICATIONS.filter(m => m.stockLevel < m.lowStockThreshold).length;
        return { pending, dispensedToday, lowStock };
    }, [prescriptions]);

    const handleDispense = (prescriptionId: string) => {
        const prescription = prescriptions.find(p => p.id === prescriptionId);
        if (!prescription) return;
        
        setPrescriptions(prev => prev.map(p => p.id === prescriptionId ? { ...p, status: 'Dispensed' } : p));
        
        prescription.items.forEach(item => {
            const medication = MOCK_MEDICATIONS.find(med => med.id === item.medicationId);
            if (medication) {
                onAddBillableItem({
                    patientId: prescription.patientId,
                    description: `Medication: ${medication.name} (x${item.quantity})`,
                    amount: medication.unitPrice * item.quantity,
                });
            }
        });
    };

    const handleUpdatePrescription = (updatedPrescription: Prescription) => {
        setPrescriptions(prev => prev.map(p => p.id === updatedPrescription.id ? updatedPrescription : p));
        if (selectedPrescription?.id === updatedPrescription.id) {
            setSelectedPrescription(updatedPrescription);
        }
    };
    
    const handleSelectPatientById = (patientId: string) => {
        const patient = MOCK_PATIENTS.find(p => p.id === patientId);
        if(patient) onSelectPatient(patient);
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) { // 4MB limit
                setPillIdError('Image size cannot exceed 4MB.');
                return;
            }
            setPillImage(file);
            setPillIdResult(null);
            setPillIdError('');
            const reader = new FileReader();
            reader.onloadend = () => {
                setPillImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleIdentifyPill = async () => {
        if (!pillImage) return;

        setIsIdentifying(true);
        setPillIdError('');
        setPillIdResult(null);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(pillImage);
            reader.onload = async () => {
                const base64Image = (reader.result as string).split(',')[1];
                const result = await identifyPillFromImage(base64Image);
                setPillIdResult(result);
                setIsIdentifying(false);
            };
            reader.onerror = () => {
                throw new Error("Failed to read the image file.");
            };
        } catch (e) {
            console.error(e);
            setPillIdError(e instanceof Error ? e.message : "An unknown error occurred.");
            setIsIdentifying(false);
        }
    };

    const statusColors: { [key in PrescriptionStatus]: string } = {
        Pending: 'bg-yellow-100 text-yellow-800',
        Dispensed: 'bg-green-100 text-green-800',
        Cancelled: 'bg-red-100 text-red-800',
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-dark-text dark:text-slate-200">Pharmacy</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Pending Prescriptions" value={pharmacySummary.pending.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <StatCard title="Dispensed Today" value={pharmacySummary.dispensedToday.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <StatCard title="Low Stock Medications" value={pharmacySummary.lowStock.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md dark:bg-slate-800 dark:border dark:border-slate-700">
                <h3 className="text-xl font-semibold text-dark-text dark:text-slate-200 mb-4">AI Pill Identifier</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div>
                        <input type="file" id="pill-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
                        <label htmlFor="pill-upload" className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-light-bg dark:border-slate-600 dark:hover:bg-slate-700">
                            {pillImagePreview ? (
                                <img src={pillImagePreview} alt="Pill preview" className="h-full w-full object-contain rounded-lg" />
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <p className="text-sm text-gray-500 mt-2">Click to upload or take a photo</p>
                                </>
                            )}
                        </label>
                        <button onClick={handleIdentifyPill} disabled={!pillImage || isIdentifying} className="mt-4 w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary-dark disabled:bg-gray-400">
                            {isIdentifying ? 'Identifying...' : 'Identify Pill'}
                        </button>
                    </div>
                    <div className="bg-light-bg dark:bg-slate-900/50 p-4 rounded-lg min-h-[240px]">
                        <h4 className="font-semibold text-dark-text dark:text-slate-200 mb-2">Results</h4>
                        {isIdentifying && <p className="text-sm text-light-text dark:text-slate-400">Analyzing image...</p>}
                        {pillIdError && <p className="text-sm text-red-600">{pillIdError}</p>}
                        {pillIdResult && (
                            <div className="text-sm space-y-2">
                                <p><strong>Name:</strong> {pillIdResult.pillName}</p>
                                <p><strong>Dosage:</strong> {pillIdResult.dosage}</p>
                                <p><strong>Common Uses:</strong> {pillIdResult.commonUses}</p>
                                <p><strong>Side Effects:</strong> {pillIdResult.sideEffects.join(', ')}</p>
                                <p><strong>Confidence:</strong> <span className="font-bold">{pillIdResult.confidence}</span></p>
                                <p className="text-xs italic text-red-500 mt-2">{pillIdResult.disclaimer}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md dark:bg-slate-800 dark:border dark:border-slate-700">
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search by prescription ID or patient name..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-light-bg dark:bg-slate-700">
                            <tr>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Prescription ID</th>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Patient</th>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Date</th>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Status</th>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="dark:text-slate-400">
                            {filteredPrescriptions.map((p) => (
                                <tr key={p.id} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="p-3 font-medium text-primary">{p.id}</td>
                                    <td className="p-3">
                                        <button onClick={() => handleSelectPatientById(p.patientId)} className="font-medium text-dark-text hover:underline dark:text-slate-200">{p.patientName}</button>
                                    </td>
                                    <td className="p-3">{p.date}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[p.status]}`}>{p.status}</span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <button onClick={() => setSelectedPrescription(p)} className="text-primary hover:underline text-sm font-medium">
                                            {p.status === 'Pending' ? 'View & Dispense' : 'View Details'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedPrescription && (
                <DispenseModal 
                    prescription={selectedPrescription} 
                    onClose={() => setSelectedPrescription(null)} 
                    onDispense={handleDispense}
                    onUpdatePrescription={handleUpdatePrescription}
                    patient={MOCK_PATIENTS.find(p => p.id === selectedPrescription.patientId)}
                    allPrescriptions={prescriptions.filter(p => p.patientId === selectedPrescription.patientId)}
                />
            )}
        </div>
    );
};

export default Pharmacy;