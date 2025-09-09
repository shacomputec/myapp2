import React, { useState, useMemo } from 'react';
import { MOCK_PATIENTS, MOCK_STAFF_MEMBERS } from '../constants';
import type { Surgery, SurgeryStatus, Patient, PreOpChecklistItem } from '../types';
import { getSurgicalProcedureExplanation } from '../services/geminiService';
import { useAuth } from '../services/auth';
import ConfirmationModal from './ConfirmationModal';

const allSurgeons = MOCK_STAFF_MEMBERS.filter(s => s.role.name === 'Doctor').map(s => s.name);
const allOperatingRooms = ['OR-01', 'OR-02', 'OR-03', 'OR-04'];

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

const ScheduleSurgeryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (surgery: Omit<Surgery, 'id' | 'status' | 'preOpChecklist'>) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Omit<Surgery, 'id' | 'status' | 'preOpChecklist'>>>({
        operatingRoom: 'OR-01',
    });

    if (!isOpen) return null;

     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const patientId = e.target.value;
        const patient = MOCK_PATIENTS.find(p => p.id === patientId);
        setFormData(prev => ({...prev, patientId, patientName: patient?.name}));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { patientId, procedure, surgeon, operatingRoom, date, time } = formData;
        if (!patientId || !procedure || !surgeon || !operatingRoom || !date || !time) {
            alert('Please fill all required fields.');
            return;
        }
        onSave(formData as Omit<Surgery, 'id' | 'status' | 'preOpChecklist'>);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 relative">
                 <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                <h3 className="text-2xl font-bold text-dark-text mb-4">Schedule New Surgery</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-light-text mb-1">Patient</label>
                        <select name="patientId" value={formData.patientId || ''} onChange={handlePatientChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="">Select a patient</option>
                            {MOCK_PATIENTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-light-text mb-1">Procedure</label>
                        <input type="text" name="procedure" value={formData.procedure || ''} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g., Appendectomy" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-light-text mb-1">Surgeon</label>
                            <select name="surgeon" value={formData.surgeon || ''} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                                <option value="">Select Surgeon</option>
                                {allSurgeons.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-light-text mb-1">Operating Room</label>
                            <select name="operatingRoom" value={formData.operatingRoom || ''} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                                {allOperatingRooms.map(or => <option key={or} value={or}>{or}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-light-text mb-1">Date</label>
                            <input type="date" name="date" value={formData.date || ''} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-light-text mb-1">Time</label>
                            <input type="time" name="time" value={formData.time || ''} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                    </div>
                     <div className="mt-6 flex justify-end">
                        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark font-semibold">Schedule Surgery</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SurgeryDetailModal: React.FC<{ surgery: Surgery; onClose: () => void; onUpdateChecklist: (surgeryId: string, checklist: PreOpChecklistItem[]) => void }> = ({ surgery, onClose, onUpdateChecklist }) => {
    const [explanation, setExplanation] = useState('');
    const [isExplaining, setIsExplaining] = useState(false);
    const [checklist, setChecklist] = useState<PreOpChecklistItem[]>(surgery.preOpChecklist);
    const { hasPermission } = useAuth();

    const handleExplain = async () => {
        setIsExplaining(true);
        const result = await getSurgicalProcedureExplanation(surgery.procedure);
        setExplanation(result);
        setIsExplaining(false);
    };
    
    const handleChecklistChange = (itemId: string) => {
        const updatedChecklist = checklist.map(item => item.id === itemId ? { ...item, completed: !item.completed } : item);
        setChecklist(updatedChecklist);
        onUpdateChecklist(surgery.id, updatedChecklist);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 relative max-h-[90vh] flex flex-col">
                 <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                 <h3 className="text-2xl font-bold text-dark-text mb-2">Surgery Details ({surgery.id})</h3>
                 <div className="mb-4">
                    <p><strong>Patient:</strong> {surgery.patientName} ({surgery.patientId})</p>
                    <p><strong>Procedure:</strong> {surgery.procedure}</p>
                    <p><strong>Surgeon:</strong> {surgery.surgeon}</p>
                    <p><strong>Date & Time:</strong> {surgery.date} @ {surgery.time}</p>
                    <p><strong>Operating Room:</strong> {surgery.operatingRoom}</p>
                 </div>
                 <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                    <div>
                        <h4 className="font-semibold text-dark-text mb-2">Pre-Operative Checklist</h4>
                        <div className="space-y-2">
                            {checklist.map(item => (
                                <label key={item.id} className="flex items-center p-2 bg-light-bg rounded-md">
                                    <input type="checkbox" checked={item.completed} onChange={() => handleChecklistChange(item.id)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <span className={`ml-3 text-sm ${item.completed ? 'line-through text-light-text' : 'text-dark-text'}`}>{item.text}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                     {hasPermission('admin:ai_assistant') && (
                        <div>
                            <button onClick={handleExplain} disabled={isExplaining || !!explanation} className="bg-secondary text-primary-dark px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors font-semibold text-sm flex items-center disabled:bg-gray-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                {isExplaining ? 'Generating...' : 'Explain Procedure with AI'}
                            </button>
                            {explanation && <p className="mt-2 text-sm bg-blue-50 p-3 rounded-md text-blue-800 italic">{explanation}</p>}
                        </div>
                     )}
                 </div>
            </div>
        </div>
    );
};


interface SurgeryProps {
    surgeries: Surgery[];
    onAddSurgery: (surgery: Omit<Surgery, 'id' | 'status' | 'preOpChecklist'>) => void;
    onUpdateSurgery: (surgery: Surgery) => void;
}


const Surgery: React.FC<SurgeryProps> = ({ surgeries, onAddSurgery, onUpdateSurgery }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSurgery, setSelectedSurgery] = useState<Surgery | null>(null);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [actionToConfirm, setActionToConfirm] = useState<{ surgery: Surgery; newStatus: SurgeryStatus } | null>(null);

    const filteredSurgeries = useMemo(() =>
        surgeries.filter(s =>
            s.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.procedure.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [surgeries, searchTerm]);

    const surgerySummary = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        return {
            today: surgeries.filter(s => s.date === todayStr).length,
            availableORs: 4 - surgeries.filter(s => s.date === todayStr && s.status === 'In Progress').length, // Assuming 4 total ORs
            postOp: surgeries.filter(s => s.status === 'Completed').length,
        };
    }, [surgeries]);

    const handleUpdateChecklist = (surgeryId: string, newChecklist: PreOpChecklistItem[]) => {
        const surgeryToUpdate = surgeries.find(s => s.id === surgeryId);
        if (surgeryToUpdate) {
            const updatedSurgery = { ...surgeryToUpdate, preOpChecklist: newChecklist };
            onUpdateSurgery(updatedSurgery);
            // also update the selected surgery if it is being viewed
            if (selectedSurgery && selectedSurgery.id === surgeryId) {
                setSelectedSurgery(updatedSurgery);
            }
        }
    };
    
    const handleStatusSelect = (surgery: Surgery, newStatus: SurgeryStatus) => {
        if (newStatus === 'Cancelled') {
            setActionToConfirm({ surgery, newStatus });
            setIsConfirmModalOpen(true);
        } else {
            onUpdateSurgery({ ...surgery, status: newStatus });
        }
    };

    const handleConfirmStatusChange = () => {
        if (actionToConfirm) {
            onUpdateSurgery({ ...actionToConfirm.surgery, status: actionToConfirm.newStatus });
        }
        setActionToConfirm(null);
        setIsConfirmModalOpen(false);
    };

    const statusColors: { [key in SurgeryStatus]: string } = {
        Scheduled: 'bg-blue-100 text-blue-800',
        'In Progress': 'bg-yellow-100 text-yellow-800',
        Completed: 'bg-green-100 text-green-800',
        Cancelled: 'bg-red-100 text-red-800',
        Postponed: 'bg-purple-100 text-purple-800',
    };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-dark-text">Surgery Management</h2>
        <button onClick={() => setIsScheduleModalOpen(true)} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors font-semibold flex items-center">
            Schedule New Surgery
        </button>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Surgeries Today" value={surgerySummary.today.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
        <StatCard title="Available ORs" value={surgerySummary.availableORs.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>} />
        <StatCard title="Post-Op Patients" value={surgerySummary.postOp.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857" /></svg>} />
      </div>

       <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by patient name or procedure..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-light-bg">
              <tr>
                <th className="p-3 font-semibold text-light-text">Patient</th>
                <th className="p-3 font-semibold text-light-text">Procedure</th>
                <th className="p-3 font-semibold text-light-text">Surgeon</th>
                <th className="p-3 font-semibold text-light-text">Date & Time</th>
                <th className="p-3 font-semibold text-light-text">Status</th>
                <th className="p-3 font-semibold text-light-text text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSurgeries.map((surgery) => (
                <tr key={surgery.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium text-dark-text">{surgery.patientName}</td>
                  <td className="p-3">{surgery.procedure}</td>
                  <td className="p-3">{surgery.surgeon}</td>
                  <td className="p-3">{surgery.date} @ {surgery.time}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[surgery.status]}`}>{surgery.status}</span>
                  </td>
                  <td className="p-3 text-center">
                    <select
                        value={surgery.status}
                        onChange={(e) => handleStatusSelect(surgery, e.target.value as SurgeryStatus)}
                        className="p-1 text-xs border rounded-lg bg-light-bg focus:outline-none focus:ring-1 focus:ring-primary"
                        disabled={surgery.status === 'Completed' || surgery.status === 'Cancelled'}
                    >
                        {(['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'Postponed'] as SurgeryStatus[]).map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                    <button onClick={() => setSelectedSurgery(surgery)} className="text-primary hover:underline text-sm font-medium ml-4">
                        Details
                    </button>
                </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ScheduleSurgeryModal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} onSave={onAddSurgery} />
      {selectedSurgery && <SurgeryDetailModal surgery={selectedSurgery} onClose={() => setSelectedSurgery(null)} onUpdateChecklist={handleUpdateChecklist} />}
        {actionToConfirm && (
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => {
                    setIsConfirmModalOpen(false);
                    setActionToConfirm(null);
                }}
                onConfirm={handleConfirmStatusChange}
                title="Confirm Cancellation"
                message={`Are you sure you want to cancel the surgery "${actionToConfirm.surgery.procedure}" for ${actionToConfirm.surgery.patientName}? This action cannot be undone.`}
                confirmText="Yes, Cancel"
                cancelText="No, Keep Scheduled"
            />
        )}
    </div>
  );
};

export default Surgery;
