
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MOCK_PATIENTS, MOCK_EMERGENCY_VISITS } from '../constants';
import type { Patient, EmergencyVisit, TriageLevel, ERStatus, TriageSuggestion } from '../types';
import { useAuth } from '../services/auth';
import { getTriageSuggestion } from '../services/geminiService';

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

const triageLevels: TriageLevel[] = ['Resuscitation (I)', 'Emergent (II)', 'Urgent (III)', 'Non-urgent (IV)'];
const erStatuses: ERStatus[] = ['Waiting for Triage', 'In Triage', 'In Treatment', 'Awaiting Labs', 'Awaiting Admission', 'Discharged', 'Admitted'];


interface TriageModalProps {
    visit: EmergencyVisit;
    isOpen: boolean;
    onClose: () => void;
    onSave: (visitId: string, triageLevel: TriageLevel, notes: string) => void;
    suggestedLevel?: TriageLevel;
}

const TriageModal: React.FC<TriageModalProps> = ({ visit, isOpen, onClose, onSave, suggestedLevel }) => {
    const [triageLevel, setTriageLevel] = useState<TriageLevel>(suggestedLevel || 'Urgent (III)');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTriageLevel(suggestedLevel || 'Urgent (III)');
            setNotes('');
        }
    }, [isOpen, suggestedLevel]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        onSave(visit.id, triageLevel, notes);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                <h3 className="text-xl font-bold text-dark-text mb-2">Triage Assessment</h3>
                <p className="mb-4 text-light-text">Patient: {visit.patientName}</p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1">Triage Level</label>
                        <select value={triageLevel} onChange={e => setTriageLevel(e.target.value as TriageLevel)} className="w-full p-2 border border-gray-300 rounded-lg">
                            {triageLevels.map(level => <option key={level} value={level}>{level}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1">Triage Notes</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="w-full p-2 border border-gray-300 rounded-lg" placeholder="Initial observations, vitals..."></textarea>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={handleSubmit} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-semibold">Save Triage</button>
                </div>
            </div>
        </div>
    );
};

interface UpdateStatusModalProps {
    visit: EmergencyVisit;
    isOpen: boolean;
    onClose: () => void;
    onSave: (visitId: string, status: ERStatus) => void;
}

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({ visit, isOpen, onClose, onSave }) => {
    const [status, setStatus] = useState<ERStatus>(visit.status);
    
    if (!isOpen) return null;

    const handleSubmit = () => {
        onSave(visit.id, status);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                <h3 className="text-xl font-bold text-dark-text mb-2">Update Status</h3>
                 <p className="mb-4 text-light-text">Patient: {visit.patientName}</p>
                 <label className="block text-sm font-medium text-light-text mb-1">New Status</label>
                 <select value={status} onChange={e => setStatus(e.target.value as ERStatus)} className="w-full p-2 border border-gray-300 rounded-lg">
                    {erStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
                 <div className="mt-6 flex justify-end">
                    <button onClick={handleSubmit} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-semibold">Update Status</button>
                </div>
            </div>
        </div>
    )
}

interface TriageSuggestionModalProps {
    visit: EmergencyVisit | null;
    suggestion: TriageSuggestion | null;
    isOpen: boolean;
    isLoading: boolean;
    onClose: () => void;
    onAccept: (level: TriageLevel) => void;
    onManual: () => void;
}

const TriageSuggestionModal: React.FC<TriageSuggestionModalProps> = ({ visit, suggestion, isOpen, isLoading, onClose, onAccept, onManual }) => {
    if (!isOpen) return null;

    const handleAccept = () => {
        if (suggestion && suggestion.suggestedLevel && triageLevels.includes(suggestion.suggestedLevel)) {
            onAccept(suggestion.suggestedLevel as TriageLevel);
        }
    };
    
    const isError = suggestion && !triageLevels.includes(suggestion.suggestedLevel);
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative dark:bg-slate-800">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-xl font-bold text-dark-text mb-2 dark:text-slate-200">AI Triage Suggestion</h3>
                <p className="mb-4 text-light-text dark:text-slate-400">For: {visit?.patientName}</p>
                
                <div className="bg-light-bg p-4 rounded-lg min-h-[150px] dark:bg-slate-700">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full text-light-text dark:text-slate-400">
                            <svg className="animate-spin h-8 w-8 text-primary mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p>Analyzing patient complaint...</p>
                        </div>
                    ) : suggestion ? (
                        <div className="space-y-2">
                             <p className="text-sm font-semibold text-dark-text dark:text-slate-200">Suggested Level:</p>
                             <p className={`text-lg font-bold ${isError ? 'text-accent' : 'text-primary'}`}>{suggestion.suggestedLevel}</p>
                             <p className="text-sm font-semibold text-dark-text dark:text-slate-200 mt-2">Rationale:</p>
                             <p className="text-sm text-light-text dark:text-slate-300">{suggestion.rationale}</p>
                        </div>
                    ) : null}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onManual} className="bg-gray-200 text-dark-text px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">
                        Triage Manually
                    </button>
                    <button 
                        onClick={handleAccept} 
                        disabled={isLoading || !suggestion || isError}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark font-semibold disabled:bg-gray-400"
                    >
                        Accept & Triage
                    </button>
                </div>
            </div>
        </div>
    );
};


const Emergency: React.FC<{ onSelectPatient: (patient: Patient) => void }> = ({ onSelectPatient }) => {
    const [visits, setVisits] = useState<EmergencyVisit[]>(MOCK_EMERGENCY_VISITS);
    const [now, setNow] = useState(new Date());
    const [selectedVisit, setSelectedVisit] = useState<EmergencyVisit | null>(null);
    const [isTriageModalOpen, setIsTriageModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const { hasPermission } = useAuth();
    
    const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
    const [suggestion, setSuggestion] = useState<TriageSuggestion | null>(null);
    const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
    const [suggestionPatient, setSuggestionPatient] = useState<EmergencyVisit | null>(null);
    const [prefilledTriageLevel, setPrefilledTriageLevel] = useState<TriageLevel | undefined>(undefined);
    
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    const summary = useMemo(() => {
        const waitingForTriage = visits.filter(v => v.status === 'Waiting for Triage');
        const totalWait = waitingForTriage.reduce((sum, v) => sum + (now.getTime() - new Date(v.arrivalTime).getTime()), 0);
        const avgWaitMinutes = waitingForTriage.length > 0 ? Math.round(totalWait / waitingForTriage.length / 60000) : 0;
        
        return {
            currentPatients: visits.length,
            waitingForTriage: waitingForTriage.length,
            avgWaitTime: `${avgWaitMinutes} min`,
            openBeds: 8 - visits.filter(v => v.status === 'In Treatment' || v.status === 'In Triage').length, // Mock data
        }
    }, [visits, now]);
    
    const handleTriageSave = (visitId: string, triageLevel: TriageLevel, notes: string) => {
        setVisits(prev => prev.map(v => v.id === visitId ? {...v, triageLevel, notes, status: 'In Triage'} : v));
    };

    const handleUpdateStatusSave = (visitId: string, status: ERStatus) => {
        if (status === 'Discharged' || status === 'Admitted') {
            setVisits(prev => prev.filter(v => v.id !== visitId));
        } else {
            setVisits(prev => prev.map(v => v.id === visitId ? { ...v, status } : v));
        }
    };
    
    const timeInER = (arrivalTime: string) => {
        const diff = now.getTime() - new Date(arrivalTime).getTime();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    };

    const triageColors: Record<TriageLevel, string> = {
        'Resuscitation (I)': 'bg-red-500',
        'Emergent (II)': 'bg-orange-500',
        'Urgent (III)': 'bg-yellow-400',
        'Non-urgent (IV)': 'bg-green-500',
    };

    const handleGetTriageSuggestion = useCallback(async (visit: EmergencyVisit) => {
        const patient = MOCK_PATIENTS.find(p => p.id === visit.patientId);
        if (!patient) return;

        setSuggestionPatient(visit);
        setIsGeneratingSuggestion(true);
        setSuggestion(null);
        setIsSuggestionModalOpen(true);

        try {
            const result = await getTriageSuggestion(patient.age, patient.gender, visit.chiefComplaint);
            setSuggestion(result);
        } catch (error) {
            console.error(error);
            setSuggestion({ suggestedLevel: 'Error' as TriageLevel, rationale: 'Could not generate a triage suggestion at this time.' });
        } finally {
            setIsGeneratingSuggestion(false);
        }
    }, []);
    
    const handleAcceptSuggestion = (level: TriageLevel) => {
        setIsSuggestionModalOpen(false);
        setPrefilledTriageLevel(level);
        setSelectedVisit(suggestionPatient);
        setIsTriageModalOpen(true);
    };
    
    const handleManualTriage = () => {
        setIsSuggestionModalOpen(false);
        setPrefilledTriageLevel(undefined);
        setSelectedVisit(suggestionPatient);
        setIsTriageModalOpen(true);
    };


  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-dark-text">Emergency Room Dashboard</h2>
      
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Current Patients" value={summary.currentPatients.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857" /></svg>} />
            <StatCard title="Waiting for Triage" value={summary.waitingForTriage.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
            <StatCard title="Avg. Wait Time" value={summary.avgWaitTime} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
            <StatCard title="Open ER Beds" value={summary.openBeds.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-dark-text mb-4">ER Patient Tracker</h3>
            <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-light-bg">
                <tr>
                    <th className="p-3 font-semibold text-light-text">Patient</th>
                    <th className="p-3 font-semibold text-light-text">Time in ER</th>
                    <th className="p-3 font-semibold text-light-text">Chief Complaint</th>
                    <th className="p-3 font-semibold text-light-text">Triage Level</th>
                    <th className="p-3 font-semibold text-light-text">Status</th>
                    <th className="p-3 font-semibold text-light-text">Actions</th>
                </tr>
                </thead>
                <tbody>
                {visits.map(visit => {
                    const patient = MOCK_PATIENTS.find(p => p.id === visit.patientId);
                    return (
                        <tr key={visit.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium text-dark-text flex items-center">
                            <img src={visit.avatarUrl} alt={visit.patientName} className="w-8 h-8 rounded-full mr-3" />
                            <button onClick={() => patient && onSelectPatient(patient)} className="hover:underline">{visit.patientName}</button>
                        </td>
                        <td className="p-3">{timeInER(visit.arrivalTime)}</td>
                        <td className="p-3 text-sm">{visit.chiefComplaint}</td>
                        <td className="p-3">
                            {visit.triageLevel ? (
                                <span className={`px-2 py-1 text-xs font-bold text-white rounded-full ${triageColors[visit.triageLevel]}`}>
                                    {visit.triageLevel}
                                </span>
                            ) : (
                                <span className="text-xs text-light-text italic">Not triaged</span>
                            )}
                        </td>
                        <td className="p-3 text-sm font-semibold">{visit.status}</td>
                        <td className="p-3 space-x-2 flex items-center">
                             {visit.status === 'Waiting for Triage' ? (
                                <>
                                <button onClick={() => { setSelectedVisit(visit); setPrefilledTriageLevel(undefined); setIsTriageModalOpen(true); }} className="bg-primary text-white px-3 py-1 rounded-lg hover:bg-primary-dark text-sm">Triage</button>
                                {hasPermission('admin:ai_assistant') && (
                                    <button
                                        onClick={() => handleGetTriageSuggestion(visit)}
                                        className="bg-secondary text-primary-dark p-2 rounded-lg hover:bg-yellow-400 transition-colors"
                                        title="Get AI Triage Suggestion"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </button>
                                )}
                                </>
                             ) : (
                                <button onClick={() => { setSelectedVisit(visit); setIsUpdateModalOpen(true); }} className="text-primary hover:underline text-sm font-medium">Update Status</button>
                             )}
                        </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
            </div>
        </div>

        {isTriageModalOpen && selectedVisit && (
            <TriageModal 
                isOpen={isTriageModalOpen} 
                onClose={() => setIsTriageModalOpen(false)} 
                visit={selectedVisit} 
                onSave={handleTriageSave}
                suggestedLevel={prefilledTriageLevel}
            />
        )}
        {isUpdateModalOpen && selectedVisit && (
            <UpdateStatusModal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} visit={selectedVisit} onSave={handleUpdateStatusSave} />
        )}
        <TriageSuggestionModal
            isOpen={isSuggestionModalOpen}
            onClose={() => setIsSuggestionModalOpen(false)}
            visit={suggestionPatient}
            suggestion={suggestion}
            isLoading={isGeneratingSuggestion}
            onAccept={handleAcceptSuggestion}
            onManual={handleManualTriage}
        />
    </div>
  );
};

export default Emergency;
