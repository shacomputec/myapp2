

import React, { useState, useMemo, useEffect } from 'react';
import { Page } from '../types';
import type { Patient, MentalHealthSession, TherapyType, MoodEntry, WellbeingAssessment, Notification } from '../types';
import { useAuth } from '../services/auth';
import { getWellbeingInsights, getWellbeingAssessmentInterpretation, analyzeMoodForCrisis } from '../services/geminiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../services/theme';
import { MOCK_STAFF_MEMBERS } from '../constants';

const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
  <div className="bg-white p-6 rounded-xl shadow-md dark:bg-slate-800 dark:border dark:border-slate-700">
    <p className="text-sm font-medium text-light-text dark:text-slate-400">{title}</p>
    <p className="text-3xl font-bold text-dark-text dark:text-slate-200">{value}</p>
  </div>
);

const ScheduleSessionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (session: Omit<MentalHealthSession, 'id' | 'patientId' | 'patientName' | 'status'>) => void;
    patient: Patient;
}> = ({ isOpen, onClose, onSave, patient }) => {
    const [formData, setFormData] = useState({
        therapist: patient.mentalHealthProfile?.therapist || '',
        type: 'CBT' as TherapyType,
        date: new Date().toISOString().split('T')[0],
        time: '',
        notes: ''
    });

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.date || !formData.time) {
            alert('Please select a date and time.');
            return;
        }
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative dark:bg-slate-800">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-xl font-bold text-dark-text mb-4 dark:text-slate-200">Schedule Session for {patient.name}</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Therapist</label>
                            <input type="text" name="therapist" value={formData.therapist} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Session Type</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                                <option value="CBT">CBT</option>
                                <option value="Psychodynamic">Psychodynamic</option>
                                <option value="Group Therapy">Group Therapy</option>
                                <option value="Counseling">Counseling</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Date</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Time</label>
                            <input type="time" name="time" value={formData.time} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Session Notes (Optional)</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} className="w-full p-2 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-semibold">
                        Schedule
                    </button>
                </div>
            </form>
        </div>
    );
};

const LogMoodModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (entry: { rating: number; notes?: string }) => void;
    patient: Patient;
}> = ({ isOpen, onClose, onSave, patient }) => {
    const [rating, setRating] = useState<number | null>(null);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setRating(null);
            setNotes('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === null) {
            alert('Please select a mood rating.');
            return;
        }
        onSave({ rating, notes });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative dark:bg-slate-800">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-xl font-bold text-dark-text mb-4 dark:text-slate-200">Log Mood for {patient.name}</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-2 dark:text-slate-400">How are you feeling today? (1 = Very Poor, 10 = Excellent)</label>
                        <div className="flex justify-between items-center space-x-1">
                            {[...Array(10)].map((_, i) => {
                                const value = i + 1;
                                return (
                                    <button
                                        type="button"
                                        key={value}
                                        onClick={() => setRating(value)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                                            rating === value
                                                ? 'bg-primary text-white scale-110 shadow-lg'
                                                : 'bg-light-bg text-dark-text hover:bg-primary-dark hover:text-white dark:bg-slate-700 dark:text-slate-200'
                                        }`}
                                    >
                                        {value}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Notes (Optional)</label>
                        <textarea
                            name="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            className="w-full p-2 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                            placeholder="Any thoughts or events that might have influenced your mood?"
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-semibold disabled:bg-gray-400" disabled={rating === null}>
                        Save Entry
                    </button>
                </div>
            </form>
        </div>
    );
};

const RecordAssessmentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (assessment: Omit<WellbeingAssessment, 'id' | 'date'>) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const [type, setType] = useState<'GAD-7' | 'PHQ-9'>('GAD-7');
    const [score, setScore] = useState<number | ''>('');
    const [interpretation, setInterpretation] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setType('GAD-7');
            setScore('');
            setInterpretation('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleGenerateInterpretation = async () => {
        if (score === '') return;
        setIsGenerating(true);
        const result = await getWellbeingAssessmentInterpretation(type, score);
        setInterpretation(result);
        setIsGenerating(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (score === '' || !interpretation) {
            alert('Please enter a score and generate an interpretation.');
            return;
        }
        onSave({ type, score: Number(score), interpretation });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative dark:bg-slate-800">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-xl font-bold text-dark-text mb-4 dark:text-slate-200">Record Wellbeing Assessment</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Assessment Type</label>
                            <select value={type} onChange={e => setType(e.target.value as 'GAD-7' | 'PHQ-9')} className="w-full p-2 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                                <option value="GAD-7">GAD-7 (Anxiety)</option>
                                <option value="PHQ-9">PHQ-9 (Depression)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Score</label>
                            <input type="number" value={score} onChange={e => setScore(e.target.value === '' ? '' : parseInt(e.target.value))} required className="w-full p-2 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Clinical Interpretation</label>
                        <div className="flex items-center gap-2">
                            <input type="text" value={interpretation} readOnly placeholder="Click to generate interpretation" className="w-full p-2 border border-gray-300 rounded-lg bg-light-bg dark:bg-slate-900 dark:border-slate-600 dark:text-slate-300" />
                            <button type="button" onClick={handleGenerateInterpretation} disabled={isGenerating || score === ''} className="bg-secondary text-primary-dark px-3 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-400 disabled:opacity-50">
                                {isGenerating ? '...' : 'AI'}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-semibold disabled:bg-gray-400" disabled={!interpretation}>
                        Save Assessment
                    </button>
                </div>
            </form>
        </div>
    );
};

const SessionNotesModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (sessionId: string, notes: string) => void;
    session: MentalHealthSession | null;
}> = ({ isOpen, onClose, onSave, session }) => {
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (session) {
            setNotes(session.notes || '');
        }
    }, [session]);

    if (!isOpen || !session) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(session.id, notes);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 relative dark:bg-slate-800">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-xl font-bold text-dark-text mb-4 dark:text-slate-200">Session Notes</h3>
                <p className="text-sm text-light-text mb-4 dark:text-slate-400">
                    Session on {session.date} @ {session.time} with {session.therapist}
                </p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">
                            {session.status === 'Completed' ? 'Post-Session Notes' : 'Pre-Session Notes'}
                        </label>
                        <textarea
                            name="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={12}
                            className="w-full p-2 border border-gray-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                            placeholder="Enter session details, patient progress, observations, etc."
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-semibold">
                        Save Notes
                    </button>
                </div>
            </form>
        </div>
    );
};

const MentalHealthPatientDetail: React.FC<{ 
    patient: Patient; 
    onBack: () => void; 
    onUpdatePatient: (patient: Patient) => void;
    addNotification: (notification: Omit<Notification, 'id'>) => void;
}> = ({ patient, onBack, onUpdatePatient, addNotification }) => {
    const [activeTab, setActiveTab] = useState('Overview');
    const { hasPermission } = useAuth();
    const { theme } = useTheme();

    const [wellbeingInsights, setWellbeingInsights] = useState('');
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [isLogMoodModalOpen, setIsLogMoodModalOpen] = useState(false);
    const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState<MentalHealthSession | null>(null);


    const handleGetInsights = async () => {
        if (!patient.mentalHealthProfile) return;
        setIsLoadingInsights(true);
        const result = await getWellbeingInsights(
            patient.mentalHealthProfile.moodHistory,
            patient.mentalHealthProfile.assessments,
            patient.mentalHealthProfile.sessions
        );
        setWellbeingInsights(result);
        setIsLoadingInsights(false);
    };
    
    const handleSaveSession = (sessionData: Omit<MentalHealthSession, 'id' | 'patientId' | 'patientName' | 'status'>) => {
        if (!patient.mentalHealthProfile) return;

        const newSession: MentalHealthSession = {
            id: `MHS-${Date.now()}`,
            patientId: patient.id,
            patientName: patient.name,
            status: 'Scheduled',
            ...sessionData,
        };

        const updatedPatient: Patient = {
            ...patient,
            mentalHealthProfile: {
                ...patient.mentalHealthProfile,
                sessions: [newSession, ...patient.mentalHealthProfile.sessions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            },
        };
        onUpdatePatient(updatedPatient);
        setIsScheduleModalOpen(false);
    };

    const handleSaveMoodEntry = (entry: { rating: number; notes?: string }) => {
        if (!patient.mentalHealthProfile) return;
    
        const newEntry: MoodEntry = {
            date: new Date().toISOString().split('T')[0],
            rating: entry.rating,
            notes: entry.notes,
        };
    
        const updatedPatient: Patient = {
            ...patient,
            mentalHealthProfile: {
                ...patient.mentalHealthProfile,
                moodHistory: [...patient.mentalHealthProfile.moodHistory, newEntry],
            },
        };
        onUpdatePatient(updatedPatient);
        setIsLogMoodModalOpen(false);

        // Fire-and-forget background crisis analysis
        (async () => {
            try {
                const crisisResult = await analyzeMoodForCrisis(newEntry);
                if (crisisResult.isCrisis) {
                    addNotification({
                        type: 'crisis',
                        message: `CRISIS ALERT: Potential crisis detected for patient ${patient.name}. Reason: ${crisisResult.reason}`,
                        isRead: false,
                        timestamp: new Date().toISOString(),
                        link: { page: Page.MentalHealth, patientId: patient.id },
                        // Notify the patient's assigned therapist, or a default clinician/admin
                        userId: patient.mentalHealthProfile?.therapist ? MOCK_STAFF_MEMBERS.find(s => s.name === patient.mentalHealthProfile?.therapist)?.id || 'S001' : 'S001',
                    });
                }
            } catch (error) {
                console.error("Failed to run crisis analysis:", error);
                // Optionally, you could create a system notification here about the failure
            }
        })();
    };

    const handleSaveAssessment = (assessment: Omit<WellbeingAssessment, 'id' | 'date'>) => {
        if (!patient.mentalHealthProfile) return;
    
        const newAssessment: WellbeingAssessment = {
            id: `AS-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            ...assessment,
        };
    
        const updatedPatient: Patient = {
            ...patient,
            mentalHealthProfile: {
                ...patient.mentalHealthProfile,
                assessments: [newAssessment, ...patient.mentalHealthProfile.assessments],
            },
        };
        onUpdatePatient(updatedPatient);
        setIsAssessmentModalOpen(false);
    };

    const handleOpenNotesModal = (session: MentalHealthSession) => {
        setSelectedSession(session);
        setIsNotesModalOpen(true);
    };

    const handleSaveNotes = (sessionId: string, notes: string) => {
        if (!patient.mentalHealthProfile) return;

        const updatedSessions = patient.mentalHealthProfile.sessions.map(session =>
            session.id === sessionId ? { ...session, notes } : session
        );

        const updatedPatient: Patient = {
            ...patient,
            mentalHealthProfile: {
                ...patient.mentalHealthProfile,
                sessions: updatedSessions,
            },
        };
        onUpdatePatient(updatedPatient);
        setIsNotesModalOpen(false);
        setSelectedSession(null);
    };

    if (!patient.mentalHealthProfile) {
        return <div>This patient does not have a mental health profile.</div>
    }
    
    const moodChartData = patient.mentalHealthProfile.moodHistory
        .map(e => ({...e, date: new Date(e.date).toLocaleDateString()}))
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const sessionStatusColors: Record<MentalHealthSession['status'], string> = {
        Scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        Completed: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    };

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="text-primary font-semibold hover:underline">&larr; Back to Mental Health Dashboard</button>
            <div className="bg-white p-6 rounded-xl shadow-md flex items-start justify-between dark:bg-slate-800">
                <div>
                    <h3 className="text-2xl font-bold text-dark-text dark:text-slate-200">{patient.name}</h3>
                    <p className="text-light-text dark:text-slate-400">Diagnosis: <span className="font-semibold">{patient.mentalHealthProfile.diagnosis}</span></p>
                    <p className="text-light-text dark:text-slate-400">Therapist: <span className="font-semibold">{patient.mentalHealthProfile.therapist}</span></p>
                </div>
            </div>
             <div className="bg-white p-6 rounded-xl shadow-md dark:bg-slate-800">
                <nav className="flex space-x-4 border-b -mx-6 px-6 mb-4 dark:border-slate-700">
                    {['Overview', 'Sessions', 'Mood Tracking', 'Assessments'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-1 pb-2 text-sm font-semibold ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-light-text hover:text-dark-text dark:text-slate-400 dark:hover:text-slate-200'}`}>
                            {tab}
                        </button>
                    ))}
                </nav>
                
                {activeTab === 'Overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-dark-text dark:text-slate-200 mb-2">Treatment Plan</h4>
                            <p className="text-sm p-4 bg-light-bg rounded-md dark:bg-slate-700 dark:text-slate-300">{patient.mentalHealthProfile.treatmentPlan}</p>
                        </div>
                        <div>
                             <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-dark-text dark:text-slate-200">AI Wellbeing Insights</h4>
                                {hasPermission('admin:ai_assistant') && <button onClick={handleGetInsights} disabled={isLoadingInsights} className="text-xs bg-secondary text-primary-dark px-3 py-1 rounded-md font-semibold hover:bg-yellow-400 disabled:opacity-50">{isLoadingInsights ? 'Analyzing...' : 'Generate'}</button>}
                             </div>
                             <div className="p-4 bg-light-bg rounded-md min-h-[100px] dark:bg-slate-700">
                                {isLoadingInsights && <p className="text-sm text-light-text dark:text-slate-400">Generating insights...</p>}
                                {wellbeingInsights && <div className="prose prose-sm max-w-none text-gray-800 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: wellbeingInsights.replace(/\n/g, '<br />') }} />}
                             </div>
                        </div>
                    </div>
                )}
                {activeTab === 'Sessions' && (
                    <div>
                        <div className="flex justify-end mb-4">
                            <button onClick={() => setIsScheduleModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark">Schedule New Session</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-light-bg dark:bg-slate-700">
                                    <tr>
                                        <th className="p-3 font-semibold text-light-text dark:text-slate-300">Date & Time</th>
                                        <th className="p-3 font-semibold text-light-text dark:text-slate-300">Type</th>
                                        <th className="p-3 font-semibold text-light-text dark:text-slate-300">Therapist</th>
                                        <th className="p-3 font-semibold text-light-text dark:text-slate-300">Status</th>
                                        <th className="p-3 font-semibold text-light-text dark:text-slate-300">Notes</th>
                                        <th className="p-3 font-semibold text-light-text dark:text-slate-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="dark:text-slate-400">
                                    {patient.mentalHealthProfile.sessions.map(session => (
                                        <tr key={session.id} className="border-b dark:border-slate-700">
                                            <td className="p-3">{session.date} @ {session.time}</td>
                                            <td className="p-3">{session.type}</td>
                                            <td className="p-3">{session.therapist}</td>
                                            <td className="p-3">
                                                 <span className={`px-2 py-1 text-xs font-semibold rounded-full ${sessionStatusColors[session.status]}`}>{session.status}</span>
                                            </td>
                                            <td className="p-3 text-sm text-light-text dark:text-slate-400 max-w-xs truncate">
                                                {session.notes || 'N/A'}
                                            </td>
                                            <td className="p-3">
                                                <button
                                                    onClick={() => handleOpenNotesModal(session)}
                                                    className="text-primary hover:underline text-sm font-medium"
                                                >
                                                    View/Edit Notes
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {activeTab === 'Mood Tracking' && (
                    <div>
                        <div className="flex justify-end mb-4">
                            <button onClick={() => setIsLogMoodModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark">Log Mood</button>
                        </div>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <LineChart data={moodChartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#475569' : '#e5e7eb'}/>
                                    <XAxis dataKey="date" />
                                    <YAxis domain={[1, 10]} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="rating" name="Mood (1-10)" stroke="#8884d8" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
                 {activeTab === 'Assessments' && (
                     <div>
                        <div className="flex justify-end mb-4">
                            <button onClick={() => setIsAssessmentModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark">Record Assessment</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {patient.mentalHealthProfile.assessments.map(ass => (
                               <div key={ass.id} className="p-4 bg-light-bg rounded-lg dark:bg-slate-700">
                                   <p className="font-bold text-dark-text dark:text-slate-200">{ass.type} Assessment</p>
                                   <p className="text-sm text-light-text dark:text-slate-400">{ass.date}</p>
                                   <p className="text-3xl font-bold text-primary mt-2">{ass.score}</p>
                                   <p className="font-semibold text-dark-text dark:text-slate-300">{ass.interpretation}</p>
                               </div>
                           ))}
                       </div>
                    </div>
                )}

            </div>
            <ScheduleSessionModal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} onSave={handleSaveSession} patient={patient} />
            <LogMoodModal isOpen={isLogMoodModalOpen} onClose={() => setIsLogMoodModalOpen(false)} onSave={handleSaveMoodEntry} patient={patient} />
            <RecordAssessmentModal isOpen={isAssessmentModalOpen} onClose={() => setIsAssessmentModalOpen(false)} onSave={handleSaveAssessment} />
            <SessionNotesModal
                isOpen={isNotesModalOpen}
                onClose={() => { setIsNotesModalOpen(false); setSelectedSession(null); }}
                onSave={handleSaveNotes}
                session={selectedSession}
            />
        </div>
    );
};

const MentalHealth: React.FC<{ 
    patients: Patient[]; 
    selectedPatient: Patient | null;
    onSelectPatient: (patient: Patient | null) => void; 
    onUpdatePatient: (patient: Patient) => void; 
    addNotification: (notification: Omit<Notification, 'id'>) => void;
}> = ({ patients, selectedPatient, onSelectPatient, onUpdatePatient, addNotification }) => {
    
    const mentalHealthPatients = useMemo(() => patients.filter(p => p.mentalHealthProfile), [patients]);

    const summary = useMemo(() => ({
        totalPatients: mentalHealthPatients.length,
        upcomingSessions: mentalHealthPatients.flatMap(p => p.mentalHealthProfile?.sessions || []).filter(s => s.status === 'Scheduled').length,
        overdueAssessments: 5, // Mock data
    }), [mentalHealthPatients]);
    
    if (selectedPatient && mentalHealthPatients.some(p => p.id === selectedPatient.id)) {
        return <MentalHealthPatientDetail patient={selectedPatient} onBack={() => onSelectPatient(null)} onUpdatePatient={onUpdatePatient} addNotification={addNotification} />;
    }

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-dark-text dark:text-slate-200">Mental Health Dashboard</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Patients" value={summary.totalPatients} />
                <StatCard title="Upcoming Sessions" value={summary.upcomingSessions} />
                <StatCard title="Overdue Assessments" value={summary.overdueAssessments} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md dark:bg-slate-800">
                <h3 className="text-xl font-semibold text-dark-text mb-4 dark:text-slate-200">Patient Roster</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-light-bg dark:bg-slate-700">
                            <tr>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Patient</th>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Diagnosis</th>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Therapist</th>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="dark:text-slate-400">
                            {mentalHealthPatients.map(p => (
                                <tr key={p.id} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="p-3 font-medium text-dark-text dark:text-slate-200">{p.name}</td>
                                    <td className="p-3">{p.mentalHealthProfile?.diagnosis}</td>
                                    <td className="p-3">{p.mentalHealthProfile?.therapist}</td>
                                    <td className="p-3">
                                        <button onClick={() => onSelectPatient(p)} className="bg-primary text-white px-3 py-1 rounded-lg hover:bg-primary-dark text-sm">View Profile</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MentalHealth;