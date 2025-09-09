import React, { useState, useMemo } from 'react';
import { MOCK_PATIENTS, MOCK_STAFF_MEMBERS } from '../constants';
import type { Patient, TherapySession, TherapyStatus } from '../types';

interface PhysiotherapyProps {
  therapySessions: TherapySession[];
  setTherapySessions: React.Dispatch<React.SetStateAction<TherapySession[]>>;
  onSelectPatient: (patient: Patient) => void;
}

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

const ScheduleSessionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (session: Omit<TherapySession, 'id'>) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Omit<TherapySession, 'id'>>>({
        status: 'Scheduled',
        therapist: 'John Doe',
    });

     if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
    };
    
    const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const patient = MOCK_PATIENTS.find(p => p.id === e.target.value);
        setFormData(prev => ({...prev, patientId: patient?.id, patientName: patient?.name}));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.patientId || !formData.date || !formData.time || !formData.sessionType) {
            alert("Please fill all fields.");
            return;
        }
        onSave(formData as Omit<TherapySession, 'id'>);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                <h3 className="text-xl font-bold text-dark-text mb-4">Schedule Therapy Session</h3>
                 <div className="space-y-4">
                    <select name="patientId" value={formData.patientId} onChange={handlePatientChange} required className="w-full p-2 border rounded-lg"><option value="">Select a patient</option>{MOCK_PATIENTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                    <input type="text" name="sessionType" value={formData.sessionType || ''} onChange={handleChange} placeholder="Session Type (e.g., Post-operative rehab)" required className="w-full p-2 border rounded-lg" />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="date" name="date" value={formData.date || ''} onChange={handleChange} required className="w-full p-2 border rounded-lg" />
                        <input type="time" name="time" value={formData.time || ''} onChange={handleChange} required className="w-full p-2 border rounded-lg" />
                    </div>
                 </div>
                 <div className="mt-6 flex justify-end">
                    <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-semibold">Schedule</button>
                </div>
            </form>
        </div>
    );
};

const Physiotherapy: React.FC<PhysiotherapyProps> = ({ therapySessions, setTherapySessions, onSelectPatient }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const summary = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return {
            totalSessions: therapySessions.length,
            sessionsToday: therapySessions.filter(s => s.date === today).length,
            pendingReports: therapySessions.filter(s => s.status === 'Completed' && !s.progressNotes).length,
        };
    }, [therapySessions]);

    const handleSaveSession = (sessionData: Omit<TherapySession, 'id'>) => {
        const newSession: TherapySession = {
            id: `TS${(therapySessions.length + 1).toString().padStart(3, '0')}`,
            ...sessionData
        };
        setTherapySessions(prev => [newSession, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };

    const statusColors: Record<TherapyStatus, string> = { Scheduled: 'bg-blue-100 text-blue-800', Completed: 'bg-green-100 text-green-800', Cancelled: 'bg-red-100 text-red-800' };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-dark-text">Physiotherapy</h2>
                <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark font-semibold">Schedule Session</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Scheduled Sessions" value={summary.totalSessions.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                <StatCard title="Sessions Today" value={summary.sessionsToday.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} />
                <StatCard title="Pending Reports" value={summary.pendingReports.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} />
            </div>

             <div className="bg-white p-6 rounded-xl shadow-md">
                 <h3 className="text-xl font-semibold text-dark-text mb-4">Session Schedule</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-light-bg">
                            <tr>
                                <th className="p-3 font-semibold text-light-text">Patient</th>
                                <th className="p-3 font-semibold text-light-text">Date & Time</th>
                                <th className="p-3 font-semibold text-light-text">Session Type</th>
                                <th className="p-3 font-semibold text-light-text">Therapist</th>
                                <th className="p-3 font-semibold text-light-text">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {therapySessions.map(session => {
                                const patient = MOCK_PATIENTS.find(p => p.id === session.patientId);
                                return (
                                <tr key={session.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3"><button onClick={() => patient && onSelectPatient(patient)} className="font-medium text-dark-text hover:underline">{session.patientName}</button></td>
                                    <td className="p-3">{session.date} @ {session.time}</td>
                                    <td className="p-3">{session.sessionType}</td>
                                    <td className="p-3">{session.therapist}</td>
                                    <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[session.status]}`}>{session.status}</span></td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
            <ScheduleSessionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveSession} />
        </div>
    );
};

export default Physiotherapy;
