import React, { useState, useMemo, useCallback } from 'react';
import type { Patient, Bed, BedStatus } from '../types';
import SummaryModal from './SummaryModal';
import { getDischargePrediction } from '../services/geminiService';
import { useAuth } from '../services/auth';


// Mock data for beds
const MOCK_BEDS: Bed[] = [
    { id: 'GW-101', ward: 'General Ward', status: 'Occupied', patientId: 'P001', patientName: 'Ama Serwaa' },
    { id: 'GW-102', ward: 'General Ward', status: 'Available' },
    { id: 'GW-103', ward: 'General Ward', status: 'Cleaning' },
    { id: 'GW-104', ward: 'General Ward', status: 'Available' },
    { id: 'MAT-201', ward: 'Maternity', status: 'Occupied', patientId: 'P003', patientName: 'Adwoa Boateng' },
    { id: 'MAT-202', ward: 'Maternity', status: 'Available' },
    { id: 'ICU-301', ward: 'ICU', status: 'Occupied', patientId: 'P002', patientName: 'Kofi Annan' },
    { id: 'ICU-302', ward: 'ICU', status: 'Cleaning' },
    { id: 'PED-401', ward: 'Pediatrics', status: 'Available' },
    { id: 'PED-402', ward: 'Pediatrics', status: 'Available' },
];

// Reusable components
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

interface AssignPatientModalProps {
    bed: Bed;
    onClose: () => void;
    onAssign: (bedId: string, patient: Patient) => void;
    allPatients: Patient[];
    occupiedBedPatientIds: string[];
}

const AssignPatientModal: React.FC<AssignPatientModalProps> = ({ bed, onClose, onAssign, allPatients, occupiedBedPatientIds }) => {
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const availablePatients = allPatients.filter(p => !occupiedBedPatientIds.includes(p.id));

    const handleAssign = () => {
        const patient = allPatients.find(p => p.id === selectedPatientId);
        if (patient) {
            onAssign(bed.id, patient);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative dark:bg-slate-800">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-xl font-bold text-dark-text mb-4 dark:text-slate-200">Assign Patient to Bed {bed.id}</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Select Patient</label>
                        <select
                            value={selectedPatientId}
                            onChange={(e) => setSelectedPatientId(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                        >
                            <option value="">-- Select a patient --</option>
                            {availablePatients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                        </select>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={handleAssign} disabled={!selectedPatientId} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors font-semibold disabled:bg-gray-400">
                        Assign Bed
                    </button>
                </div>
            </div>
        </div>
    );
};


interface BedManagementProps {
    onSelectPatient: (patient: Patient) => void;
    patients: Patient[];
}

const BedManagement: React.FC<BedManagementProps> = ({ onSelectPatient, patients }) => {
    const [beds, setBeds] = useState<Bed[]>(MOCK_BEDS);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedBed, setSelectedBed] = useState<Bed | null>(null);

    const [isPredictionModalOpen, setIsPredictionModalOpen] = useState(false);
    const [predictionContent, setPredictionContent] = useState('');
    const [isGeneratingPrediction, setIsGeneratingPrediction] = useState(false);
    const [predictionPatient, setPredictionPatient] = useState<Patient | null>(null);
    const { hasPermission } = useAuth();

    const summary = useMemo(() => ({
        total: beds.length,
        occupied: beds.filter(b => b.status === 'Occupied').length,
        available: beds.filter(b => b.status === 'Available').length,
    }), [beds]);

    const bedsByWard = useMemo(() => {
        return beds.reduce((acc, bed) => {
            (acc[bed.ward] = acc[bed.ward] || []).push(bed);
            return acc;
        }, {} as Record<string, Bed[]>);
    }, [beds]);

    const occupiedBedPatientIds = useMemo(() =>
        beds.map(b => b.patientId).filter((id): id is string => !!id),
    [beds]);

    const handleAssign = (bedId: string, patient: Patient) => {
        setBeds(prev => prev.map(b => b.id === bedId ? { ...b, status: 'Occupied', patientId: patient.id, patientName: patient.name } : b));
    };

    const handleDischarge = (bedId: string) => {
        setBeds(prev => prev.map(b => b.id === bedId ? { ...b, status: 'Cleaning', patientId: null, patientName: null } : b));
    };

    const handleMarkAvailable = (bedId: string) => {
        setBeds(prev => prev.map(b => b.id === bedId ? { ...b, status: 'Available' } : b));
    };
    
    const handlePredictDischarge = useCallback(async (bed: Bed) => {
        const patient = patients.find(p => p.id === bed.patientId);
        if (!patient) return;

        setPredictionPatient(patient);
        setIsGeneratingPrediction(true);
        setPredictionContent('');
        setIsPredictionModalOpen(true);

        const patientData = `
            - Age: ${patient.age}, Gender: ${patient.gender}
            - Primary Diagnosis: ${patient.medicalHistory[0]?.diagnosis || 'N/A'}
            - Recent Treatment: ${patient.medicalHistory[0]?.treatment || 'N/A'}
            - Allergies: ${patient.allergies.join(', ') || 'None'}
        `;

        try {
            const result = await getDischargePrediction(patientData);
            setPredictionContent(result);
        } catch (error) {
            console.error(error);
            setPredictionContent("Could not generate prediction at this time.");
        } finally {
            setIsGeneratingPrediction(false);
        }
    }, [patients]);


    const statusStyles: Record<BedStatus, { bg: string, text: string, border: string }> = {
        Available: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-800 dark:text-green-300', border: 'border-green-300 dark:border-green-500/30' },
        Occupied: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-800 dark:text-red-300', border: 'border-red-300 dark:border-red-500/30' },
        Cleaning: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-800 dark:text-yellow-300', border: 'border-yellow-300 dark:border-yellow-500/30' },
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-dark-text dark:text-slate-200">Bed Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Beds" value={summary.total.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>} />
                <StatCard title="Occupied Beds" value={summary.occupied.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
                <StatCard title="Available Beds" value={summary.available.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>} />
            </div>

            {Object.entries(bedsByWard).map(([ward, wardBeds]) => (
                <div key={ward} className="bg-white p-6 rounded-xl shadow-md dark:bg-slate-800 dark:border dark:border-slate-700">
                    <h3 className="text-xl font-semibold text-dark-text mb-4 dark:text-slate-200">{ward}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {wardBeds.map(bed => {
                            const styles = statusStyles[bed.status];
                            const patient = patients.find(p => p.id === bed.patientId);
                            return (
                                <div key={bed.id} className={`p-4 rounded-lg border ${styles.bg} ${styles.border} flex flex-col justify-between`}>
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-bold text-lg text-dark-text dark:text-slate-200">{bed.id}</h4>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-white dark:bg-slate-900 ${styles.text}`}>{bed.status}</span>
                                        </div>
                                        <div className="h-12">
                                            {bed.status === 'Occupied' && bed.patientName && (
                                                <div>
                                                    <p className="font-semibold text-dark-text dark:text-slate-200">{bed.patientName}</p>
                                                    <button onClick={() => patient && onSelectPatient(patient)} className="text-xs text-primary hover:underline">View Patient</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        {bed.status === 'Available' && <button onClick={() => { setSelectedBed(bed); setIsAssignModalOpen(true); }} className="w-full bg-primary text-white py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark">Assign Patient</button>}
                                        {bed.status === 'Occupied' && (
                                            <>
                                                <button onClick={() => handleDischarge(bed.id)} className="w-full bg-accent text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-700">Discharge</button>
                                                {hasPermission('admin:ai_assistant') && (
                                                    <button 
                                                        onClick={() => handlePredictDischarge(bed)} 
                                                        className="w-full bg-secondary text-primary-dark py-2 rounded-lg text-sm font-semibold hover:bg-yellow-400 flex items-center justify-center"
                                                    >
                                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        AI Predict Discharge
                                                    </button>
                                                )}
                                            </>
                                        )}
                                        {bed.status === 'Cleaning' && <button onClick={() => handleMarkAvailable(bed.id)} className="w-full bg-success text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700">Mark as Available</button>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}
            {isAssignModalOpen && selectedBed && <AssignPatientModal bed={selectedBed} onClose={() => setIsAssignModalOpen(false)} onAssign={handleAssign} allPatients={patients} occupiedBedPatientIds={occupiedBedPatientIds}/>}
             {predictionPatient && (
                <SummaryModal
                    isOpen={isPredictionModalOpen}
                    onClose={() => setIsPredictionModalOpen(false)}
                    content={predictionContent}
                    patientName={predictionPatient.name}
                    title={`AI Discharge Prediction for ${predictionPatient.name}`}
                    isLoading={isGeneratingPrediction}
                />
            )}
        </div>
    );
};

export default BedManagement;
