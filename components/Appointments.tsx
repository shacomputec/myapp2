import React, { useState, useMemo, useCallback } from 'react';
import { MOCK_PATIENTS, MOCK_STAFF_MEMBERS } from '../constants';
import type { Appointment, Patient } from '../types';
import ConfirmationModal from './ConfirmationModal';

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

const allAppointments = MOCK_PATIENTS.flatMap(p => p.appointments);
const allDoctors = MOCK_STAFF_MEMBERS.filter(s => s.role.name === 'Doctor').map(s => s.name);
const allDepartments = [...new Set(MOCK_STAFF_MEMBERS.map(s => s.department))];

interface ScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (appointment: Appointment) => void;
    appointmentToEdit?: Appointment | null;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose, onSave, appointmentToEdit }) => {
    const [formData, setFormData] = useState<Partial<Appointment>>(
        appointmentToEdit || { type: 'In-Person', status: 'Scheduled' }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };
    
    const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const patientId = e.target.value;
        const patient = MOCK_PATIENTS.find(p => p.id === patientId);
        setFormData(prev => ({...prev, patientId, patientName: patient?.name}));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation
        if (!formData.patientId || !formData.date || !formData.time || !formData.doctor || !formData.department) {
            alert("Please fill all required fields.");
            return;
        }
        
        const appointmentData = {
            id: appointmentToEdit?.id || `A${Math.floor(Math.random() * 1000)}`,
            ...formData
        } as Appointment;

        onSave(appointmentData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative dark:bg-slate-800">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-xl font-bold text-dark-text mb-4 dark:text-slate-200">{appointmentToEdit ? 'Reschedule Appointment' : 'Schedule New Appointment'}</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Patient</label>
                        <select name="patientId" value={formData.patientId} onChange={handlePatientChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                            <option value="">Select a patient</option>
                            {MOCK_PATIENTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Date</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Time</label>
                            <input type="time" name="time" value={formData.time} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Department</label>
                            <select name="department" value={formData.department} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                                 <option value="">Select Department</option>
                                 {allDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Doctor</label>
                            <select name="doctor" value={formData.doctor} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                                <option value="">Select Doctor</option>
                                {allDoctors.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">Reason for Visit</label>
                        <textarea name="reason" value={formData.reason} onChange={handleChange} rows={3} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"></textarea>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors font-semibold">
                            Save Appointment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const Appointments: React.FC<{ onSelectPatient: (patient: Patient) => void }> = ({ onSelectPatient }) => {
    const [appointments, setAppointments] = useState<Appointment[]>(allAppointments);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ department: 'All', doctor: 'All', status: 'All' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredAppointments = useMemo(() =>
        appointments.filter(app => {
            const matchesSearch = app.patientName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDept = filters.department === 'All' || app.department === filters.department;
            const matchesDoctor = filters.doctor === 'All' || app.doctor === filters.doctor;
            const matchesStatus = filters.status === 'All' || app.status === filters.status;
            return matchesSearch && matchesDept && matchesDoctor && matchesStatus;
        }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [appointments, searchTerm, filters]);

    const handleSaveAppointment = (appointment: Appointment) => {
        setAppointments(prev => {
            const existing = prev.find(a => a.id === appointment.id);
            if (existing) {
                return prev.map(a => a.id === appointment.id ? appointment : a);
            }
            return [...prev, appointment];
        });
    };

    const handleCancelClick = (appointment: Appointment) => {
        setAppointmentToCancel(appointment);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmCancel = () => {
        if (appointmentToCancel) {
            setAppointments(prev => prev.map(a => a.id === appointmentToCancel.id ? {...a, status: 'Cancelled'} : a));
        }
        setAppointmentToCancel(null);
        setIsConfirmModalOpen(false);
    };

    const handleSelectPatientById = (patientId: string) => {
        const patient = MOCK_PATIENTS.find(p => p.id === patientId);
        if (patient) onSelectPatient(patient);
    };

    const statusColors = {
        Scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        Completed: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-dark-text dark:text-slate-200">Appointment Management</h2>
                <button onClick={() => { setEditingAppointment(null); setIsModalOpen(true); }} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors font-semibold flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Schedule New
                </button>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md dark:bg-slate-800 dark:border dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Search by patient name..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary md:col-span-1 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                     <select name="department" value={filters.department} onChange={handleFilterChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                        <option value="All">All Departments</option>
                        {allDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                     <select name="doctor" value={filters.doctor} onChange={handleFilterChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                        <option value="All">All Doctors</option>
                        {allDoctors.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                     <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
                        <option value="All">All Statuses</option>
                        <option>Scheduled</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-light-bg dark:bg-slate-700">
                            <tr>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Patient</th>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Date & Time</th>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Doctor</th>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Status</th>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="dark:text-slate-400">
                            {filteredAppointments.map(app => (
                                <tr key={app.id} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="p-3">
                                        <button onClick={() => handleSelectPatientById(app.patientId)} className="font-medium text-dark-text hover:underline dark:text-slate-200">{app.patientName}</button>
                                        <p className="text-sm text-light-text dark:text-slate-400">{app.department}</p>
                                    </td>
                                    <td className="p-3">{app.date} <br/> <span className="text-sm text-light-text dark:text-slate-400">{app.time}</span></td>
                                    <td className="p-3">{app.doctor}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[app.status]}`}>{app.status}</span>
                                    </td>
                                    <td className="p-3 space-x-2">
                                        <button onClick={() => { setEditingAppointment(app); setIsModalOpen(true); }} className="text-primary hover:underline text-sm font-medium">Reschedule</button>
                                        {app.status === 'Scheduled' && (
                                            <button onClick={() => handleCancelClick(app)} className="text-accent hover:underline text-sm font-medium">Cancel</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <ScheduleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveAppointment} appointmentToEdit={editingAppointment} />
            {appointmentToCancel && (
                <ConfirmationModal
                    isOpen={isConfirmModalOpen}
                    onClose={() => {
                        setIsConfirmModalOpen(false);
                        setAppointmentToCancel(null);
                    }}
                    onConfirm={handleConfirmCancel}
                    title="Confirm Appointment Cancellation"
                    message={`Are you sure you want to cancel the appointment for ${appointmentToCancel.patientName} on ${appointmentToCancel.date}?`}
                    confirmText="Yes, Cancel"
                    cancelText="No, Keep Scheduled"
                />
            )}
        </div>
    );
};

export default Appointments;