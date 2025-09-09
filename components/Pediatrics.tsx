import React, { useState, useMemo } from 'react';
import type { Patient, Vaccination, VaccinationStatus } from '../types';
import { MOCK_PATIENTS, MOCK_VACCINATIONS } from '../constants';

interface PediatricsProps {
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

const AdministerVaccineModal: React.FC<{
    vaccination: Vaccination;
    isOpen: boolean;
    onClose: () => void;
    onSave: (vaccinationId: string, administeredDate: string) => void;
}> = ({ vaccination, isOpen, onClose, onSave }) => {
    const [administeredDate, setAdministeredDate] = useState(new Date().toISOString().split('T')[0]);
    if (!isOpen) return null;

    const handleSubmit = () => {
        onSave(vaccination.id, administeredDate);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-xl font-bold text-dark-text mb-2">Administer Vaccine</h3>
                <p className="mb-4"><strong>{vaccination.vaccineName}</strong> for {vaccination.patientName}</p>
                
                <div>
                    <label htmlFor="adminDate" className="block text-sm font-medium text-light-text mb-1">Date of Administration</label>
                    <input 
                        type="date" 
                        id="adminDate"
                        value={administeredDate}
                        onChange={(e) => setAdministeredDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="bg-gray-200 text-dark-text px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold">Cancel</button>
                    <button onClick={handleSubmit} className="bg-success text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold">Confirm Administration</button>
                </div>
            </div>
        </div>
    );
};


const Pediatrics: React.FC<PediatricsProps> = ({ onSelectPatient }) => {
    const pediatricPatients = useMemo(() => MOCK_PATIENTS.filter(p => p.age < 18), []);
    const [vaccinations, setVaccinations] = useState<Vaccination[]>(MOCK_VACCINATIONS);
    const [activeTab, setActiveTab] = useState<'Patients' | 'Vaccinations'>('Patients');
    const [selectedVaccine, setSelectedVaccine] = useState<Vaccination | null>(null);

    const summary = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const totalAge = pediatricPatients.reduce((sum, p) => sum + p.age, 0);
        return {
            admitted: pediatricPatients.length,
            vaccinationsToday: vaccinations.filter(v => v.dueDate === today).length,
            avgAge: pediatricPatients.length > 0 ? (totalAge / pediatricPatients.length).toFixed(1) : 0,
            bedsAvailable: 4, // Mock data
        };
    }, [pediatricPatients, vaccinations]);
    
    const handleAdministerVaccine = (vaccinationId: string, administeredDate: string) => {
        setVaccinations(prev => prev.map(v => 
            v.id === vaccinationId 
            ? { ...v, status: 'Administered', administeredDate } 
            : v
        ));
    };
    
    const statusColors: Record<VaccinationStatus, string> = {
        Upcoming: 'bg-blue-100 text-blue-800',
        Administered: 'bg-green-100 text-green-800',
        Overdue: 'bg-red-100 text-red-800',
    };

    const renderContent = () => {
        if (activeTab === 'Patients') {
             return (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-light-bg">
                            <tr>
                                <th className="p-3 font-semibold text-light-text">Patient</th>
                                <th className="p-3 font-semibold text-light-text">Age</th>
                                <th className="p-3 font-semibold text-light-text">Gender</th>
                                <th className="p-3 font-semibold text-light-text">Last Visit</th>
                                <th className="p-3 font-semibold text-light-text">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pediatricPatients.map(p => (
                                <tr key={p.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-medium text-dark-text flex items-center">
                                        <img src={p.avatarUrl} alt={p.name} className="w-8 h-8 rounded-full mr-3" />
                                        {p.name}
                                    </td>
                                    <td className="p-3">{p.age}</td>
                                    <td className="p-3">{p.gender}</td>
                                    <td className="p-3">{p.lastVisit}</td>
                                    <td className="p-3">
                                        <button onClick={() => onSelectPatient(p)} className="bg-primary text-white px-3 py-1 rounded-lg hover:bg-primary-dark text-sm">View Chart</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
        if (activeTab === 'Vaccinations') {
            return (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-light-bg">
                            <tr>
                                <th className="p-3 font-semibold text-light-text">Patient</th>
                                <th className="p-3 font-semibold text-light-text">Vaccine</th>
                                <th className="p-3 font-semibold text-light-text">Due Date</th>
                                <th className="p-3 font-semibold text-light-text">Status</th>
                                <th className="p-3 font-semibold text-light-text">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vaccinations.map(v => (
                                <tr key={v.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-medium text-dark-text">{v.patientName}</td>
                                    <td className="p-3">{v.vaccineName}</td>
                                    <td className="p-3">{v.dueDate}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[v.status]}`}>{v.status}</span>
                                    </td>
                                    <td className="p-3">
                                        {v.status !== 'Administered' ? (
                                            <button onClick={() => setSelectedVaccine(v)} className="bg-success text-white px-3 py-1 rounded-lg hover:bg-green-700 text-sm">Administer</button>
                                        ) : (
                                            <span className="text-sm text-light-text">Done on {v.administeredDate}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
    };


  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-dark-text">Pediatrics Department</h2>
      
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Admitted Children" value={summary.admitted.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857" /></svg>} />
        <StatCard title="Vaccinations Today" value={summary.vaccinationsToday.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
        <StatCard title="Available Beds" value={summary.bedsAvailable.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>} />
        <StatCard title="Average Patient Age" value={`${summary.avgAge} yrs`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>} />
      </div>

       <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="border-b mb-4">
                <nav className="flex space-x-4">
                    {(['Patients', 'Vaccinations'] as const).map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-2 font-medium text-sm rounded-t-lg ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-light-text hover:text-dark-text'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
            {renderContent()}
        </div>
        {selectedVaccine && (
            <AdministerVaccineModal
                isOpen={!!selectedVaccine}
                onClose={() => setSelectedVaccine(null)}
                vaccination={selectedVaccine}
                onSave={handleAdministerVaccine}
            />
        )}
    </div>
  );
};

export default Pediatrics;