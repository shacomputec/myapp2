import React, { useState, useMemo } from 'react';
import type { Patient, TreatmentCycle, TreatmentType } from '../types';
import { useAuth } from '../services/auth';
import { getOncologyTreatmentExplanation } from '../services/geminiService';
import TreatmentCycleCard from './TreatmentCycleCard';

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

const ScheduleTreatmentModal: React.FC<{
    patient: Patient;
    isOpen: boolean;
    onClose: () => void;
    onSave: (patientId: string, cycle: Omit<TreatmentCycle, 'id'>) => void;
}> = ({ patient, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Omit<TreatmentCycle, 'id'>>>({
        type: 'Chemotherapy',
        status: 'Scheduled'
    });

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { type, startDate, endDate, status } = formData;
        if (!type || !startDate || !endDate || !status) {
            alert('Please fill all required fields.');
            return;
        }
        onSave(patient.id, formData as Omit<TreatmentCycle, 'id'>);
        onClose();
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative">
                 <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                <h3 className="text-xl font-bold text-dark-text mb-4">Schedule Treatment for {patient.name}</h3>
                <div className="space-y-4">
                    <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg">
                        {(['Chemotherapy', 'Radiation Therapy', 'Surgery', 'Targeted Therapy', 'Palliative Care'] as TreatmentType[]).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="date" name="startDate" value={formData.startDate || ''} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                        <input type="date" name="endDate" value={formData.endDate || ''} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                    </div>
                    <textarea name="notes" placeholder="Notes (e.g., specific drugs, dosage)" value={formData.notes || ''} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
                </div>
                 <div className="mt-6 flex justify-end">
                    <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-semibold">Schedule Cycle</button>
                </div>
            </form>
        </div>
    );
};

const TreatmentPlanModal: React.FC<{
    patient: Patient;
    isOpen: boolean;
    onClose: () => void;
    onScheduleNew: (patient: Patient) => void;
}> = ({ patient, isOpen, onClose, onScheduleNew }) => {
    const { hasPermission } = useAuth();
    const [explanation, setExplanation] = useState('');
    const [isExplaining, setIsExplaining] = useState(false);
    
    if(!isOpen) return null;

    const handleExplain = async (treatmentType: string) => {
        setIsExplaining(true);
        setExplanation('');
        const result = await getOncologyTreatmentExplanation(treatmentType);
        setExplanation(result);
        setIsExplaining(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-8 relative max-h-[90vh] flex flex-col">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                <h3 className="text-2xl font-bold text-dark-text mb-2">Treatment Plan for {patient.name}</h3>
                <p className="text-light-text mb-4">Diagnosis: {patient.oncologyProfile?.cancerType} (Stage {patient.oncologyProfile?.cancerStage})</p>
                <div className="flex-grow overflow-y-auto pr-2 border-t pt-4 space-y-4">
                    {patient.oncologyProfile?.treatmentPlan.map(cycle => <TreatmentCycleCard key={cycle.id} cycle={cycle} />)}

                    {hasPermission('admin:ai_assistant') && (
                        <div className="border-t pt-4">
                            <h4 className="font-semibold text-dark-text mb-2">Patient Education AI</h4>
                            <div className="flex items-center gap-2">
                                <p className="text-sm">Explain:</p>
                                <button onClick={() => handleExplain('Chemotherapy')} className="text-sm bg-secondary text-primary-dark px-3 py-1 rounded-md hover:bg-yellow-400">Chemotherapy</button>
                                <button onClick={() => handleExplain('Radiation Therapy')} className="text-sm bg-secondary text-primary-dark px-3 py-1 rounded-md hover:bg-yellow-400">Radiation</button>
                            </div>
                            {isExplaining && <p className="mt-2 text-sm text-light-text italic">Generating simple explanation...</p>}
                            {explanation && <p className="mt-2 text-sm bg-blue-50 p-3 rounded-md text-blue-800 italic">{explanation}</p>}
                        </div>
                    )}
                </div>
                <div className="border-t pt-4 mt-4 flex justify-end">
                    <button onClick={() => onScheduleNew(patient)} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-semibold">Schedule New Cycle</button>
                </div>
            </div>
        </div>
    );
};

interface OncologyProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onUpdatePatient: (patient: Patient) => void;
}

const Oncology: React.FC<OncologyProps> = ({ patients, onSelectPatient, onUpdatePatient }) => {
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const oncologyPatients = useMemo(() => patients.filter(p => p.oncologyProfile), [patients]);

  const summary = useMemo(() => {
      const activeTreatment = oncologyPatients.filter(p => p.oncologyProfile?.treatmentPlan.some(t => t.status === 'In Progress')).length;
      return {
          totalPatients: oncologyPatients.length,
          activeTreatment: activeTreatment,
          surgeriesToday: 0, 
          consultsToday: 2, 
      };
  }, [oncologyPatients]);
  
  const handleViewPlan = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsPlanModalOpen(true);
  };
  
  const handleScheduleNewFromModal = (patient: Patient) => {
    setIsPlanModalOpen(false);
    setSelectedPatient(patient);
    setIsScheduleModalOpen(true);
  };

  const handleSaveCycle = (patientId: string, cycle: Omit<TreatmentCycle, 'id'>) => {
    const patientToUpdate = patients.find(p => p.id === patientId);
    if (patientToUpdate && patientToUpdate.oncologyProfile) {
        const newCycle: TreatmentCycle = {
            id: `TC-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
            ...cycle,
            status: 'Scheduled' // Ensure new cycles are scheduled
        };
        const updatedProfile = {
            ...patientToUpdate.oncologyProfile,
            treatmentPlan: [...patientToUpdate.oncologyProfile.treatmentPlan, newCycle]
        };
        onUpdatePatient({ ...patientToUpdate, oncologyProfile: updatedProfile });
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-dark-text">Oncology Department</h2>
      
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Total Oncology Patients" value={summary.totalPatients.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857" /></svg>} />
            <StatCard title="Active Treatment" value={summary.activeTreatment.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>} />
            <StatCard title="Surgeries Today" value={summary.surgeriesToday.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} />
            <StatCard title="Consults Today" value={summary.consultsToday.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-dark-text mb-4">Oncology Patient Roster</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-light-bg">
                        <tr>
                            <th className="p-3 font-semibold text-light-text">Patient</th>
                            <th className="p-3 font-semibold text-light-text">Diagnosis</th>
                            <th className="p-3 font-semibold text-light-text">Current Status</th>
                            <th className="p-3 font-semibold text-light-text">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {oncologyPatients.map(patient => {
                            const currentCycle = patient.oncologyProfile?.treatmentPlan.find(t => t.status === 'In Progress');
                            return (
                                <tr key={patient.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">
                                        <button onClick={() => onSelectPatient(patient)} className="font-medium text-dark-text hover:underline">{patient.name}</button>
                                    </td>
                                    <td className="p-3">
                                        {patient.oncologyProfile?.cancerType} (Stage {patient.oncologyProfile?.cancerStage})
                                    </td>
                                    <td className="p-3 text-sm">
                                        {currentCycle ? `${currentCycle.type} - In Progress` : 'Monitoring'}
                                    </td>
                                    <td className="p-3">
                                        <button onClick={() => handleViewPlan(patient)} className="bg-primary text-white px-3 py-1 rounded-lg hover:bg-primary-dark text-sm">View Plan</button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
        {isPlanModalOpen && selectedPatient && (
            <TreatmentPlanModal 
                isOpen={isPlanModalOpen} 
                onClose={() => setIsPlanModalOpen(false)} 
                patient={selectedPatient}
                onScheduleNew={handleScheduleNewFromModal}
            />
        )}
        {isScheduleModalOpen && selectedPatient && (
            <ScheduleTreatmentModal 
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                patient={selectedPatient}
                onSave={handleSaveCycle}
            />
        )}
    </div>
  );
};

export default Oncology;
